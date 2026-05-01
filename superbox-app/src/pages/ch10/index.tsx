import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch10Snapshots, type PredictDef } from '../../utils/snapshots'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import './index.scss'

const institutions = [
  { emoji: '🏛️', name: '商业银行', regulator: 'Fed / OCC', deposits: '储蓄/活期', focus: '存贷业务' },
  { emoji: '📈', name: '投资银行', regulator: 'SEC', deposits: '无', focus: '承销/并购/自营' },
  { emoji: '👻', name: 'MMF / 影子银行', regulator: 'SEC(轻)', deposits: '类存款', focus: '高流动性 + 收益' },
  { emoji: '🇨🇳', name: '中国国有大行', regulator: '银保监 + 央行', deposits: '储蓄/活期', focus: '政策传导主渠道' },
  { emoji: '🦄', name: '互联网银行', regulator: '银保监', deposits: '电子账户', focus: '数字风控 + 长尾客户' }
]

export default function Ch10Page() {
  const [params, setParams] = useState({ iorb: 4.40, mmfYield: 4.50 })
  const [bankDeposits, setBankDeposits] = useState(18)
  const [mmfSize, setMmfSize] = useState(6.4)
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const spread = params.mmfYield - params.iorb
  const flowDirection = spread > 0.3 ? 'mmf' : spread < -0.3 ? 'bank' : 'balanced'
  const totalSize = bankDeposits + mmfSize
  const bankPct = totalSize > 0 ? bankDeposits / totalSize * 100 : 50
  const mmfPct = 100 - bankPct

  const flowMeta = {
    mmf: { label: '🌊 资金流向 MMF', cls: 'flow-mmf', desc: 'MMF 收益高于银行存款,客户加速搬钱。可能引发银行流动性压力。' },
    bank: { label: '🏛️ 资金流向银行', cls: 'flow-bank', desc: '银行存款利率有竞争力,资金回归。罕见(只在加息后期才会出现)。' },
    balanced: { label: '⚖️ 平衡', cls: 'flow-bal', desc: '利差不显著,资金流向均衡。' }
  }[flowDirection]

  function loadSnapshot(key: string) {
    const s = ch10Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch10Snapshots[key]
    setParams({ iorb: s.iorb, mmfYield: s.mmfYield })
    setBankDeposits(s.bankDeposits)
    setMmfSize(s.mmfSize)
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
    title: `第 10 章 · 银行 ${bankDeposits.toFixed(1)}T vs MMF ${mmfSize.toFixed(1)}T`,
    path: '/pages/ch10/index'
  }))

  return (
    <ScrollView scrollY className='ch10'>
      <View className='page-header'>
        <Text className='page-title'>🏢 银行业 vs 影子银行</Text>
        <Text className='page-meta'>第 10 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1980', label: '1980 萌芽' },
          { key: '2008', label: '2008 MMF 挤兑' },
          { key: '2023', label: '2023 大迁移 ⚡', accent: 'danger' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`balance-card ${flash ? 'flash' : ''}`}>
        <Text className='balance-tag'>📊 银行存款 vs MMF 规模</Text>
        <View className='size-row'>
          <View className='size-bar bank-bar' style={{ width: `${bankPct}%` }}>
            <Text>🏛️ 银行 ${bankDeposits.toFixed(1)}T</Text>
          </View>
          <View className='size-bar mmf-bar' style={{ width: `${mmfPct}%` }}>
            <Text>👻 MMF ${mmfSize.toFixed(1)}T</Text>
          </View>
        </View>

        <View className={`flow-row ${flowMeta.cls}`}>
          <Text className='flow-label'>{flowMeta.label}</Text>
          <Text className='flow-spread'>利差 {spread >= 0 ? '+' : ''}{spread.toFixed(2)}%</Text>
        </View>
        <Text className='flow-desc'>{flowMeta.desc}</Text>
      </View>

      {note ? <Text className='ch10-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调利率看资金流向</Text>
        <SliderRow label='IORB · 银行付息(实际给储户的更低)' value={params.iorb} unit='%' min={0} max={6} step={0.05}
          onChange={v => setParams(p => ({ ...p, iorb: v }))} />
        <SliderRow label='MMF 收益率' value={params.mmfYield} unit='%' min={0} max={6} step={0.05}
          onChange={v => setParams(p => ({ ...p, mmfYield: v }))} />
      </View>

      <View className='inst-card'>
        <Text className='inst-tag'>🏦 5 大机构对比</Text>
        {institutions.map((i, idx) => (
          <View key={idx} className='inst-row'>
            <Text className='inst-emoji'>{i.emoji}</Text>
            <View className='inst-body'>
              <Text className='inst-name'>{i.name}</Text>
              <View className='inst-meta'>
                <Text className='inst-cell'>监管:{i.regulator}</Text>
                <Text className='inst-cell'>存款:{i.deposits}</Text>
              </View>
              <Text className='inst-focus'>主业:{i.focus}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text className='hint'>💡 切「2023 大迁移 ⚡」→ 猜单周资金迁移规模 → 揭示 $2.5T+ 史上最大。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
