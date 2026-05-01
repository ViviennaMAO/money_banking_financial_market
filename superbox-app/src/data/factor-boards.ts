/* 因子看板配置 — 跳转到外部小程序
 *
 * 跨小程序跳转的两个前提:
 *   1. 把目标 appId 填入下面的 appId 字段
 *   2. 在 app.config.ts 的 navigateToMiniProgramAppIdList 中加入对应 appId(白名单)
 *      没加白名单 → 微信小程序 API 调用会失败
 *
 * 不同平台的差异:
 *   - 微信:调用 wx.navigateToMiniProgram(Taro.navigateToMiniProgram 等价)
 *   - SuperBox / 钉钉小程序:相应平台的"打开其他小程序"API,Taro 也用同名包装
 *   - 暂时未知 appId 时,点击会弹 toast 提示
 */

export interface FactorBoard {
  /** 唯一 id */
  id: string
  /** 显示名(8 字以内) */
  name: string
  /** emoji 图标 */
  emoji: string
  /** 一句话定位 */
  desc: string
  /** 对应章节(用于"延伸学习") */
  chapters: number[]
  /** 目标小程序 appId — 留空时点击会提示需要配置 */
  appId: string
  /** 跳转路径(可选) */
  path?: string
  /** 额外参数 */
  extraData?: Record<string, unknown>
  /** 主题色 className */
  color: string
}

export const factorBoards: FactorBoard[] = [
  {
    id: 'usd',
    name: '美元因子看板',
    emoji: '💵',
    desc: 'DXY · 美元体系 · Fed swap line',
    chapters: [17, 18],
    appId: '',  // ← 在这里填入"美元因子看板"小程序的 appId
    color: 'bd-green'
  },
  {
    id: 'inflation',
    name: '通胀因子看板',
    emoji: '🔥',
    desc: 'CPI · PCE · 工资 · 通胀预期',
    chapters: [22, 24, 25],
    appId: '',  // ← 在这里填入"通胀因子看板"小程序的 appId
    color: 'bd-orange'
  },
  {
    id: 'gold',
    name: '黄金因子看板',
    emoji: '🥇',
    desc: '实际利率 · 通胀对冲 · 央行购金',
    chapters: [4, 17, 24],
    appId: '',  // ← 在这里填入"黄金因子看板"小程序的 appId
    color: 'bd-yellow'
  }
]

/** 是否已配置 appId */
export function isBoardConfigured(board: FactorBoard): boolean {
  return !!board.appId && board.appId.length > 0
}
