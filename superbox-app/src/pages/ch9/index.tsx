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

export default function Ch9Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

  const riskMeta: Record<string, { label: string; cls: string; desc: string }> = {
    safe: {
      label: S('🟢 安全', '🟢 Safe'),
      cls: 'risk-safe',
      desc: S(
        'CET1 充足 + 流动性储备充裕,通过压力测试。',
        'CET1 strong + ample liquidity reserves — passes the stress test.'
      )
    },
    warning: {
      label: S('🟡 警示', '🟡 Warning'),
      cls: 'risk-warn',
      desc: S(
        'CET1 接近监管下限,或流动性储备勉强够用。需关注。',
        'CET1 near regulatory floor, or liquidity reserves just barely sufficient. Watch closely.'
      )
    },
    capital_breach: {
      label: S('🔴 资本击穿', '🔴 Capital Breach'),
      cls: 'risk-cap',
      desc: S(
        '真实资本(扣 HTM 浮亏后)< 0,银行已资不抵债。',
        'Real capital (after HTM unrealized losses) < 0 — the bank is insolvent.'
      )
    },
    liquidity_run: {
      label: S('🔴 挤兑爆发', '🔴 Bank Run'),
      cls: 'risk-liq',
      desc: S(
        '准备金 < 提款需求,银行无法满足储户取款 → 倒闭。',
        "Reserves < withdrawals — the bank can't meet depositor demands → collapse."
      )
    }
  }

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
    setNote(locale === 'en' && (s as any).note_en ? (s as any).note_en : s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    const headline = locale === 'en' && predict.revealHeadline_en
      ? predict.revealHeadline_en : predict.revealHeadline
    const msg = locale === 'en' && predict.revealMsg_en
      ? predict.revealMsg_en : predict.revealMsg
    setReveal({ headline, msg, correct })
    setPredict(null)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingSnap) { applySnapshot(pendingSnap); setPendingSnap(null) }
  }

  Taro.useShareAppMessage(() => ({
    title: locale === 'en'
      ? `Ch.9 · CET1 ${result.cet1Ratio.toFixed(1)}% · ${meta.label}`
      : `第 9 章 · CET1 ${result.cet1Ratio.toFixed(1)}% · ${meta.label}`,
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
          { key: 'normal', label: S('健康银行', 'Healthy bank') },
          { key: '2008', label: S('2008 雷曼', '2008 Lehman') },
          { key: '2023', label: S('2023 SVB ⚡', '2023 SVB ⚡'), accent: 'danger' },
          { key: '2024cre', label: S('2024 商业地产', '2024 CRE stress') },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* Balance sheet visualization */}
      <View className={`bs-card ${flash ? 'flash' : ''}`}>
        <Text className='bs-tag'>
          {S(
            `资产负债表 · 总资产 $${result.totalAssets.toFixed(0)}B`,
            `Balance Sheet · Total assets $${result.totalAssets.toFixed(0)}B`
          )}
        </Text>
        <View className='bs-row bs-asset'>
          <Text className='bs-side'>{S('资产端', 'Assets')}</Text>
          <View className='bs-bar'>
            <View className='bs-seg seg-loan' style={{ width: `${params.loanPct}%` }}>
              <Text>{params.loanPct}% {S('贷款', 'Loans')}</Text>
            </View>
            <View className='bs-seg seg-bond' style={{ width: `${params.longBondPct}%` }}>
              <Text>{params.longBondPct}% {S('长债', 'Long bonds')}</Text>
            </View>
            <View className='bs-seg seg-reserve' style={{ width: `${reservePct}%` }}>
              <Text>{reservePct}% {S('储备', 'Reserves')}</Text>
            </View>
          </View>
        </View>
        <View className='bs-row bs-liab'>
          <Text className='bs-side'>{S('负债端', 'Liabilities')}</Text>
          <View className='bs-bar'>
            <View className='bs-seg seg-deposit' style={{ width: `${100 - params.capitalPct}%` }}>
              <Text>{(100 - params.capitalPct).toFixed(0)}% {S('存款', 'Deposits')}</Text>
            </View>
            <View className='bs-seg seg-capital' style={{ width: `${params.capitalPct}%` }}>
              <Text>{params.capitalPct}% {S('资本', 'Capital')}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>{S('调整资产配置 + 压力情境', 'Adjust asset mix + stress scenario')}</Text>
        <SliderRow label={S('总存款规模', 'Total deposits')} value={params.deposits} prefix='$' unit='B' min={50} max={500} step={10}
          onChange={v => setParams(p => ({ ...p, deposits: v }))} />
        <SliderRow label={S('贷款占资产 %', 'Loans % of assets')} value={params.loanPct} unit='%' min={0} max={75} step={1}
          onChange={v => setParams(p => ({ ...p, loanPct: Math.round(v) }))} />
        <SliderRow label={S('长期国债占资产 %', 'Long-bond % of assets')} value={params.longBondPct} unit='%' min={0} max={50} step={1}
          onChange={v => setParams(p => ({ ...p, longBondPct: Math.round(v) }))} />
        <SliderRow label={S('资本占资产 %(Basel ≥ 8%)', 'Capital % (Basel ≥ 8%)')} value={params.capitalPct} unit='%' min={2} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, capitalPct: v }))} />
        <SliderRow label={S('⚡ 利率冲击(Fed 加息)', '⚡ Rate shock (Fed hike)')} value={params.rateShock} unit='%' min={0} max={6} step={0.25}
          onChange={v => setParams(p => ({ ...p, rateShock: v }))} />
        <SliderRow label={S('⚡ 提款冲击(挤兑)', '⚡ Withdrawal shock (run)')} value={params.withdrawPct} unit='%' min={0} max={50} step={1}
          onChange={v => setParams(p => ({ ...p, withdrawPct: Math.round(v) }))} />
      </View>

      {/* Stress test result */}
      <View className={`stress-card ${meta.cls}`}>
        <Text className='stress-tag'>{S('压力测试结果', 'Stress Test Result')}</Text>
        <View className='stress-grid'>
          <View>
            <Text className='stress-label'>{S('真实 CET1', 'Real CET1')}</Text>
            <Text className={`stress-big ${result.cet1Ratio < 4 ? 'val-bad' : result.cet1Ratio < 8 ? 'val-warn' : 'val-good'}`}>
              {result.cet1Ratio.toFixed(1)}%
            </Text>
            <Text className='stress-mini'>{S('Basel 监管下限 8%', 'Basel floor: 8%')}</Text>
          </View>
          <View>
            <Text className='stress-label'>{S('LCR 流动性', 'LCR Liquidity')}</Text>
            <Text className={`stress-big ${result.lcr < 100 ? 'val-bad' : result.lcr < 130 ? 'val-warn' : 'val-good'}`}>
              {result.lcr > 999 ? '∞' : result.lcr.toFixed(0)}%
            </Text>
            <Text className='stress-mini'>{S('监管下限 100%', 'Regulatory floor: 100%')}</Text>
          </View>
          <View>
            <Text className='stress-label'>{S('HTM 浮亏', 'HTM Unrealized Loss')}</Text>
            <Text className={`stress-mid ${result.htmLoss > 0 ? 'val-bad' : 'val-neu'}`}>
              -${result.htmLoss.toFixed(1)}B
            </Text>
            <Text className='stress-mini'>{S('会计不计入,但真实资本受损', "Off books, but real capital is hit")}</Text>
          </View>
          <View>
            <Text className='stress-label'>{S('真实资本', 'Real Capital')}</Text>
            <Text className={`stress-mid ${result.realCapital < 0 ? 'val-bad' : 'val-good'}`}>
              ${result.realCapital.toFixed(1)}B
            </Text>
            <Text className='stress-mini'>{S('= 账面资本 - HTM 浮亏', '= Book capital − HTM loss')}</Text>
          </View>
        </View>
        <View className='status-row'>
          <Text className='status-label'>{S('状态:', 'Status:')}</Text>
          <Text className={`status-big ${meta.cls}`}>{meta.label}</Text>
        </View>
        <Text className='status-desc'>{meta.desc}</Text>
      </View>

      {note ? <Text className='ch9-note'>{note}</Text> : null}

      {/* Hidden-risk formula */}
      <View className='formula-card'>
        <Text className='formula-tag'>{S('🩺 SVB 隐性风险公式', '🩺 SVB Hidden-Risk Formula')}</Text>
        <Text className='formula-text'>
          {S(
            'HTM 长债 × 利率冲击 × 久期 + 客户集中提款',
            'HTM long-bond × rate shock × duration + concentrated customer withdrawals'
          )}
        </Text>
        <Text className='formula-detail'>
          {S(
            '这就是 2023 SVB 的真实倒闭机制 — 账面利润正常,但 HTM 国债持仓让真实资本对利率敏感。利率冲击越大、长债占比越高、客户越集中,银行越脆弱。',
            "This is the true 2023 SVB collapse mechanism — book earnings look fine, but HTM Treasury holdings make real capital rate-sensitive. The larger the rate shock, the higher the long-bond share, the more concentrated the customer base, the more fragile the bank."
          )}
        </Text>
        <View className='formula-tips'>
          <Text className='tip-line'>
            {S(
              '💡 试试:把"长债占比"调到 40%(SVB 实际值),再调"利率冲击" 4%。',
              '💡 Try: set long-bond share to 40% (SVB actual), then rate shock to 4%.'
            )}
          </Text>
          <Text className='tip-line'>
            {S(
              '💡 然后调"提款冲击" 25%(SVB 实际)。看会发生什么。',
              '💡 Then set withdrawal shock to 25% (SVB actual). Watch what happens.'
            )}
          </Text>
        </View>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2023 SVB ⚡」→ 猜"账面正常为何崩" → 揭示 HTM + 集中 + 利率三件套。',
          '💡 Switch to "2023 SVB ⚡" → predict why a "fine on paper" bank collapsed → reveal the HTM + concentration + rate trinity.'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
