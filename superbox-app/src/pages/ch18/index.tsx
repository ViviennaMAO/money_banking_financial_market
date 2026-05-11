import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch18Snapshots, type PredictDef, type TrilemmaPick } from '../../utils/snapshots'
import SnapshotBar from '../../components/SnapshotBar'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface PickInfo {
  key: TrilemmaPick
  emoji: string
  label: string; label_en: string
  shortDesc: string; shortDesc_en: string
}

const pickInfos: PickInfo[] = [
  { key: 'fixed', emoji: '⚓',
    label: '固定汇率', label_en: 'Fixed FX',
    shortDesc: '汇率稳定 · 贸易可预测',
    shortDesc_en: 'Stable FX · predictable trade' },
  { key: 'free', emoji: '🌊',
    label: '资本自由流动', label_en: 'Free Capital Flow',
    shortDesc: '跨境投资 · 金融全球化',
    shortDesc_en: 'Cross-border investment · financial globalization' },
  { key: 'independent', emoji: '🎯',
    label: '独立货币政策', label_en: 'Independent Monetary Policy',
    shortDesc: '设定本国利率 · 应对衰退',
    shortDesc_en: 'Set domestic rates · respond to recession' }
]

interface RegimeInfo {
  picks: TrilemmaPick[]
  abandoned: TrilemmaPick
  regimeName: string; regimeName_en: string
  examples: string; examples_en: string
  cost: string; cost_en: string
}

const regimes: RegimeInfo[] = [
  {
    picks: ['fixed', 'independent'],
    abandoned: 'free',
    regimeName: '资本管制制度', regimeName_en: 'Capital-Controls Regime',
    examples: '🇨🇳 中国 · 🇻🇳 越南 · 🇮🇳 印度(部分)',
    examples_en: '🇨🇳 China · 🇻🇳 Vietnam · 🇮🇳 India (partial)',
    cost: '跨境投资受限 · 人民币国际化受阻',
    cost_en: 'Cross-border investment limited · RMB internationalization hampered'
  },
  {
    picks: ['free', 'independent'],
    abandoned: 'fixed',
    regimeName: '浮动汇率制度', regimeName_en: 'Floating FX Regime',
    examples: '🇺🇸 美国 · 🇯🇵 日本 · 🇨🇦 加拿大 · 🇦🇺 澳洲',
    examples_en: '🇺🇸 US · 🇯🇵 Japan · 🇨🇦 Canada · 🇦🇺 Australia',
    cost: '出口企业承担汇率风险 · 需要复杂对冲',
    cost_en: 'Exporters bear FX risk · need complex hedging'
  },
  {
    picks: ['fixed', 'free'],
    abandoned: 'independent',
    regimeName: '联系汇率 / 货币联盟',
    regimeName_en: 'Currency Peg / Monetary Union',
    examples: '🇭🇰 香港(钉 USD)· 🇪🇺 欧元区成员',
    examples_en: '🇭🇰 Hong Kong (USD peg) · 🇪🇺 Eurozone members',
    cost: '完全跟随锚国 · 无法应对本地周期',
    cost_en: 'Fully tracks anchor country · cannot respond to local cycles'
  }
]

interface SwapTier {
  tier: string; tier_en: string
  countries: string
  cls: string
  desc: string; desc_en: string
}

const swapNetwork: SwapTier[] = [
  { tier: '🟢 永久对手方', tier_en: '🟢 Permanent counterparty',
    countries: '🇪🇺 ECB · 🇯🇵 BOJ · 🇨🇦 BoC · 🇬🇧 BoE · 🇨🇭 SNB',
    cls: 'tier-perm',
    desc: '5 大盟友央行,2013 起永久不限额。',
    desc_en: '5 major ally central banks; permanent and unlimited since 2013.' },
  { tier: '🟡 临时对手方', tier_en: '🟡 Temporary counterparty',
    countries: '🇧🇷 巴西 · 🇲🇽 墨西哥 · 🇰🇷 韩国 · 🇸🇬 新加坡 · 🇦🇺 澳洲 · 🇳🇿 新西兰 · 🇩🇰 丹麦 · 🇳🇴 挪威 · 🇸🇪 瑞典',
    cls: 'tier-temp',
    desc: '危机期开放(2008/2020),当下未必激活。',
    desc_en: 'Opened in crises (2008/2020); not necessarily active now.' },
  { tier: '🔴 不在网络', tier_en: '🔴 Outside network',
    countries: '🇨🇳 中国 · 🇮🇳 印度 · 🇸🇦 沙特 · 🇷🇺 俄罗斯 · 🇹🇷 土耳其',
    cls: 'tier-out',
    desc: '需要美元时只能用外储或 IMF 贷款。',
    desc_en: 'When dollars are needed, can only use FX reserves or IMF loans.' }
]

export default function Ch18Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

  const [picks, setPicks] = useState<TrilemmaPick[]>(['free', 'independent'])
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const matchedRegime = useMemo(() => {
    if (picks.length !== 2) return null
    return regimes.find(r => {
      const a = [...r.picks].sort().join(',')
      const b = [...picks].sort().join(',')
      return a === b
    }) || null
  }, [picks])

  function togglePick(key: TrilemmaPick) {
    if (picks.includes(key)) {
      setPicks(picks.filter(p => p !== key))
    } else if (picks.length < 2) {
      setPicks([...picks, key])
    } else {
      setPicks([picks[1], key])
    }
  }

  function loadSnapshot(key: string) {
    const s = ch18Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch18Snapshots[key]
    if (s.picks.length === 3) {
      setPicks(['fixed', 'free'])
    } else {
      setPicks([...s.picks])
    }
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

  const regimeName = matchedRegime
    ? (locale === 'en' ? matchedRegime.regimeName_en : matchedRegime.regimeName)
    : S('三元悖论', 'Impossible Trinity')

  Taro.useShareAppMessage(() => ({
    title: locale === 'en'
      ? `Ch.18 · ${regimeName}`
      : `第 18 章 · ${regimeName}`,
    path: '/pages/ch18/index'
  }))

  const abandoned = matchedRegime
    ? pickInfos.find(p => p.key === matchedRegime.abandoned)
    : null

  return (
    <ScrollView scrollY className='ch18'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🌏 三元悖论', '🌏 Impossible Trinity')}</Text>
        <Text className='page-meta'>{S('第 18 章', 'Chapter 18')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: 'china', label: S('🇨🇳 中国(管制)', '🇨🇳 China (controls)') },
          { key: 'us', label: S('🇺🇸 美国(浮动)', '🇺🇸 US (float)') },
          { key: 'hk', label: S('🇭🇰 香港(联系)', '🇭🇰 HK (peg)') },
          { key: 'gbp1992', label: S('1992 英镑 ⚡', '1992 GBP ⚡'), accent: 'danger' },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`trilemma-card ${flash ? 'flash' : ''}`}>
        <Text className='trilemma-tag'>
          {S('选择你想保留的两个目标(只能选 2 个)', 'Pick the two goals to keep (only 2 allowed)')}
        </Text>
        <View className='picks-row'>
          {pickInfos.map(info => {
            const isPicked = picks.includes(info.key)
            return (
              <View
                key={info.key}
                className={`pick-card ${isPicked ? 'picked' : 'unpicked'}`}
                onClick={() => togglePick(info.key)}
              >
                <Text className='pick-emoji'>{info.emoji}</Text>
                <Text className='pick-label'>{locale === 'en' ? info.label_en : info.label}</Text>
                <Text className='pick-desc'>{locale === 'en' ? info.shortDesc_en : info.shortDesc}</Text>
                {isPicked ? <Text className='pick-checked'>{S('✓ 已选', '✓ Picked')}</Text> : null}
              </View>
            )
          })}
        </View>

        {matchedRegime ? (
          <View className='regime-result'>
            <View className='abandoned-row'>
              <Text className='abandoned-label'>{S('必须放弃:', 'Must give up:')}</Text>
              <Text className='abandoned-value'>
                {abandoned?.emoji} {locale === 'en' ? abandoned?.label_en : abandoned?.label}
              </Text>
            </View>
            <View className='regime-info'>
              <Text className='regime-name'>{regimeName}</Text>
              <Text className='regime-examples'>
                {S('代表:', 'Examples: ')}{locale === 'en' ? matchedRegime.examples_en : matchedRegime.examples}
              </Text>
              <Text className='regime-cost'>
                {S('代价:', 'Cost: ')}{locale === 'en' ? matchedRegime.cost_en : matchedRegime.cost}
              </Text>
            </View>
          </View>
        ) : (
          <View className='regime-empty'>
            <Text>
              {S(
                '请选择 2 个目标(三个全选 = 不可能,见 1992 英镑危机)',
                'Pick 2 goals (all 3 = impossible, see 1992 GBP crisis)'
              )}
            </Text>
          </View>
        )}
      </View>

      {note ? <Text className='ch18-note'>{note}</Text> : null}

      <View className='swap-card'>
        <Text className='swap-tag'>{S('💵 Fed Swap Line 网络 · 全球美元最后贷款人', '💵 Fed Swap Line Network · Global Dollar Lender of Last Resort')}</Text>
        <Text className='swap-intro'>
          {S(
            '2008/2020 危机中,Fed 给外国央行借美元,缓解全球美元短缺。但**不是每个国家都能进网络**——这反映了美元体系的等级性。',
            'During 2008/2020 crises Fed lent dollars to foreign central banks, easing global dollar shortages. But **not every country gets in** — reflecting the hierarchy of the dollar system.'
          )}
        </Text>
        {swapNetwork.map((tier, i) => (
          <View key={i} className={`swap-tier ${tier.cls}`}>
            <Text className='tier-name'>{locale === 'en' ? tier.tier_en : tier.tier}</Text>
            <Text className='tier-countries'>{tier.countries}</Text>
            <Text className='tier-desc'>{locale === 'en' ? tier.desc_en : tier.desc}</Text>
          </View>
        ))}
      </View>

      <View className='dedoll-card'>
        <Text className='dedoll-tag'>{S('📉 美元主导地位的"边际松动"', '📉 Dollar Dominance: Marginal Loosening')}</Text>

        <View className='metric-row'>
          <View className='metric'>
            <Text className='metric-label'>{S('全球外储', 'Global reserves')}</Text>
            <Text className='metric-value'>58%</Text>
            <Text className='metric-trend down'>{S('↓ 2000 = 71%', '↓ from 71% in 2000')}</Text>
          </View>
          <View className='metric'>
            <Text className='metric-label'>{S('贸易结算', 'Trade settlement')}</Text>
            <Text className='metric-value'>~80%</Text>
            <Text className='metric-trend stable'>{S('~ 稳定', '~ Stable')}</Text>
          </View>
          <View className='metric'>
            <Text className='metric-label'>{S('FX 交易', 'FX trading')}</Text>
            <Text className='metric-value'>88%</Text>
            <Text className='metric-trend stable'>{S('~ 稳定', '~ Stable')}</Text>
          </View>
        </View>

        <Text className='dedoll-detail'>
          {S(
            '外储多元化是慢变量(20 年从 71% → 58%)。但**美元在 FX 交易和贸易结算的护城河仍然厚**——网络效应让"取代美元"非常难。人民币国际化、CBDC、SDR 都是潜在挑战者,但目前没有一个达到关键临界点。',
            'Reserve diversification is a slow variable (71% → 58% over 20 years). But **the dollar moat in FX trading and trade settlement remains deep** — network effects make "replacing the dollar" extremely hard. RMB internationalization, CBDCs, SDRs are potential challengers, but none has reached critical mass yet.'
          )}
        </Text>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「1992 英镑 ⚡」→ 猜结果 → 揭示三元悖论是市场会强制执行的物理定律。',
          "💡 Switch to '1992 GBP ⚡' → predict the outcome → reveal the impossible trinity as a physics law that markets enforce."
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
