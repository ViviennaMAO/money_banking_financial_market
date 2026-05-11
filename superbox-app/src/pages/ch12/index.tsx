import { View, Text, ScrollView, Slider } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { crisisCases, type StageKey } from '../../data/ch12-crises'
import { interpolateCrisis } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { tokens } from '../../theme/tokens'
import { useT } from '../../i18n'
import './index.scss'

export default function Ch12Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

  const stages: { key: StageKey; label: string; cls: string }[] = [
    { key: 'pre',      label: S('阶段 1 前', 'Pre-Stage 1'), cls: 'st-pre' },
    { key: 'stage1',   label: S('阶段 1', 'Stage 1'),        cls: 'st-1' },
    { key: 'stage2',   label: S('阶段 2', 'Stage 2'),        cls: 'st-2' },
    { key: 'stage3',   label: S('阶段 3', 'Stage 3'),        cls: 'st-3' },
    { key: 'recovery', label: S('复苏', 'Recovery'),         cls: 'st-rec' }
  ]

  const [crisisKey, setCrisisKey] = useState('2008')
  const [progress, setProgress] = useState(0)
  const [predict, setPredict] = useState<typeof crisisCases['2020']['predict']>(undefined)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const crisis = crisisCases[crisisKey]
  const frame = useMemo(() => interpolateCrisis(crisis.frames, progress), [crisis, progress])

  const indicators = [
    {
      label: S('IG 信用利差', 'IG Credit Spread'),
      value: `${frame.creditSpread.toFixed(0)} bp`,
      cls: frame.creditSpread > 400 ? 'ind-bad' : frame.creditSpread > 200 ? 'ind-warn' : 'ind-good'
    },
    {
      label: S('VIX 恐慌指数', 'VIX Fear Index'),
      value: frame.vix.toFixed(0),
      cls: frame.vix > 50 ? 'ind-bad' : frame.vix > 25 ? 'ind-warn' : 'ind-good'
    },
    {
      label: S('银行倒闭(月)', 'Bank failures / month'),
      value: frame.bankFailures.toFixed(0),
      cls: frame.bankFailures > 10 ? 'ind-bad' : frame.bankFailures > 2 ? 'ind-warn' : 'ind-good'
    },
    {
      label: S('Fed 资产负债表', 'Fed Balance Sheet'),
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
    const headline = locale === 'en' && predict.revealHeadline_en
      ? predict.revealHeadline_en : predict.revealHeadline
    const msg = locale === 'en' && predict.revealMsg_en
      ? predict.revealMsg_en : predict.revealMsg
    setReveal({ headline, msg, correct })
    setPredict(undefined)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingKey) { applyCrisis(pendingKey); setPendingKey(null) }
  }

  // localize crisis fields
  const crisisName = locale === 'en' && (crisis as any).name_en ? (crisis as any).name_en : crisis.name
  const crisisIntro = locale === 'en' && (crisis as any).intro_en ? (crisis as any).intro_en : crisis.intro
  const eventNote = locale === 'en' && (frame as any).eventNote_en ? (frame as any).eventNote_en : frame.eventNote
  const stageLabel = locale === 'en' && (frame as any).stageLabel_en ? (frame as any).stageLabel_en : frame.stageLabel

  Taro.useShareAppMessage(() => ({
    title: locale === 'en'
      ? `Ch.12 · ${crisisName} · ${stageLabel}`
      : `第 12 章 · ${crisisName} · ${stageLabel}`,
    path: '/pages/ch12/index'
  }))

  return (
    <ScrollView scrollY className='ch12'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🔥 危机三阶段时间轴', '🔥 Crisis 3-Stage Timeline')}</Text>
        <Text className='page-meta'>{S('第 12 章', 'Chapter 12')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2008', label: S('2008 雷曼', '2008 Lehman') },
          { key: '2020', label: S('2020 疫情 ⚡', '2020 Pandemic ⚡'), accent: 'danger' },
          { key: '2023', label: S('2023 SVB', '2023 SVB') },
          { key: '1929', label: S('1929 大萧条', '1929 Great Depression') },
          { key: '2021china', label: S('中国房地产', 'China property') }
        ]}
        onSelect={loadCrisis}
      />

      <View className='crisis-card'>
        <View className='crisis-row'>
          <Text className='crisis-emoji'>{crisis.emoji}</Text>
          <View>
            <Text className='crisis-name'>{crisisName}</Text>
            <Text className='crisis-intro'>{crisisIntro}</Text>
          </View>
        </View>
      </View>

      <View className='timeline-card'>
        <Text className='timeline-tag'>{S('⏱ 危机时刻 · 拖动滑块看演进', '⏱ Crisis moments · drag the slider to see it unfold')}</Text>
        <View className='progress-row'>
          <Text className='progress-value'>{progress.toFixed(0)}%</Text>
          <Text className='progress-stage'>{stageLabel}</Text>
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
        <Text className='event-tag'>{S('📰 当前时点事件', '📰 Event at this moment')}</Text>
        <Text className='event-note'>{eventNote}</Text>
      </View>

      <View className='framework-card'>
        <Text className='framework-tag'>{S('📚 米什金三阶段框架', '📚 Mishkin\'s 3-Stage Framework')}</Text>
        <View className='fw-item'>
          <Text className='fw-num st-1-color'>1</Text>
          <View className='fw-body'>
            <Text className='fw-title'>{S('资产泡沫 + 信贷扩张', 'Asset Bubble + Credit Expansion')}</Text>
            <Text className='fw-desc'>
              {S(
                '低利率 + 监管松 → 资产价飙升 + 杠杆累积。早期不显眼。',
                'Low rates + loose regulation → asset prices soar + leverage builds. Inconspicuous early on.'
              )}
            </Text>
          </View>
        </View>
        <View className='fw-item'>
          <Text className='fw-num st-2-color'>2</Text>
          <View className='fw-body'>
            <Text className='fw-title'>{S('危机爆发 · 信用利差崩', 'Crisis Erupts · Credit Spreads Blow Out')}</Text>
            <Text className='fw-desc'>
              {S(
                '触发事件 → 流动性冻结 → 银行间停止借贷 → 系统性恐慌。',
                'Trigger event → liquidity freezes → interbank lending stops → systemic panic.'
              )}
            </Text>
          </View>
        </View>
        <View className='fw-item'>
          <Text className='fw-num st-3-color'>3</Text>
          <View className='fw-body'>
            <Text className='fw-title'>{S('债务通缩 / 债务滞胀', 'Debt Deflation / Debt Stagflation')}</Text>
            <Text className='fw-desc'>
              {S(
                '资产价跌 + 失业率升 + 通缩压力。可能持续数年。',
                'Asset prices fall + unemployment rises + deflationary pressure. Can last years.'
              )}
            </Text>
            <Text className='fw-emp'>
              {S(
                '⚡ 2020 后 Fed 学会"在阶段二内极速救助"可跳过此阶段',
                "⚡ Post-2020 Fed learned that \"rapid rescue within Stage 2\" can skip this stage"
              )}
            </Text>
          </View>
        </View>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2020 疫情 ⚡」→ 猜阶段几结束 → 揭示 Fed 极速救助跳过阶段三。',
          '💡 Switch to "2020 Pandemic ⚡" → predict which stage it ends at → reveal Fed\'s rapid rescue skipping Stage 3.'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
