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
    if (pendingSnap) {
      applySnapshot(pendingSnap)
      setPendingSnap(null)
    }
  }

  Taro.useShareAppMessage(() => ({
    title: locale === 'en'
      ? `Ch.14 · Money multiplier m=${m.toFixed(2)}`
      : `第 14 章·货币乘数 m=${m.toFixed(2)}`,
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
          { key: '2007', label: S('2007.8 危机前', '2007.8 Pre-crisis') },
          { key: '2010', label: S('2010.1 QE 后 ⚡', '2010.1 Post-QE ⚡'), accent: 'danger' },
          { key: '2020', label: S('2020.4 疫情', '2020.4 Pandemic') },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className='panel'>
        <SliderRow label={S('MB · 基础货币', 'MB · Monetary base')} value={params.mb} prefix='$' unit='T' min={0.5} max={10} step={0.1}
          onChange={v => setParams(p => ({ ...p, mb: v }))} />
        <SliderRow label={S('r · 法准率', 'r · Required reserve ratio')} value={params.r} unit='%' min={0} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, r: v }))} />
        <SliderRow label={S('e · 超储率', 'e · Excess reserve ratio')} value={params.e} unit='%' min={0} max={80} step={0.5}
          onChange={v => setParams(p => ({ ...p, e: v }))} />
        <SliderRow label={S('c · 现金/存款比', 'c · Currency-to-deposit ratio')} value={params.c} unit='%' min={0} max={30} step={0.5}
          onChange={v => setParams(p => ({ ...p, c: v }))} />
      </View>

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-row'>
          <View>
            <Text className='output-label'>{S('乘数 m', 'Multiplier m')}</Text>
            <Text className='output-value'>{isFinite(m) ? m.toFixed(2) : '∞'}</Text>
          </View>
          <View>
            <Text className='output-label'>{S('M2 理论值', 'M2 (implied)')}</Text>
            <Text className='output-value'>${isFinite(m2) ? m2.toFixed(1) : '∞'}T</Text>
          </View>
        </View>
        {note ? <Text className='output-note'>{note}</Text> : null}
      </View>

      <Text className='hint'>
        {S(
          '💡 试试「2010.1 QE 后」⚡——会先弹预测窗,猜对猜错都给反馈。',
          '💡 Try "2010.1 Post-QE" ⚡ — the predict modal pops first; right or wrong, you get feedback.'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
