import { View, Text, ScrollView, Slider } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { crisisCases, type StageKey } from '../../data/ch12-crises'
import { interpolateCrisis } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { tokens } from '../../theme/tokens'
import './index.scss'

const stages: { key: StageKey; label: string; cls: string }[] = [
  { key: 'pre',      label: '阶段 1 前',  cls: 'st-pre' },
  { key: 'stage1',   label: '阶段 1',     cls: 'st-1' },
  { key: 'stage2',   label: '阶段 2',     cls: 'st-2' },
  { key: 'stage3',   label: '阶段 3',     cls: 'st-3' },
  { key: 'recovery', label: '复苏',       cls: 'st-rec' }
]

export default function Ch12Page() {
  const [crisisKey, setCrisisKey] = useState('2008')
  const [progress, setProgress] = useState(0)
  const [predict, setPredict] = useState<typeof crisisCases['2020']['predict']>(undefined)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const crisis = crisisCases[crisisKey]
  const frame = useMemo(() => interpolateCrisis(crisis.frames, progress), [crisis, progress])

  const indicators = [
    {
      label: 'IG 信用利差',
      value: `${frame.creditSpread.toFixed(0)} bp`,
      cls: frame.creditSpread > 400 ? 'ind-bad' : frame.creditSpread > 200 ? 'ind-warn' : 'ind-good'
    },
    {
      label: 'VIX 恐慌指数',
      value: frame.vix.toFixed(0),
      cls: frame.vix > 50 ? 'ind-bad' : frame.vix > 25 ? 'ind-warn' : 'ind-good'
    },
    {
      label: '银行倒闭(月)',
      value: frame.bankFailures.toFixed(0),
      cls: frame.bankFailures > 10 ? 'ind-bad' : frame.bankFailures > 2 ? 'ind-warn' : 'ind-good'
    },
    {
      label: 'Fed 资产负债表',
      value: `$${frame.fedResponse.toFixed(0)}B`,
      cls: frame.fedResponse > 5000 ? 'ind-resp' : 'ind-neu'
    }
  ]

  function loadCrisis(key: string) {
    const c = crisisCases[key]
    if (c.predict && key !== crisisKey) {
      setPredict(c.predict)
      setPendingKey(key)
      return
    }
    applyCrisis(key)
  }

  function applyCrisis(key: string) {
    setCrisisKey(key)
    setProgress(0)
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    setReveal({ headline: predict.revealHeadline, msg: predict.revealMsg, correct })
    setPredict(undefined)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingKey) { applyCrisis(pendingKey); setPendingKey(null) }
  }

  Taro.useShareAppMessage(() => ({
    title: `第 12 章 · ${crisis.name} · ${frame.stageLabel}`,
    path: '/pages/ch12/index'
  }))

  return (
    <ScrollView scrollY className='ch12'>
      <View className='page-header'>
        <Text className='page-title'>🔥 危机三阶段时间轴</Text>
        <Text className='page-meta'>第 12 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2008', label: '2008 雷曼' },
          { key: '2020', label: '2020 疫情 ⚡', accent: 'danger' },
          { key: '2023', label: '2023 SVB' },
          { key: '1929', label: '1929 大萧条' },
          { key: '2021china', label: '中国房地产' }
        ]}
        onSelect={loadCrisis}
      />

      <View className='crisis-card'>
        <View className='crisis-row'>
          <Text className='crisis-emoji'>{crisis.emoji}</Text>
          <View>
            <Text className='crisis-name'>{crisis.name}</Text>
            <Text className='crisis-intro'>{crisis.intro}</Text>
          </View>
        </View>
      </View>

      <View className='timeline-card'>
        <Text className='timeline-tag'>⏱ 危机时刻 · 拖动滑块看演进</Text>
        <View className='progress-row'>
          <Text className='progress-value'>{progress.toFixed(0)}%</Text>
          <Text className='progress-stage'>{frame.stageLabel}</Text>
        </View>
        <Slider
          min={0} max={100} step={1} value={progress}
          activeColor={tokens.danger}
          backgroundColor={tokens.bg3}
          blockColor={tokens.danger}
          blockSize={22}
          onChanging={(e: any) => setProgress(e.detail.value)}
          onChange={(e: any) => setProgress(e.detail.value)}
        />

        <View className='stages-row'>
          {stages.map(s => {
            const isCurrent = s.key === frame.stage
            return (
              <View key={s.key} className={`stage-cell ${s.cls} ${isCurrent ? 'active' : ''}`}>
                <Text className='stage-label'>{s.label}</Text>
                <View className='stage-dot'></View>
              </View>
            )
          })}
        </View>
      </View>

      <View className='indicators-grid'>
        {indicators.map((ind, i) => (
          <View key={i} className={`ind-card ${ind.cls}`}>
            <Text className='ind-label'>{ind.label}</Text>
            <Text className='ind-value'>{ind.value}</Text>
          </View>
        ))}
      </View>

      <View className='event-card'>
        <Text className='event-tag'>📰 当前时点事件</Text>
        <Text className='event-note'>{frame.eventNote}</Text>
      </View>

      <View className='framework-card'>
        <Text className='framework-tag'>📚 米什金三阶段框架</Text>
        <View className='fw-item'>
          <Text className='fw-num st-1-color'>1</Text>
          <View className='fw-body'>
            <Text className='fw-title'>资产泡沫 + 信贷扩张</Text>
            <Text className='fw-desc'>低利率 + 监管松 → 资产价飙升 + 杠杆累积。早期不显眼。</Text>
          </View>
        </View>
        <View className='fw-item'>
          <Text className='fw-num st-2-color'>2</Text>
          <View className='fw-body'>
            <Text className='fw-title'>危机爆发 · 信用利差崩</Text>
            <Text className='fw-desc'>触发事件 → 流动性冻结 → 银行间停止借贷 → 系统性恐慌。</Text>
          </View>
        </View>
        <View className='fw-item'>
          <Text className='fw-num st-3-color'>3</Text>
          <View className='fw-body'>
            <Text className='fw-title'>债务通缩 / 债务滞胀</Text>
            <Text className='fw-desc'>资产价跌 + 失业率升 + 通缩压力。可能持续数年。</Text>
            <Text className='fw-emp'>⚡ 2020 后 Fed 学会"在阶段二内极速救助"可跳过此阶段</Text>
          </View>
        </View>
      </View>

      <Text className='hint'>💡 切「2020 疫情 ⚡」→ 猜阶段几结束 → 揭示 Fed 极速救助跳过阶段三。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
