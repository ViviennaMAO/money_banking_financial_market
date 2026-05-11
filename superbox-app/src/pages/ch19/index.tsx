import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch19Snapshots, type PredictDef } from '../../utils/snapshots'
import { mvpyCheck } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface MotiveInfo {
  emoji: string
  name: string
  desc: string
  vEffect: string
}

const motives: MotiveInfo[] = [
  { emoji: '🛒', name: '交易动机',
    desc: '日常买卖需要持币(凯恩斯第一动机)',
    vEffect: '随收入 Y 增加 → 货币需求 ↑ V 稳定' },
  { emoji: '🛡', name: '预防动机',
    desc: '应对意外支出(凯恩斯第二动机)',
    vEffect: '随不确定性 ↑ → V 下降' },
  { emoji: '📊', name: '投机动机',
    desc: '在债券和货币间分配,基于利率预期(凯恩斯第三动机)',
    vEffect: '利率↓ → 持币机会成本低 → V 下降' },
  { emoji: '💼', name: 'Friedman 现代视角',
    desc: '货币是组合资产中的一项,与债/股/实物相关',
    vEffect: '在弗里德曼看来 V 稳定;实证 1980 后失败' }
]

export default function Ch19Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({ m: 21, v: 1.7, p: 1.22, y: 25 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => mvpyCheck(params.m, params.v, params.p, params.y),
    [params]
  )

  const balanceCls = result.isBalanced ? 'bal-ok' : 'bal-off'
  const balanceLabel = result.isBalanced ? '✓ MV = PY 平衡' : '⚠ MV ≠ PY 偏差'

  function loadSnapshot(key: string) {
    const s = ch19Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch19Snapshots[key]
    setParams({ m: s.m, v: s.v, p: s.p, y: s.y })
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
    title: `第 19 章 · MV=${result.mvSide.toFixed(0)} · PY=${result.pySide.toFixed(0)}`,
    path: '/pages/ch19/index'
  }))

  return (
    <ScrollView scrollY className='ch19'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🧮 MV = PY 数量方程', '🧮 MV = PY Quantity Equation')}</Text>
        <Text className='page-meta'>{S('第 19 章', 'Chapter 19')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1960s', label: '1960s 数量论' },
          { key: '1980s', label: '1980s 沃尔克' },
          { key: '2008', label: '2008-14 QE ⚡', accent: 'danger' },
          { key: '2022', label: '2022 通胀' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 平衡可视化 */}
      <View className={`balance-card ${flash ? 'flash' : ''} ${balanceCls}`}>
        <Text className='balance-tag'>📐 方程两边对比</Text>
        <View className='side-row'>
          <View className='side side-left'>
            <Text className='side-label'>M × V</Text>
            <Text className='side-formula'>{result.m.toFixed(1)} × {result.v.toFixed(2)}</Text>
            <Text className='side-value'>{result.mvSide.toFixed(1)}</Text>
            <Text className='side-mini'>万亿名义 GDP</Text>
          </View>
          <Text className={`equals ${balanceCls}`}>=</Text>
          <View className='side side-right'>
            <Text className='side-label'>P × Y</Text>
            <Text className='side-formula'>{result.p.toFixed(2)} × {result.y.toFixed(0)}</Text>
            <Text className='side-value'>{result.pySide.toFixed(1)}</Text>
            <Text className='side-mini'>万亿名义 GDP</Text>
          </View>
        </View>
        <View className={`balance-row ${balanceCls}`}>
          <Text className='balance-label'>{balanceLabel}</Text>
          <Text className='balance-imbalance'>偏差: {result.imbalance >= 0 ? '+' : ''}{result.imbalance.toFixed(1)}T</Text>
        </View>
      </View>

      {note ? <Text className='ch19-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调四个变量看 MV=PY 是否平衡</Text>
        <SliderRow label='M · M2 货币供给' value={params.m} prefix='$' unit='T' min={0.3} max={30} step={0.1}
          onChange={v => setParams(p => ({ ...p, m: v }))} />
        <SliderRow label='V · 货币流通速度' value={params.v} unit='' min={0.8} max={5} step={0.05}
          onChange={v => setParams(p => ({ ...p, v: v }))} />
        <SliderRow label='P · 价格指数' value={params.p} unit='' min={0.1} max={2} step={0.01}
          onChange={v => setParams(p => ({ ...p, p: v }))} />
        <SliderRow label='Y · 实际 GDP' value={params.y} prefix='$' unit='T' min={5} max={35} step={0.5}
          onChange={v => setParams(p => ({ ...p, y: v }))} />
      </View>

      <View className='hint-box'>
        <Text className='hint-text'>
          💡 提示:这是会计恒等式,理论上左 = 右。
          但用户可让 M, V, P, Y 独立变化。**当左≠右时,意味着你的假设不一致**。
          在历史快照中,M 和 P 都是真实数据,所以 V = PY/M 反推。
        </Text>
      </View>

      <View className='motives-card'>
        <Text className='motives-tag'>📚 货币需求理论 · 凯恩斯 vs Friedman</Text>
        {motives.map((m, i) => (
          <View key={i} className='motive-item'>
            <Text className='motive-emoji'>{m.emoji}</Text>
            <View className='motive-body'>
              <Text className='motive-name'>{m.name}</Text>
              <Text className='motive-desc'>{m.desc}</Text>
              <Text className='motive-effect'>对 V 影响:{m.vEffect}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='friedman-collapse'>
        <Text className='fc-tag'>🌪 Friedman 假设 vs 1980+ 实证</Text>
        <Text className='fc-text'>
          Friedman 假设:**V 稳定 / 可预测的函数**(基于收入 + 一组利率)。
          → 数量论可用:M 控制好,通胀就控制好。
        </Text>
        <Text className='fc-text-bad'>
          1980 后实证打破:V 显著不稳定。原因:
          ① 金融创新(MMF / 信用卡)改变持币习惯;
          ② 利率波动 + ZLB 让"持币机会成本"剧变;
          ③ 危机时去杠杆 → V 突然崩塌。
        </Text>
        <Text className='fc-conclusion'>
          **结论**:数量论是长期渐近真理,但短期 V 波动可让 M 与 P 关系完全失效(2008-14)。
          这就是为什么现代央行不再盯货币总量,而盯利率(参考第 16 章)。
        </Text>
      </View>

      <Text className='hint'>💡 切「2008-14 QE ⚡」→ 猜 M2 +50% 为什么通胀只 +1.7% → 揭示 V 暴跌 30%。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
