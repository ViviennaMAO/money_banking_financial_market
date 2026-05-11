import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { ch11Snapshots, type PredictDef } from '../../utils/snapshots'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface BaselEra {
  year: string; emoji: string
  name: string; name_en: string
  detail: string; detail_en: string
}

const baselEvolution: BaselEra[] = [
  { year: '1988', emoji: '📜',
    name: 'Basel I', name_en: 'Basel I',
    detail: '简单 8% 资本/RWA。粗糙但开创全球监管协调。',
    detail_en: 'Simple 8% capital/RWA. Crude, but launched global regulatory coordination.' },
  { year: '2004', emoji: '📊',
    name: 'Basel II', name_en: 'Basel II',
    detail: '"内部模型法"允许大行用自己的模型评估风险。被批评太宽松。',
    detail_en: "The 'internal models approach' let big banks assess their own risk. Criticized as too lax." },
  { year: '2010-18', emoji: '🛡️',
    name: 'Basel III', name_en: 'Basel III',
    detail: '危机后大改:CET1 ≥ 4.5% + 缓冲 2.5% + 稳健 2-3% = 10-13%。引入 LCR / NSFR。',
    detail_en: 'Post-crisis overhaul: CET1 ≥ 4.5% + 2.5% buffer + 2-3% countercyclical = 10-13%. Introduced LCR / NSFR.' },
  { year: '2024+', emoji: '🔧',
    name: '末班车', name_en: 'Endgame',
    detail: '修订利率风险 + 客户集中度。SVB 后的修补。',
    detail_en: 'Revises interest-rate risk + customer concentration. Post-SVB patches.' }
]

interface Dilemma {
  emoji: string
  title: string; title_en: string
  desc: string; desc_en: string
}

const dilemmas: Dilemma[] = [
  { emoji: '⚖️',
    title: '存款保险的两难', title_en: 'The deposit-insurance dilemma',
    desc: '保储户 → 防挤兑;但银行知道有保险,会更敢冒险 → 道德风险。',
    desc_en: "Protect depositors → prevent runs; but banks know insurance exists, so they take more risk → moral hazard." },
  { emoji: '🦣',
    title: 'TBTF 困境', title_en: 'The TBTF dilemma',
    desc: '大银行不能倒(救它扭曲市场,不救灾难)。Basel III 加征 G-SIB 资本附加,但仍未完美解决。',
    desc_en: "Big banks can't fail (rescuing distorts the market, not rescuing is catastrophe). Basel III adds G-SIB capital surcharges, but the problem isn't fully solved." },
  { emoji: '🌀',
    title: '监管套利', title_en: 'Regulatory arbitrage',
    desc: '哪里监管松,资金就往哪走。这就是为什么 MMF / 影子银行膨胀(联系第 10 章)。',
    desc_en: 'Money flows to wherever regulation is laxest. This is why MMFs / shadow banks have ballooned (see Ch.10).' },
  { emoji: '⏰',
    title: '滞后性', title_en: 'Regulatory lag',
    desc: '监管基于过去危机设计,新的危机总能找新形式爆发。SVB 在 Basel III 下倒闭就是例子。',
    desc_en: 'Regulation is designed for past crises; new crises always find new forms. SVB collapsing under Basel III is the proof.' }
]

export default function Ch11Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

  const [params, setParams] = useState({ baselReq: 13, bankActual: 13 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const buffer = params.bankActual - params.baselReq
  const compliance = buffer >= 1
    ? { label: S('🟢 充裕', '🟢 Ample'), cls: 'cmp-good' }
    : buffer >= 0
      ? { label: S('🟡 临界', '🟡 At limit'), cls: 'cmp-mid' }
      : { label: S('🔴 不达标', '🔴 Non-compliant'), cls: 'cmp-bad' }

  function loadSnapshot(key: string) {
    const s = ch11Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch11Snapshots[key]
    setParams({ baselReq: s.baselReq, bankActual: s.bankActual })
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
      ? `Ch.11 · CET1 ${params.bankActual}% vs required ${params.baselReq}%`
      : `第 11 章 · CET1 ${params.bankActual}% vs 监管 ${params.baselReq}%`,
    path: '/pages/ch11/index'
  }))

  return (
    <ScrollView scrollY className='ch11'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('📜 金融监管 · Basel', '📜 Financial Regulation · Basel')}</Text>
        <Text className='page-meta'>{S('第 11 章', 'Chapter 11')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: 'basel1', label: S('Basel I 1988', 'Basel I 1988') },
          { key: '2008', label: S('2008 II 失败', '2008 II Failed') },
          { key: '2018', label: S('2018 III 实施', '2018 III Implemented') },
          { key: '2023', label: S('2023 SVB ⚡', '2023 SVB ⚡'), accent: 'danger' },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`compare-card ${flash ? 'flash' : ''}`}>
        <Text className='compare-tag'>{S('📊 监管要求 vs 银行实际', '📊 Regulatory requirement vs Bank actual')}</Text>
        <View className='cap-row'>
          <View>
            <Text className='cap-label'>{S('Basel 监管要求', 'Basel requirement')}</Text>
            <Text className='cap-big'>{params.baselReq.toFixed(1)}%</Text>
          </View>
          <View>
            <Text className='cap-label'>{S('银行实际 CET1', 'Bank actual CET1')}</Text>
            <Text className='cap-actual'>{params.bankActual.toFixed(1)}%</Text>
          </View>
          <View>
            <Text className='cap-label'>{S('缓冲', 'Buffer')}</Text>
            <Text className={`cap-buffer ${buffer >= 1 ? 'val-pos' : 'val-neg'}`}>
              {buffer >= 0 ? '+' : ''}{buffer.toFixed(1)}%
            </Text>
          </View>
        </View>
        <View className={`compliance-row ${compliance.cls}`}>
          <Text className='compliance-label'>{compliance.label}</Text>
        </View>
      </View>

      {note ? <Text className='ch11-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>{S('调监管要求 + 银行实际', 'Adjust requirement + bank actual')}</Text>
        <SliderRow label={S('Basel 最低要求', 'Basel minimum')} value={params.baselReq} unit='%' min={4} max={16} step={0.5}
          onChange={v => setParams(p => ({ ...p, baselReq: v }))} />
        <SliderRow label={S('银行实际 CET1', 'Bank actual CET1')} value={params.bankActual} unit='%' min={2} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, bankActual: v }))} />
      </View>

      <View className='evolution-card'>
        <Text className='evo-tag'>{S('📜 Basel 协议演进史', '📜 Evolution of the Basel Accords')}</Text>
        {baselEvolution.map((e, i) => (
          <View key={i} className='evo-row'>
            <View className='evo-left'>
              <Text className='evo-emoji'>{e.emoji}</Text>
              <Text className='evo-year'>{e.year}</Text>
            </View>
            <View className='evo-body'>
              <Text className='evo-name'>{locale === 'en' ? e.name_en : e.name}</Text>
              <Text className='evo-detail'>{locale === 'en' ? e.detail_en : e.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='dilemma-card'>
        <Text className='dilemma-tag'>{S('⚠ 监管的根本两难', '⚠ Fundamental Dilemmas of Regulation')}</Text>
        {dilemmas.map((d, i) => (
          <View key={i} className='dil-row'>
            <Text className='dil-emoji'>{d.emoji}</Text>
            <View className='dil-body'>
              <Text className='dil-title'>{locale === 'en' ? d.title_en : d.title}</Text>
              <Text className='dil-desc'>{locale === 'en' ? d.desc_en : d.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2023 SVB ⚡」→ 猜为何 Basel III 没拦住 → 揭示利率风险 + 集中度盲区。',
          "💡 Switch to '2023 SVB ⚡' → predict why Basel III didn't stop it → reveal the rate-risk + concentration blind spots."
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
