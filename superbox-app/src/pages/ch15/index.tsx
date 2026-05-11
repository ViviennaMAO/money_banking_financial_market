import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch15Snapshots, type PredictDef } from '../../utils/snapshots'
import { rateCorridor } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface ToolEvent {
  year: string
  emoji: string
  name: string; name_en: string
  desc: string; desc_en: string
  emp?: boolean
}

const toolTimeline: ToolEvent[] = [
  { year: '1913', emoji: '🏛️',
    name: 'OMO 公开市场操作', name_en: 'OMO · Open Market Operations',
    desc: 'Fed 创立时的核心工具:买卖国债影响银行准备金。',
    desc_en: "The Fed's founding tool: buy/sell Treasuries to influence bank reserves." },
  { year: '2008.10', emoji: '💰',
    name: 'IOER 启用', name_en: 'IOER activated',
    desc: '危机后 Fed 开始给银行超额准备金付息,搭建利率走廊上限。',
    desc_en: "Post-crisis Fed began paying interest on excess reserves, forming the corridor's upper bound." },
  { year: '2013.9', emoji: '🛡️',
    name: 'ON RRP 创设', name_en: 'ON RRP created',
    desc: '隔夜逆回购便利,作为利率走廊的"地板"——非银行机构可获得 Fed 利息。',
    desc_en: "Overnight Reverse Repo facility — the corridor's 'floor', giving non-bank institutions access to Fed interest." },
  { year: '2019.9', emoji: '🔥',
    name: 'REPO 危机 ⚡', name_en: 'REPO crisis ⚡',
    desc: '准备金不足 → REPO 利率飙到 10% → 走廊失锚。Fed 紧急扩表救市。',
    desc_en: 'Insufficient reserves → REPO rate spiked to 10% → corridor un-anchored. Fed emergency balance-sheet expansion to rescue.',
    emp: true },
  { year: '2020.3', emoji: '🦠',
    name: 'r=0 + 无限 QE', name_en: 'r=0 + unlimited QE',
    desc: '疫情冲击,Fed 把法定准备金率(r)直接设为 0,启动无限 QE。',
    desc_en: 'Pandemic shock: Fed set required reserve ratio (r) to 0, launched unlimited QE.' },
  { year: '2021.7', emoji: '🔧',
    name: 'SRF 创设 + IORB 合并', name_en: 'SRF created + IORB consolidated',
    desc: '常备回购便利上线,防 2019.9 重演;同时把 IOER + IORR 合并为单一 IORB。**教材未更新这一点**。',
    desc_en: 'Standing Repo Facility goes live to prevent a 2019.9 repeat; meanwhile IOER + IORR merged into a single IORB. **Textbooks have not been updated on this**.',
    emp: true },
  { year: '2023.3', emoji: '🏦',
    name: 'BTFP 创设', name_en: 'BTFP created',
    desc: 'SVB 倒闭后紧急工具,允许银行用国债面值(非市价)抵押融资。',
    desc_en: 'Post-SVB emergency tool — banks can borrow against Treasuries at par (not mark-to-market).' }
]

export default function Ch15Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

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
    normal: {
      label: S('🟢 正常', '🟢 Normal'),
      cls: 'cor-normal',
      desc: S(
        'IORB 顶 + ON RRP 底有效锚定 EFFR · 充足准备金制度运行良好。',
        'IORB ceiling + ON RRP floor effectively anchor EFFR · ample-reserves regime working well.'
      )
    },
    tight: {
      label: S('🟡 紧张', '🟡 Tight'),
      cls: 'cor-tight',
      desc: S(
        '准备金接近下限,EFFR 接近 IORB。需要警惕,SRF 可能被使用。',
        'Reserves near the floor, EFFR near IORB. Watch carefully — SRF may activate.'
      )
    },
    broken: {
      label: S('🔴 走廊崩', '🔴 Corridor Broke'),
      cls: 'cor-broken',
      desc: S(
        '准备金不足,IORB 失去锚定 → REPO 飙升。2019.9 模式重现。',
        'Reserves insufficient, IORB lost its anchor → REPO spikes. The 2019.9 pattern resurfaces.'
      )
    }
  }[result.corridor]

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
    setNote(locale === 'en' && (s as any).note_en ? (s as any).note_en : s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    const headline = locale === 'en' && predict.revealHeadline_en
      ? predict.revealHeadline_en : predict.revealHeadline
    const msg = locale === 'en' && predict.revealMsg_en
      ? predict.revealMsg_en : predict.revealMsg
    setReveal({ headline, msg, correct })
    setPredict(null)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingSnap) { applySnapshot(pendingSnap); setPendingSnap(null) }
  }

  Taro.useShareAppMessage(() => ({
    title: locale === 'en'
      ? `Ch.15 · Corridor ${corridorMeta.label} · EFFR ${result.effr.toFixed(2)}%`
      : `第 15 章 · 走廊 ${corridorMeta.label} · EFFR ${result.effr.toFixed(2)}%`,
    path: '/pages/ch15/index'
  }))

  return (
    <ScrollView scrollY className='ch15'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🔧 Fed 工具箱 + 利率走廊', '🔧 Fed Toolkit + Rate Corridor')}</Text>
        <Text className='page-meta'>{S('第 15 章', 'Chapter 15')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2008', label: S('2008 危机前', '2008 Pre-crisis') },
          { key: '2014', label: S('2014 充足', '2014 Ample') },
          { key: '2019', label: S('2019.9 REPO ⚡', '2019.9 REPO ⚡'), accent: 'danger' },
          { key: '2024', label: S('2024', '2024') },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`corridor-card ${flash ? 'flash' : ''}`}>
        <Text className='corridor-tag'>{S('📊 利率走廊 · 实时', '📊 Rate Corridor · Live')}</Text>
        <View className='corridor-viz'>
          <View className='cor-line cor-iorb' style={{ top: `${yPos(params.iorb)}%` }}>
            <Text className='cor-label'>{S('IORB 顶', 'IORB ceiling')}</Text>
            <Text className='cor-rate'>{params.iorb.toFixed(2)}%</Text>
          </View>
          <View className='cor-line cor-effr' style={{ top: `${yPos(result.effr)}%` }}>
            <Text className='cor-label'>EFFR</Text>
            <Text className='cor-rate'>{result.effr.toFixed(2)}%</Text>
          </View>
          <View className='cor-line cor-onrrp' style={{ top: `${yPos(params.onRrp)}%` }}>
            <Text className='cor-label'>{S('ON RRP 底', 'ON RRP floor')}</Text>
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
          <Text className='status-pct'>
            {S(`准备金 ${result.reservesPct.toFixed(0)}% 目标水平`, `Reserves ${result.reservesPct.toFixed(0)}% of target`)}
          </Text>
        </View>
        <Text className='status-desc'>{corridorMeta.desc}</Text>
      </View>

      {note ? <Text className='ch15-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>{S('调三个工具看走廊变化', 'Adjust three tools to see how the corridor responds')}</Text>
        <SliderRow label={S('IORB · 准备金余额利率(顶)', 'IORB · Interest on Reserve Balances (ceiling)')} value={params.iorb} unit='%' min={0} max={6} step={0.05}
          onChange={v => setParams(p => ({ ...p, iorb: v }))} />
        <SliderRow label={S('ON RRP · 隔夜逆回购利率(底)', 'ON RRP · Overnight Reverse Repo rate (floor)')} value={params.onRrp} unit='%' min={0} max={6} step={0.05}
          onChange={v => setParams(p => ({ ...p, onRrp: v }))} />
        <SliderRow label={S('银行准备金水平', 'Bank reserves level')} value={params.reserves} prefix='$' unit='T' min={0.05} max={5} step={0.05}
          onChange={v => setParams(p => ({ ...p, reserves: v }))} />
      </View>

      <View className='iorb-callout'>
        <Text className='iorb-tag'>{S('⚠ 教材 vs 现实', '⚠ Textbook vs Reality')}</Text>
        <Text className='iorb-text'>
          {S(
            '米什金教材讨论 IOER(超额)和 IORR(法定)两个工具。',
            'Mishkin discusses IOER (excess) and IORR (required) as two separate tools.'
          )}
          {' '}
          <Text className='emp'>
            {S(
              '2021.7.29 起 Fed 把它们合并为单一 IORB',
              "Since 2021.7.29 the Fed merged them into a single IORB"
            )}
          </Text>
          {S(
            '(因为 2020 起 r=0,IORR 失去意义)。模拟器以现行 IORB 为准。',
            ' (since r=0 from 2020, IORR lost meaning). The simulator uses the current IORB.'
          )}
        </Text>
      </View>

      <View className='timeline-card'>
        <Text className='timeline-tag'>{S('📜 Fed 工具箱演进史', '📜 Fed Toolkit Evolution')}</Text>
        {toolTimeline.map((tEv, i) => (
          <View key={i} className={`tl-item ${tEv.emp ? 'tl-emp' : ''}`}>
            <View className='tl-left'>
              <Text className='tl-emoji'>{tEv.emoji}</Text>
              <Text className='tl-year'>{tEv.year}</Text>
            </View>
            <View className='tl-body'>
              <Text className='tl-name'>{locale === 'en' ? tEv.name_en : tEv.name}</Text>
              <Text className='tl-desc'>{locale === 'en' ? tEv.desc_en : tEv.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2019.9 REPO ⚡」→ 猜走廊为何崩 → 揭示准备金不足时 IORB 失效。',
          "💡 Switch to '2019.9 REPO ⚡' → predict why the corridor broke → reveal that IORB fails under insufficient reserves."
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
