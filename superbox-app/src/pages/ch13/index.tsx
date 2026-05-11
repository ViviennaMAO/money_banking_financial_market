import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch13Snapshots, type PredictDef } from '../../utils/snapshots'
import { fomcDotPlot } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface FedRoleInfo {
  emoji: string
  name: string
  count: string
  desc: string
  protect: string
}

const fedRoles: FedRoleInfo[] = [
  {
    emoji: '🏛️', name: '联储理事会(7 人)', count: '14 年任期',
    desc: '总统提名 + 国会确认 · 长任期防止政治周期影响',
    protect: '14 年任期 = 横跨多个总统任期,无连任压力'
  },
  {
    emoji: '🌎', name: '12 联储行长', count: '地区董事会任命',
    desc: '不由总统任命 · 由各地区银行的董事会(私营 + 学术)选',
    protect: '地区任命 = 政治权力难以一次性影响'
  },
  {
    emoji: '🗳️', name: 'FOMC 投票席位', count: '7+5 席位',
    desc: '7 理事永远投 + 纽约联储永远投 + 4 轮换席位(11 个其他行长轮)',
    protect: '永久 + 轮换 = 决策反映多元地区视角'
  }
]

export default function Ch13Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({ inflationGap: 1, outputGap: 0, uncertainty: 40 })
  const [actualFFR, setActualFFR] = useState(4.5)
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => fomcDotPlot(params.inflationGap, params.outputGap, params.uncertainty),
    [params]
  )

  // 用于点阵图可视化:把所有点的利率范围找到 min/max
  const minRate = Math.min(...result.dots.map(d => d.position), 0)
  const maxRate = Math.max(...result.dots.map(d => d.position), 8)
  const range = maxRate - minRate || 1

  function loadSnapshot(key: string) {
    const s = ch13Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch13Snapshots[key]
    setParams({ inflationGap: s.inflationGap, outputGap: s.outputGap, uncertainty: s.uncertainty })
    setActualFFR(s.actualFFR)
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
    title: `第 13 章 · 点阵中位数 ${result.median.toFixed(2)}% vs FFR ${actualFFR}%`,
    path: '/pages/ch13/index'
  }))

  // 把利率范围分成 6 个 bin,每个 bin 一行(便于可视化堆叠)
  const numBins = 6
  const binWidth = range / numBins
  const bins: { rate: number; dots: typeof result.dots }[] = []
  for (let i = 0; i < numBins; i++) {
    const minB = minRate + i * binWidth
    const maxB = minB + binWidth
    bins.push({
      rate: (minB + maxB) / 2,
      dots: result.dots.filter(d => d.position >= minB && d.position < maxB || (i === numBins - 1 && d.position === maxB))
    })
  }

  return (
    <ScrollView scrollY className='ch13'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🏛️ FOMC 点阵图模拟', '🏛️ FOMC Dot Plot Simulator')}</Text>
        <Text className='page-meta'>{S('第 13 章', 'Chapter 13')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1981', label: '1981 沃尔克 ⚡', accent: 'danger' },
          { key: '2008', label: '2008.12 ZLB' },
          { key: '2015', label: '2015.12 启动加息' },
          { key: '2022', label: '2022.6 通胀冲击' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 点阵图可视化 */}
      <View className={`dotplot-card ${flash ? 'flash' : ''}`}>
        <Text className='dotplot-tag'>📊 FOMC 点阵图 · 12 位委员投票预测</Text>
        <View className='dotplot-viz'>
          {bins.slice().reverse().map((bin, i) => (
            <View key={i} className='bin-row'>
              <Text className='bin-rate'>{bin.rate.toFixed(1)}%</Text>
              <View className='bin-dots'>
                {bin.dots.map((d, j) => (
                  <View key={j} className={`fomc-dot dot-${d.faction}`}></View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View className='median-row'>
          <View>
            <Text className='median-label'>点阵中位数</Text>
            <Text className='median-big'>{result.median.toFixed(2)}%</Text>
          </View>
          <View>
            <Text className='median-label'>实际 FFR</Text>
            <Text className='median-actual'>{actualFFR.toFixed(2)}%</Text>
          </View>
          <View className='dev-cell'>
            <Text className='median-label'>偏离</Text>
            <Text className={`dev-value ${actualFFR - result.median > 1 ? 'dev-tight' : actualFFR - result.median < -1 ? 'dev-loose' : 'dev-fair'}`}>
              {actualFFR - result.median >= 0 ? '+' : ''}{(actualFFR - result.median).toFixed(2)}%
            </Text>
          </View>
        </View>

        <View className='factions'>
          <Text className='fac-tag'>委员观点分布</Text>
          <View className='fac-bars'>
            <View className='fac-bar fac-hawk' style={{ width: `${result.hawkPct}%` }}>
              <Text>🦅 鹰派 {result.hawkPct.toFixed(0)}%</Text>
            </View>
            <View className='fac-bar fac-mid' style={{ width: `${result.midPct}%` }}>
              <Text>● 中间 {result.midPct.toFixed(0)}%</Text>
            </View>
            <View className='fac-bar fac-dove' style={{ width: `${result.dovePct}%` }}>
              <Text>🕊️ 鸽派 {result.dovePct.toFixed(0)}%</Text>
            </View>
          </View>
        </View>
      </View>

      {note ? <Text className='ch13-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调经济状态 → 看委员观点重塑</Text>
        <SliderRow label='通胀缺口 π - π*' value={params.inflationGap} unit='%' min={-3} max={12} step={0.1}
          onChange={v => setParams(p => ({ ...p, inflationGap: v }))} />
        <SliderRow label='产出缺口 y - y*' value={params.outputGap} unit='%' min={-6} max={5} step={0.1}
          onChange={v => setParams(p => ({ ...p, outputGap: v }))} />
        <SliderRow label='委员意见分歧度' value={params.uncertainty} unit='%' min={10} max={100} step={5}
          onChange={v => setParams(p => ({ ...p, uncertainty: Math.round(v) }))} />
        <SliderRow label='实际 FFR(对比基准)' value={actualFFR} unit='%' min={0} max={20} step={0.1}
          onChange={v => setActualFFR(v)} />
      </View>

      {/* Fed 结构教学卡 */}
      <View className='structure-card'>
        <Text className='struct-tag'>🏛️ Fed 的"政治隔离"结构</Text>
        {fedRoles.map((role, i) => (
          <View key={i} className='role-item'>
            <View className='role-header'>
              <Text className='role-emoji'>{role.emoji}</Text>
              <View>
                <Text className='role-name'>{role.name}</Text>
                <Text className='role-count'>{role.count}</Text>
              </View>
            </View>
            <Text className='role-desc'>{role.desc}</Text>
            <Text className='role-protect'>🛡 {role.protect}</Text>
          </View>
        ))}
        <Text className='struct-note'>
          这套结构的核心目标:**让政治压力难以快速影响货币政策**。
          FOMC 一年开 8 次会 + 季度 SEP 经济预测 + 每次会议后发布点阵图。
        </Text>
      </View>

      {/* 中美对比 */}
      <View className='compare-card'>
        <Text className='compare-tag'>🇺🇸 vs 🇨🇳 央行结构差异</Text>
        <View className='cmp-row'>
          <View className='cmp-cell cmp-us'>
            <Text className='cmp-name'>美联储 Fed</Text>
            <Text className='cmp-detail'>独立机构 · 向国会负责 · 14 年任期 · 政治隔离 · 透明披露(点阵图)</Text>
          </View>
          <View className='cmp-cell cmp-cn'>
            <Text className='cmp-name'>中国人民银行 PBOC</Text>
            <Text className='cmp-detail'>国务院组成部门 · 货币政策最终决策权在国务院 · 行长任期与政府同步</Text>
          </View>
        </View>
        <Text className='cmp-note'>
          独立性 ≠ 优劣 — 两种制度各有取舍。Fed 模式擅长长期通胀稳定;
          PBOC 模式擅长结构性政策与跨政策协调。
        </Text>
      </View>

      <Text className='hint'>💡 切「1981 沃尔克 ⚡」→ 猜他会不会让步 → 揭示央行独立性的核心价值。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
