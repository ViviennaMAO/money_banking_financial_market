import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

const choices = ['有', '没有', '看情况']

export default function NewsPage() {
  const [picked, setPicked] = useState<number | null>(null)

  return (
    <ScrollView scrollY className='news'>
      <View className='page-header'>
        <Text className='page-title'>📰 新闻三联单</Text>
        <Text className='page-meta'>每日 1-3 条</Text>
      </View>
      <Text className='intro'>一张图同时给"新闻 + 数据 + 理论 + 互动"。</Text>

      <View className='card'>
        <View className='card-news'>
          <Text className='news-date'>📰 2024.7.31</Text>
          <Text className='news-title'>BOJ 意外加息 25bp,Powell 暗示 9 月降息</Text>
          <Text className='news-detail'>日央行 0.10% → 0.25%(2007 来最大)。Fed 当晚措辞转向。</Text>
        </View>

        <View className='card-section'>
          <Text className='section-tag'>📊 看板信号 · 决议后 48 小时</Text>
          <View className='kpi-row'><Text>USD/JPY</Text><Text className='kpi-neg'>155 → 142 (-8.4%)</Text></View>
          <View className='kpi-row'><Text>日经 225</Text><Text className='kpi-neg'>-12% 单日</Text></View>
          <View className='kpi-row'><Text>VIX</Text><Text className='kpi-warn'>16 → 38</Text></View>
        </View>

        <View className='card-section'>
          <Text className='section-tag'>🎓 教材原理 · 第 17 章 利率平价</Text>
          <Text className='theory'>
            i_d↓ + i_f↑ → carry 利差快速收窄 → 套息平仓潮 → 反向资金推升 JPY → 杠杆放大 → 流动性挤兑
          </Text>
        </View>

        <View className='card-section card-q'>
          <Text className='q-tag'>❓ 渐进追问 L1 · 直觉层</Text>
          <Text className='q-text'>这事对持有美股的散户有影响吗?</Text>
          <View className='q-options'>
            {choices.map((c, i) => (
              <Button
                key={i}
                className={`q-btn ${picked === i ? 'picked' : ''}`}
                onClick={() => setPicked(i)}
              >
                {c}
              </Button>
            ))}
          </View>
          {picked !== null ? <Text className='q-after'>答完显示 L2 机制层(自由文本)→ L3 反事实(高难度)</Text> : null}
        </View>

        <View className='card-actions'>
          <Button className='action-share'>📤 分享到 Luffa</Button>
          <Button className='action-sim' onClick={() => Taro.navigateTo({ url: '/pages/ch17/index' })}>
            🪙 套息器试一下
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}
