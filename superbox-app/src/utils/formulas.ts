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

// 第 9 章 银行压力测试
// 输入(占比为 0-100):
//   deposits 总存款(单位:十亿)
//   loanPct / longBondPct 资产端配置
//   capitalPct 资本占资产比
//   rateShock 利率冲击 %
//   withdrawPct 挤兑提款比例
export interface BankStressResult {
  totalAssets: number
  loans: number
  longBonds: number
  reserves: number
  capital: number
  htmLoss: number       // HTM 国债浮亏(假设久期 5)
  realCapital: number
  cet1Ratio: number     // 真实 CET1
  lcr: number           // 流动性覆盖率(简化)
  collapseRisk: 'safe' | 'warning' | 'capital_breach' | 'liquidity_run'
}

export function bankStressTest(
  deposits: number,
  loanPct: number,
  longBondPct: number,
  capitalPct: number,
  rateShock: number,
  withdrawPct: number
): BankStressResult {
  const capRatio = Math.max(0.5, capitalPct) / 100
  const totalAssets = deposits / (1 - capRatio)
  const loans = totalAssets * loanPct / 100
  const longBonds = totalAssets * longBondPct / 100
  const reserves = Math.max(0, totalAssets - loans - longBonds)
  const capital = totalAssets * capRatio
  // HTM 浮亏 ≈ 长债规模 × 利率冲击 × 久期(假设 5)
  const htmLoss = longBonds * rateShock / 100 * 5
  const realCapital = capital - htmLoss
  const cet1Ratio = totalAssets > 0 ? realCapital / totalAssets * 100 : 0
  const withdraw = deposits * withdrawPct / 100
  const lcr = withdraw > 0 ? reserves / withdraw * 100 : 999

  let collapseRisk: BankStressResult['collapseRisk'] = 'safe'
  if (cet1Ratio < 0) collapseRisk = 'capital_breach'
  else if (lcr < 100) collapseRisk = 'liquidity_run'
  else if (cet1Ratio < 4 || lcr < 130) collapseRisk = 'warning'

  return {
    totalAssets, loans, longBonds, reserves, capital,
    htmLoss, realCapital, cet1Ratio, lcr, collapseRisk
  }
}

// 第 8 章 信息不对称分析
// 输入:三个 0-100 的指标
//   asymmetry = 信息不对称度
//   monitoring = 监督机制强度
//   screening = 筛选成本(低=便于筛选)
// 输出:市场效率 + 主导问题
export type AsymmetryProblem = 'adverse_selection' | 'moral_hazard' | 'principal_agent' | 'balanced'

export interface InfoAsymmetryResult {
  marketEfficiency: number   // 0-100
  dominant: AsymmetryProblem
  collapsed: boolean
}

export function infoAsymmetryAnalysis(
  asymmetry: number,
  monitoring: number,
  screening: number
): InfoAsymmetryResult {
  const screeningEase = 100 - screening
  // 简化:不对称 - 监督帮助 - 筛选便利度
  const raw = 100 - asymmetry + monitoring * 0.6 + screeningEase * 0.3
  const efficiency = Math.max(0, Math.min(100, raw / 1.9))

  let dominant: AsymmetryProblem = 'balanced'
  if (asymmetry > 65 && screening > 55) dominant = 'adverse_selection'
  else if (monitoring < 45 && asymmetry > 45) dominant = 'moral_hazard'
  else if (screening > 60 && monitoring < 60) dominant = 'principal_agent'

  return {
    marketEfficiency: efficiency,
    dominant,
    collapsed: efficiency < 28
  }
}

// 第 7 章 戈登增长模型
// P = D / (r - g),其中 D 是下一期分红
//   r 必要回报率必须 > g 永续增长率,否则模型失效
export function gordonPrice(D: number, g: number, r: number): number {
  const gDec = g / 100
  const rDec = r / 100
  if (rDec - gDec < 0.0001) return Infinity
  return D / (rDec - gDec)
}

// 反向求隐含增长率(给定市场价 P,推 g)
export function impliedGrowth(P: number, D: number, r: number): number {
  if (P <= 0) return 0
  return (r / 100 - D / P) * 100
}

// 第 5 章 利率行为 · 费雪分解
// 名义利率 = 实际利率 + 通胀预期 + 风险/期限溢价 + Fed 政策调整
//   - 实际利率 r* (可贷资金均衡)
//   - 通胀预期 π_e(费雪效应)
//   - 风险溢价 ρ(信用 / 期限)
//   - Fed 调整(流动性偏好视角下,Fed 通过 OMO / IORB 推/拉)
export interface RateBreakdown {
  realRate: number
  inflationExpect: number
  riskPremium: number
  fedAdjust: number
  nominal: number
}

export function decomposeRate(
  r: number, piE: number, rho: number, fed: number
): RateBreakdown {
  return {
    realRate: r,
    inflationExpect: piE,
    riskPremium: rho,
    fedAdjust: fed,
    nominal: r + piE + rho + fed
  }
}

// 第 6 章 收益率曲线
// 模型:y(t) = shortEnd + (longEnd - shortEnd) × w + curveBow × 4w(1-w)
//   其中 w = t/30(期限权重)
//   curveBow > 0 中段凸起;curveBow < 0 中段凹陷
export function yieldAtTenor(
  shortEnd: number,    // 2Y 短端利率(Fed 政策影响)
  longEnd: number,     // 30Y 长端利率(市场长期预期)
  curveBow: number,    // 凸度(-1.5 ~ +1.5)
  tenor: number        // 期限(年)
): number {
  const w = Math.min(Math.max(tenor / 30, 0), 1)
  const linear = shortEnd + (longEnd - shortEnd) * w
  const bow = curveBow * 4 * w * (1 - w)
  return Math.max(0, linear + bow)
}

// 2s10s 利差(经典衰退指标)
export function spread2s10s(shortEnd: number, longEnd: number, curveBow: number): number {
  const y10 = yieldAtTenor(shortEnd, longEnd, curveBow, 10)
  const y2 = yieldAtTenor(shortEnd, longEnd, curveBow, 2)
  return y10 - y2  // 正常 > 0;倒挂 < 0
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
