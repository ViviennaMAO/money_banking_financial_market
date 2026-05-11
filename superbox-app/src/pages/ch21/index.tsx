import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch21Snapshots, type PredictDef } from '../../utils/snapshots'
import { policyMix } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

export default function Ch21Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({ fiscalShift: 30, monetaryShift: -30 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => policyMix(params.fiscalShift, params.monetaryShift),
    [params]
  )

  function loadSnapshot(key: string) {
    const s = ch21Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch21Snapshots[key]
    setParams({ fiscalShift: s.fiscalShift, monetaryShift: s.monetaryShift })
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
    title: `第 21 章 · ${result.comboLabel}`,
    path: '/pages/ch21/index'
  }))

  // 4 象限定位
  const xPos = 50 + params.fiscalShift / 2  // 0-100
  const yPos = 50 - params.monetaryShift / 2  // 反向(顶 = 紧缩)

  return (
    <ScrollView scrollY className='ch21'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('⚙️ IS-LM 政策组合', '⚙️ IS-LM Policy Mix')}</Text>
        <Text className='page-meta'>{S('第 21 章', 'Chapter 21')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1981', label: '1981 里根+沃 ⚡', accent: 'danger' },
          { key: '2008', label: '2008 双扩' },
          { key: '1995', label: '1995 克林顿' },
          { key: '2020', label: '2020 极致双扩' },
          { key: '2024', label: '2024 现状' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 4 象限定位图 */}
      <View className={`quad-card ${flash ? 'flash' : ''}`}>
        <Text className='quad-tag'>📍 政策组合 4 象限</Text>
        <View className='quad-viz'>
          <View className='quad-axis-y'></View>
          <View className='quad-axis-x'></View>
          <Text className='quad-label-tl'>财紧+货紧</Text>
          <Text className='quad-label-tr'>财扩+货紧 ⚡</Text>
          <Text className='quad-label-bl'>财紧+货宽</Text>
          <Text className='quad-label-br'>🔥 双扩张</Text>
          <View className='quad-dot' style={{ left: `${xPos}%`, top: `${yPos}%` }}></View>
          <Text className='quad-axis-x-label'>财政力度 →</Text>
          <Text className='quad-axis-y-label'>货币紧缩 ↑</Text>
        </View>

        <View className={`combo-row ${result.comboCls}`}>
          <Text className='combo-label'>{result.comboLabel}</Text>
        </View>
        <Text className='combo-side'>{result.sideEffect}</Text>
      </View>

      {/* 总效果指标 */}
      <View className='effect-card'>
        <View className='eff-row'>
          <View>
            <Text className='eff-label'>财政对 Y</Text>
            <Text className={`eff-value ${result.fiscalEffect >= 0 ? 'val-pos' : 'val-neg'}`}>
              {result.fiscalEffect >= 0 ? '+' : ''}{result.fiscalEffect.toFixed(1)}
            </Text>
          </View>
          <View>
            <Text className='eff-label'>货币对 Y</Text>
            <Text className={`eff-value ${result.monetaryEffect >= 0 ? 'val-pos' : 'val-neg'}`}>
              {result.monetaryEffect >= 0 ? '+' : ''}{result.monetaryEffect.toFixed(1)}
            </Text>
          </View>
          <View>
            <Text className='eff-label'>总产出 ΔY</Text>
            <Text className={`eff-big ${result.totalY >= 0 ? 'val-pos' : 'val-neg'}`}>
              {result.totalY >= 0 ? '+' : ''}{result.totalY.toFixed(1)}
            </Text>
          </View>
          <View>
            <Text className='eff-label'>利率 Δi</Text>
            <Text className={`eff-big ${result.totalI >= 0 ? 'val-pos' : 'val-neg'}`}>
              {result.totalI >= 0 ? '+' : ''}{result.totalI.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      {note ? <Text className='ch21-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调财政 + 货币组合</Text>
        <SliderRow label='财政力度(- 紧缩 / + 扩张)' value={params.fiscalShift} unit='' min={-100} max={100} step={5}
          onChange={v => setParams(p => ({ ...p, fiscalShift: Math.round(v) }))} />
        <SliderRow label='货币力度(- 紧缩 / + 宽松)' value={params.monetaryShift} unit='' min={-100} max={100} step={5}
          onChange={v => setParams(p => ({ ...p, monetaryShift: Math.round(v) }))} />
      </View>

      <View className='lessons-card'>
        <Text className='lessons-tag'>📚 政策组合的四种典型情境</Text>
        <View className='lesson-item lesson-expand'>
          <Text className='lesson-icon'>🔥</Text>
          <View className='lesson-body'>
            <Text className='lesson-title'>双扩张(财扩 + 货宽)</Text>
            <Text className='lesson-desc'>例:2020 疫情应对 + 2008 危机。强劲反弹但埋下通胀种子。</Text>
          </View>
        </View>
        <View className='lesson-item lesson-conflict'>
          <Text className='lesson-icon'>⚡</Text>
          <View className='lesson-body'>
            <Text className='lesson-title'>政策冲突 · 财扩 + 货紧</Text>
            <Text className='lesson-desc'>例:1981 里根+沃尔克 → USD 飙升 + LDC 危机。当下 2024 同类组合。</Text>
          </View>
        </View>
        <View className='lesson-item lesson-loose-tight'>
          <Text className='lesson-icon'>🌊</Text>
          <View className='lesson-body'>
            <Text className='lesson-title'>政策冲突 · 财紧 + 货宽</Text>
            <Text className='lesson-desc'>例:1990s 末克林顿减赤 + Fed 低利率。资产价飙升 → dotcom 泡沫。</Text>
          </View>
        </View>
        <View className='lesson-item lesson-contract'>
          <Text className='lesson-icon'>❄️</Text>
          <View className='lesson-body'>
            <Text className='lesson-title'>双紧缩</Text>
            <Text className='lesson-desc'>罕见。通常危机后整顿期使用。1990s 早期克林顿 + Greenspan 减赤 + 加息。</Text>
          </View>
        </View>
      </View>

      <Text className='hint'>💡 切「1981 里根+沃 ⚡」→ 猜副作用 → 揭示 LDC 拉美债务危机。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
