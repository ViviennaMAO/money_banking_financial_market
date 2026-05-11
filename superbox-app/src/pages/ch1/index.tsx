import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { mortgagePayment } from '../../utils/formulas'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import LiveData from '../../components/LiveData'
import { useT } from '../../i18n'
import './index.scss'

interface LifeImpact {
  emoji: string
  name: string
  name_en: string
  detail: string
  detail_en: string
}

const lifeImpacts: LifeImpact[] = [
  { emoji: '🏠',
    name: '房贷',
    name_en: 'Mortgage',
    detail: '30 年房贷利率每涨 1%,月供涨 ~12%。100 万贷款,30 年期,3.5% 升到 6.5% → 月供从 4490 升到 6320 元(+41%)。',
    detail_en: 'Every 1% rise in 30Y mortgage rate → monthly payment +~12%. ¥1M loan over 30 years: 3.5% → 6.5% pushes the payment from ¥4,490 to ¥6,320 (+41%).' },
  { emoji: '📉',
    name: '通胀',
    name_en: 'Inflation',
    detail: '5% 通胀连续 5 年 = 钱包缩水 22%。100 万存款 5 年后实际购买力 ~78 万。',
    detail_en: '5% inflation for 5 years = wallet shrinks 22%. ¥1M in savings has real purchasing power of ~¥780k after 5 years.' },
  { emoji: '💱',
    name: '汇率',
    name_en: 'Exchange rate',
    detail: 'USD/CNY 波动 5% = 留学一年差 1 万美金。出口企业的利润可被汇率波动直接抹掉。',
    detail_en: 'A 5% USD/CNY move = $10k difference in one year of study abroad. FX swings can wipe out an exporter\'s margin instantly.' },
  { emoji: '💼',
    name: '就业',
    name_en: 'Employment',
    detail: '2008 危机后美国失业率 +4%,中国 2008 后大量出口工厂倒闭。金融危机直接影响普通人就业。',
    detail_en: 'After 2008, US unemployment rose 4pp; Chinese export factories went under en masse. Financial crises hit ordinary jobs directly.' },
  { emoji: '🛒',
    name: '日常消费',
    name_en: 'Daily spending',
    detail: '利率影响信用卡 / 车贷 / 学贷利率。Fed 一次加息 25bp,你每年额外多付 60-200 美金(取决于负债)。',
    detail_en: 'Rates flow into credit cards / auto loans / student loans. One 25bp Fed hike adds $60–$200/year in interest depending on your debt.' }
]

interface Predict {
  title: string
  title_en: string
  question: string
  question_en: string
  options: string[]
  options_en: string[]
  correctIdx: number
  revealHeadline: string
  revealHeadline_en: string
  revealMsg: string
  revealMsg_en: string
}

const PREDICT: Predict = {
  title: '反预期:利率涨 1% 影响有多大?',
  title_en: "Anti-intuition: how big is a 1% rate hike?",
  question: '100 万贷款 30 年期,利率从 3.5% 涨到 6.5%(美国 2022 加息周期实况),月供变化最接近?',
  question_en: 'A 1M loan over 30 years; rate rises from 3.5% to 6.5% (actual 2022 US cycle). Closest monthly-payment change?',
  options: [
    '+5%(温和上涨)',
    '+15%(显著)',
    '+30%(很大)',
    '+40%(看似温和的利率变化竟有这么大的真实影响)'
  ],
  options_en: [
    '+5% (mild rise)',
    '+15% (significant)',
    '+30% (big)',
    '+40% (a seemingly modest rate change has this much real-life impact)'
  ],
  correctIdx: 3,
  revealHeadline: '月供 +41% · 总利息 +90%',
  revealHeadline_en: 'Monthly payment +41% · total interest +90%',
  revealMsg: '100 万 30 年贷款:3.5% → 月供 4,490;6.5% → 月供 6,320。**月供 +41%,30 年总利息从 62 万 → 128 万(+106%)**。这就是 2022-23 美国买房需求暴跌的根本原因 — 利率从 3% 到 7% 让相同的购房力直接腰斩。**金融素养 = 看懂"小利率变化 → 大生活变化"的能力**。',
  revealMsg_en: '1M / 30Y loan: 3.5% → payment 4,490; 6.5% → payment 6,320. **Payment +41%, total 30-year interest goes from 620k → 1.28M (+106%)**. This is exactly why US homebuying demand collapsed in 2022-23 — rates from 3% to 7% halved purchasing power. **Financial literacy = the ability to see "small rate changes → big life changes".**'
}

export default function Ch1Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

  const [params, setParams] = useState({ principal: 100, rate: 4, years: 30 })
  const [predict, setPredict] = useState<Predict | null>(null)
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
    const correct = idx === predict.correctIdx
    const headline = locale === 'en' ? predict.revealHeadline_en : predict.revealHeadline
    const msg = locale === 'en' ? predict.revealMsg_en : predict.revealMsg
    setReveal({ headline, msg, correct })
    setPredict(null)
  }

  Taro.useShareAppMessage(() => ({
    title: locale === 'en'
      ? `Ch.1 · Mortgage payment $${result.monthly.toFixed(0)}/mo`
      : `第 1 章 · 房贷月供 ¥${result.monthly.toFixed(0)}/月`,
    path: '/pages/ch1/index'
  }))

  // PredictModal 需要 PredictDef 形状,locale 转换
  const predictForModal = predict ? {
    title: locale === 'en' ? predict.title_en : predict.title,
    title_en: predict.title_en,
    question: locale === 'en' ? predict.question_en : predict.question,
    question_en: predict.question_en,
    options: locale === 'en' ? predict.options_en : predict.options,
    options_en: predict.options_en,
    correctIdx: predict.correctIdx,
    revealHeadline: predict.revealHeadline,
    revealHeadline_en: predict.revealHeadline_en,
    revealMsg: predict.revealMsg,
    revealMsg_en: predict.revealMsg_en
  } : null

  return (
    <ScrollView scrollY className='ch1'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🌐 为什么研究货币金融', '🌐 Why Study Money & Banking')}</Text>
        <Text className='page-meta'>{S('第 1 章', 'Chapter 1')}</Text>
      </View>

      <View className='intro-card'>
        <Text className='intro-text'>
          {S(
            '利率、通胀、汇率不只在新闻里 —— 它们决定你的房贷、储蓄、就业。这一章用一个简单计算器告诉你:**金融素养是现代公民的基本能力**。',
            "Rates, inflation, FX aren't just in the news — they shape your mortgage, savings, and job. This chapter uses one simple calculator to show: **financial literacy is a basic skill for modern citizenship.**"
          )}
        </Text>
      </View>

      <LiveData
        title={S('📡 此刻的真实利率环境', '📡 Real Rate Environment, Right Now')}
        subtitle={S(
          "用 FRED 当下的房贷利率算你的月供 — 不是教材里的\"假设 6%\"",
          "Use FRED's current mortgage rate for your payment — not the textbook's \"assume 6%\""
        )}
        tiles={[
          { id: 'MORTGAGE30US', label: S('30Y 房贷利率', '30Y mortgage rate'),
            hint: S('直接代到下方滑块,看月供如何变化', 'Plug into the slider below to see how the payment shifts')
          },
          { id: 'DFF', label: S('联邦基金利率', 'Federal funds rate'), change: '1y',
            hint: S('Fed 加 1% → 房贷涨 ~1%', '+1% Fed → mortgage +~1%')
          },
          { id: 'CPIAUCSL', label: S('CPI 总', 'CPI headline'), change: '1y',
            hint: S('通胀决定你的"实际"购买力', 'Inflation sets your "real" purchasing power')
          },
          { id: 'UNRATE', label: S('失业率', 'Unemployment'),
            hint: S('劳动市场状况 — 决定你的工资增长', 'Labor market state — drives your wage growth')
          }
        ]}
      />

      <View className='calc-card'>
        <Text className='calc-tag'>{S('🏠 房贷月供计算器', '🏠 Mortgage Payment Calculator')}</Text>
        <View className='calc-out'>
          <View>
            <Text className='out-label'>{S('月供', 'Monthly')}</Text>
            <Text className='out-big'>¥{result.monthly.toFixed(0)}</Text>
          </View>
          <View>
            <Text className='out-label'>{S('总利息', 'Total interest')}</Text>
            <Text className='out-mid'>¥{(result.interest / 10000).toFixed(1)}{S('万', '0k')}</Text>
          </View>
          <View>
            <Text className='out-label'>{S('总还款', 'Total payback')}</Text>
            <Text className='out-mid'>¥{(result.total / 10000).toFixed(1)}{S('万', '0k')}</Text>
          </View>
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>{S('调三个参数,看月供如何变化', 'Adjust three knobs to see how the payment moves')}</Text>
        <SliderRow label={S('贷款本金(万)', 'Principal (10k)')} value={params.principal} prefix='¥' unit={S('万', '0k')} min={10} max={500} step={5}
          onChange={v => setParams(p => ({ ...p, principal: Math.round(v) }))} />
        <SliderRow label={S('年利率', 'Annual rate')} value={params.rate} unit='%' min={2} max={10} step={0.1}
          onChange={v => setParams(p => ({ ...p, rate: v }))} />
        <SliderRow label={S('年限', 'Years')} value={params.years} unit={S('年', 'yr')} min={5} max={30} step={1}
          onChange={v => setParams(p => ({ ...p, years: Math.round(v) }))} />
      </View>

      <View className='predict-trigger' onClick={showPredict}>
        <Text>{S('⚡ 点这里挑战:利率涨 1% 影响有多大?', '⚡ Challenge: how big is a 1% rate hike?')}</Text>
      </View>

      <View className='impacts-card'>
        <Text className='impacts-tag'>{S('📚 金融如何影响你的生活', '📚 How Finance Touches Your Life')}</Text>
        {lifeImpacts.map((i, idx) => (
          <View key={idx} className='impact-row'>
            <Text className='impact-emoji'>{i.emoji}</Text>
            <View className='impact-body'>
              <Text className='impact-name'>{locale === 'en' ? i.name_en : i.name}</Text>
              <Text className='impact-detail'>{locale === 'en' ? i.detail_en : i.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='conclusion-card'>
        <Text className='conc-tag'>{S('💡 这一章的核心信息', '💡 The core message of this chapter')}</Text>
        <Text className='conc-text'>
          {S(
            '货币金融学不只是华尔街的事。**利率 / 通胀 / 汇率三件大事影响每个人**。学这一科 = 看懂宏观新闻 + 做更好的财务决策。',
            "Money and banking isn't just a Wall Street topic. **Rates / inflation / FX — three big things that touch every single person**. Studying it = understanding macro news + making better financial decisions."
          )}
        </Text>
      </View>

      {predictForModal ? <PredictModal def={predictForModal} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={() => setReveal(null)} /> : null}
    </ScrollView>
  )
}
