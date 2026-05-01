import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch4Snapshots, type PredictDef } from '../../utils/snapshots'
import { bondPrice, modifiedDuration, realRate } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import LiveData from '../../components/LiveData'
import './index.scss'

export default function Ch4Page() {
  // 默认:中等期限,正常利率
  const [params, setParams] = useState({
    fv: 1000, couponRate: 4, ytm: 4, years: 10, inflation: 2.5
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const calc = useMemo(() => {
    const couponDec = params.couponRate / 100
    const ytmDec = params.ytm / 100
    const piDec = params.inflation / 100
    const P = bondPrice(params.fv, couponDec, ytmDec, params.years)
    const dur = modifiedDuration(params.fv, couponDec, ytmDec, params.years)
    const real = realRate(ytmDec, piDec) * 100
    const premium = ((P - params.fv) / params.fv) * 100
    return { P, dur, real, premium }
  }, [params])

  function loadSnapshot(key: string) {
    const s = ch4Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch4Snapshots[key]
    setParams({
      fv: s.fv, couponRate: s.couponRate, ytm: s.ytm,
      years: s.years, inflation: s.inflation
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
    title: `第 4 章 · 利率 ${params.ytm}% 时债券价 $${calc.P.toFixed(0)}`,
    path: '/pages/ch4/index'
  }))

  const premiumStatus = calc.premium > 0.5 ? '溢价' : (calc.premium < -0.5 ? '折价' : '平价')
  const premiumCls = calc.premium > 0 ? 'pos' : (calc.premium < 0 ? 'neg' : 'neu')

  return (
    <ScrollView scrollY className='ch4'>
      <View className='page-header'>
        <Text className='page-title'>📈 债券定价器</Text>
        <Text className='page-meta'>第 4 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1981', label: '1981 沃尔克末' },
          { key: '2022', label: '2022 加息冲击 ⚡', accent: 'danger' },
          { key: '2024', label: '2024.10' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title='📡 当下利率快照'
        subtitle='教材里的 r,在今天的 FRED 数据中是这些数字'
        tiles={[
          { id: 'DGS2',  label: '2 年期美债' },
          { id: 'DGS10', label: '10 年期美债' },
          { id: 'DGS30', label: '30 年期美债' },
          { id: 'T10YIE', label: '10Y 通胀盈亏平衡',
            hint: '费雪方程的 π^e:把 i - π^e ≈ 实际利率'
          }
        ]}
      />

      <View className='panel'>
        <Text className='panel-tag'>债券:面值 {params.fv} · 期限 {params.years} 年 · 票息 {params.couponRate}%</Text>
        <SliderRow label='FV · 面值' value={params.fv} prefix='$' min={100} max={10000} step={100}
          onChange={v => setParams(p => ({ ...p, fv: v }))} />
        <SliderRow label='c · 票息率' value={params.couponRate} unit='%' min={0} max={20} step={0.25}
          onChange={v => setParams(p => ({ ...p, couponRate: v }))} />
        <SliderRow label='i / YTM · 市场利率' value={params.ytm} unit='%' min={0} max={20} step={0.25}
          onChange={v => setParams(p => ({ ...p, ytm: v }))} />
        <SliderRow label='n · 到期年限' value={params.years} unit='年' min={1} max={30} step={1}
          onChange={v => setParams(p => ({ ...p, years: Math.round(v) }))} />
        <SliderRow label='π · 通胀(用于实际利率)' value={params.inflation} unit='%' min={-2} max={15} step={0.25}
          onChange={v => setParams(p => ({ ...p, inflation: v }))} />
      </View>

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-grid'>
          <View>
            <Text className='output-label'>价格 P</Text>
            <Text className={`output-big ${premiumCls}`}>${calc.P.toFixed(0)}</Text>
          </View>
          <View>
            <Text className='output-label'>溢价 / 折价</Text>
            <Text className={`output-mid ${premiumCls}`}>
              {(calc.premium >= 0 ? '+' : '') + calc.premium.toFixed(1)}%
            </Text>
            <Text className='output-tiny'>{premiumStatus}</Text>
          </View>
          <View>
            <Text className='output-label'>修正久期</Text>
            <Text className='output-mid'>{calc.dur.toFixed(2)}</Text>
            <Text className='output-tiny'>利率 +1% → 价跌 ≈ {calc.dur.toFixed(1)}%</Text>
          </View>
          <View>
            <Text className='output-label'>实际利率</Text>
            <Text className={`output-mid ${calc.real > 0 ? 'pos' : 'neg'}`}>
              {(calc.real >= 0 ? '+' : '') + calc.real.toFixed(2)}%
            </Text>
            <Text className='output-tiny'>费雪方程</Text>
          </View>
        </View>
        {note ? <Text className='output-note'>{note}</Text> : null}
      </View>

      <View className='laws'>
        <Text className='laws-tag'>📚 三条不可违反的"利率定律"</Text>
        <View className='law-item'>
          <Text className='law-num'>1</Text>
          <Text className='law-text'>**利率↑ → 债券价↓**(反向关系) — 把 ytm 从 4% 拖到 5% 试试</Text>
        </View>
        <View className='law-item'>
          <Text className='law-num'>2</Text>
          <Text className='law-text'>**期限越长,价格对利率越敏感**(久期效应) — 把 n 从 5 拖到 30 试试</Text>
        </View>
        <View className='law-item'>
          <Text className='law-num'>3</Text>
          <Text className='law-text'>**实际利率才是真实成本** = 名义 - 通胀(费雪方程)</Text>
        </View>
      </View>

      <Text className='hint'>💡 切「2022 加息冲击」⚡ → 猜价格变化 → 揭示 -50%。债券不是"低风险资产"。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
