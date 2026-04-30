import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch8Snapshots, type PredictDef } from '../../utils/snapshots'
import { infoAsymmetryAnalysis, type AsymmetryProblem } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import './index.scss'

const problemMeta: Record<AsymmetryProblem, { title: string; tag: string; desc: string; cls: string }> = {
  adverse_selection: {
    title: '主导问题:逆向选择',
    tag: '交易前 · 坏借款人最积极',
    desc: '高利率吸引高风险者,低风险者远离 → 借款池子坏账率上升。解决:信用评级 + 抵押。',
    cls: 'pb-as'
  },
  moral_hazard: {
    title: '主导问题:道德风险',
    tag: '交易后 · 行为变化',
    desc: '贷款发放后,借款人冒更多险(反正没本金)。解决:监督 + 限制条款。',
    cls: 'pb-mh'
  },
  principal_agent: {
    title: '主导问题:主-代理',
    tag: '委托代理 · 利益不一致',
    desc: '股东要长期价值,经理要短期奖金。解决:股权激励 + 独立董事。',
    cls: 'pb-pa'
  },
  balanced: {
    title: '相对平衡',
    tag: '监管 + 科技减少了部分信息差',
    desc: '现代金融体系通过披露 / 评级 / 抵押 / 监督等多重机制压制信息不对称。但仍有结构性脆弱。',
    cls: 'pb-bal'
  }
}

export default function Ch8Page() {
  const [params, setParams] = useState({ asymmetry: 38, monitoring: 72, screening: 32 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => infoAsymmetryAnalysis(params.asymmetry, params.monitoring, params.screening),
    [params]
  )
  const meta = problemMeta[result.dominant]

  function loadSnapshot(key: string) {
    const s = ch8Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch8Snapshots[key]
    setParams({ asymmetry: s.asymmetry, monitoring: s.monitoring, screening: s.screening })
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
    title: `第 8 章 · 市场效率 ${result.marketEfficiency.toFixed(0)}%${result.collapsed ? ' · 崩溃' : ''}`,
    path: '/pages/ch8/index'
  }))

  return (
    <ScrollView scrollY className='ch8'>
      <View className='page-header'>
        <Text className='page-title'>🔍 信息不对称实验室</Text>
        <Text className='page-meta'>第 8 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '2008', label: '2008 次贷' },
          { key: '2023', label: '2023 SVB ⚡', accent: 'danger' },
          { key: '2014', label: '2014 P2P 爆雷' },
          { key: '2002', label: '2002 SOX 前' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='efficiency-row'>
          <View>
            <Text className='output-label'>市场效率</Text>
            <Text className={`eff-big ${result.collapsed ? 'eff-bad' : (result.marketEfficiency > 70 ? 'eff-good' : 'eff-mid')}`}>
              {result.marketEfficiency.toFixed(0)}%
            </Text>
          </View>
          <View className='eff-bar-wrap'>
            <View className='eff-bar-bg'>
              <View
                className={`eff-bar ${result.collapsed ? 'eff-bar-bad' : (result.marketEfficiency > 70 ? 'eff-bar-good' : 'eff-bar-mid')}`}
                style={{ width: `${result.marketEfficiency}%` }}
              ></View>
            </View>
            <View className='eff-marks'>
              <Text>0</Text><Text>50</Text><Text>100</Text>
            </View>
          </View>
        </View>
        {result.collapsed ? (
          <Text className='collapsed-banner'>⚠ 市场已崩溃 · 严重信息不对称导致交易停滞</Text>
        ) : null}
        <View className={`dominant-card ${meta.cls}`}>
          <Text className='dom-title'>{meta.title}</Text>
          <Text className='dom-tag'>{meta.tag}</Text>
          <Text className='dom-desc'>{meta.desc}</Text>
        </View>
      </View>

      {note ? <Text className='ch8-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调三个指标看市场反应</Text>
        <SliderRow label='信息不对称程度' value={params.asymmetry} unit='%' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, asymmetry: Math.round(v) }))} />
        <SliderRow label='监督机制强度' value={params.monitoring} unit='%' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, monitoring: Math.round(v) }))} />
        <SliderRow label='筛选成本(高=难筛选)' value={params.screening} unit='%' min={0} max={100} step={1}
          onChange={v => setParams(p => ({ ...p, screening: Math.round(v) }))} />
      </View>

      <View className='problems-card'>
        <Text className='problems-tag'>📚 信息不对称的三大经典问题</Text>
        <View className='pb-item pb-as'>
          <Text className='pb-num'>1</Text>
          <View className='pb-body'>
            <Text className='pb-title'>逆向选择(交易前)</Text>
            <Text className='pb-desc'>坏借款人最积极申请贷款 → 借款池子坏账率上升。Akerlof 柠檬市场。</Text>
            <Text className='pb-fix'>解决:信用评级 / 抵押 / 第三方背书</Text>
          </View>
        </View>
        <View className='pb-item pb-mh'>
          <Text className='pb-num'>2</Text>
          <View className='pb-body'>
            <Text className='pb-title'>道德风险(交易后)</Text>
            <Text className='pb-desc'>贷款发放后,借款人行为变化 — 拿了钱去赌一把,反正赔了不是自己的。</Text>
            <Text className='pb-fix'>解决:限制条款 / 监督 / 担保</Text>
          </View>
        </View>
        <View className='pb-item pb-pa'>
          <Text className='pb-num'>3</Text>
          <View className='pb-body'>
            <Text className='pb-title'>主-代理问题</Text>
            <Text className='pb-desc'>股东要长期价值,经理要短期奖金 — 利益不一致导致代理人怠工或越权。</Text>
            <Text className='pb-fix'>解决:股权激励 / 独立董事 / 信息披露(SOX)</Text>
          </View>
        </View>
      </View>

      <View className='inst-card'>
        <Text className='inst-tag'>🏦 这就是金融机构存在的根本理由</Text>
        <View className='inst-row'>
          <Text className='inst-emoji'>🏛️</Text>
          <View className='inst-body'>
            <Text className='inst-name'>商业银行</Text>
            <Text className='inst-role'>专业筛选 + 长期监督借款人</Text>
          </View>
        </View>
        <View className='inst-row'>
          <Text className='inst-emoji'>📊</Text>
          <View className='inst-body'>
            <Text className='inst-name'>评级机构 / 审计</Text>
            <Text className='inst-role'>信号传递 — 把不可见的风险变成可见</Text>
          </View>
        </View>
        <View className='inst-row'>
          <Text className='inst-emoji'>📜</Text>
          <View className='inst-body'>
            <Text className='inst-name'>监管机构</Text>
            <Text className='inst-role'>强制信息披露 + 系统性风险监控</Text>
          </View>
        </View>
        <Text className='inst-note'>没有这些机构,金融市场会退化到柠檬市场——只剩坏品。</Text>
      </View>

      <Text className='hint'>💡 切「2023 SVB ⚡」→ 猜为什么 48 小时崩 → 揭示数字时代信息传递速度被加速。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
