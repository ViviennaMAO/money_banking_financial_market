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

// 第 4 章 债券定价
// P = Σ C/(1+i)^t (t=1..n) + FV/(1+i)^n
// fv: 面值;couponRate: 票息率(0-1);ytm: 市场利率/到期收益率(0-1);years: 到期年限
export function bondPrice(
  fv: number,
  couponRate: number,
  ytm: number,
  years: number
): number {
  if (years <= 0) return fv
  if (ytm < 0.00001) return fv + fv * couponRate * years  // 零利率退化
  const coupon = fv * couponRate
  const pvCoupons = coupon * (1 - Math.pow(1 + ytm, -years)) / ytm
  const pvFace = fv / Math.pow(1 + ytm, years)
  return pvCoupons + pvFace
}

// 修正久期(近似):衡量价格对利率的敏感度
// 近似公式:D ≈ Σ t·CF_t/(1+y)^t / P
export function modifiedDuration(
  fv: number,
  couponRate: number,
  ytm: number,
  years: number
): number {
  if (years <= 0 || ytm < 0.00001) return years
  const P = bondPrice(fv, couponRate, ytm, years)
  if (P <= 0) return 0
  const coupon = fv * couponRate
  let weighted = 0
  for (let t = 1; t <= years; t++) {
    weighted += t * coupon / Math.pow(1 + ytm, t)
  }
  weighted += years * fv / Math.pow(1 + ytm, years)
  const macaulayD = weighted / P
  return macaulayD / (1 + ytm)
}

// 费雪方程:实际利率 ≈ 名义 - 通胀
export function realRate(nominalRate: number, inflation: number): number {
  return (1 + nominalRate) / (1 + inflation) - 1
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
