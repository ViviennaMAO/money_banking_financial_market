import { View, Text, Slider } from '@tarojs/components'
import { tokens } from '../../theme/tokens'
import './index.scss'

interface Props {
  label: string
  value: number
  unit?: string
  prefix?: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

export default function SliderRow(props: Props) {
  const decimals = props.step < 1 ? 1 : 0
  return (
    <View className='slider-row'>
      <View className='slider-header'>
        <Text className='slider-label'>{props.label}</Text>
        <Text className='slider-value'>
          {props.prefix || ''}{props.value.toFixed(decimals)}{props.unit || ''}
        </Text>
      </View>
      <Slider
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        activeColor={tokens.accent}
        backgroundColor={tokens.bg3}
        blockColor={tokens.accent}
        blockSize={22}
        onChanging={(e: any) => props.onChange(e.detail.value)}
        onChange={(e: any) => props.onChange(e.detail.value)}
      />
    </View>
  )
}
