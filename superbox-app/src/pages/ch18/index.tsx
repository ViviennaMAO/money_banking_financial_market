import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch18Snapshots, type PredictDef, type TrilemmaPick } from '../../utils/snapshots'
import SnapshotBar from '../../components/SnapshotBar'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import './index.scss'

interface PickInfo {
  key: TrilemmaPick
  emoji: string
  label: string
  shortDesc: string
}

const pickInfos: PickInfo[] = [
  { key: 'fixed',       emoji: '⚓', label: '固定汇率',     shortDesc: '汇率稳定 · 贸易可预测' },
  { key: 'free',        emoji: '🌊', label: '资本自由流动', shortDesc: '跨境投资 · 金融全球化' },
  { key: 'independent', emoji: '🎯', label: '独立货币政策', shortDesc: '设定本国利率 · 应对衰退' }
]

interface RegimeInfo {
  picks: TrilemmaPick[]
  abandoned: TrilemmaPick
  regimeName: string
  examples: string
  cost: string
}

const regimes: RegimeInfo[] = [
  {
    picks: ['fixed', 'independent'],
    abandoned: 'free',
    regimeName: '资本管制制度',
    examples: '🇨🇳 中国 · 🇻🇳 越南 · 🇮🇳 印度(部分)',
    cost: '跨境投资受限 · 人民币国际化受阻'
  },
  {
    picks: ['free', 'independent'],
    abandoned: 'fixed',
    regimeName: '浮动汇率制度',
    examples: '🇺🇸 美国 · 🇯🇵 日本 · 🇨🇦 加拿大 · 🇦🇺 澳洲',
    cost: '出口企业承担汇率风险 · 需要复杂对冲'
  },
  {
    picks: ['fixed', 'free'],
    abandoned: 'independent',
    regimeName: '联系汇率 / 货币联盟',
    examples: '🇭🇰 香港(钉 USD)· 🇪🇺 欧元区成员',
    cost: '完全跟随锚国 · 无法应对本地周期'
  }
]

interface SwapTier {
  tier: string
  countries: string
  cls: string
  desc: string
}

const swapNetwork: SwapTier[] = [
  { tier: '🟢 永久对手方',
    countries: '🇪🇺 ECB · 🇯🇵 BOJ · 🇨🇦 BoC · 🇬🇧 BoE · 🇨🇭 SNB',
    cls: 'tier-perm',
    desc: '5 大盟友央行,2013 起永久不限额。' },
  { tier: '🟡 临时对手方',
    countries: '🇧🇷 巴西 · 🇲🇽 墨西哥 · 🇰🇷 韩国 · 🇸🇬 新加坡 · 🇦🇺 澳洲 · 🇳🇿 新西兰 · 🇩🇰 丹麦 · 🇳🇴 挪威 · 🇸🇪 瑞典',
    cls: 'tier-temp',
    desc: '危机期开放(2008/2020),当下未必激活。' },
  { tier: '🔴 不在网络',
    countries: '🇨🇳 中国 · 🇮🇳 印度 · 🇸🇦 沙特 · 🇷🇺 俄罗斯 · 🇹🇷 土耳其',
    cls: 'tier-out',
    desc: '需要美元时只能用外储或 IMF 贷款。' }
]

export default function Ch18Page() {
  const [picks, setPicks] = useState<TrilemmaPick[]>(['free', 'independent'])
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  // 找到当前匹配的制度
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
      // 已有 2 个,替换最旧的
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
    // 1992 危机是三个都要 — 让用户感受不可能
    if (s.picks.length === 3) {
      setPicks(['fixed', 'free'])  // 默认显示一个组合
    } else {
      setPicks([...s.picks])
    }
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
    title: `第 18 章 · ${matchedRegime?.regimeName || '三元悖论'}`,
    path: '/pages/ch18/index'
  }))

  const abandoned = matchedRegime
    ? pickInfos.find(p => p.key === matchedRegime.abandoned)
    : null

  return (
    <ScrollView scrollY className='ch18'>
      <View className='page-header'>
        <Text className='page-title'>🌏 三元悖论</Text>
        <Text className='page-meta'>第 18 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: 'china', label: '🇨🇳 中国(管制)' },
          { key: 'us', label: '🇺🇸 美国(浮动)' },
          { key: 'hk', label: '🇭🇰 香港(联系)' },
          { key: 'gbp1992', label: '1992 英镑 ⚡', accent: 'danger' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 三元悖论选择器 */}
      <View className={`trilemma-card ${flash ? 'flash' : ''}`}>
        <Text className='trilemma-tag'>选择你想保留的两个目标(只能选 2 个)</Text>
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
                <Text className='pick-label'>{info.label}</Text>
                <Text className='pick-desc'>{info.shortDesc}</Text>
                {isPicked ? <Text className='pick-checked'>✓ 已选</Text> : null}
              </View>
            )
          })}
        </View>

        {matchedRegime ? (
          <View className='regime-result'>
            <View className='abandoned-row'>
              <Text className='abandoned-label'>必须放弃:</Text>
              <Text className='abandoned-value'>{abandoned?.emoji} {abandoned?.label}</Text>
            </View>
            <View className='regime-info'>
              <Text className='regime-name'>{matchedRegime.regimeName}</Text>
              <Text className='regime-examples'>代表:{matchedRegime.examples}</Text>
              <Text className='regime-cost'>代价:{matchedRegime.cost}</Text>
            </View>
          </View>
        ) : (
          <View className='regime-empty'>
            <Text>请选择 2 个目标(三个全选 = 不可能,见 1992 英镑危机)</Text>
          </View>
        )}
      </View>

      {note ? <Text className='ch18-note'>{note}</Text> : null}

      {/* Fed Swap Line 等级 */}
      <View className='swap-card'>
        <Text className='swap-tag'>💵 Fed Swap Line 网络 · 全球美元最后贷款人</Text>
        <Text className='swap-intro'>
          2008/2020 危机中,Fed 给外国央行借美元,缓解全球美元短缺。但**不是每个国家都能进网络**——这反映了美元体系的等级性。
        </Text>
        {swapNetwork.map((tier, i) => (
          <View key={i} className={`swap-tier ${tier.cls}`}>
            <Text className='tier-name'>{tier.tier}</Text>
            <Text className='tier-countries'>{tier.countries}</Text>
            <Text className='tier-desc'>{tier.desc}</Text>
          </View>
        ))}
      </View>

      {/* 美元主导地位 + 去美元化 */}
      <View className='dedoll-card'>
        <Text className='dedoll-tag'>📉 美元主导地位的"边际松动"</Text>

        <View className='metric-row'>
          <View className='metric'>
            <Text className='metric-label'>全球外储</Text>
            <Text className='metric-value'>58%</Text>
            <Text className='metric-trend down'>↓ 2000 = 71%</Text>
          </View>
          <View className='metric'>
            <Text className='metric-label'>贸易结算</Text>
            <Text className='metric-value'>~80%</Text>
            <Text className='metric-trend stable'>~ 稳定</Text>
          </View>
          <View className='metric'>
            <Text className='metric-label'>FX 交易</Text>
            <Text className='metric-value'>88%</Text>
            <Text className='metric-trend stable'>~ 稳定</Text>
          </View>
        </View>

        <Text className='dedoll-detail'>
          外储多元化是慢变量(20 年从 71% → 58%)。但**美元在 FX 交易和贸易结算的护城河仍然厚**——网络效应让"取代美元"非常难。
          人民币国际化、CBDC、SDR 都是潜在挑战者,但目前没有一个达到关键临界点。
        </Text>
      </View>

      <Text className='hint'>💡 切「1992 英镑 ⚡」→ 猜结果 → 揭示三元悖论是市场会强制执行的物理定律。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
