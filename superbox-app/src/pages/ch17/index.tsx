import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { ch17Snapshots, type PredictDef } from '../../utils/snapshots'
import { carryReturn } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import LiveData from '../../components/LiveData'
import { useT } from '../../i18n'
import './index.scss'

export default function Ch17Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

  const [params, setParams] = useState({ id: 5.25, ifv: 0.5, ds: 0, lev: 10 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const r = carryReturn(params.id, params.ifv, params.ds, params.lev)

  function loadSnapshot(key: string) {
    const s = ch17Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch17Snapshots[key]
    setParams({ id: s.id, ifv: s.ifv, ds: s.ds, lev: s.lev })
    setNote(locale === 'en' && s.note_en ? s.note_en : s.note)
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
    if (pendingSnap) {
      applySnapshot(pendingSnap)
      setPendingSnap(null)
    }
  }

  function fmtPct(v: number, decimals = 2) {
    return (v >= 0 ? '+' : '') + v.toFixed(decimals) + '%'
  }

  function riskTag(): { label: string; cls: string } {
    const a = Math.abs(r.leveraged)
    if (a < 5) return { label: S('低', 'Low'), cls: 'risk-low' }
    if (a < 30) return { label: S('中', 'Medium'), cls: 'risk-mid' }
    if (a < 80) return { label: S('高', 'High'), cls: 'risk-high' }
    return { label: S('极高 / 爆仓', 'Extreme / margin call'), cls: 'risk-extreme' }
  }
  const risk = riskTag()

  return (
    <ScrollView scrollY className='ch17'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>🪙 {S('套息交易实验室', 'Carry Trade Lab')}</Text>
        <Text className='page-meta'>{S('第 17 章', 'Chapter 17')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2007', label: S('2007.7 套息巅峰', '2007.7 Carry Peak') },
          { key: '2008', label: S('2008.10 崩盘 ⚡', '2008.10 Crash ⚡'), accent: 'danger' },
          { key: '2024-7', label: S('2024.7 高峰', '2024.7 Peak') },
          { key: '2024-8', label: S('2024.8 平仓 ⚡', '2024.8 Unwind ⚡'), accent: 'danger' },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title={S('📡 当下汇率与利差', '📡 Live FX & Rate Spreads')}
        subtitle={S(
          'IRP 不是静态公式 — 这些数字每天都在动',
          'IRP is not a static formula — these numbers move every day'
        )}
        tiles={[
          { id: 'DEXJPUS', label: 'USD/JPY',
            hint: S(
              '同比变化 = 套息盘的"汇率风险"实绩',
              "YoY change = carry trade's actual FX-risk realization"
            )
          },
          { id: 'DEXUSEU', label: 'EUR/USD' },
          { id: 'DFF', label: S('USD 利率', 'USD rate'),
            hint: S("套息收益的\"高息腿\"", "The 'high-yield leg' of carry profit")
          },
          { id: 'DTWEXBGS', label: S('美元贸易加权指数', 'USD Trade-Weighted Index') }
        ]}
      />

      <View className='panel'>
        <Text className='panel-tag'>{S('借日元 · 投美元 · 持仓 3 个月', 'Borrow JPY · Invest USD · 3-month hold')}</Text>
        <SliderRow label={S('i_d · USD 利率', 'i_d · USD rate')} value={params.id} unit='%' min={0} max={10} step={0.05}
          onChange={v => setParams(p => ({ ...p, id: v }))} />
        <SliderRow label={S('i_f · JPY 利率', 'i_f · JPY rate')} value={params.ifv} unit='%' min={-0.5} max={5} step={0.05}
          onChange={v => setParams(p => ({ ...p, ifv: v }))} />
        <SliderRow label={S('ΔS · USD/JPY 变动', 'ΔS · USD/JPY move')} value={params.ds} unit='%' min={-20} max={10} step={0.5}
          onChange={v => setParams(p => ({ ...p, ds: v }))} />
        <SliderRow label={S('杠杆', 'Leverage')} value={params.lev} unit='x' min={1} max={30} step={1}
          onChange={v => setParams(p => ({ ...p, lev: Math.round(v) }))} />
      </View>

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-grid'>
          <View><Text className='output-label'>{S('Carry 收益', 'Carry yield')}</Text><Text className='output-mid'>{fmtPct(r.carry)}</Text></View>
          <View><Text className='output-label'>{S('汇率损益', 'FX P&L')}</Text><Text className='output-mid'>{fmtPct(r.dsLoss, 1)}</Text></View>
          <View><Text className='output-label'>{S('无杠杆回报', 'Unlevered return')}</Text><Text className='output-mid'>{fmtPct(r.nominal)}</Text></View>
          <View><Text className='output-label'>{S('杠杆后回报', 'Levered return')}</Text><Text className={`output-big ${r.leveraged >= 0 ? 'pos' : 'neg'}`}>{fmtPct(r.leveraged, 1)}</Text></View>
        </View>
        <View className='output-row-bottom'>
          <View className='br-row'>
            <Text className='br-label'>{S('Breakeven · 汇率最多跌', 'Breakeven · max FX loss before zero')}</Text>
            <Text className='br-value'>{r.breakeven.toFixed(2)}%</Text>
          </View>
          <View className='br-row'>
            <Text className='br-label'>{S('风险标签', 'Risk tag')}</Text>
            <Text className={`risk ${risk.cls}`}>{risk.label}</Text>
          </View>
        </View>
        {note ? <Text className='output-note'>{note}</Text> : null}
      </View>

      <Text className='hint'>
        {S(
          '💡 切到「2024.8 平仓」⚡——猜猜 10x 杠杆下亏多少。',
          '💡 Switch to "2024.8 Unwind" ⚡ — guess how much 10x leverage loses.'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
