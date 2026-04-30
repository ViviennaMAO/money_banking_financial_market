import { View, Text, Button } from '@tarojs/components'
import type { PredictDef } from '../../utils/snapshots'
import './index.scss'

interface Props {
  def: PredictDef
  onAnswer: (idx: number) => void
}

export default function PredictModal({ def, onAnswer }: Props) {
  return (
    <View className='predict-overlay'>
      <View className='predict-modal'>
        <Text className='predict-tag'>🎯 预测先行 · 生成效应</Text>
        <Text className='predict-title'>{def.title}</Text>
        <Text className='predict-question'>{def.question}</Text>
        <View className='predict-options'>
          {def.options.map((opt, i) => (
            <Button key={i} className='predict-option' onClick={() => onAnswer(i)}>
              {opt}
            </Button>
          ))}
        </View>
        <Text className='predict-hint'>猜对猜错都给反馈,被打脸是学习时刻</Text>
      </View>
    </View>
  )
}
