import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

const PREDICT = {
  title: '反预期:数字支付改变了什么?',
  question: '2010-2024 中国移动支付规模从几乎为零飙升到 ¥500T+/年。这对 c(现金/存款比)的影响?',
  options: [
    'c 大幅上升',
    'c 不变',
    'c 大幅下降(从 ~12% 跌到 ~2%)',
    '与移动支付无关'
  ],
  correctIdx: 2,
  revealHeadline: 'c 从 12% 跌到 ~2% · 移动支付改写货币结构',
  revealMsg: '中国 c 从 1990s 的 ~15% 跌到 2024 的 ~2%(每个人钱包里的现金大幅减少)。**这直接改变了第 14 章的货币乘数 m = (1+c)/(r+e+c)**:c 下降 → m 上升 → 给定 MB,M2 显著增加。这就是为什么 2010 后中国 M2 增长部分由"数字化"贡献,与传统货币创造无关。**支付工具创新会重塑整个货币体系**。CBDC 如果广泛采用,c 还会进一步变化(联系第 15 章)。'
}

interface Layer {
  level: 'M0' | 'M1' | 'M2' | 'M3'
  emoji: string
  name: string
  example: string
  liquidity: number
}

const layers: Layer[] = [
  { level: 'M0', emoji: '💵', name: '流通中现金', example: '钱包里 + 收银台里的纸币硬币', liquidity: 100 },
  { level: 'M1', emoji: '💳', name: 'M0 + 活期', example: '可以立刻刷卡花出去的全部钱', liquidity: 90 },
  { level: 'M2', emoji: '💰', name: 'M1 + 储蓄 + 短期定存', example: '宏观分析最常用口径(也包括 MMF)', liquidity: 60 },
  { level: 'M3', emoji: '📈', name: 'M2 + 大额定存', example: '部分国家用,美国 2006 起停止公布', liquidity: 30 }
]

export default function Ch3Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({ cash: 5, demand: 30, savings: 50, mmf: 15 })
  const [predict, setPredict] = useState<typeof PREDICT | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)

  const total = params.cash + params.demand + params.savings + params.mmf
  const M0 = params.cash
  const M1 = params.cash + params.demand
  const M2 = params.cash + params.demand + params.savings + params.mmf
  // c = 现金 / 存款比
  const c = (params.demand + params.savings + params.mmf) > 0
    ? (params.cash / (params.demand + params.savings + params.mmf) * 100)
    : 0

  Taro.useShareAppMessage(() => ({
    title: `第 3 章 · M2 = ¥${M2}T · c = ${c.toFixed(1)}%`,
    path: '/pages/ch3/index'
  }))

  return (
    <ScrollView scrollY className='ch3'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('💵 什么是货币 · M0-M2', '💵 What is Money · M0-M2')}</Text>
        <Text className='page-meta'>{S('第 3 章', 'Chapter 3')}</Text>
      </View>

      <View className='intro-card'>
        <Text className='intro-text'>
          M0 / M1 / M2 / M3 不是密码,是货币的不同**形态**。
          从你口袋的现金,到银行卡的活期,到余额宝的货币基金,各有各的"流动性"。
        </Text>
      </View>

      <View className='hierarchy-card'>
        <Text className='h-tag'>📚 货币层次 · 流动性递减</Text>
        {layers.map((l, i) => (
          <View key={i} className='layer-row'>
            <Text className='layer-emoji'>{l.emoji}</Text>
            <View className='layer-body'>
              <View className='layer-header'>
                <Text className='layer-level'>{l.level}</Text>
                <Text className='layer-name'>{l.name}</Text>
              </View>
              <View className='liquidity-row'>
                <Text className='liq-label'>流动性</Text>
                <View className='liq-bar-wrap'>
                  <View className='liq-bar' style={{ width: `${l.liquidity}%` }}></View>
                </View>
                <Text className='liq-value'>{l.liquidity}%</Text>
              </View>
              <Text className='layer-example'>{l.example}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='build-card'>
        <Text className='b-tag'>🔧 试一试 · 调整你的"钱"分布(单位:T)</Text>
        <SliderRow label='💵 现金 / 钱包' value={params.cash} prefix='¥' unit='T' min={0} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, cash: v }))} />
        <SliderRow label='💳 银行活期' value={params.demand} prefix='¥' unit='T' min={0} max={50} step={1}
          onChange={v => setParams(p => ({ ...p, demand: Math.round(v) }))} />
        <SliderRow label='🏦 储蓄+短期定存' value={params.savings} prefix='¥' unit='T' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, savings: Math.round(v) }))} />
        <SliderRow label='💰 余额宝 / MMF' value={params.mmf} prefix='¥' unit='T' min={0} max={30} step={0.5}
          onChange={v => setParams(p => ({ ...p, mmf: v }))} />
      </View>

      <View className='out-card'>
        <Text className='out-tag'>📊 计算结果</Text>
        <View className='out-grid'>
          <View><Text className='out-label'>M0</Text><Text className='out-big m0'>¥{M0.toFixed(1)}T</Text></View>
          <View><Text className='out-label'>M1</Text><Text className='out-big m1'>¥{M1.toFixed(1)}T</Text></View>
          <View><Text className='out-label'>M2</Text><Text className='out-big m2'>¥{M2.toFixed(1)}T</Text></View>
          <View><Text className='out-label'>c 现金存款比</Text><Text className='out-big c-val'>{c.toFixed(1)}%</Text></View>
        </View>
        <Text className='out-formula'>
          c 直接影响货币乘数 m = (1+c)/(r+e+c) — 联系第 14 章
        </Text>
      </View>

      <View className='predict-trigger' onClick={() => setPredict(PREDICT)}>
        <Text>⚡ 反预期:数字支付改变了什么?</Text>
      </View>

      <View className='conclusion-card'>
        <Text className='conc-tag'>💡 核心启示</Text>
        <Text className='conc-text'>
          ① 货币不是单一概念,是流动性梯度。
          ② M2 是宏观分析最常用的口径。
          ③ 数字支付正在改变 c(现金/存款比),m 也跟着变 — 这是 2010+ 中国 M2 高增长的原因之一。
        </Text>
      </View>

      {predict ? <PredictModal def={predict} onAnswer={(idx) => {
        if (!predict) return
        setReveal({ headline: predict.revealHeadline, msg: predict.revealMsg, correct: idx === predict.correctIdx })
        setPredict(null)
      }} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={() => setReveal(null)} /> : null}
    </ScrollView>
  )
}
