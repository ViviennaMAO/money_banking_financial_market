import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { mortgagePayment } from '../../utils/formulas'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import './index.scss'

const lifeImpacts = [
  { emoji: '🏠', name: '房贷', detail: '30 年房贷利率每涨 1%,月供涨 ~12%。100 万贷款,30 年期,3.5% 升到 6.5% → 月供从 4490 升到 6320 元(+41%)。' },
  { emoji: '📉', name: '通胀', detail: '5% 通胀连续 5 年 = 钱包缩水 22%。100 万存款 5 年后实际购买力 ~78 万。' },
  { emoji: '💱', name: '汇率', detail: 'USD/CNY 波动 5% = 留学一年差 1 万美金。出口企业的利润可被汇率波动直接抹掉。' },
  { emoji: '💼', name: '就业', detail: '2008 危机后美国失业率 +4%,中国 2008 后大量出口工厂倒闭。金融危机直接影响普通人就业。' },
  { emoji: '🛒', name: '日常消费', detail: '利率影响信用卡 / 车贷 / 学贷利率。Fed 一次加息 25bp,你每年额外多付 60-200 美金(取决于负债)。' }
]

const PREDICT = {
  title: '反预期:利率涨 1% 影响有多大?',
  question: '100 万贷款 30 年期,利率从 3.5% 涨到 6.5%(美国 2022 加息周期实况),月供变化最接近?',
  options: [
    '+5%(温和上涨)',
    '+15%(显著)',
    '+30%(很大)',
    '+40%(看似温和的利率变化竟有这么大的真实影响)'
  ],
  correctIdx: 3,
  revealHeadline: '月供 +41% · 总利息 +90%',
  revealMsg: '100 万 30 年贷款:3.5% → 月供 4,490;6.5% → 月供 6,320。**月供 +41%,30 年总利息从 62 万 → 128 万(+106%)**。这就是 2022-23 美国买房需求暴跌的根本原因 — 利率从 3% 到 7% 让相同的购房力直接腰斩。**金融素养 = 看懂"小利率变化 → 大生活变化"的能力**。'
}

export default function Ch1Page() {
  const [params, setParams] = useState({ principal: 100, rate: 4, years: 30 })
  const [predict, setPredict] = useState<typeof PREDICT | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)

  const result = useMemo(
    () => mortgagePayment(params.principal * 10000, params.rate, params.years),
    [params]
  )

  function showPredict() {
    setPredict(PREDICT)
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    setReveal({ headline: predict.revealHeadline, msg: predict.revealMsg, correct: idx === predict.correctIdx })
    setPredict(null)
  }

  Taro.useShareAppMessage(() => ({
    title: `第 1 章 · 房贷月供 ¥${result.monthly.toFixed(0)}/月`,
    path: '/pages/ch1/index'
  }))

  return (
    <ScrollView scrollY className='ch1'>
      <View className='page-header'>
        <Text className='page-title'>🌐 为什么研究货币金融</Text>
        <Text className='page-meta'>第 1 章</Text>
      </View>

      <View className='intro-card'>
        <Text className='intro-text'>
          利率、通胀、汇率不只在新闻里 —— 它们决定你的房贷、储蓄、就业。
          这一章用一个简单计算器告诉你:**金融素养是现代公民的基本能力**。
        </Text>
      </View>

      <View className='calc-card'>
        <Text className='calc-tag'>🏠 房贷月供计算器</Text>
        <View className='calc-out'>
          <View>
            <Text className='out-label'>月供</Text>
            <Text className='out-big'>¥{result.monthly.toFixed(0)}</Text>
          </View>
          <View>
            <Text className='out-label'>总利息</Text>
            <Text className='out-mid'>¥{(result.interest / 10000).toFixed(1)}万</Text>
          </View>
          <View>
            <Text className='out-label'>总还款</Text>
            <Text className='out-mid'>¥{(result.total / 10000).toFixed(1)}万</Text>
          </View>
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>调三个参数,看月供如何变化</Text>
        <SliderRow label='贷款本金(万)' value={params.principal} prefix='¥' unit='万' min={10} max={500} step={5}
          onChange={v => setParams(p => ({ ...p, principal: Math.round(v) }))} />
        <SliderRow label='年利率' value={params.rate} unit='%' min={2} max={10} step={0.1}
          onChange={v => setParams(p => ({ ...p, rate: v }))} />
        <SliderRow label='年限' value={params.years} unit='年' min={5} max={30} step={1}
          onChange={v => setParams(p => ({ ...p, years: Math.round(v) }))} />
      </View>

      <View className='predict-trigger' onClick={showPredict}>
        <Text>⚡ 点这里挑战:利率涨 1% 影响有多大?</Text>
      </View>

      <View className='impacts-card'>
        <Text className='impacts-tag'>📚 金融如何影响你的生活</Text>
        {lifeImpacts.map((i, idx) => (
          <View key={idx} className='impact-row'>
            <Text className='impact-emoji'>{i.emoji}</Text>
            <View className='impact-body'>
              <Text className='impact-name'>{i.name}</Text>
              <Text className='impact-detail'>{i.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='conclusion-card'>
        <Text className='conc-tag'>💡 这一章的核心信息</Text>
        <Text className='conc-text'>
          货币金融学不只是华尔街的事。**利率 / 通胀 / 汇率三件大事影响每个人**。
          学这一科 = 看懂宏观新闻 + 做更好的财务决策。
        </Text>
      </View>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={() => setReveal(null)} /> : null}
    </ScrollView>
  )
}
