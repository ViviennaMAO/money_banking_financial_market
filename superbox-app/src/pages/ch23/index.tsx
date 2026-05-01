import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch23Snapshots, type PredictDef } from '../../utils/snapshots'
import { channelTransmission } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import './index.scss'

const channelExplain: Record<string, { mech: string; failsWhen: string }> = {
  '① 利率渠道': {
    mech: 'Fed 利率↓ → 投资 / 消费 ↑',
    failsWhen: '在 ZLB(零利率)无法继续降息时失效'
  },
  '② 资产价格 / 财富效应': {
    mech: '利率↓ → 股 / 房价↑ → 居民净值↑ → 消费↑',
    failsWhen: '资产价格已经处于泡沫水平时失效'
  },
  '③ 信贷渠道': {
    mech: '利率↓ + 银行愿放贷 → 信贷扩张',
    failsWhen: '银行健康受损时失效(2008 经典案例)'
  },
  '④ 资产负债表渠道': {
    mech: '利率↓ → 借款人净值↑ → 信用更易获得',
    failsWhen: '借款人净值已被资产暴跌击穿时失效'
  },
  '⑤ 流动性效应': {
    mech: '利率↓ → 消费者去杠杆 → 消费 / 房产购买↑',
    failsWhen: '消费者已严重负债 / 集体去杠杆时失效'
  }
}

export default function Ch23Page() {
  const [params, setParams] = useState({
    fedAction: 0, bankHealth: 70, borrowerNetworth: 70,
    ratePosition: 60, consumerLeverage: 55
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => channelTransmission(
      params.fedAction, params.bankHealth, params.borrowerNetworth,
      params.ratePosition, params.consumerLeverage
    ),
    [params]
  )

  const totalLabel = result.total > 70 ? { txt: '🟢 高效传导', cls: 'total-good' }
                   : result.total > 40 ? { txt: '🟡 部分阻塞', cls: 'total-mid' }
                   : { txt: '🔴 严重阻塞', cls: 'total-bad' }

  function loadSnapshot(key: string) {
    const s = ch23Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch23Snapshots[key]
    setParams({
      fedAction: s.fedAction, bankHealth: s.bankHealth,
      borrowerNetworth: s.borrowerNetworth, ratePosition: s.ratePosition,
      consumerLeverage: s.consumerLeverage
    })
    setNote(s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    setReveal({ headline: predict.revealHeadline, msg: predict.revealMsg, correct })
    setPredict(null)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingSnap) { applySnapshot(pendingSnap); setPendingSnap(null) }
  }

  Taro.useShareAppMessage(() => ({
    title: `第 23 章 · 政策传导 ${result.total.toFixed(0)}%`,
    path: '/pages/ch23/index'
  }))

  return (
    <ScrollView scrollY className='ch23'>
      <View className='page-header'>
        <Text className='page-title'>🔄 5 大传导渠道</Text>
        <Text className='page-meta'>第 23 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1990s', label: '1990s 大缓和' },
          { key: '2001', label: '2001 dotcom 后' },
          { key: '2008', label: '2008-14 QE ⚡', accent: 'danger' },
          { key: '2020', label: '2020 V 反弹' },
          { key: '2022', label: '2022 紧缩' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 总传导效率 */}
      <View className={`total-card ${flash ? 'flash' : ''} ${totalLabel.cls}`}>
        <View className='total-row'>
          <View>
            <Text className='total-label'>政策总传导效率</Text>
            <Text className='total-big'>{result.total.toFixed(0)}%</Text>
          </View>
          <Text className={`total-tag ${totalLabel.cls}`}>{totalLabel.txt}</Text>
        </View>
        <View className='total-detail'>
          <Text className='detail-label'>最强渠道:</Text>
          <Text className='detail-strong'>{result.dominant}</Text>
        </View>
        <View className='total-detail'>
          <Text className='detail-label'>最弱 / 阻塞:</Text>
          <Text className='detail-weak'>{result.weakest}</Text>
        </View>
      </View>

      {/* 5 渠道强度 */}
      <View className='channels-card'>
        <Text className='channels-tag'>📊 5 渠道传导强度对比</Text>
        {result.channels.map(ch => {
          const explain = channelExplain[ch.name]
          const cls = ch.strength > 70 ? 'ch-good' : ch.strength > 40 ? 'ch-mid' : 'ch-bad'
          return (
            <View key={ch.key} className={`channel-row ${cls}`}>
              <View className='ch-header'>
                <Text className='ch-name'>{ch.name}</Text>
                <Text className='ch-strength'>{ch.strength.toFixed(0)}%</Text>
              </View>
              <View className='ch-bar-wrap'>
                <View className={`ch-bar ${cls}`} style={{ width: `${ch.strength}%` }}></View>
              </View>
              <Text className='ch-mech'>机制:{explain.mech}</Text>
              <Text className='ch-fails'>失效:{explain.failsWhen}</Text>
            </View>
          )
        })}
      </View>

      {note ? <Text className='ch23-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调经济体的"传导基础"</Text>
        <SliderRow label='Fed 行动力度(-紧缩 / +宽松)' value={params.fedAction} unit='' min={-100} max={100} step={5}
          onChange={v => setParams(p => ({ ...p, fedAction: Math.round(v) }))} />
        <SliderRow label='银行体系健康度' value={params.bankHealth} unit='%' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, bankHealth: Math.round(v) }))} />
        <SliderRow label='借款人资产负债表' value={params.borrowerNetworth} unit='%' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, borrowerNetworth: Math.round(v) }))} />
        <SliderRow label='当前利率位置(0 = ZLB)' value={params.ratePosition} unit='%' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, ratePosition: Math.round(v) }))} />
        <SliderRow label='消费者杠杆水平' value={params.consumerLeverage} unit='%' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, consumerLeverage: Math.round(v) }))} />
      </View>

      <View className='context-card'>
        <Text className='context-tag'>💡 这一章为什么重要</Text>
        <Text className='context-text'>
          货币政策不是"Fed 调利率,经济就动"那么简单。Fed 的影响**通过 5 个并联渠道**传到实体经济。
          每个渠道在不同时期、不同情境下强弱不同——理解这一点,才能解释为什么:
        </Text>
        <Text className='context-bullet'>• 2001 降息能催生房地产泡沫(资产价格 + 信贷渠道双开)</Text>
        <Text className='context-bullet'>• 2008-2014 QE 万亿却复苏缓慢(3 个渠道阻塞)</Text>
        <Text className='context-bullet'>• 2020 财政直接发钱比 Fed 货币更有效(绕过银行系统)</Text>
        <Text className='context-bullet'>• 2022 加息能在 16 个月内压住通胀(5 渠道全开)</Text>
      </View>

      <Text className='hint'>💡 切「2008-14 QE ⚡」→ 猜复苏为何慢 → 揭示 5 渠道里 3 个失效。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
