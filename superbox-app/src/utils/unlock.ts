/* 付费解锁状态机
 *
 * 锁定章节:第 5 篇 + 第 6 篇(Ch 17-25 共 9 章)
 * 第 1-4 篇(Ch 1-16)完全免费
 *
 * 存储:Taro.storage(key: unlock-v1),独立于 progress / lang
 * 设计原则:目录卡片可见 → 跳转拦截 → 路由到 /pages/unlock
 */

import Taro from '@tarojs/taro'

const STORAGE_KEY = 'unlock-v1'
const EVENT_LISTENERS = new Set<(s: UnlockState) => void>()

/* ===== 锁定边界(单一来源) ===== */

export const LOCKED_CHAPTERS = [17, 18, 19, 20, 21, 22, 23, 24, 25] as const
export const LOCKED_PARTS = [5, 6] as const

export const UNLOCK_PRICE_USD = 19.9

/* ===== 状态模型 ===== */

export type UnlockMethod = 'paid' | 'demo' | 'gift' | 'admin'

export interface UnlockState {
  unlocked: boolean
  unlockedAt?: number
  unlockedBy?: UnlockMethod
  txId?: string             // 链上交易 hash(Phase 2 用)
  address?: string          // 支付者钱包地址
  bundle?: 'all' | 'part5' | 'part6'
}

function empty(): UnlockState {
  return { unlocked: false }
}

/* ===== Load / Save ===== */

export function loadUnlockState(): UnlockState {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (!raw) return empty()
    if (typeof raw === 'string') return { ...empty(), ...JSON.parse(raw) }
    return { ...empty(), ...raw }
  } catch {
    return empty()
  }
}

function save(s: UnlockState): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, s)
  } catch (e) {
    console.warn('unlock state save failed', e)
  }
  EVENT_LISTENERS.forEach(fn => fn(s))
}

/* ===== 公开 API ===== */

/** 一个具体章节是否被锁(未付费 + 在锁定列表内) */
export function isChapterLocked(chNum: number): boolean {
  if (!LOCKED_CHAPTERS.includes(chNum as any)) return false
  return !loadUnlockState().unlocked
}

/** 不带 storage 查询:用已加载的 state 判断(渲染时调用,避免每次读 storage) */
export function isChapterLockedFor(state: UnlockState, chNum: number): boolean {
  if (!LOCKED_CHAPTERS.includes(chNum as any)) return false
  return !state.unlocked
}

export function isPartLocked(partNum: number): boolean {
  if (!LOCKED_PARTS.includes(partNum as any)) return false
  return !loadUnlockState().unlocked
}

export function isAllUnlocked(): boolean {
  return loadUnlockState().unlocked
}

export interface UnlockMeta {
  txId?: string
  address?: string
  bundle?: 'all'
}

export function markUnlocked(method: UnlockMethod, meta: UnlockMeta = {}): UnlockState {
  const next: UnlockState = {
    unlocked: true,
    unlockedAt: Date.now(),
    unlockedBy: method,
    bundle: meta.bundle || 'all',
    txId: meta.txId,
    address: meta.address
  }
  save(next)
  return next
}

export function resetUnlock(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEY)
  } catch {}
  EVENT_LISTENERS.forEach(fn => fn(empty()))
}

/* ===== 订阅(让 UI 立刻响应解锁) ===== */

export function subscribe(fn: (s: UnlockState) => void): () => void {
  EVENT_LISTENERS.add(fn)
  return () => {
    EVENT_LISTENERS.delete(fn)
  }
}

/* ===== 路由 helper ===== */

/**
 * 通用拦截器:如果章节被锁,路由到 unlock 页(带回章号)并返回 true。
 * 调用方:if (interceptLockedChapter(ch.num)) return
 */
export function interceptLockedChapter(chNum: number): boolean {
  if (!isChapterLocked(chNum)) return false
  Taro.navigateTo({ url: `/pages/unlock/index?ch=${chNum}` })
  return true
}
