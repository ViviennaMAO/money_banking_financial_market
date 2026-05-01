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

// 第 1 章 房贷月供
export function mortgagePayment(
  principal: number, annualRate: number, years: number
): { monthly: number; total: number; interest: number } {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r < 0.0001) return { monthly: principal / n, total: principal, interest: 0 }
  const monthly = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  const total = monthly * n
  return { monthly, total, interest: total - principal }
}

// 第 21 章 IS-LM 政策组合
export interface PolicyMixResult {
  fiscalEffect: number
  monetaryEffect: number
  totalY: number
  totalI: number
  combo: 'expansionary' | 'contractionary' | 'mixed_loose' | 'mixed_tight' | 'conflict' | 'neutral'
  comboLabel: string
  comboCls: string
  sideEffect: string
}

export function policyMix(fiscalShift: number, monetaryShift: number): PolicyMixResult {
  const fiscalEffect = fiscalShift * 0.4
  const monetaryEffect = monetaryShift * 0.4
  const totalY = fiscalEffect + monetaryEffect
  const totalI = fiscalShift * 0.3 - monetaryShift * 0.3

  let combo: PolicyMixResult['combo'] = 'neutral'
  let comboLabel = '中性 / 微调'
  let comboCls = 'mix-neutral'
  let sideEffect = '政策力度温和,无明显副作用'

  if (fiscalShift > 30 && monetaryShift > 30) {
    combo = 'expansionary'
    comboLabel = '🔥 双扩张'
    comboCls = 'mix-expand'
    sideEffect = '产出强劲增长 + 利率温和(双向抵消)。例:2020 疫情应对。副作用:埋下通胀种子。'
  } else if (fiscalShift < -30 && monetaryShift < -30) {
    combo = 'contractionary'
    comboLabel = '❄️ 双紧缩'
    comboCls = 'mix-contract'
    sideEffect = '产出大幅萎缩 + 利率温和。罕见,通常危机后整顿。例:1990s 早期克林顿 + Greenspan。'
  } else if (fiscalShift > 30 && monetaryShift < -30) {
    combo = 'conflict'
    comboLabel = '⚡ 冲突 · 财扩 + 货紧'
    comboCls = 'mix-conflict'
    sideEffect = '利率飙升 + 美元强 + 挤出私人投资 + 触发新兴市场危机。例:1981-82 里根 + 沃尔克 → LDC 危机。'
  } else if (fiscalShift < -30 && monetaryShift > 30) {
    combo = 'conflict'
    comboLabel = '🌊 冲突 · 财紧 + 货宽'
    comboCls = 'mix-conflict'
    sideEffect = '利率被压低 + 资产价格上升。例:1990s 末期克林顿减赤 + Fed 低利率 → dotcom 泡沫种子。'
  } else if (fiscalShift > 0 && monetaryShift > 0) {
    combo = 'mixed_loose'
    comboLabel = '🟢 温和宽松'
    comboCls = 'mix-loose'
    sideEffect = '产出温和增长,标准反衰退应对。'
  } else if (fiscalShift < 0 && monetaryShift < 0) {
    combo = 'mixed_tight'
    comboLabel = '🟠 温和紧缩'
    comboCls = 'mix-tight'
    sideEffect = '产出适度降温,反通胀常见场景。'
  }

  return { fiscalEffect, monetaryEffect, totalY, totalI, combo, comboLabel, comboCls, sideEffect }
}

// 第 25 章 卢卡斯批判 · 政策预期模型
// 政策有效性 = f(政策力度, 预期度, 可信度)
//   - 完全未预期:政策 100% 有效(经典模型适用)
//   - 完全预期:政策 30% 有效(理性预期消化)
//   - 不可信央行:即使政策对,效果打折
export interface PolicyResult {
  basePredict: number      // 经典模型预测(基于历史数据)
  rationalActual: number   // 理性预期下的实际效果
  surprise: number         // 经典预测 - 实际(模型偏差)
  effectiveness: number    // 0-100 政策实际有效性
  modelMisses: boolean     // 经典模型是否大幅失误
}

export function policyExpectation(
  policyStrength: number,    // -100 紧缩 ~ +100 宽松
  expectedness: number,      // 0-100 公众预期度
  credibility: number        // 0-100 央行可信度
): PolicyResult {
  const baseAbs = Math.abs(policyStrength)
  const sign = Math.sign(policyStrength)

  // 经典模型预测(假设政策完全有效)
  const basePredict = policyStrength * 0.6

  // 理性预期实际效果:
  //   未预期(expectedness=0):效果 ~ 基础 × credibility
  //   完全预期(expectedness=100):效果 ~ 基础 × 0.25 × credibility
  const surpriseFactor = (100 - expectedness) / 100
  const credFactor = credibility / 100
  const rationalActual = sign * baseAbs * (0.25 + 0.55 * surpriseFactor) * credFactor

  const surprise = basePredict - rationalActual
  const effectiveness = baseAbs > 0
    ? Math.min(100, Math.abs(rationalActual) / (baseAbs * 0.6) * 100)
    : 0
  const modelMisses = Math.abs(surprise) > Math.abs(rationalActual) * 0.5

  return { basePredict, rationalActual, surprise, effectiveness, modelMisses }
}

// 第 19 章 MV = PY 货币数量方程
export interface MvpyResult {
  m: number
  v: number
  p: number
  y: number
  mvSide: number
  pySide: number
  isBalanced: boolean
  imbalance: number
}

export function mvpyCheck(m: number, v: number, p: number, y: number): MvpyResult {
  const mvSide = m * v
  const pySide = p * y
  const imbalance = mvSide - pySide
  return {
    m, v, p, y, mvSide, pySide,
    isBalanced: Math.abs(imbalance) < 1.0,
    imbalance
  }
}

// 第 24 章 通胀 4 机制拆解
// 通胀 = 基础 + 货币贡献 + 需求贡献 + 供给贡献 + 预期贡献
export interface InflationComponent {
  key: string
  name: string
  value: number
}

export interface InflationDecomp {
  monetary: number
  demand: number
  supply: number
  expect: number
  base: number
  total: number
  components: InflationComponent[]
  dominant: string
}

export function inflationDecomp(
  m2Growth: number,
  outputGap: number,
  oilShock: number,
  expectGap: number
): InflationDecomp {
  const monetary = Math.max(0, (m2Growth - 5) * 0.3)
  const demand = Math.max(0, outputGap * 0.6)
  const supply = oilShock * 0.04
  const expect = expectGap * 0.7
  const base = 1.5
  const total = base + monetary + demand + supply + expect

  const components: InflationComponent[] = [
    { key: 'mon', name: '货币驱动 M', value: monetary },
    { key: 'dem', name: '需求拉动 D', value: demand },
    { key: 'sup', name: '供给推动 S', value: supply },
    { key: 'exp', name: '预期驱动 E', value: expect }
  ]
  const sorted = [...components].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  return {
    monetary, demand, supply, expect, base, total, components,
    dominant: sorted[0].name
  }
}

// 第 23 章 货币政策 5 大传导渠道
// 给定 Fed 行动 + 经济状态,计算每个渠道的"传导强度"(0-100)
// 5 渠道:
//   1 利率渠道 — Fed 利率 → 投资 / 消费
//   2 资产价格 — 利率 → 股 / 房 → 财富效应
//   3 信贷渠道 — 银行愿不愿放贷
//   4 资产负债表 — 借款人净值 → 信用可获得
//   5 流动性效应 — 消费者去/加杠杆
export interface Channel {
  key: string
  name: string
  strength: number      // 0-100 该渠道当前传导强度
}

export interface ChannelResult {
  channels: Channel[]
  total: number          // 总政策有效性 0-100
  dominant: string       // 当前最强渠道
  weakest: string        // 当前最弱渠道
}

export function channelTransmission(
  fedAction: number,        // -100(强紧缩)~ +100(强宽松)
  bankHealth: number,       // 0-100 银行体系健康
  borrowerNetworth: number, // 0-100 借款人资产负债表
  ratePosition: number,     // 当前利率位置 0-100(0 = ZLB, 100 = 高位)
  consumerLeverage: number  // 0-100 消费者杠杆水平
): ChannelResult {
  // 简化:每个渠道的强度 = f(渠道相关因素)
  const fedAbs = Math.abs(fedAction)
  // 1 利率渠道:在高利率位置传导强,ZLB 时弱
  const c1 = Math.min(100, fedAbs * 0.5 + ratePosition * 0.4)
  // 2 资产价格:在 bull market 时强(简化为 ratePosition + bankHealth)
  const c2 = Math.min(100, fedAbs * 0.4 + (bankHealth + ratePosition) / 4)
  // 3 信贷渠道:银行健康度直接决定
  const c3 = Math.min(100, fedAbs * 0.3 + bankHealth * 0.7)
  // 4 资产负债表:借款人净值
  const c4 = Math.min(100, fedAbs * 0.3 + borrowerNetworth * 0.7)
  // 5 流动性效应:消费者杠杆 + Fed 行动
  const c5 = Math.min(100, fedAbs * 0.4 + (100 - consumerLeverage) * 0.5)

  const channels: Channel[] = [
    { key: 'rate',     name: '① 利率渠道',           strength: c1 },
    { key: 'asset',    name: '② 资产价格 / 财富效应', strength: c2 },
    { key: 'credit',   name: '③ 信贷渠道',           strength: c3 },
    { key: 'balance',  name: '④ 资产负债表渠道',     strength: c4 },
    { key: 'liquid',   name: '⑤ 流动性效应',         strength: c5 }
  ]

  const total = channels.reduce((sum, c) => sum + c.strength, 0) / 5
  const sorted = [...channels].sort((a, b) => b.strength - a.strength)

  return {
    channels,
    total,
    dominant: sorted[0].name,
    weakest: sorted[sorted.length - 1].name
  }
}

// 第 22 章 AD-AS 模型
// 简化方程:
//   AD : Y = 100 + 5·adShift - 1.5·P     (负斜率)
//   SRAS: P = 4 + srasShift + 0.3·(Y - 100)  (正斜率,短期工资粘性)
//   LRAS: Y = potentialY                  (垂直,长期由供给决定)
export interface ADASEquilibrium {
  shortP: number      // 短期均衡价格水平
  shortY: number      // 短期均衡产出
  longP: number       // 长期均衡价格(在 LRAS 上)
  longY: number       // = potentialY
  outputGap: number   // shortY - potentialY(>0 过热,<0 衰退)
  inflationPressure: 'rising' | 'falling' | 'stable'
}

export function adasEquilibrium(
  adShift: number,
  srasShift: number,
  potentialY: number
): ADASEquilibrium {
  // 联立 AD 和 SRAS:
  // P = (4 + srasShift + 1.5·adShift) / 1.45
  const shortP = (4 + srasShift + 1.5 * adShift) / 1.45
  const shortY = 100 + 5 * adShift - 1.5 * shortP

  // 长期 P 在 LRAS 上(Y = potentialY)
  const longP = (100 + 5 * adShift - potentialY) / 1.5

  const outputGap = shortY - potentialY
  let inflationPressure: ADASEquilibrium['inflationPressure'] = 'stable'
  if (outputGap > 1) inflationPressure = 'rising'
  else if (outputGap < -1) inflationPressure = 'falling'

  return { shortP, shortY, longP, longY: potentialY, outputGap, inflationPressure }
}

// 第 13 章 FOMC 点阵图
// 给定经济状态(通胀缺口/产出缺口/不确定性),模拟 12 位委员的点阵分布
export interface FomcDot {
  position: number     // 委员预测的政策利率
  faction: 'hawk' | 'mid' | 'dove'
}

export interface FomcDotPlotResult {
  dots: FomcDot[]
  median: number
  hawkPct: number
  midPct: number
  dovePct: number
}

export function fomcDotPlot(
  inflationGap: number,    // π - π*
  outputGap: number,       // y - y*
  uncertainty: number      // 0-100,委员意见分歧度
): FomcDotPlotResult {
  // 中心 ≈ 泰勒规则隐含利率(简化:r* + π_target + 通胀缺口贡献 + 产出贡献)
  const center = 0.5 + 2.0 + inflationGap * 1.5 + outputGap * 0.5
  // 散布度 = 不确定性 + 通胀缺口波动
  const spread = uncertainty / 30 + Math.abs(inflationGap) * 0.2

  // 12 位委员,围绕中心散布
  const dots: FomcDot[] = []
  const N = 12
  for (let i = 0; i < N; i++) {
    // 偏移按顺序分布,左右对称
    const offset = ((i - (N - 1) / 2) / (N - 1)) * spread * 5
    const position = Math.max(0, center + offset)
    let faction: 'hawk' | 'mid' | 'dove'
    if (offset > spread * 0.8) faction = 'hawk'
    else if (offset < -spread * 0.8) faction = 'dove'
    else faction = 'mid'
    dots.push({ position, faction })
  }

  const sorted = [...dots].sort((a, b) => a.position - b.position)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1].position + sorted[sorted.length / 2].position) / 2
    : sorted[Math.floor(sorted.length / 2)].position

  const hawks = dots.filter(d => d.faction === 'hawk').length
  const mids = dots.filter(d => d.faction === 'mid').length
  const doves = dots.filter(d => d.faction === 'dove').length

  return {
    dots,
    median,
    hawkPct: hawks / N * 100,
    midPct: mids / N * 100,
    dovePct: doves / N * 100
  }
}

// 第 15 章 Fed 利率走廊
// 模型:
//   - 准备金充足(reserves ≥ 目标 $3T):EFFR 在 IORB 与 ON RRP 之间,接近 ON RRP
//   - 紧张(70-100%):EFFR 接近 IORB
//   - 严重短缺(<70%):IORB 失去控制,EFFR 与 REPO 突破上限(2019.9 状态)
export interface CorridorResult {
  effr: number              // EFFR 估算(%)
  repo: number              // REPO 利率(%)
  corridor: 'normal' | 'tight' | 'broken'
  reservesPct: number       // 准备金占目标 %
}

export function rateCorridor(
  iorb: number,
  onRrp: number,
  reserves: number,
  reservesTarget: number = 3.0
): CorridorResult {
  const ratio = reserves / reservesTarget
  let effr: number, repo: number
  let corridor: CorridorResult['corridor']

  if (ratio >= 1.0) {
    // 充足:EFFR 在走廊内,接近 ON RRP + 部分溢价
    effr = onRrp + (iorb - onRrp) * 0.5
    repo = effr - 0.02
    corridor = 'normal'
  } else if (ratio >= 0.7) {
    // 紧张:EFFR 接近 IORB
    effr = iorb - (1 - ratio) * 0.3
    repo = effr + 0.1
    corridor = 'tight'
  } else {
    // 严重短缺:走廊失控
    const spike = (0.7 - ratio) / 0.7
    effr = iorb + spike * 1.0
    repo = iorb + spike * 6.0  // REPO 飙升(2019.9 模式)
    corridor = 'broken'
  }

  return { effr, repo, corridor, reservesPct: ratio * 100 }
}

// 第 16 章 泰勒规则
// i* = r* + π + α(π - π*) + β(y - y*)
//   r* 自然实际利率
//   π 当前通胀,π* 通胀目标(默认 2%)
//   y - y* 产出缺口(正 = 过热,负 = 衰退)
//   α / β 反应系数(标准 = 0.5)
export interface TaylorRuleResult {
  impliedRate: number     // 泰勒规则隐含利率
  inflationGap: number    // π - π*
  inflationContrib: number  // α × inflationGap
  outputContrib: number     // β × outputGap
}

export function taylorRule(
  inflation: number,
  inflationTarget: number,
  outputGap: number,
  naturalRate: number,
  alpha: number = 0.5,
  beta: number = 0.5
): TaylorRuleResult {
  const inflationGap = inflation - inflationTarget
  const inflationContrib = alpha * inflationGap
  const outputContrib = beta * outputGap
  const impliedRate = naturalRate + inflation + inflationContrib + outputContrib
  return { impliedRate, inflationGap, inflationContrib, outputContrib }
}

// 第 12 章 危机时序帧插值
// 在两个相邻 frame 之间线性插值(progress 0-100)
import type { CrisisFrame } from '../data/ch12-crises'

export function interpolateCrisis(frames: CrisisFrame[], progress: number): CrisisFrame {
  const p = Math.max(0, Math.min(100, progress))
  // 找到相邻两帧
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i]
    const b = frames[i + 1]
    if (p >= a.progress && p <= b.progress) {
      const t = (p - a.progress) / Math.max(1, b.progress - a.progress)
      return {
        progress: p,
        creditSpread: a.creditSpread + (b.creditSpread - a.creditSpread) * t,
        vix: a.vix + (b.vix - a.vix) * t,
        bankFailures: a.bankFailures + (b.bankFailures - a.bankFailures) * t,
        fedResponse: a.fedResponse + (b.fedResponse - a.fedResponse) * t,
        // 阶段标签:用接近的那一帧
        stage: t < 0.5 ? a.stage : b.stage,
        stageLabel: t < 0.5 ? a.stageLabel : b.stageLabel,
        eventNote: t < 0.5 ? a.eventNote : b.eventNote
      }
    }
  }
  return frames[frames.length - 1]
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
