import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

interface Question {
  text: string
  options: string[]
}

const questions: Question[] = [
  { text: '1. 100 美元存银行,通过派生最终能创造多少 M2?', options: ['$100', '$500', '$1,000', '$10,000'] },
  { text: '2. Fed 印 1 万亿美元,M2 一定增加 1 万亿?', options: ['对', '错'] },
  { text: '3. 高息货币,是不是必然升值?', options: ['是', '不是'] }
]

export default function QuizPage() {
  const [picks, setPicks] = useState<(number | null)[]>([null, null, null])

  function pick(qIdx: number, optIdx: number) {
    setPicks(prev => prev.map((p, i) => (i === qIdx ? optIdx : p)))
  }

  return (
    <ScrollView scrollY className='quiz'>
      <View className='page-header'>
        <Text className='page-title'>⚡ 前测 3 题</Text>
        <Text className='page-meta'>测试效应</Text>
      </View>
      <Text className='intro'>
        不教任何东西,直接抛三道直觉题。<Text className='intro-emp'>答案此刻不揭晓</Text>——只记录你的初始直觉。
      </Text>

      <View className='qs-card'>
        {questions.map((q, qi) => (
          <View key={qi} className='q-block'>
            <Text className='q-stem'>{q.text}</Text>
            <View className={`q-opts cols-${q.options.length}`}>
              {q.options.map((opt, oi) => (
                <Button
                  key={oi}
                  className={`q-opt ${picks[qi] === oi ? 'picked' : ''}`}
                  onClick={() => pick(qi, oi)}
                >
                  {opt}
                </Button>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className='design-card'>
        <Text className='design-tag'>🔬 设计逻辑</Text>
        <Text className='design-text'>
          我们不告诉你答案。等你在三个模拟器里学完后,这三道题会
          <Text className='emp'>伪装成新题再次出现</Text>
          ——前测/后测的提升幅度才是产品 KPI。
        </Text>
      </View>
    </ScrollView>
  )
}
