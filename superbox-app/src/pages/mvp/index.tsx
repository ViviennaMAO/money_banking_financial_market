import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mvpChapters, type Chapter } from '../../data/chapters'
import './index.scss'

export default function MvpPage() {
  function go(ch: Chapter) {
    const url = ch.pagePath || `/pages/chapter/index?ch=${ch.num}`
    Taro.navigateTo({ url })
  }

  // 按章号排序
  const sorted = [...mvpChapters].sort((a, b) => a.num - b.num)

  return (
    <ScrollView scrollY className='mvp-page'>
      <View className='mvp-hero'>
        <Text className='hero-emoji'>⭐</Text>
        <Text className='hero-title'>反预期精选</Text>
        <Text className='hero-subtitle'>
          {sorted.length} 个震撼时刻 · 每章一个"教材没说,但市场会教你"的瞬间
        </Text>
      </View>

      <View className='mvp-list'>
        {sorted.map(c => (
          <View
            key={c.num}
            className='mvp-card'
            onClick={() => go(c)}
          >
            <View className='card-row'>
              <Text className='card-emoji'>{c.emoji}</Text>
              <View className='card-body'>
                <View className='card-meta'>
                  <Text className='card-num'>第 {c.num} 章</Text>
                  <Text className='card-stars'>{'⭐'.repeat(c.difficulty)}</Text>
                </View>
                <Text className='card-title'>{c.title}</Text>
              </View>
            </View>
            {c.hook ? (
              <View className='card-hook'>
                <Text className='hook-flag'>⚡</Text>
                <Text className='hook-text'>{c.hook}</Text>
              </View>
            ) : null}
            <Text className='card-cta'>立刻试 →</Text>
          </View>
        ))}
      </View>

      <View className='footer-note'>
        <Text>每章带历史快照 + 反预期预测先行 + 互动公式器</Text>
      </View>
    </ScrollView>
  )
}
