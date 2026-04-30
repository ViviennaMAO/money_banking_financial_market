import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface ChapterCard {
  ch: number
  emoji: string
  title: string
  meta: string
  hook: string
  path: string
}

const chapters: ChapterCard[] = [
  {
    ch: 14, emoji: '💱', title: '货币乘数',
    meta: '12 分钟 · ⭐⭐⭐',
    hook: '反预期震撼:Fed 印万亿,M2 却几乎没动。乘数砸到 1.2 那一刻。',
    path: '/pages/ch14/index'
  },
  {
    ch: 17, emoji: '🪙', title: '利率平价 · 套息交易',
    meta: '14 分钟 · ⭐⭐⭐⭐',
    hook: '反预期震撼:2024.8 USD/JPY 三周从 162→142,10 倍杠杆 -100%。',
    path: '/pages/ch17/index'
  },
  {
    ch: 20, emoji: '📐', title: 'IS-LM 模型',
    meta: '15 分钟 · ⭐⭐⭐⭐⭐',
    hook: '反预期震撼:流动性陷阱里,LM 怎么右移 Y 都不动。',
    path: '/pages/ch20/index'
  }
]

const principles = [
  { name: '测试效应', color: 'p-blue' },
  { name: '生成效应', color: 'p-amber' },
  { name: '反预期', color: 'p-red' },
  { name: '必要难度', color: 'p-green' },
  { name: '自解释', color: 'p-purple' },
  { name: '元认知', color: 'p-cyan' }
]

export default function Home() {
  function navigate(path: string) {
    Taro.navigateTo({ url: path })
  }
  return (
    <ScrollView scrollY className='home'>
      <View className='hero'>
        <Text className='hero-tag'>让米什金的理论 · 在今天的市场上立刻验证</Text>
        <Text className='hero-title'>
          把<Text className='hero-accent'>货币金融学</Text>{'\n'}
          变成你能<Text className='hero-warm'>动手玩</Text>的活教材
        </Text>
      </View>

      <View className='card principles'>
        <Text className='card-tag'>设计原则 · 6 条学习科学锚点</Text>
        <View className='badges'>
          {principles.map(p => (
            <Text key={p.name} className={`badge ${p.color}`}>{p.name}</Text>
          ))}
        </View>
      </View>

      <View className='ch-list'>
        <Text className='section-tag'>MVP 三章 · 全部可点</Text>
        {chapters.map(c => (
          <View key={c.ch} className='ch-card' onClick={() => navigate(c.path)}>
            <View className='ch-row'>
              <View>
                <Text className='ch-num'>第 {c.ch} 章</Text>
                <Text className='ch-title'>{c.title}</Text>
                <Text className='ch-meta'>{c.meta}</Text>
              </View>
              <Text className='ch-emoji'>{c.emoji}</Text>
            </View>
            <Text className='ch-hook'>{c.hook}</Text>
            <Text className='ch-cta'>立刻试一下 →</Text>
          </View>
        ))}
      </View>

      <View className='footer-note'>
        <Text>原型 v1 · 米什金教材内容版权属 Pearson</Text>
      </View>
    </ScrollView>
  )
}
