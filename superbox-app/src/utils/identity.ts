/* Luffa 身份(钱包地址)管理
 *
 * 应用启动时调用 connect → 缓存到 storage
 * - 用户接受:存地址 + uid,以后不重复弹
 * - 用户拒绝:标记 dismissed,可设置过期以便下次启动再问
 * - Luffa 环境不可用(开发模式):静默,不阻塞应用
 *
 * 审核要求:onLaunch 必须调用钱包 connect。本模块即为该接入点。
 */

import Taro from '@tarojs/taro'
import { luffa, sessionUuid, bridgeAvailable } from './luffa-bridge'

const STORAGE_KEY = 'luffa-identity-v1'

export interface LuffaIdentity {
  /** 钱包地址 */
  address?: string
  /** Luffa cid(用户唯一 ID) */
  cid?: string
  /** Luffa nickname */
  nickname?: string
  /** Luffa uid */
  uid?: string
  /** 头像(可选) */
  avatar?: string
  /** 连接时间戳 */
  connectedAt?: number
  /** 是否被用户拒绝 */
  dismissed?: boolean
  /** 拒绝时间 */
  dismissedAt?: number
}

function load(): LuffaIdentity {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (!raw) return {}
    if (typeof raw === 'string') return JSON.parse(raw)
    return raw as LuffaIdentity
  } catch {
    return {}
  }
}

function save(id: LuffaIdentity): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, id)
  } catch (e) {
    console.warn('luffa identity save failed', e)
  }
}

export function getIdentity(): LuffaIdentity {
  return load()
}

/** 是否已连接(用户授权过且未拒绝) */
export function isConnected(): boolean {
  const id = load()
  return !!id.address && !id.dismissed
}

/** 用户拒绝后多久可以再次询问 — 默认 6 小时 */
const REASK_INTERVAL_MS = 6 * 60 * 60 * 1000

function shouldReask(id: LuffaIdentity): boolean {
  if (!id.dismissed || !id.dismissedAt) return true
  return Date.now() - id.dismissedAt > REASK_INTERVAL_MS
}

/**
 * 应用启动时调用一次。
 *
 * 行为:
 *   - 已有有效身份(addr + 未 dismissed)→ 直接返回,不弹窗
 *   - 桥不可用(web 调试)→ 静默返回 {}
 *   - 弹窗 → 用户接受存身份,用户拒绝存 dismissed
 *
 * 返回当前身份(无论成功失败都不抛错,onLaunch 不应阻塞)
 */
export async function ensureConnected(opts: {
  network?: 'mainnet' | 'testnet'
  title?: string
  desc?: string
  force?: boolean
} = {}): Promise<LuffaIdentity> {
  const current = load()

  // 已经连接,无需再弹
  if (current.address && !current.dismissed) return current

  // 拒绝过且未到再问时间
  if (current.dismissed && !shouldReask(current) && !opts.force) return current

  // 桥不可用 — 开发者工具 web 模式或非 Luffa 环境,静默
  if (!bridgeAvailable()) return current

  // 弹窗连接
  try {
    const res: any = await luffa('connect', {
      uuid: sessionUuid(),
      network: opts.network || 'mainnet',
      metadata: {
        title: opts.title || '货币金融学互动学习',
        desc: opts.desc || '需要您的钱包地址以验证身份和后续付费解锁'
      }
    })

    // Luffa 返回结构兼容多种 shape
    const address = res?.address || res?.args?.address || res?.data?.address
    if (!address) {
      // 返回了但没拿到地址 — 当作 dismissed
      const next: LuffaIdentity = { dismissed: true, dismissedAt: Date.now() }
      save(next)
      return next
    }

    const next: LuffaIdentity = {
      address,
      cid: res?.cid || res?.args?.cid,
      uid: res?.uid || res?.args?.uid,
      nickname: res?.nickname || res?.args?.nickname,
      avatar: res?.avatar || res?.args?.avatar,
      connectedAt: Date.now()
    }
    save(next)
    return next
  } catch (e) {
    // 用户拒绝、或调用失败
    const next: LuffaIdentity = {
      ...current,
      dismissed: true,
      dismissedAt: Date.now()
    }
    save(next)
    return next
  }
}

/** 强制重连(用户点"重新连接"或换账号时) */
export async function reconnect(opts?: Parameters<typeof ensureConnected>[0]): Promise<LuffaIdentity> {
  // 清掉 dismissed 标记
  const current = load()
  save({ ...current, dismissed: false, dismissedAt: undefined })
  return ensureConnected({ ...opts, force: true })
}

/** 调试用:清空身份 */
export function clearIdentity(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEY)
  } catch {}
}
