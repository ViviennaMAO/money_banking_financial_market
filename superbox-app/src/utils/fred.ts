/* FRED 实时数据加载
 *
 * 优先级:
 *   1. 内存缓存(进程内,< 1 小时)
 *   2. 本地存储缓存(< 12 小时)
 *   3. CDN 网络拉取(jsDelivr → raw.githubusercontent 兜底)
 *   4. 打包基线 fredBaseline(永远成功)
 *
 * 在小程序合法域名:确保 cdn.jsdelivr.net 与 raw.githubusercontent.com
 * 已添加到 SuperBox / 微信小程序后台的 request 白名单。
 */

import Taro from '@tarojs/taro'
import { fredBaseline, type FredSnapshot, type FredSeriesId, type FredPoint } from '../data/fred-baseline'

const STORAGE_KEY = 'fred-snapshot-v1'
const MEM_TTL_MS = 60 * 60 * 1000          // 1 小时
const STORAGE_TTL_MS = 12 * 60 * 60 * 1000 // 12 小时

/* ===== 配置 CDN ===== */
// 用户 GitHub repo 名是 "-" 这一特殊情况,直接拼 raw 比 jsDelivr 稳
const CDN_URLS = [
  'https://cdn.jsdelivr.net/gh/ViviennaMAO/-@main/superbox-app/public/data/fred-latest.json',
  'https://raw.githubusercontent.com/ViviennaMAO/-/main/superbox-app/public/data/fred-latest.json'
]

let memCache: { snapshot: FredSnapshot; loadedAt: number } | null = null

/* ===== 公开 API ===== */

/**
 * 同步获取(永不抛错):
 * 命中内存缓存 → 返回缓存
 * 命中 storage 缓存 → 返回 storage
 * 否则 → 返回 baseline
 */
export function getFredSnapshotSync(): FredSnapshot {
  if (memCache && Date.now() - memCache.loadedAt < MEM_TTL_MS) {
    return memCache.snapshot
  }
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw) {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (obj && obj.snapshot && Date.now() - obj.savedAt < STORAGE_TTL_MS) {
        memCache = { snapshot: obj.snapshot, loadedAt: Date.now() }
        return obj.snapshot
      }
    }
  } catch {
    // ignore
  }
  return fredBaseline
}

/**
 * 异步刷新(尝试网络拉取,失败回退缓存/基线)
 */
export async function refreshFredSnapshot(): Promise<FredSnapshot> {
  for (const url of CDN_URLS) {
    try {
      const res = await Taro.request<FredSnapshot>({
        url,
        method: 'GET',
        timeout: 8000,
        responseType: 'text'
      })
      const data = parseSnapshot(res.data)
      if (data) {
        memCache = { snapshot: data, loadedAt: Date.now() }
        try {
          Taro.setStorageSync(STORAGE_KEY, { snapshot: data, savedAt: Date.now() })
        } catch {}
        return data
      }
    } catch (err) {
      // 尝试下一个 URL
      console.warn('[fred] CDN 失败', url, err)
    }
  }
  // 全部失败 → 使用上次缓存或 baseline
  return getFredSnapshotSync()
}

function parseSnapshot(d: unknown): FredSnapshot | null {
  if (!d) return null
  let obj: FredSnapshot
  if (typeof d === 'string') {
    try { obj = JSON.parse(d) } catch { return null }
  } else {
    obj = d as FredSnapshot
  }
  if (!obj || !obj.series || !obj.derived) return null
  return obj
}

/* ===== 便捷选择器 ===== */

export function getSeries(snap: FredSnapshot, id: FredSeriesId): FredPoint | undefined {
  return snap.series[id]
}

/** 友好格式化:数值 + 单位 */
export function formatValue(p: FredPoint | undefined, digits = 2): string {
  if (!p) return '—'
  const { value, unit } = p
  if (unit === 'B') {
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)} T`
    return `${value.toFixed(0)} B`
  }
  if (unit === 'T') return `${value.toFixed(digits)} T`
  if (unit === '%' || unit === 'pp') return `${value.toFixed(digits)}%`
  if (unit === 'bps') return `${Math.round(value)} bps`
  if (unit === 'JPY') return `${value.toFixed(2)}`
  if (unit === 'USD') return `${value.toFixed(4)}`
  return value.toFixed(digits)
}

/** 变化的友好格式 */
export function formatChange(
  change: number | undefined,
  unit: string = '%',
  prefix = ''
): { text: string; tone: 'up' | 'down' | 'flat' } {
  if (change == null || isNaN(change)) return { text: '—', tone: 'flat' }
  const sign = change > 0 ? '+' : change < 0 ? '' : '±'
  const tone: 'up' | 'down' | 'flat' = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  let text: string
  if (unit === '%' || unit === 'pp') {
    text = `${sign}${change.toFixed(2)}pp`
  } else if (unit === 'bps') {
    text = `${sign}${Math.round(change)}bps`
  } else if (unit === 'B') {
    text = `${sign}${change.toFixed(0)} B`
  } else {
    text = `${sign}${change.toFixed(2)}`
  }
  return { text: prefix + text, tone }
}

/** 兜底来源标签 */
export function sourceLabel(snap: FredSnapshot): string {
  switch (snap.source) {
    case 'fred-live': return 'FRED · 实时'
    case 'fred-cache': return 'FRED · 缓存'
    case 'fred-baseline': return 'FRED · 基线'
    default: return 'FRED'
  }
}
