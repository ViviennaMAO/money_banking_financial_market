/* FRED 数据基线(打进客户端的兜底数据)
 *
 * 当 GitHub Actions 还没运行 / CDN 失败 / 离线时使用
 * 真实数据由 .github/workflows/fred-sync.yml 每日刷新到 public/data/fred-latest.json
 *
 * 数据快照:2026-05-01(用 fetch-fred.mjs 拉取真实 FRED 数据后同步)
 */

export type FredSeriesId =
  | 'DFF'           // Federal Funds Rate
  | 'DGS2'          // 2-Year Treasury
  | 'DGS10'         // 10-Year Treasury
  | 'DGS30'         // 30-Year Treasury
  | 'T10Y2Y'        // 2s10s spread
  | 'T10YIE'        // 10Y Breakeven Inflation
  | 'SOFR'          // Secured Overnight Financing Rate
  | 'IORB'          // Interest on Reserve Balances
  | 'CPIAUCSL'      // CPI All Items (level)
  | 'CPILFESL'      // Core CPI (level)
  | 'PCEPI'         // PCE Price Index
  | 'PCEPILFE'      // Core PCE
  | 'M1SL'          // M1
  | 'M2SL'          // M2
  | 'WALCL'         // Fed Total Assets
  | 'UNRATE'        // Unemployment
  | 'GDPC1'         // Real GDP
  | 'DEXJPUS'       // USD/JPY
  | 'DEXUSEU'       // EUR/USD
  | 'DTWEXBGS'      // Trade-Weighted Dollar Index
  | 'MORTGAGE30US'  // 30Y Fixed Mortgage Rate

export interface FredPoint {
  /** 序列名(中文) */
  name: string
  /** 当前数值 */
  value: number
  /** 单位 */
  unit: '%' | 'pp' | 'bps' | 'index' | 'B' | 'T' | 'JPY' | 'USD' | string
  /** 数据点日期 ISO */
  date: string
  /** 与 1 期前对比的变化(同单位) */
  change1?: number
  /** 与 1 年前对比 */
  change1y?: number
  /** 频率 */
  freq: 'd' | 'w' | 'm' | 'q'
  /** FRED series ID */
  id: FredSeriesId
}

export interface FredDerived {
  cpiYoY: { value: number; unit: '%'; date: string }
  coreCpiYoY: { value: number; unit: '%'; date: string }
  pceYoY: { value: number; unit: '%'; date: string }
  corePceYoY: { value: number; unit: '%'; date: string }
  spread2s10sBps: { value: number; unit: 'bps'; date: string }
  m2YoY: { value: number; unit: '%'; date: string }
  walclVsPeak: { value: number; peak: number; unit: 'T'; date: string }
  taylorImplied: { value: number; unit: '%'; inputs: { piPct: number; piStarPct: number; outputGapPct: number; rStarPct: number } }
  mortgageMonthlyAt500k: { value: number; unit: 'USD'; rate: number }
}

export interface FredSnapshot {
  asOf: string
  fetchedAt: number
  source: 'fred-baseline' | 'fred-live' | 'fred-cache'
  series: Partial<Record<FredSeriesId, FredPoint>>
  derived: FredDerived
}

/* ===== 兜底基线 · 2026-05-01(FRED 真实数据快照) ===== */

export const fredBaseline: FredSnapshot = {
  asOf: '2026-05-01',
  fetchedAt: 1777627284277,
  source: 'fred-baseline',
  series: {
    DFF:          { id: 'DFF',          name: '联邦基金利率',          value: 3.64,    unit: '%',     date: '2026-04-29', change1: 0,      change1y: -0.69,  freq: 'd' },
    DGS2:         { id: 'DGS2',         name: '2 年期美债',            value: 3.92,    unit: '%',     date: '2026-04-29', change1: 0.08,   change1y: 0.25,   freq: 'd' },
    DGS10:        { id: 'DGS10',        name: '10 年期美债',           value: 4.42,    unit: '%',     date: '2026-04-29', change1: 0.06,   change1y: 0.19,   freq: 'd' },
    DGS30:        { id: 'DGS30',        name: '30 年期美债',           value: 4.98,    unit: '%',     date: '2026-04-29', change1: 0.04,   change1y: 0.29,   freq: 'd' },
    T10Y2Y:       { id: 'T10Y2Y',       name: '10Y-2Y 利差',           value: 0.52,    unit: '%',     date: '2026-04-30', change1: 0.02,   change1y: -0.02,  freq: 'd' },
    T10YIE:       { id: 'T10YIE',       name: '10Y 通胀盈亏平衡',       value: 2.46,    unit: '%',     date: '2026-04-30', change1: 0,      change1y: 0.23,   freq: 'd' },
    SOFR:         { id: 'SOFR',         name: '隔夜担保融资利率',       value: 3.63,    unit: '%',     date: '2026-04-29', change1: -0.01,  change1y: -0.7,   freq: 'd' },
    IORB:         { id: 'IORB',         name: '准备金利率(走廊上沿)',   value: 3.65,    unit: '%',     date: '2026-05-01', change1: 0,      change1y: -0.75,  freq: 'd' },
    CPIAUCSL:     { id: 'CPIAUCSL',     name: 'CPI 总指数',            value: 330.29,  unit: 'index', date: '2026-03-01', change1: 2.83,   change1y: 10.51,  freq: 'm' },
    CPILFESL:     { id: 'CPILFESL',     name: '核心 CPI 指数',         value: 334.17,  unit: 'index', date: '2026-03-01', change1: 0.65,   change1y: 8.48,   freq: 'm' },
    PCEPI:        { id: 'PCEPI',        name: 'PCE 价格指数',          value: 130.34,  unit: 'index', date: '2026-03-01', change1: 0.86,   change1y: 4.19,   freq: 'm' },
    PCEPILFE:     { id: 'PCEPILFE',     name: '核心 PCE 指数',         value: 129.28,  unit: 'index', date: '2026-03-01', change1: 0.38,   change1y: 3.78,   freq: 'm' },
    M1SL:         { id: 'M1SL',         name: 'M1 货币总量',           value: 19436.3, unit: 'B',     date: '2026-03-01', change1: 48.9,   change1y: 814.5,  freq: 'm' },
    M2SL:         { id: 'M2SL',         name: 'M2 货币总量',           value: 22686,   unit: 'B',     date: '2026-03-01', change1: 58.7,   change1y: 910.4,  freq: 'm' },
    WALCL:        { id: 'WALCL',        name: 'Fed 资产负债表',        value: 6699.95, unit: 'B',     date: '2026-04-29', change1: -7.47,  change1y: -10.94, freq: 'w' },
    UNRATE:       { id: 'UNRATE',       name: '失业率',                value: 4.3,     unit: '%',     date: '2026-03-01', change1: -0.1,   change1y: 0.1,    freq: 'm' },
    GDPC1:        { id: 'GDPC1',        name: '实际 GDP(链式)',       value: 24174.5, unit: 'B',     date: '2026-01-01', change1: 118.78, change1y: 403.55, freq: 'q' },
    DEXJPUS:      { id: 'DEXJPUS',      name: 'USD/JPY',               value: 159.35,  unit: 'JPY',   date: '2026-04-24', change1: -0.09,  change1y: 16.71,  freq: 'd' },
    DEXUSEU:      { id: 'DEXUSEU',      name: 'EUR/USD',               value: 1.1718,  unit: 'USD',   date: '2026-04-24', change1: 0.0014, change1y: 0.0368, freq: 'd' },
    DTWEXBGS:     { id: 'DTWEXBGS',     name: '美元贸易加权指数',       value: 118.73,  unit: 'index', date: '2026-04-24', change1: 0.0139, change1y: -4.30,  freq: 'd' },
    MORTGAGE30US: { id: 'MORTGAGE30US', name: '30 年期固定房贷利率',    value: 6.30,    unit: '%',     date: '2026-04-30', change1: 0.07,   change1y: -0.46,  freq: 'w' }
  },
  derived: {
    cpiYoY:               { value: 3.29, unit: '%', date: '2026-03-01' },
    coreCpiYoY:           { value: 2.60, unit: '%', date: '2026-03-01' },
    pceYoY:               { value: 3.32, unit: '%', date: '2026-03-01' },
    corePceYoY:           { value: 3.01, unit: '%', date: '2026-03-01' },
    spread2s10sBps:       { value: 52,   unit: 'bps', date: '2026-04-30' },
    m2YoY:                { value: 4.18, unit: '%', date: '2026-03-01' },
    walclVsPeak:          { value: 6.70, peak: 8.96, unit: 'T', date: '2026-04-29' },
    taylorImplied: {
      value: 6.54, unit: '%',
      inputs: { piPct: 3.29, piStarPct: 2.0, outputGapPct: 0.2, rStarPct: 2.5 }
    },
    mortgageMonthlyAt500k: { value: 3095, unit: 'USD', rate: 6.30 }
  }
}
