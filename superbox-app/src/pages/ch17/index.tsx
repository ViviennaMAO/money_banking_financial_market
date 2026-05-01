import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { ch17Snapshots, type PredictDef } from '../../utils/snapshots'
import { carryReturn } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import LiveData from '../../components/LiveData'
import './index.scss'

export default function Ch17Page() {
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
    setNote(s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    setReveal({
      headline: predict.revealHeadline,
      msg: predict.revealMsg,
      correct
    })
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
    if (a < 5) return { label: '低', cls: 'risk-low' }
    if (a < 30) return { label: '中', cls: 'risk-mid' }
    if (a < 80) return { label: '高', cls: 'risk-high' }
    return { label: '极高 / 爆仓', cls: 'risk-extreme' }
  }
  const risk = riskTag()

  return (
    <ScrollView scrollY className='ch17'>
      <View className='page-header'>
        <Text className='page-title'>🪙 套息交易实验室</Text>
        <Text className='page-meta'>第 17 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2007', label: '2007.7 套息巅峰' },
          { key: '2008', label: '2008.10 崩盘 ⚡', accent: 'danger' },
          { key: '2024-7', label: '2024.7 高峰' },
          { key: '2024-8', label: '2024.8 平仓 ⚡', accent: 'danger' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title='📡 当下汇率与利差'
        subtitle='IRP 不是静态公式 — 这些数字每天都在动'
        tiles={[
          { id: 'DEXJPUS', label: 'USD/JPY',
            hint: '同比变化 = 套息盘的"汇率风险"实绩'
          },
          { id: 'DEXUSEU', label: 'EUR/USD' },
          { id: 'DFF', label: 'USD 利率',
            hint: '套息收益的"高息腿"'
          },
          { id: 'DTWEXBGS', label: '美元贸易加权指数' }
        ]}
      />

      <View className='panel'>
        <Text className='panel-tag'>借日元 · 投美元 · 持仓 3 个月</Text>
        <SliderRow label='i_d · USD 利率' value={params.id} unit='%' min={0} max={10} step={0.05}
          onChange={v => setParams(p => ({ ...p, id: v }))} />
        <SliderRow label='i_f · JPY 利率' value={params.ifv} unit='%' min={-0.5} max={5} step={0.05}
          onChange={v => setParams(p => ({ ...p, ifv: v }))} />
        <SliderRow label='ΔS · USD/JPY 变动' value={params.ds} unit='%' min={-20} max={10} step={0.5}
          onChange={v => setParams(p => ({ ...p, ds: v }))} />
        <SliderRow label='杠杆' value={params.lev} unit='x' min={1} max={30} step={1}
          onChange={v => setParams(p => ({ ...p, lev: Math.round(v) }))} />
      </View>

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-grid'>
          <View><Text className='output-label'>Carry 收益</Text><Text className='output-mid'>{fmtPct(r.carry)}</Text></View>
          <View><Text className='output-label'>汇率损益</Text><Text className='output-mid'>{fmtPct(r.dsLoss, 1)}</Text></View>
          <View><Text className='output-label'>无杠杆回报</Text><Text className='output-mid'>{fmtPct(r.nominal)}</Text></View>
          <View><Text className='output-label'>杠杆后回报</Text><Text className={`output-big ${r.leveraged >= 0 ? 'pos' : 'neg'}`}>{fmtPct(r.leveraged, 1)}</Text></View>
        </View>
        <View className='output-row-bottom'>
          <View className='br-row'>
            <Text className='br-label'>Breakeven · 汇率最多跌</Text>
            <Text className='br-value'>{r.breakeven.toFixed(2)}%</Text>
          </View>
          <View className='br-row'>
            <Text className='br-label'>风险标签</Text>
            <Text className={`risk ${risk.cls}`}>{risk.label}</Text>
          </View>
        </View>
        {note ? <Text className='output-note'>{note}</Text> : null}
      </View>

      <Text className='hint'>💡 切到「2024.8 平仓」⚡——猜猜 10x 杠杆下亏多少。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
