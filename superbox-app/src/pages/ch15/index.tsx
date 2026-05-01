import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch15Snapshots, type PredictDef } from '../../utils/snapshots'
import { rateCorridor } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import './index.scss'

interface ToolEvent {
  year: string
  emoji: string
  name: string
  desc: string
  emp?: boolean
}

const toolTimeline: ToolEvent[] = [
  { year: '1913', emoji: '🏛️', name: 'OMO 公开市场操作', desc: 'Fed 创立时的核心工具:买卖国债影响银行准备金。'},
  { year: '2008.10', emoji: '💰', name: 'IOER 启用', desc: '危机后 Fed 开始给银行超额准备金付息,搭建利率走廊上限。' },
  { year: '2013.9', emoji: '🛡️', name: 'ON RRP 创设', desc: '隔夜逆回购便利,作为利率走廊的"地板"——非银行机构可获得 Fed 利息。' },
  { year: '2019.9', emoji: '🔥', name: 'REPO 危机 ⚡', desc: '准备金不足 → REPO 利率飙到 10% → 走廊失锚。Fed 紧急扩表救市。', emp: true },
  { year: '2020.3', emoji: '🦠', name: 'r=0 + 无限 QE', desc: '疫情冲击,Fed 把法定准备金率(r)直接设为 0,启动无限 QE。' },
  { year: '2021.7', emoji: '🔧', name: 'SRF 创设 + IORB 合并', desc: '常备回购便利上线,防 2019.9 重演;同时把 IOER + IORR 合并为单一 IORB。**教材未更新这一点**。', emp: true },
  { year: '2023.3', emoji: '🏦', name: 'BTFP 创设', desc: 'SVB 倒闭后紧急工具,允许银行用国债面值(非市价)抵押融资。' }
]

export default function Ch15Page() {
  const [params, setParams] = useState({ iorb: 4.40, onRrp: 4.30, reserves: 3.0 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => rateCorridor(params.iorb, params.onRrp, params.reserves),
    [params]
  )

  const corridorMeta = {
    normal: { label: '🟢 正常', cls: 'cor-normal', desc: 'IORB 顶 + ON RRP 底有效锚定 EFFR · 充足准备金制度运行良好。' },
    tight: { label: '🟡 紧张', cls: 'cor-tight', desc: '准备金接近下限,EFFR 接近 IORB。需要警惕,SRF 可能被使用。' },
    broken: { label: '🔴 走廊崩', cls: 'cor-broken', desc: '准备金不足,IORB 失去锚定 → REPO 飙升。2019.9 模式重现。' }
  }[result.corridor]

  // 用于走廊可视化(把 IORB / EFFR / ON RRP / REPO 映射到 0-100 的高度位置)
  const corridorMin = Math.min(params.onRrp, result.repo, result.effr, params.iorb) - 0.5
  const corridorMax = Math.max(params.iorb, result.repo, params.onRrp) + 0.5
  const corridorRange = corridorMax - corridorMin
  const yPos = (rate: number) => ((corridorMax - rate) / corridorRange) * 100

  function loadSnapshot(key: string) {
    const s = ch15Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch15Snapshots[key]
    setParams({ iorb: s.iorb, onRrp: s.onRrp, reserves: s.reserves })
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
    title: `第 15 章 · 走廊 ${corridorMeta.label} · EFFR ${result.effr.toFixed(2)}%`,
    path: '/pages/ch15/index'
  }))

  return (
    <ScrollView scrollY className='ch15'>
      <View className='page-header'>
        <Text className='page-title'>🔧 Fed 工具箱 + 利率走廊</Text>
        <Text className='page-meta'>第 15 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2008', label: '2008 危机前' },
          { key: '2014', label: '2014 充足' },
          { key: '2019', label: '2019.9 REPO ⚡', accent: 'danger' },
          { key: '2024', label: '2024' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 利率走廊可视化 */}
      <View className={`corridor-card ${flash ? 'flash' : ''}`}>
        <Text className='corridor-tag'>📊 利率走廊 · 实时</Text>
        <View className='corridor-viz'>
          <View className='cor-line cor-iorb' style={{ top: `${yPos(params.iorb)}%` }}>
            <Text className='cor-label'>IORB 顶</Text>
            <Text className='cor-rate'>{params.iorb.toFixed(2)}%</Text>
          </View>
          <View className='cor-line cor-effr' style={{ top: `${yPos(result.effr)}%` }}>
            <Text className='cor-label'>EFFR</Text>
            <Text className='cor-rate'>{result.effr.toFixed(2)}%</Text>
          </View>
          <View className='cor-line cor-onrrp' style={{ top: `${yPos(params.onRrp)}%` }}>
            <Text className='cor-label'>ON RRP 底</Text>
            <Text className='cor-rate'>{params.onRrp.toFixed(2)}%</Text>
          </View>
          {result.corridor === 'broken' ? (
            <View className='cor-line cor-repo-spike' style={{ top: `${yPos(result.repo)}%` }}>
              <Text className='cor-label'>⚠ REPO</Text>
              <Text className='cor-rate'>{result.repo.toFixed(2)}%</Text>
            </View>
          ) : (
            <View className='cor-line cor-repo' style={{ top: `${yPos(result.repo)}%` }}>
              <Text className='cor-label'>REPO</Text>
              <Text className='cor-rate'>{result.repo.toFixed(2)}%</Text>
            </View>
          )}
        </View>

        <View className={`status-row ${corridorMeta.cls}`}>
          <Text className='status-big'>{corridorMeta.label}</Text>
          <Text className='status-pct'>准备金 {result.reservesPct.toFixed(0)}% 目标水平</Text>
        </View>
        <Text className='status-desc'>{corridorMeta.desc}</Text>
      </View>

      {note ? <Text className='ch15-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调三个工具看走廊变化</Text>
        <SliderRow label='IORB · 准备金余额利率(顶)' value={params.iorb} unit='%' min={0} max={6} step={0.05}
          onChange={v => setParams(p => ({ ...p, iorb: v }))} />
        <SliderRow label='ON RRP · 隔夜逆回购利率(底)' value={params.onRrp} unit='%' min={0} max={6} step={0.05}
          onChange={v => setParams(p => ({ ...p, onRrp: v }))} />
        <SliderRow label='银行准备金水平' value={params.reserves} prefix='$' unit='T' min={0.05} max={5} step={0.05}
          onChange={v => setParams(p => ({ ...p, reserves: v }))} />
      </View>

      {/* IORB 合并提示 */}
      <View className='iorb-callout'>
        <Text className='iorb-tag'>⚠ 教材 vs 现实</Text>
        <Text className='iorb-text'>
          米什金教材讨论 IOER(超额)和 IORR(法定)两个工具。
          但 <Text className='emp'>2021.7.29 起 Fed 把它们合并为单一 IORB</Text>(因为 2020 起 r=0,IORR 失去意义)。
          模拟器以现行 IORB 为准。
        </Text>
      </View>

      {/* 工具箱演进时间轴 */}
      <View className='timeline-card'>
        <Text className='timeline-tag'>📜 Fed 工具箱演进史</Text>
        {toolTimeline.map((t, i) => (
          <View key={i} className={`tl-item ${t.emp ? 'tl-emp' : ''}`}>
            <View className='tl-left'>
              <Text className='tl-emoji'>{t.emoji}</Text>
              <Text className='tl-year'>{t.year}</Text>
            </View>
            <View className='tl-body'>
              <Text className='tl-name'>{t.name}</Text>
              <Text className='tl-desc'>{t.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text className='hint'>💡 切「2019.9 REPO ⚡」→ 猜走廊为何崩 → 揭示准备金不足时 IORB 失效。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
