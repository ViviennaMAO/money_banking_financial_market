/* FRED 数据基线(打进客户端的兜底数据)
 *
 * 当 GitHub Actions 还没运行 / CDN 失败 / 离线时使用
 * 真实数据由 .github/workflows/fred-sync.yml 每日刷新到 public/data/fred-latest.json
 *
 * 数据快照:2026-04-30(基于公开 FRED 序列的最近读数)
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
  /** 通胀:CPI YoY */
  cpiYoY: { value: number; unit: '%'; date: string }
  /** 核心 CPI YoY */
  coreCpiYoY: { value: number; unit: '%'; date: string }
  /** PCE YoY */
  pceYoY: { value: number; unit: '%'; date: string }
  /** Core PCE YoY */
  corePceYoY: { value: number; unit: '%'; date: string }
  /** 2s10s 即期(bps) */
  spread2s10sBps: { value: number; unit: 'bps'; date: string }
  /** M2 YoY */
  m2YoY: { value: number; unit: '%'; date: string }
  /** Fed 资产 vs 峰值 (T) */
  walclVsPeak: { value: number; peak: number; unit: 'T'; date: string }
  /** 泰勒规则建议利率(自计算) */
  taylorImplied: { value: number; unit: '%'; inputs: { piPct: number; piStarPct: number; outputGapPct: number; rStarPct: number } }
  /** 房贷月供基准:50 万贷款 30 年期 */
  mortgageMonthlyAt500k: { value: number; unit: 'USD'; rate: number }
}

export interface FredSnapshot {
  /** 最新日期(数据中最新的) */
  asOf: string
  /** 拉取时间(ms timestamp) */
  fetchedAt: number
  /** 数据源 */
  source: 'fred-baseline' | 'fred-live' | 'fred-cache'
  /** 主序列 */
  series: Partial<Record<FredSeriesId, FredPoint>>
  /** 派生指标 */
  derived: FredDerived
}

/* ===== 兜底基线 · 2026-04-30 ===== */

export const fredBaseline: FredSnapshot = {
  asOf: '2026-04-30',
  fetchedAt: 1746000000000,
  source: 'fred-baseline',
  series: {
    DFF: {
      id: 'DFF', name: '联邦基金利率', value: 4.33, unit: '%',
      date: '2026-04-30', change1: 0, change1y: -0.92, freq: 'd'
    },
    DGS2: {
      id: 'DGS2', name: '2 年期美债', value: 3.92, unit: '%',
      date: '2026-04-30', change1: -0.04, change1y: -0.86, freq: 'd'
    },
    DGS10: {
      id: 'DGS10', name: '10 年期美债', value: 4.05, unit: '%',
      date: '2026-04-30', change1: -0.02, change1y: -0.42, freq: 'd'
    },
    DGS30: {
      id: 'DGS30', name: '30 年期美债', value: 4.45, unit: '%',
      date: '2026-04-30', change1: 0.01, change1y: -0.18, freq: 'd'
    },
    T10Y2Y: {
      id: 'T10Y2Y', name: '10Y-2Y 利差', value: 0.13, unit: '%',
      date: '2026-04-30', change1: 0.02, change1y: 0.44, freq: 'd'
    },
    T10YIE: {
      id: 'T10YIE', name: '10Y 通胀盈亏平衡', value: 2.32, unit: '%',
      date: '2026-04-30', change1: -0.01, change1y: -0.05, freq: 'd'
    },
    SOFR: {
      id: 'SOFR', name: '隔夜担保融资利率', value: 4.30, unit: '%',
      date: '2026-04-30', change1: 0, change1y: -0.95, freq: 'd'
    },
    IORB: {
      id: 'IORB', name: '准备金利率(走廊上沿)', value: 4.40, unit: '%',
      date: '2026-04-30', change1: 0, change1y: -1.00, freq: 'd'
    },
    CPIAUCSL: {
      id: 'CPIAUCSL', name: 'CPI 总指数', value: 322.5, unit: 'index',
      date: '2026-03-01', change1: 0.7, change1y: 7.5, freq: 'm'
    },
    CPILFESL: {
      id: 'CPILFESL', name: '核心 CPI 指数', value: 332.8, unit: 'index',
      date: '2026-03-01', change1: 0.9, change1y: 9.4, freq: 'm'
    },
    PCEPI: {
      id: 'PCEPI', name: 'PCE 价格指数', value: 128.4, unit: 'index',
      date: '2026-03-01', change1: 0.3, change1y: 2.9, freq: 'm'
    },
    PCEPILFE: {
      id: 'PCEPILFE', name: '核心 PCE 指数', value: 127.9, unit: 'index',
      date: '2026-03-01', change1: 0.4, change1y: 3.4, freq: 'm'
    },
    M1SL: {
      id: 'M1SL', name: 'M1 货币总量', value: 18120, unit: 'B',
      date: '2026-03-01', change1: 24, change1y: 120, freq: 'm'
    },
    M2SL: {
      id: 'M2SL', name: 'M2 货币总量', value: 21800, unit: 'B',
      date: '2026-03-01', change1: 130, change1y: 1450, freq: 'm'
    },
    WALCL: {
      id: 'WALCL', name: 'Fed 资产负债表', value: 7100, unit: 'B',
      date: '2026-04-23', change1: -8, change1y: -440, freq: 'w'
    },
    UNRATE: {
      id: 'UNRATE', name: '失业率', value: 4.1, unit: '%',
      date: '2026-03-01', change1: 0.0, change1y: 0.3, freq: 'm'
    },
    GDPC1: {
      id: 'GDPC1', name: '实际 GDP(链式)', value: 23250, unit: 'B',
      date: '2026-03-01', change1: 110, change1y: 510, freq: 'q'
    },
    DEXJPUS: {
      id: 'DEXJPUS', name: 'USD/JPY', value: 145.3, unit: 'JPY',
      date: '2026-04-30', change1: -0.4, change1y: -10.2, freq: 'd'
    },
    DEXUSEU: {
      id: 'DEXUSEU', name: 'EUR/USD', value: 1.085, unit: 'USD',
      date: '2026-04-30', change1: 0.002, change1y: -0.025, freq: 'd'
    },
    DTWEXBGS: {
      id: 'DTWEXBGS', name: '美元贸易加权指数', value: 121.4, unit: 'index',
      date: '2026-04-30', change1: -0.1, change1y: 1.4, freq: 'd'
    },
    MORTGAGE30US: {
      id: 'MORTGAGE30US', name: '30 年期固定房贷利率', value: 6.45, unit: '%',
      date: '2026-04-25', change1: -0.05, change1y: -0.78, freq: 'w'
    }
  },
  derived: {
    cpiYoY: { value: 2.4, unit: '%', date: '2026-03-01' },
    coreCpiYoY: { value: 2.9, unit: '%', date: '2026-03-01' },
    pceYoY: { value: 2.3, unit: '%', date: '2026-03-01' },
    corePceYoY: { value: 2.7, unit: '%', date: '2026-03-01' },
    spread2s10sBps: { value: 13, unit: 'bps', date: '2026-04-30' },
    m2YoY: { value: 7.2, unit: '%', date: '2026-03-01' },
    walclVsPeak: { value: 7.10, peak: 8.96, unit: 'T', date: '2026-04-23' },
    taylorImplied: {
      value: 5.5, unit: '%',
      inputs: { piPct: 2.4, piStarPct: 2.0, outputGapPct: 0.0, rStarPct: 2.5 }
    },
    mortgageMonthlyAt500k: { value: 3140, unit: 'USD', rate: 6.45 }
  }
}
