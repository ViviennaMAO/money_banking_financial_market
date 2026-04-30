import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { ch20Snapshots, type PredictDef } from '../../utils/snapshots'
import { islmEquilibrium } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import ISLMCanvas from '../../components/ISLMCanvas'
import './index.scss'

export default function Ch20Page() {
  const [params, setParams] = useState({ a: 22, b: 2, c: 8, d: 2 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const eq = islmEquilibrium(params.a, params.b, params.c, params.d)

  function loadSnapshot(key: string) {
    const s = ch20Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch20Snapshots[key]
    setParams({ a: s.a, b: s.b, c: s.c, d: s.d })
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

  return (
    <ScrollView scrollY className='ch20'>
      <View className='page-header'>
        <Text className='page-title'>📐 IS-LM 沙盘</Text>
        <Text className='page-meta'>第 20 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1962', label: '1962 减税' },
          { key: '1980', label: '1980 沃尔克' },
          { key: '2010', label: '2010 陷阱 ⚡', accent: 'danger' },
          { key: '2020', label: '2020.4 双扩张' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className='canvas-card'>
        <ISLMCanvas a={params.a} b={params.b} c={params.c} d={params.d} />
        <View className='eq-row'>
          <View className='eq-cell'>
            <Text className='eq-label'>i*</Text>
            <Text className='eq-value'>{eq.i_star.toFixed(1)}%</Text>
          </View>
          <View className='eq-cell'>
            <Text className='eq-label'>Y*</Text>
            <Text className='eq-value'>{eq.Y_star.toFixed(1)}T</Text>
          </View>
          {eq.trap ? <Text className='trap-tag'>陷阱</Text> : null}
        </View>
      </View>

      <View className='panel'>
        <SliderRow label='财政量(IS 截距 a)' value={params.a} min={10} max={35} step={0.5}
          onChange={v => setParams(p => ({ ...p, a: v }))} />
        <SliderRow label='投资敏感度(IS 斜率 b)' value={params.b} min={0.5} max={5} step={0.1}
          onChange={v => setParams(p => ({ ...p, b: v }))} />
        <SliderRow label='实际货币 M^s/P(LM 截距 c)' value={params.c} min={0} max={80} step={0.5}
          onChange={v => setParams(p => ({ ...p, c: v }))} />
        <SliderRow label='利率敏感度(LM 斜率 d)' value={params.d} min={0.5} max={5} step={0.1}
          onChange={v => setParams(p => ({ ...p, d: v }))} />
      </View>

      {note ? <View className={`note-card ${flash ? 'flash' : ''}`}><Text>{note}</Text></View> : null}

      <Text className='hint'>💡 切「2010 陷阱」⚡ → 拖大 c(QE 注入)→ 看 LM 推到哪都改不了 Y*。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
