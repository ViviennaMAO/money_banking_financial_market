import { View, Text, Button } from '@tarojs/components'
import type { PredictDef } from '../../utils/snapshots'
import { useT } from '../../i18n'
import './index.scss'

interface Props {
  def: PredictDef
  onAnswer: (idx: number) => void
}

export default function PredictModal({ def, onAnswer }: Props) {
  const { locale } = useT()
  const title = locale === 'en' && def.title_en ? def.title_en : def.title
  const question = locale === 'en' && def.question_en ? def.question_en : def.question
  const options = locale === 'en' && def.options_en ? def.options_en : def.options
  const tag = locale === 'en' ? '🎯 Predict first · generation effect' : '🎯 预测先行 · 生成效应'
  const hint = locale === 'en'
    ? "Right or wrong, you get feedback — being humbled is the learning moment"
    : '猜对猜错都给反馈,被打脸是学习时刻'

  return (
    <View className='predict-overlay'>
      <View className='predict-modal'>
        <Text className='predict-tag'>{tag}</Text>
        <Text className='predict-title'>{title}</Text>
        <Text className='predict-question'>{question}</Text>
        <View className='predict-options'>
          {options.map((opt, i) => (
            <Button key={i} className='predict-option' onClick={() => onAnswer(i)}>
              {opt}
            </Button>
          ))}
        </View>
        <Text className='predict-hint'>{hint}</Text>
      </View>
    </View>
  )
}
