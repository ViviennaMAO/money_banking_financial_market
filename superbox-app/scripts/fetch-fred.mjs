#!/usr/bin/env node
/**
 * FRED 数据拉取脚本
 *
 * 用法:
 *   FRED_API_KEY=xxx node scripts/fetch-fred.mjs
 *   输出 → public/data/fred-latest.json
 *
 * 申请 API key:https://fred.stlouisfed.org/docs/api/api_key.html(免费)
 *
 * 在 GitHub Actions 中,通过 secrets.FRED_API_KEY 注入,每天 02:00 UTC 自动运行。
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_FILE = path.join(__dirname, '..', 'public', 'data', 'fred-latest.json')

const API_KEY = process.env.FRED_API_KEY
if (!API_KEY) {
  console.error('❌ FRED_API_KEY env var 未设置 — 跳过拉取')
  console.error('   申请免费 key:https://fred.stlouisfed.org/docs/api/api_key.html')
  process.exit(0) // 退出码 0,不让 CI 失败
}

const BASE = 'https://api.stlouisfed.org/fred/series/observations'

/* ====== 序列定义 ====== */

const SERIES = [
  { id: 'DFF',          name: '联邦基金利率',        unit: '%',     freq: 'd' },
  { id: 'DGS2',         name: '2 年期美债',          unit: '%',     freq: 'd' },
  { id: 'DGS10',        name: '10 年期美债',         unit: '%',     freq: 'd' },
  { id: 'DGS30',        name: '30 年期美债',         unit: '%',     freq: 'd' },
  { id: 'T10Y2Y',       name: '10Y-2Y 利差',         unit: '%',     freq: 'd' },
  { id: 'T10YIE',       name: '10Y 通胀盈亏平衡',     unit: '%',     freq: 'd' },
  { id: 'SOFR',         name: '隔夜担保融资利率',     unit: '%',     freq: 'd' },
  { id: 'IORB',         name: '准备金利率(走廊上沿)', unit: '%',     freq: 'd' },
  { id: 'CPIAUCSL',     name: 'CPI 总指数',          unit: 'index', freq: 'm' },
  { id: 'CPILFESL',     name: '核心 CPI 指数',       unit: 'index', freq: 'm' },
  { id: 'PCEPI',        name: 'PCE 价格指数',        unit: 'index', freq: 'm' },
  { id: 'PCEPILFE',     name: '核心 PCE 指数',       unit: 'index', freq: 'm' },
  { id: 'M1SL',         name: 'M1 货币总量',         unit: 'B',     freq: 'm' },
  { id: 'M2SL',         name: 'M2 货币总量',         unit: 'B',     freq: 'm' },
  { id: 'WALCL',        name: 'Fed 资产负债表',      unit: 'B',     freq: 'w' },
  { id: 'UNRATE',       name: '失业率',              unit: '%',     freq: 'm' },
  { id: 'GDPC1',        name: '实际 GDP(链式)',     unit: 'B',     freq: 'q' },
  { id: 'DEXJPUS',      name: 'USD/JPY',            unit: 'JPY',   freq: 'd' },
  { id: 'DEXUSEU',      name: 'EUR/USD',            unit: 'USD',   freq: 'd' },
  { id: 'DTWEXBGS',     name: '美元贸易加权指数',     unit: 'index', freq: 'd' },
  { id: 'MORTGAGE30US', name: '30 年期固定房贷利率',  unit: '%',     freq: 'w' }
]

/* ====== 拉取一个序列(取最近 ~13 个月) ====== */

async function fetchSeries(id) {
  const url = `${BASE}?series_id=${id}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=400`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`FRED ${id} HTTP ${res.status}: ${await res.text()}`)
  }
  const j = await res.json()
  if (!j.observations) throw new Error(`FRED ${id} 返回缺少 observations`)
  // 按日期升序排
  return j.observations
    .filter(o => o.value && o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
    .reverse()
}

/* ====== 主流程 ====== */

async function main() {
  console.log(`📡 开始拉取 ${SERIES.length} 个 FRED 序列...`)

  const series = {}
  for (const def of SERIES) {
    try {
      let obs = await fetchSeries(def.id)
      if (!obs.length) {
        console.warn(`⚠️  ${def.id} 无数据`)
        continue
      }
      // 单位归一:WALCL 在 FRED 是 millions of $,统一到 billions(与 M1/M2 一致)
      if (def.id === 'WALCL') {
        obs = obs.map(o => ({ date: o.date, value: o.value / 1000 }))
      }
      const latest = obs[obs.length - 1]
      const prev   = obs[obs.length - 2]
      // 找一年前(频率不同时找最近 12 期或日期最接近 -365 天的点)
      let yearAgo = null
      if (def.freq === 'd') yearAgo = obs[Math.max(0, obs.length - 252)] // ~252 工作日
      else if (def.freq === 'w') yearAgo = obs[Math.max(0, obs.length - 52)]
      else if (def.freq === 'm') yearAgo = obs[Math.max(0, obs.length - 12)]
      else if (def.freq === 'q') yearAgo = obs[Math.max(0, obs.length - 4)]

      const change1 = prev ? round(latest.value - prev.value, 4) : undefined
      const change1y = yearAgo ? round(latest.value - yearAgo.value, 4) : undefined

      series[def.id] = {
        id: def.id,
        name: def.name,
        value: round(latest.value, 4),
        unit: def.unit,
        date: latest.date,
        change1,
        change1y,
        freq: def.freq
      }
      console.log(`✓ ${def.id.padEnd(14)} ${latest.value.toFixed(2)} (${latest.date})`)
    } catch (err) {
      console.error(`✗ ${def.id}: ${err.message}`)
    }
  }

  /* === 派生指标 === */
  const derived = {}

  // CPI YoY = (latest - 12 期前) / 12 期前 × 100
  for (const [name, id] of [
    ['cpiYoY', 'CPIAUCSL'],
    ['coreCpiYoY', 'CPILFESL'],
    ['pceYoY', 'PCEPI'],
    ['corePceYoY', 'PCEPILFE'],
    ['m2YoY', 'M2SL']
  ]) {
    const s = series[id]
    if (!s || s.change1y == null) continue
    const oneYrAgoVal = s.value - s.change1y
    const yoy = oneYrAgoVal === 0 ? 0 : round((s.change1y / oneYrAgoVal) * 100, 2)
    derived[name] = { value: yoy, unit: '%', date: s.date }
  }

  // 2s10s spread (bps)
  if (series.T10Y2Y) {
    derived.spread2s10sBps = {
      value: Math.round(series.T10Y2Y.value * 100),
      unit: 'bps',
      date: series.T10Y2Y.date
    }
  }

  // Fed 资产负债表 vs 峰值 (T)
  // WALCL 已在拉取时归一为 billions,这里转 trillions
  if (series.WALCL) {
    const valueT = round(series.WALCL.value / 1000, 2)
    derived.walclVsPeak = { value: valueT, peak: 8.96, unit: 'T', date: series.WALCL.date }
  }

  // 泰勒规则:i* = r* + π + 0.5(π-π*) + 0.5(y-y*)
  // 简化:r*=2.5, π*=2, y-y* 用失业率缺口的代理 = -2 × (UNRATE - 4.4)
  // 输出在合理范围 [0, 15]
  if (derived.cpiYoY && series.UNRATE) {
    const piPct = derived.cpiYoY.value
    const piStarPct = 2.0
    const rStarPct = 2.5
    const naturalU = 4.4
    const okunCoef = -2.0
    const outputGapPct = round(okunCoef * (series.UNRATE.value - naturalU), 2)
    const taylor = rStarPct + piPct + 0.5 * (piPct - piStarPct) + 0.5 * outputGapPct
    derived.taylorImplied = {
      value: round(Math.max(0, Math.min(15, taylor)), 2),
      unit: '%',
      inputs: { piPct, piStarPct, outputGapPct, rStarPct }
    }
  }

  // 30Y 房贷 50 万 月供
  if (series.MORTGAGE30US) {
    const r = series.MORTGAGE30US.value / 100 / 12
    const n = 360
    const P = 500000
    const monthly = (P * r) / (1 - Math.pow(1 + r, -n))
    derived.mortgageMonthlyAt500k = {
      value: Math.round(monthly),
      unit: 'USD',
      rate: series.MORTGAGE30US.value
    }
  }

  /* === 找最新的总日期 === */
  const allDates = Object.values(series).map(s => s.date).filter(Boolean).sort()
  const asOf = allDates.length ? allDates[allDates.length - 1] : new Date().toISOString().slice(0, 10)

  const snapshot = {
    asOf,
    fetchedAt: Date.now(),
    source: 'fred-live',
    series,
    derived
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
  await fs.writeFile(OUT_FILE, JSON.stringify(snapshot, null, 2), 'utf8')
  console.log(`\n✅ 写入 ${OUT_FILE}`)
  console.log(`   asOf: ${asOf} · 共 ${Object.keys(series).length} 个序列 · 派生 ${Object.keys(derived).length} 项`)
}

function round(x, n = 2) {
  const k = Math.pow(10, n)
  return Math.round(x * k) / k
}

main().catch(err => {
  console.error('❌ 拉取失败:', err)
  process.exit(1)
})
