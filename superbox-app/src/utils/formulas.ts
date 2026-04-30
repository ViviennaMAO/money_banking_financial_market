/* 三章 MVP 核心公式 · 纯函数,无 React 依赖 */

// 第 14 章 货币乘数:m = (1+c) / (r+e+c)
export function moneyMultiplier(r: number, e: number, c: number): number {
  const denom = r + e + c
  if (denom < 0.0001) return Infinity
  return (1 + c) / denom
}

export function totalM2(mb: number, r: number, e: number, c: number): number {
  return mb * moneyMultiplier(r, e, c)
}

// 第 17 章 套息交易回报
export interface CarryReturn {
  carry: number       // 利差(已按 τ 折算,单位 %)
  dsLoss: number      // 汇率损益(%)
  nominal: number     // 无杠杆总回报(%)
  leveraged: number   // 杠杆后回报(%)
  breakeven: number   // 汇率允许的最大不利变动(%)
}

export function carryReturn(
  id: number, ifv: number,
  dsPercent: number, leverage: number,
  tauMonths: number = 3
): CarryReturn {
  const tau = tauMonths / 12
  const carry = (id - ifv) * tau
  const nominal = carry + dsPercent
  return {
    carry,
    dsLoss: dsPercent,
    nominal,
    leveraged: nominal * leverage,
    breakeven: -carry
  }
}

// 第 20 章 IS-LM 均衡
export interface ISLMEquilibrium {
  i_star: number
  Y_star: number
  trap: boolean
}

export function islmEquilibrium(
  a: number, b: number,
  c: number, d: number
): ISLMEquilibrium {
  const i_star = (a - c) / (b + d)
  if (i_star >= 0) {
    return { i_star, Y_star: c + d * i_star, trap: false }
  }
  return { i_star: 0, Y_star: a, trap: true }
}
