import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import {
  getFredSnapshotSync,
  refreshFredSnapshot,
  formatValue,
  formatChange,
  sourceLabel
} from '../../utils/fred'
import type { FredSeriesId, FredSnapshot } from '../../data/fred-baseline'
import './index.scss'

interface LiveTileSpec {
  id: FredSeriesId
  /** 章号链接(可选,渲染时显示) */
  ch?: number
  /** 自定义显示名(覆盖 series.name) */
  label?: string
  /** 显示哪种变化:1d / 1y */
  change?: '1' | '1y' | 'none'
  /** 反预期 hint(可选) */
  hint?: string
}

interface LiveDataProps {
  /** 标题(可选) */
  title?: string
  /** 副标题(可选) */
  subtitle?: string
  /** 要展示的指标列表 */
  tiles: LiveTileSpec[]
  /** 是否显示来源行 */
  showSource?: boolean
  /** 是否在挂载时尝试网络刷新(默认 true) */
  autoRefresh?: boolean
  /** 加载完成回调(可用于让父组件感知) */
  onLoaded?: (snap: FredSnapshot) => void
}

export default function LiveData({
  title,
  subtitle,
  tiles,
  showSource = true,
  autoRefresh = true,
  onLoaded
}: LiveDataProps) {
  const [snap, setSnap] = useState<FredSnapshot>(getFredSnapshotSync())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!autoRefresh) return
    let cancelled = false
    setLoading(true)
    refreshFredSnapshot()
      .then(s => {
        if (cancelled) return
        setSnap(s)
        onLoaded?.(s)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh])

  return (
    <View className='live-data'>
      {title ? (
        <View className='live-head'>
          <Text className='live-title'>{title}</Text>
          {subtitle ? <Text className='live-subtitle'>{subtitle}</Text> : null}
        </View>
      ) : null}

      <View className='live-grid'>
        {tiles.map(tile => {
          const p = snap.series[tile.id]
          const changeMode = tile.change ?? '1'
          const change =
            changeMode === '1'
              ? p?.change1
              : changeMode === '1y'
                ? p?.change1y
                : undefined
          const ch = formatChange(change, p?.unit || '%', '')
          return (
            <View key={tile.id} className='live-tile'>
              <Text className='tile-label'>{tile.label || p?.name || tile.id}</Text>
              <Text className='tile-value'>{formatValue(p)}</Text>
              <View className='tile-meta'>
                {changeMode !== 'none' ? (
                  <Text className={`tile-change tone-${ch.tone}`}>
                    {changeMode === '1y' ? '同比 ' : '日 '}{ch.text}
                  </Text>
                ) : null}
                {p?.date ? <Text className='tile-date'>{p.date}</Text> : null}
              </View>
              {tile.hint ? <Text className='tile-hint'>{tile.hint}</Text> : null}
            </View>
          )
        })}
      </View>

      {showSource ? (
        <View className='live-foot'>
          <Text className='foot-source'>
            🔌 {sourceLabel(snap)} · 截至 {snap.asOf}
            {loading ? ' · 同步中...' : ''}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
