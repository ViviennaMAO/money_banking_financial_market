import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { ch6Snapshots, type PredictDef } from '../../utils/snapshots'
import { spread2s10s, yieldAtTenor } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import YieldCurveCanvas from '../../components/YieldCurveCanvas'
import './index.scss'

export default function Ch6Page() {
  const [params, setParams] = useState({
    shortEnd: 4.3, longEnd: 4.6, curveBow: 0.1
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const spread = spread2s10s(params.shortEnd, params.longEnd, params.curveBow)
  const isInverted = spread < 0
  const y2 = yieldAtTenor(params.shortEnd, params.longEnd, params.curveBow, 2)
  const y10 = yieldAtTenor(params.shortEnd, params.longEnd, params.curveBow, 10)

  function loadSnapshot(key: string) {
    const s = ch6Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch6Snapshots[key]
    setParams({ shortEnd: s.shortEnd, longEnd: s.longEnd, curveBow: s.curveBow })
    setNote(s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    setReveal({
      headline: predict.revealHeadline,
      msg: predict.revealMsg,
      correct
    })
    setPredict(null)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingSnap) {
      applySnapshot(pendingSnap)
      setPendingSnap(null)
    }
  }

  Taro.useShareAppMessage(() => ({
    title: `第 6 章 · 2s10s = ${spread > 0 ? '+' : ''}${(spread * 100).toFixed(0)}bp${isInverted ? ' (倒挂)' : ''}`,
    path: '/pages/ch6/index'
  }))

  return (
    <ScrollView scrollY className='ch6'>
      <View className='page-header'>
        <Text className='page-title'>📊 收益率曲线沙盘</Text>
        <Text className='page-meta'>第 6 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1980', label: '1980 沃尔克' },
          { key: '2007', label: '2007.6 危机前' },
          { key: '2019', label: '2019.8 倒挂' },
          { key: '2024', label: '2024.7 反常 ⚡', accent: 'danger' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`canvas-card ${flash ? 'flash' : ''}`}>
        <YieldCurveCanvas
          shortEnd={params.shortEnd}
          longEnd={params.longEnd}
          curveBow={params.curveBow}
        />
        <View className='spread-row'>
          <View className='spread-cell'>
            <Text className='spread-label'>2Y</Text>
            <Text className='spread-value'>{y2.toFixed(2)}%</Text>
          </View>
          <View className='spread-cell'>
            <Text className='spread-label'>10Y</Text>
            <Text className='spread-value'>{y10.toFixed(2)}%</Text>
          </View>
          <View className={`spread-cell spread-key ${isInverted ? 'inv' : 'norm'}`}>
            <Text className='spread-label'>2s10s 利差</Text>
            <Text className='spread-value'>
              {(spread > 0 ? '+' : '') + (spread * 100).toFixed(0)}bp
            </Text>
            {isInverted ? <Text className='inv-tag'>⚠ 倒挂</Text> : null}
          </View>
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>调三个滑块,塑造曲线形态</Text>
        <SliderRow label='2Y 短端利率(Fed 政策)' value={params.shortEnd} unit='%' min={0} max={16} step={0.1}
          onChange={v => setParams(p => ({ ...p, shortEnd: v }))} />
        <SliderRow label='30Y 长端利率(市场预期)' value={params.longEnd} unit='%' min={0} max={16} step={0.1}
          onChange={v => setParams(p => ({ ...p, longEnd: v }))} />
        <SliderRow label='中段凸度(0=直线 / +=拱起 / -=凹)' value={params.curveBow} min={-1.5} max={1.5} step={0.1}
          onChange={v => setParams(p => ({ ...p, curveBow: v }))} />
      </View>

      {note ? <View className={`note-card ${isInverted ? 'note-inv' : 'note-ok'}`}><Text>{note}</Text></View> : null}

      <View className='theories'>
        <Text className='theories-tag'>📚 解释期限结构的三大理论</Text>
        <View className='th-item'>
          <Text className='th-num'>1</Text>
          <View className='th-body'>
            <Text className='th-title'>纯预期假说</Text>
            <Text className='th-desc'>长期利率 = 未来短期利率的均值。倒挂 = 市场预期 Fed 会降息。</Text>
          </View>
        </View>
        <View className='th-item'>
          <Text className='th-num'>2</Text>
          <View className='th-body'>
            <Text className='th-title'>流动性溢价理论</Text>
            <Text className='th-desc'>长期债流动性差 → 需要溢价补偿 → 曲线天然向上(主流解释)。</Text>
          </View>
        </View>
        <View className='th-item'>
          <Text className='th-num'>3</Text>
          <View className='th-body'>
            <Text className='th-title'>市场分割理论</Text>
            <Text className='th-desc'>不同期限市场是分割的(养老金买长债 / 银行买短债)。</Text>
          </View>
        </View>
      </View>

      <Text className='hint'>💡 切「2024.7 反常」⚡ → 猜倒挂 24 个月后 GDP 怎样 → 揭示 +2.5% 健康增长。倒挂不是真理。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
