import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch5Snapshots, type PredictDef } from '../../utils/snapshots'
import { decomposeRate } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface Component {
  key: string
  label: string
  value: number
  cls: string
}

export default function Ch5Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({
    realRate: 1.5, inflationExpect: 2.5, riskPremium: 0.5, fedAdjust: 0
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const breakdown = useMemo(
    () => decomposeRate(params.realRate, params.inflationExpect, params.riskPremium, params.fedAdjust),
    [params]
  )

  // 计算各分量绝对值占比(用于条形图宽度)
  const components: Component[] = [
    { key: 'real',  label: '实际利率 r*',     value: breakdown.realRate,        cls: 'comp-real' },
    { key: 'pi',    label: '通胀预期 π_e',    value: breakdown.inflationExpect, cls: 'comp-pi' },
    { key: 'rho',   label: '风险/期限 ρ',     value: breakdown.riskPremium,     cls: 'comp-rho' },
    { key: 'fed',   label: 'Fed 调整',        value: breakdown.fedAdjust,       cls: 'comp-fed' }
  ]
  const totalAbs = components.reduce((sum, c) => sum + Math.abs(c.value), 0) || 1

  function loadSnapshot(key: string) {
    const s = ch5Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch5Snapshots[key]
    setParams({
      realRate: s.realRate, inflationExpect: s.inflationExpect,
      riskPremium: s.riskPremium, fedAdjust: s.fedAdjust
    })
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
    if (pendingSnap) {
      applySnapshot(pendingSnap)
      setPendingSnap(null)
    }
  }

  Taro.useShareAppMessage(() => ({
    title: `第 5 章 · 名义利率 ${breakdown.nominal.toFixed(2)}% = r+π_e+ρ+Fed`,
    path: '/pages/ch5/index'
  }))

  // 双视角:可贷资金 vs 流动性偏好的"主导信号"
  const lfDriver = params.realRate >= 0
    ? '储蓄供给充足 → r* 维持低位'
    : '储蓄过剩 → r* 被压成负(财政抑制)'
  const lpDriver = params.fedAdjust > 0.3
    ? 'Fed 紧缩 → 货币供给收紧 → 利率被推高'
    : (params.fedAdjust < -0.3 ? 'Fed QE / 降息 → 流动性供给充裕 → 利率被压低' : 'Fed 中性 → 货币供需平衡')

  return (
    <ScrollView scrollY className='ch5'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('⚖️ 利率行为实验室', '⚖️ Interest Rate Behavior Lab')}</Text>
        <Text className='page-meta'>{S('第 5 章', 'Chapter 5')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1981', label: '1981 沃尔克' },
          { key: '2008', label: '2008.10 雷曼' },
          { key: '2010', label: '2010 QE' },
          { key: '2022', label: '2022 通胀冲击 ⚡', accent: 'danger' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`output ${flash ? 'flash' : ''}`}>
        <Text className='output-label'>名义利率 i</Text>
        <Text className='output-big'>{breakdown.nominal.toFixed(2)}%</Text>
        <Text className='output-formula'>= r* + π_e + ρ + Fed_adjust</Text>

        <View className='comp-stack'>
          {components.map(c => {
            const w = Math.abs(c.value) / totalAbs * 100
            const isNeg = c.value < 0
            return (
              <View key={c.key} className='comp-row'>
                <Text className={`comp-label ${c.cls}`}>{c.label}</Text>
                <View className='comp-bar-wrap'>
                  <View className={`comp-bar ${c.cls} ${isNeg ? 'neg' : ''}`} style={{ width: `${w}%` }}></View>
                </View>
                <Text className={`comp-value ${c.cls}`}>
                  {(c.value >= 0 ? '+' : '') + c.value.toFixed(2)}%
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>调四个分量,看费雪分解</Text>
        <SliderRow label='r* · 实际利率(可贷资金均衡)' value={params.realRate} unit='%' min={-3} max={6} step={0.1}
          onChange={v => setParams(p => ({ ...p, realRate: v }))} />
        <SliderRow label='π_e · 通胀预期(费雪效应)' value={params.inflationExpect} unit='%' min={-2} max={15} step={0.1}
          onChange={v => setParams(p => ({ ...p, inflationExpect: v }))} />
        <SliderRow label='ρ · 风险 / 期限溢价' value={params.riskPremium} unit='%' min={0} max={5} step={0.1}
          onChange={v => setParams(p => ({ ...p, riskPremium: v }))} />
        <SliderRow label='Fed 调整(流动性偏好视角)' value={params.fedAdjust} unit='%' min={-3} max={3} step={0.1}
          onChange={v => setParams(p => ({ ...p, fedAdjust: v }))} />
      </View>

      {note ? <Text className='output-note'>{note}</Text> : null}

      <View className='dual-card'>
        <Text className='dual-tag'>📚 双视角解读 · 同一个利率,两种讲法</Text>
        <View className='dual-row'>
          <View className='dual-box dual-lf'>
            <Text className='dual-title'>💰 可贷资金视角</Text>
            <Text className='dual-text'>
              利率 = 储蓄供给 vs 投资需求 的均衡价格。
              核心驱动是<Text className='emp'>实际经济活动</Text>。
            </Text>
            <Text className='dual-now'>当前:{lfDriver}</Text>
          </View>
          <View className='dual-box dual-lp'>
            <Text className='dual-title'>💎 流动性偏好视角</Text>
            <Text className='dual-text'>
              利率 = 货币供给 vs 货币需求 的均衡价格。
              核心驱动是<Text className='emp'>央行政策 + 持币意愿</Text>。
            </Text>
            <Text className='dual-now'>当前:{lpDriver}</Text>
          </View>
        </View>
        <Text className='dual-note'>
          两个视角不矛盾——它们是同一现象的两种切面。
          可贷资金看实际,流动性偏好看货币。教材强调"两个都要会用"。
        </Text>
      </View>

      <Text className='hint'>💡 切「2022 通胀冲击」⚡ → 猜 10Y 怎么动 → 揭示费雪效应让利率独立飙升 +200bp+。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
