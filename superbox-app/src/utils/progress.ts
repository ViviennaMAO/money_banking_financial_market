/* 学习进度追踪
 *
 * 本地持久化:Taro storage
 * 数据模型:
 *   completedChapters: number[]            已完成章号
 *   chapterStats: { [num]: ChapterStat }   每章细节
 *   reviewQueue: ReviewItem[]               复习队列(基于艾宾浩斯)
 */

import Taro from '@tarojs/taro'

const KEY = 'mishkin-progress-v1'

export interface ChapterStat {
  num: number
  firstOpenedAt: number       // 第一次打开时间
  lastOpenedAt: number        // 最近打开
  predictAttempts: number     // 反预期尝试次数
  predictCorrect: number      // 答对次数(可选)
  quizScore?: number          // 0-100
  quizTakenAt?: number
  completed: boolean
  completedAt?: number
}

export interface ReviewItem {
  num: number
  dueAt: number               // 下次复习时间(timestamp)
  level: number               // 间隔级别 0-5
}

export interface ProgressData {
  chapterStats: Record<number, ChapterStat>
  reviewQueue: ReviewItem[]
  totalMinutes: number        // 累计学习分钟
  streakDays: number          // 连续学习天数
  lastStudyDate: string       // YYYY-MM-DD
}

/* ===== 艾宾浩斯遗忘曲线间隔(分钟) ===== */
const REVIEW_INTERVALS_MIN = [
  20,                  // 0: 20 分钟
  60 * 24,             // 1: 1 天
  60 * 24 * 3,         // 2: 3 天
  60 * 24 * 7,         // 3: 1 周
  60 * 24 * 14,        // 4: 2 周
  60 * 24 * 30         // 5: 1 月
]

function emptyData(): ProgressData {
  return {
    chapterStats: {},
    reviewQueue: [],
    totalMinutes: 0,
    streakDays: 0,
    lastStudyDate: ''
  }
}

export function loadProgress(): ProgressData {
  try {
    const raw = Taro.getStorageSync(KEY)
    if (!raw) return emptyData()
    if (typeof raw === 'string') return { ...emptyData(), ...JSON.parse(raw) }
    return { ...emptyData(), ...raw }
  } catch {
    return emptyData()
  }
}

export function saveProgress(data: ProgressData): void {
  try {
    Taro.setStorageSync(KEY, data)
  } catch (e) {
    console.warn('saveProgress failed', e)
  }
}

function todayStr(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function dayDiff(a: string, b: string): number {
  if (!a || !b) return 999
  const ta = new Date(a).getTime()
  const tb = new Date(b).getTime()
  return Math.round((tb - ta) / (1000 * 60 * 60 * 24))
}

/* ===== API ===== */

export function markOpened(chNum: number, addMinutes = 1): ProgressData {
  const data = loadProgress()
  const now = Date.now()
  const stat = data.chapterStats[chNum] || {
    num: chNum,
    firstOpenedAt: now,
    lastOpenedAt: now,
    predictAttempts: 0,
    predictCorrect: 0,
    completed: false
  }
  stat.lastOpenedAt = now
  data.chapterStats[chNum] = stat

  // streak
  const today = todayStr()
  if (data.lastStudyDate !== today) {
    if (data.lastStudyDate === '') {
      data.streakDays = 1
    } else {
      const diff = dayDiff(data.lastStudyDate, today)
      data.streakDays = diff === 1 ? data.streakDays + 1 : 1
    }
    data.lastStudyDate = today
  }
  data.totalMinutes += addMinutes

  saveProgress(data)
  return data
}

export function markPredicted(chNum: number, correct: boolean): ProgressData {
  const data = loadProgress()
  const stat = data.chapterStats[chNum] || {
    num: chNum,
    firstOpenedAt: Date.now(),
    lastOpenedAt: Date.now(),
    predictAttempts: 0,
    predictCorrect: 0,
    completed: false
  }
  stat.predictAttempts += 1
  if (correct) stat.predictCorrect += 1
  data.chapterStats[chNum] = stat
  saveProgress(data)
  return data
}

export function markQuiz(chNum: number, score: number): ProgressData {
  const data = loadProgress()
  const stat = data.chapterStats[chNum] || {
    num: chNum,
    firstOpenedAt: Date.now(),
    lastOpenedAt: Date.now(),
    predictAttempts: 0,
    predictCorrect: 0,
    completed: false
  }
  stat.quizScore = score
  stat.quizTakenAt = Date.now()
  if (score >= 60) {
    stat.completed = true
    stat.completedAt = Date.now()
    // 排进复习队列
    upsertReview(data, chNum, 0)
  }
  data.chapterStats[chNum] = stat
  saveProgress(data)
  return data
}

export function markCompleted(chNum: number): ProgressData {
  const data = loadProgress()
  const stat = data.chapterStats[chNum] || {
    num: chNum,
    firstOpenedAt: Date.now(),
    lastOpenedAt: Date.now(),
    predictAttempts: 0,
    predictCorrect: 0,
    completed: false
  }
  stat.completed = true
  stat.completedAt = Date.now()
  data.chapterStats[chNum] = stat
  upsertReview(data, chNum, 0)
  saveProgress(data)
  return data
}

function upsertReview(data: ProgressData, chNum: number, level: number) {
  const interval = REVIEW_INTERVALS_MIN[Math.min(level, REVIEW_INTERVALS_MIN.length - 1)]
  const dueAt = Date.now() + interval * 60 * 1000
  const idx = data.reviewQueue.findIndex(r => r.num === chNum)
  if (idx >= 0) {
    data.reviewQueue[idx] = { num: chNum, dueAt, level }
  } else {
    data.reviewQueue.push({ num: chNum, dueAt, level })
  }
}

export function reviewDone(chNum: number, success: boolean): ProgressData {
  const data = loadProgress()
  const item = data.reviewQueue.find(r => r.num === chNum)
  if (item) {
    if (success) {
      upsertReview(data, chNum, item.level + 1)
    } else {
      upsertReview(data, chNum, Math.max(0, item.level - 1))
    }
  }
  saveProgress(data)
  return data
}

/* ===== 派生数据 ===== */

export function dueReviews(data: ProgressData): ReviewItem[] {
  const now = Date.now()
  return data.reviewQueue
    .filter(r => r.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt)
}

export function completionRate(data: ProgressData, total: number): number {
  const done = Object.values(data.chapterStats).filter(s => s.completed).length
  return total > 0 ? Math.round((done / total) * 100) : 0
}

export function completedCount(data: ProgressData): number {
  return Object.values(data.chapterStats).filter(s => s.completed).length
}

export function openedCount(data: ProgressData): number {
  return Object.keys(data.chapterStats).length
}

export function resetProgress(): void {
  try {
    Taro.removeStorageSync(KEY)
  } catch (e) {
    console.warn('reset failed', e)
  }
}
