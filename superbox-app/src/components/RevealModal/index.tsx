import { View, Text, Button } from '@tarojs/components'
import { useT } from '../../i18n'
import './index.scss'

interface Props {
  headline: string
  msg: string
  correct: boolean
  onClose: () => void
}

export default function RevealModal({ headline, msg, correct, onClose }: Props) {
  const { locale } = useT()
  const prefix = locale === 'en'
    ? (correct
        ? "✅ You've internalized this mechanism"
        : "🎯 You're not alone — most people thought the same")
    : (correct
        ? '✅ 你已经把这个机制内化了'
        : '🎯 多数人都和你想的一样')
  const tag = locale === 'en' ? '⚡ Anti-intuition moment' : '⚡ 反预期时刻'
  const cta = locale === 'en' ? 'Watch the simulator →' : '看模拟器演示 →'
  return (
    <View className='reveal-overlay'>
      <View className='reveal-modal'>
        <Text className='reveal-tag'>{tag}</Text>
        <Text className='reveal-headline'>{prefix} · {headline}</Text>
        <Text className='reveal-msg'>{msg}</Text>
        <Button className='reveal-close' onClick={onClose}>{cta}</Button>
      </View>
    </View>
  )
}
