import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch9Snapshots, type PredictDef } from '../../utils/snapshots'
import { bankStressTest } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

const riskMeta: Record<string, { label: string; cls: string; desc: string }> = {
  safe: {
    label: '🟢 安全',
    cls: 'risk-safe',
    desc: 'CET1 充足 + 流动性储备充裕,通过压力测试。'
  },
  warning: {
    label: '🟡 警示',
    cls: 'risk-warn',
    desc: 'CET1 接近监管下限,或流动性储备勉强够用。需关注。'
  },
  capital_breach: {
    label: '🔴 资本击穿',
    cls: 'risk-cap',
    desc: '真实资本(扣 HTM 浮亏后)< 0,银行已资不抵债。'
  },
  liquidity_run: {
    label: '🔴 挤兑爆发',
    cls: 'risk-liq',
    desc: '准备金 < 提款需求,银行无法满足储户取款 → 倒闭。'
  }
}

export default function Ch9Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({
    deposits: 100, loanPct: 55, longBondPct: 15, capitalPct: 10,
    rateShock: 0, withdrawPct: 5
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => bankStressTest(
      params.deposits, params.loanPct, params.longBondPct,
      params.capitalPct, params.rateShock, params.withdrawPct
    ),
    [params]
  )

  const reservePct = Math.max(0, 100 - params.loanPct - params.longBondPct)
  const meta = riskMeta[result.collapseRisk]

  function loadSnapshot(key: string) {
    const s = ch9Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch9Snapshots[key]
    setParams({
      deposits: s.deposits, loanPct: s.loanPct, longBondPct: s.longBondPct,
      capitalPct: s.capitalPct, rateShock: s.rateShock, withdrawPct: s.withdrawPct
    })
    setNote(s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    setReveal({ headline: predict.revealHeadline, msg: predict.revealMsg, correct })
    setPredict(null)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingSnap) { applySnapshot(pendingSnap); setPendingSnap(null) }
  }

  Taro.useShareAppMessage(() => ({
    title: `第 9 章 · CET1 ${result.cet1Ratio.toFixed(1)}% · ${meta.label}`,
    path: '/pages/ch9/index'
  }))

  return (
    <ScrollView scrollY className='ch9'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🏦 银行压力测试', '🏦 Bank Stress Test')}</Text>
        <Text className='page-meta'>{S('第 9 章', 'Chapter 9')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: 'normal', label: '健康银行' },
          { key: '2008', label: '2008 雷曼' },
          { key: '2023', label: '2023 SVB ⚡', accent: 'danger' },
          { key: '2024cre', label: '2024 商业地产' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 资产负债表可视化 */}
      <View className={`bs-card ${flash ? 'flash' : ''}`}>
        <Text className='bs-tag'>资产负债表 · 总资产 ${result.totalAssets.toFixed(0)}B</Text>
        <View className='bs-row bs-asset'>
          <Text className='bs-side'>资产端</Text>
          <View className='bs-bar'>
            <View className='bs-seg seg-loan' style={{ width: `${params.loanPct}%` }}>
              <Text>{params.loanPct}% 贷款</Text>
            </View>
            <View className='bs-seg seg-bond' style={{ width: `${params.longBondPct}%` }}>
              <Text>{params.longBondPct}% 长债</Text>
            </View>
            <View className='bs-seg seg-reserve' style={{ width: `${reservePct}%` }}>
              <Text>{reservePct}% 储备</Text>
            </View>
          </View>
        </View>
        <View className='bs-row bs-liab'>
          <Text className='bs-side'>负债端</Text>
          <View className='bs-bar'>
            <View className='bs-seg seg-deposit' style={{ width: `${100 - params.capitalPct}%` }}>
              <Text>{(100 - params.capitalPct).toFixed(0)}% 存款</Text>
            </View>
            <View className='bs-seg seg-capital' style={{ width: `${params.capitalPct}%` }}>
              <Text>{params.capitalPct}% 资本</Text>
            </View>
          </View>
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>调整资产配置 + 压力情境</Text>
        <SliderRow label='总存款规模' value={params.deposits} prefix='$' unit='B' min={50} max={500} step={10}
          onChange={v => setParams(p => ({ ...p, deposits: v }))} />
        <SliderRow label='贷款占资产 %' value={params.loanPct} unit='%' min={0} max={75} step={1}
          onChange={v => setParams(p => ({ ...p, loanPct: Math.round(v) }))} />
        <SliderRow label='长期国债占资产 %' value={params.longBondPct} unit='%' min={0} max={50} step={1}
          onChange={v => setParams(p => ({ ...p, longBondPct: Math.round(v) }))} />
        <SliderRow label='资本占资产 %(Basel ≥ 8%)' value={params.capitalPct} unit='%' min={2} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, capitalPct: v }))} />
        <SliderRow label='⚡ 利率冲击(Fed 加息)' value={params.rateShock} unit='%' min={0} max={6} step={0.25}
          onChange={v => setParams(p => ({ ...p, rateShock: v }))} />
        <SliderRow label='⚡ 提款冲击(挤兑)' value={params.withdrawPct} unit='%' min={0} max={50} step={1}
          onChange={v => setParams(p => ({ ...p, withdrawPct: Math.round(v) }))} />
      </View>

      {/* 压力测试结果 */}
      <View className={`stress-card ${meta.cls}`}>
        <Text className='stress-tag'>压力测试结果</Text>
        <View className='stress-grid'>
          <View>
            <Text className='stress-label'>真实 CET1</Text>
            <Text className={`stress-big ${result.cet1Ratio < 4 ? 'val-bad' : result.cet1Ratio < 8 ? 'val-warn' : 'val-good'}`}>
              {result.cet1Ratio.toFixed(1)}%
            </Text>
            <Text className='stress-mini'>Basel 监管下限 8%</Text>
          </View>
          <View>
            <Text className='stress-label'>LCR 流动性</Text>
            <Text className={`stress-big ${result.lcr < 100 ? 'val-bad' : result.lcr < 130 ? 'val-warn' : 'val-good'}`}>
              {result.lcr > 999 ? '∞' : result.lcr.toFixed(0)}%
            </Text>
            <Text className='stress-mini'>监管下限 100%</Text>
          </View>
          <View>
            <Text className='stress-label'>HTM 浮亏</Text>
            <Text className={`stress-mid ${result.htmLoss > 0 ? 'val-bad' : 'val-neu'}`}>
              -${result.htmLoss.toFixed(1)}B
            </Text>
            <Text className='stress-mini'>会计不计入,但真实资本受损</Text>
          </View>
          <View>
            <Text className='stress-label'>真实资本</Text>
            <Text className={`stress-mid ${result.realCapital < 0 ? 'val-bad' : 'val-good'}`}>
              ${result.realCapital.toFixed(1)}B
            </Text>
            <Text className='stress-mini'>= 账面资本 - HTM 浮亏</Text>
          </View>
        </View>
        <View className='status-row'>
          <Text className='status-label'>状态:</Text>
          <Text className={`status-big ${meta.cls}`}>{meta.label}</Text>
        </View>
        <Text className='status-desc'>{meta.desc}</Text>
      </View>

      {note ? <Text className='ch9-note'>{note}</Text> : null}

      {/* 隐性风险公式 */}
      <View className='formula-card'>
        <Text className='formula-tag'>🩺 SVB 隐性风险公式</Text>
        <Text className='formula-text'>HTM 长债 × 利率冲击 × 久期 + 客户集中提款</Text>
        <Text className='formula-detail'>
          这就是 2023 SVB 的真实倒闭机制 — 账面利润正常,但 HTM 国债持仓让真实资本对利率敏感。
          利率冲击越大、长债占比越高、客户越集中,银行越脆弱。
        </Text>
        <View className='formula-tips'>
          <Text className='tip-line'>💡 试试:把"长债占比"调到 40%(SVB 实际值),再调"利率冲击" 4%。</Text>
          <Text className='tip-line'>💡 然后调"提款冲击" 25%(SVB 实际)。看会发生什么。</Text>
        </View>
      </View>

      <Text className='hint'>💡 切「2023 SVB ⚡」→ 猜"账面正常为何崩" → 揭示 HTM + 集中 + 利率三件套。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
