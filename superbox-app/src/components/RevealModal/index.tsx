import { View, Text, Button } from '@tarojs/components'
import './index.scss'

interface Props {
  headline: string
  msg: string
  correct: boolean
  onClose: () => void
}

export default function RevealModal({ headline, msg, correct, onClose }: Props) {
  const prefix = correct
    ? '✅ 你已经把这个机制内化了'
    : '🎯 多数人都和你想的一样'
  return (
    <View className='reveal-overlay'>
      <View className='reveal-modal'>
        <Text className='reveal-tag'>⚡ 反预期时刻</Text>
        <Text className='reveal-headline'>{prefix} · {headline}</Text>
        <Text className='reveal-msg'>{msg}</Text>
        <Button className='reveal-close' onClick={onClose}>看模拟器演示 →</Button>
      </View>
    </View>
  )
}
