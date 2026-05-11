import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { ch14Snapshots, type PredictDef } from '../../utils/snapshots'
import { moneyMultiplier, totalM2 } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

export default function Ch14Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({ mb: 5.5, r: 0, e: 12, c: 8 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const m = moneyMultiplier(params.r / 100, params.e / 100, params.c / 100)
  const m2 = totalM2(params.mb, params.r / 100, params.e / 100, params.c / 100)

  function loadSnapshot(key: string) {
    const s = ch14Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch14Snapshots[key]
    setParams({ mb: s.mb, r: s.r, e: s.e, c: s.c })
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

  Taro.useShareAppMessage(() => ({
    title: `第 14 章·货币乘数 m=${m.toFixed(2)}`,
    path: '/pages/ch14/index'
  }))

  return (
    <ScrollView scrollY className='ch14'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('💱 货币乘数实验室', '💱 Money Multiplier Lab')}</Text>
        <Text className='page-meta'>{S('第 14 章', 'Chapter 14')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2007', label: '2007.8 危机前' },
          { key: '2010', label: '2010.1 QE 后 ⚡', accent: 'danger' },
          { key: '2020', label: '2020.4 疫情' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className='panel'>
        <SliderRow label='MB · 基础货币' value={params.mb} prefix='$' unit='T' min={0.5} max={10} step={0.1}
          onChange={v => setParams(p => ({ ...p, mb: v }))} />
        <SliderRow label='r · 法准率' value={params.r} unit='%' min={0} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, r: v }))} />
        <SliderRow label='e · 超储率' value={params.e} unit='%' min={0} max={80} step={0.5}
          onChange={v => setParams(p => ({ ...p, e: v }))} />
        <SliderRow label='c · 现金/存款比' value={params.c} unit='%' min={0} max={30} step={0.5}
          onChange={v => setParams(p => ({ ...p, c: v }))} />
      </View>

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-row'>
          <View>
            <Text className='output-label'>乘数 m</Text>
            <Text className='output-value'>{isFinite(m) ? m.toFixed(2) : '∞'}</Text>
          </View>
          <View>
            <Text className='output-label'>M2 理论值</Text>
            <Text className='output-value'>${isFinite(m2) ? m2.toFixed(1) : '∞'}T</Text>
          </View>
        </View>
        {note ? <Text className='output-note'>{note}</Text> : null}
      </View>

      <Text className='hint'>💡 试试「2010.1 QE 后」⚡——会先弹预测窗,猜对猜错都给反馈。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
