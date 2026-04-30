import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { findChapter, type Chapter, type Part } from '../../data/chapters'
import './index.scss'

export default function Placeholder() {
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [part, setPart] = useState<Part | null>(null)

  useDidShow(() => {
    const opts = Taro.getCurrentInstance().router?.params || {}
    const ch = Number(opts.ch || 0)
    const found = findChapter(ch)
    if (found) {
      setChapter(found.chapter)
      setPart(found.part)
    }
  })

  function goBack() {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: '/pages/home/index' }).catch(() =>
        Taro.redirectTo({ url: '/pages/home/index' })
      )
    })
  }

  if (!chapter || !part) {
    return (
      <View className='placeholder'>
        <Text className='ph-emoji'>🤔</Text>
        <Text className='ph-msg'>章节信息丢失</Text>
        <Button className='ph-back' onClick={goBack}>返回首页</Button>
      </View>
    )
  }

  return (
    <ScrollView scrollY className='placeholder'>
      <View className='ph-header'>
        <Text className='ph-part-tag'>第 {part.num} 篇 · {part.title}</Text>
        <Text className='ph-emoji-big'>{chapter.emoji}</Text>
        <Text className='ph-ch-num'>第 {chapter.num} 章</Text>
        <Text className='ph-ch-title'>{chapter.title}</Text>
      </View>

      <View className='ph-meta'>
        <View className='ph-meta-item'>
          <Text className='ph-meta-label'>难度</Text>
          <Text className='ph-meta-value'>{'⭐'.repeat(chapter.difficulty)}</Text>
        </View>
        {chapter.duration ? (
          <View className='ph-meta-item'>
            <Text className='ph-meta-label'>预估时长</Text>
            <Text className='ph-meta-value'>{chapter.duration}</Text>
          </View>
        ) : null}
      </View>

      <View className='ph-card'>
        <Text className='ph-card-tag'>📖 章节概览</Text>
        <Text className='ph-brief'>{chapter.brief}</Text>
      </View>

      <View className='ph-status-card'>
        <Text className='ph-status-emoji'>🚧</Text>
        <Text className='ph-status-title'>互动学习页面开发中</Text>
        <Text className='ph-status-desc'>
          这一章的模拟器、题库、新闻三联单和 AI 答疑正在按
          <Text className='ph-status-emp'>「学习科学六锚点」</Text>
          的设计原则开发中。
        </Text>
        <Text className='ph-status-progress'>
          MVP 三章已开放:第 14 章 货币乘数 / 第 17 章 利率平价 / 第 20 章 IS-LM
        </Text>
      </View>

      <View className='ph-actions'>
        <Button className='ph-btn ph-btn-primary' onClick={goBack}>← 返回目录</Button>
      </View>

      <View className='ph-footer'>
        <Text>米什金《货币金融学》第 11 版 · 第 {chapter.num} 章</Text>
      </View>
    </ScrollView>
  )
}
