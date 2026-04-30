import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch7Snapshots, type PredictDef } from '../../utils/snapshots'
import { gordonPrice, impliedGrowth } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import './index.scss'

interface EMHForm {
  level: string
  desc: string
  test: string
  cls: string
}

const emhForms: EMHForm[] = [
  {
    level: '弱式',
    desc: '历史价格不能预测未来',
    test: '技术分析无效?(实证大致支持)',
    cls: 'emh-weak'
  },
  {
    level: '半强式',
    desc: '所有公开信息已被定价',
    test: '基本面分析无效?(部分支持,部分反例)',
    cls: 'emh-semi'
  },
  {
    level: '强式',
    desc: '连内幕信息也已被定价',
    test: 'Soros / 巴菲特跑赢市场 → 反例',
    cls: 'emh-strong'
  }
]

export default function Ch7Page() {
  const [params, setParams] = useState({ D: 3, g: 4, r: 8 })
  const [marketPrice, setMarketPrice] = useState(75)
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const fairPrice = useMemo(
    () => gordonPrice(params.D, params.g, params.r),
    [params]
  )
  const implied_g = useMemo(
    () => impliedGrowth(marketPrice, params.D, params.r),
    [marketPrice, params.D, params.r]
  )

  const isModelInvalid = !isFinite(fairPrice) || params.r <= params.g
  const overOrUnder = isFinite(fairPrice)
    ? ((marketPrice - fairPrice) / fairPrice * 100)
    : 0

  function loadSnapshot(key: string) {
    const s = ch7Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch7Snapshots[key]
    setParams({ D: s.D, g: s.g, r: s.r })
    setMarketPrice(s.marketPrice)
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
    title: `第 7 章 · 公允价 $${isFinite(fairPrice) ? fairPrice.toFixed(0) : '∞'}`,
    path: '/pages/ch7/index'
  }))

  const valuationStatus = isModelInvalid
    ? { label: '模型失效(r ≤ g)', cls: 'val-invalid' }
    : (overOrUnder > 20 ? { label: '高估', cls: 'val-over' }
      : overOrUnder < -20 ? { label: '低估', cls: 'val-under' }
      : { label: '合理', cls: 'val-fair' })

  return (
    <ScrollView scrollY className='ch7'>
      <View className='page-header'>
        <Text className='page-title'>📉 戈登增长 + EMH</Text>
        <Text className='page-meta'>第 7 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1999', label: '1999 dotcom ⚡', accent: 'danger' },
          { key: '2008', label: '2008.10 雷曼' },
          { key: '2010', label: '2010 QE' },
          { key: '2024', label: '2024 AI 牛' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-row'>
          <View>
            <Text className='output-label'>公允价 P</Text>
            <Text className='output-big'>
              {isModelInvalid ? '∞' : `$${fairPrice.toFixed(0)}`}
            </Text>
            <Text className='output-formula'>= D / (r - g)</Text>
          </View>
          <View>
            <Text className='output-label'>市场价</Text>
            <Text className='output-mid'>${marketPrice.toFixed(0)}</Text>
            <Text className={`output-tag ${valuationStatus.cls}`}>
              {valuationStatus.label}
            </Text>
          </View>
        </View>
        {isModelInvalid ? (
          <Text className='warn-banner'>⚠ 必要回报率 r 必须 &gt; 永续增长率 g,否则模型失效。把 r 拉到比 g 大试试。</Text>
        ) : (
          <View className='implied-row'>
            <Text className='implied-label'>若市场价 ${marketPrice.toFixed(0)},隐含永续增长率:</Text>
            <Text className={`implied-value ${implied_g > 5 ? 'high' : 'normal'}`}>
              {implied_g.toFixed(1)}%
            </Text>
            {implied_g > 10 ? (
              <Text className='implied-warn'>⚠ 高于 GDP 长期增长 ~3%,长期不可持续</Text>
            ) : null}
          </View>
        )}
      </View>

      {note ? <Text className='ch7-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调三个参数,看公允价怎么动</Text>
        <SliderRow label='D · 当年分红' value={params.D} prefix='$' min={0.5} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, D: v }))} />
        <SliderRow label='g · 永续增长率' value={params.g} unit='%' min={-2} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, g: v }))} />
        <SliderRow label='r · 必要回报率' value={params.r} unit='%' min={2} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, r: v }))} />
        <SliderRow label='市场价(用于反推 g)' value={marketPrice} prefix='$' min={5} max={500} step={5}
          onChange={v => setMarketPrice(v)} />
      </View>

      <View className='emh-card'>
        <Text className='emh-tag'>📚 EMH 三种形式 · 强度递进</Text>
        {emhForms.map(f => (
          <View key={f.level} className={`emh-item ${f.cls}`}>
            <Text className='emh-level'>{f.level}</Text>
            <View className='emh-body'>
              <Text className='emh-desc'>{f.desc}</Text>
              <Text className='emh-test'>{f.test}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='dual-card'>
        <Text className='dual-tag'>🥊 EMH 派 vs 反 EMH 派</Text>
        <View className='dual-row'>
          <View className='dual-box dual-emh'>
            <Text className='dual-title'>📊 EMH 阵营</Text>
            <Text className='dual-text'>
              市场基本有效。<Text className='emp'>跑赢市场长期不可能</Text>。
              指数化投资是唯一明智策略。
            </Text>
            <Text className='dual-evidence'>证据:90% 主动基金长期跑不赢标普 500。</Text>
          </View>
          <View className='dual-box dual-anti'>
            <Text className='dual-title'>🎯 反 EMH 阵营</Text>
            <Text className='dual-text'>
              市场不完全有效。<Text className='emp'>巴菲特 60 年跑赢市场 1 万倍</Text>、
              Soros 1992 击败英镑赚 10 亿 — 这些是统计噪声还是真实超额?
            </Text>
            <Text className='dual-evidence'>证据:行为金融 + Soros 反身性。</Text>
          </View>
        </View>
        <Text className='dual-note'>
          教材立场:**长期看市场大致有效,短期 / 局部反例存在**。
          完美 EMH 是理想模型,现实是"几乎有效但留下少量超额机会"。
        </Text>
      </View>

      <Text className='hint'>💡 切「1999 dotcom ⚡」 → 猜支撑泡沫需要的 g → 揭示 g=20%+ 数学不可能。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
