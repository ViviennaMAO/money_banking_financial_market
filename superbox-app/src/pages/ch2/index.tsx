import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface FinTool {
  name: string
  emoji: string
  type: 'direct-primary' | 'direct-secondary' | 'indirect'
  detail: string
}

const tools: FinTool[] = [
  { name: 'IPO 认购', emoji: '🎉', type: 'direct-primary', detail: '直接融资 · 一级市场:钱直接给企业' },
  { name: '炒股(腾讯)', emoji: '📈', type: 'direct-secondary', detail: '直接融资 · 二级市场:在已发行股票间转手' },
  { name: '银行存款', emoji: '🏛️', type: 'indirect', detail: '间接融资:银行做中介,你存款 → 银行放贷' },
  { name: '余额宝', emoji: '💰', type: 'indirect', detail: '间接融资:MMF 做中介,你的钱被汇集去买短期债' },
  { name: '买公司债', emoji: '📜', type: 'direct-primary', detail: '直接融资 · 一级市场(若新发行)' },
  { name: 'P2P 借贷', emoji: '🤝', type: 'direct-primary', detail: '直接融资 · 个体对个体(2018+ 中国基本被关停)' }
]

const PREDICT = {
  title: '反预期:支付宝 / Apple Pay 是什么?',
  question: 'Apple Pay / 支付宝 / 微信支付,本质上是哪种?',
  options: [
    '银行的替代品(完全取代银行)',
    '影子银行的一种',
    '支付层(钱仍存在银行,只是支付通道改变)',
    '直接融资工具'
  ],
  correctIdx: 2,
  revealHeadline: '支付层 · 钱仍在银行体系内',
  revealMsg: '支付宝 / 微信 / Apple Pay 主要是**支付通道**,绑定的最终是银行卡或银行账户。它们不创造货币,只改变流转效率。这就是为什么 Fed 仍能通过银行体系传导货币政策。但**它们正在改变 c**(现金/存款比)— 现金需求大幅下降,这影响货币乘数 m(联系第 14 章)。**支付创新会重塑货币创造结构,但还没替代银行**。'
}

export default function Ch2Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [picks, setPicks] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [predict, setPredict] = useState<typeof PREDICT | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)

  function pick(idx: number, type: string) {
    if (showResults) return
    setPicks(prev => ({ ...prev, [idx]: type }))
  }

  function check() {
    setShowResults(true)
  }

  function reset() {
    setPicks({})
    setShowResults(false)
  }

  const correctCount = Object.entries(picks).filter(([idx, type]) => tools[Number(idx)].type === type).length

  Taro.useShareAppMessage(() => ({
    title: '第 2 章 · 金融体系分类游戏',
    path: '/pages/ch2/index'
  }))

  return (
    <ScrollView scrollY className='ch2'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🏛️ 金融体系概览', '🏛️ Financial System Overview')}</Text>
        <Text className='page-meta'>{S('第 2 章', 'Chapter 2')}</Text>
      </View>

      <View className='intro-card'>
        <Text className='intro-text'>
          钱从哪里来,到哪里去?这一章给你一张"资金流向地图":
          **直接融资**(钱直接给企业)vs **间接融资**(通过银行中介)。
          这两种方式塑造了整个经济。
        </Text>
      </View>

      <View className='tax-card'>
        <Text className='tax-tag'>📊 三种融资方式</Text>
        <View className='tax-row tax-direct-primary'>
          <Text className='tax-emoji'>💸</Text>
          <View className='tax-body'>
            <Text className='tax-name'>直接融资 · 一级市场</Text>
            <Text className='tax-desc'>钱直接给企业(IPO 认购、新发行债券)</Text>
          </View>
        </View>
        <View className='tax-row tax-direct-secondary'>
          <Text className='tax-emoji'>🔄</Text>
          <View className='tax-body'>
            <Text className='tax-name'>直接融资 · 二级市场</Text>
            <Text className='tax-desc'>已发行金融资产之间转手(股票交易、二级债券)</Text>
          </View>
        </View>
        <View className='tax-row tax-indirect'>
          <Text className='tax-emoji'>🏦</Text>
          <View className='tax-body'>
            <Text className='tax-name'>间接融资</Text>
            <Text className='tax-desc'>通过银行 / MMF / 信托等中介(存款 → 贷款)</Text>
          </View>
        </View>
      </View>

      <View className='game-card'>
        <Text className='game-tag'>🎮 互动:把每个工具分到正确的类</Text>
        {tools.map((t, idx) => {
          const picked = picks[idx]
          const isCorrect = showResults && picked === t.type
          const isWrong = showResults && picked && picked !== t.type
          return (
            <View key={idx} className='tool-row'>
              <View className='tool-header'>
                <Text className='tool-emoji'>{t.emoji}</Text>
                <Text className='tool-name'>{t.name}</Text>
                {isCorrect ? <Text className='res-correct'>✓</Text> : null}
                {isWrong ? <Text className='res-wrong'>✗</Text> : null}
              </View>
              <View className='tool-options'>
                <Button className={`opt ${picked === 'direct-primary' ? 'picked' : ''}`} onClick={() => pick(idx, 'direct-primary')}>直接·一级</Button>
                <Button className={`opt ${picked === 'direct-secondary' ? 'picked' : ''}`} onClick={() => pick(idx, 'direct-secondary')}>直接·二级</Button>
                <Button className={`opt ${picked === 'indirect' ? 'picked' : ''}`} onClick={() => pick(idx, 'indirect')}>间接</Button>
              </View>
              {showResults && picked && picked !== t.type ? (
                <Text className='tool-detail'>{t.detail}</Text>
              ) : null}
            </View>
          )
        })}

        <View className='game-actions'>
          {!showResults ? (
            <Button className='btn-check' onClick={check}>检查答案</Button>
          ) : (
            <View className='result-block'>
              <Text className='result-text'>正确 {correctCount} / {tools.length}</Text>
              <Button className='btn-reset' onClick={reset}>重做</Button>
            </View>
          )}
        </View>
      </View>

      <View className='predict-trigger' onClick={() => setPredict(PREDICT)}>
        <Text>⚡ 反预期:支付宝是哪种?</Text>
      </View>

      <View className='conclusion-card'>
        <Text className='conc-tag'>💡 核心启示</Text>
        <Text className='conc-text'>
          ① 金融体系本质是"把钱从有钱人转给需要钱的人"。
          ② 银行存在是因为信息不对称(联系第 8 章)。
          ③ 直接 vs 间接 不是优劣之分,各服务不同期限和风险需求。
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
