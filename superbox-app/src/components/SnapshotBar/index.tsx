import { View, Text, Button } from '@tarojs/components'
import './index.scss'

export interface SnapshotItem {
  key: string
  label: string
  accent?: 'plain' | 'primary' | 'danger'
}

interface Props {
  items: SnapshotItem[]
  onSelect: (key: string) => void
}

export default function SnapshotBar({ items, onSelect }: Props) {
  return (
    <View className='snap-bar'>
      <Text className='snap-label'>历史快照</Text>
      <View className='snap-buttons'>
        {items.map(s => (
          <Button
            key={s.key}
            className={`snap-btn snap-${s.accent || 'plain'}`}
            onClick={() => onSelect(s.key)}
          >
            {s.label}
          </Button>
        ))}
      </View>
    </View>
  )
}
