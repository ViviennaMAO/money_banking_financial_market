import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch16Snapshots, type PredictDef } from '../../utils/snapshots'
import { taylorRule } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import LiveData from '../../components/LiveData'
import './index.scss'

export default function Ch16Page() {
  const [params, setParams] = useState({
    inflation: 3, inflationTarget: 2, outputGap: 0, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5
  })
  const [actualFFR, setActualFFR] = useState(4.5)
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => taylorRule(
      params.inflation, params.inflationTarget,
      params.outputGap, params.naturalRate,
      params.alpha, params.beta
    ),
    [params]
  )

  const deviation = actualFFR - result.impliedRate
  const stance = deviation > 1.5 ? { label: '过紧', cls: 'st-tight' }
                : deviation < -1.5 ? { label: '过松', cls: 'st-loose' }
                : { label: '合理', cls: 'st-fair' }

  function loadSnapshot(key: string) {
    const s = ch16Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch16Snapshots[key]
    setParams({
      inflation: s.inflation, inflationTarget: s.inflationTarget,
      outputGap: s.outputGap, naturalRate: s.naturalRate,
      alpha: s.alpha, beta: s.beta
    })
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
    title: `第 16 章 · 泰勒 ${result.impliedRate.toFixed(1)}% vs 实际 ${actualFFR}%`,
    path: '/pages/ch16/index'
  }))

  // 分量条形图(单位 %,正负都有)
  const components = [
    { label: 'r* 自然实际利率',  value: params.naturalRate,        cls: 'cmp-r' },
    { label: 'π 当前通胀',       value: params.inflation,          cls: 'cmp-pi' },
    { label: 'α(π-π*) 通胀缺口', value: result.inflationContrib,   cls: 'cmp-gap' },
    { label: 'β·y 产出缺口',     value: result.outputContrib,      cls: 'cmp-y' }
  ]
  const maxAbs = Math.max(...components.map(c => Math.abs(c.value)), 1)

  return (
    <ScrollView scrollY className='ch16'>
      <View className='page-header'>
        <Text className='page-title'>🎯 泰勒规则计算器</Text>
        <Text className='page-meta'>第 16 章</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1981', label: '1981 沃尔克' },
          { key: '2008', label: '2008 危机' },
          { key: '2010', label: '2010 QE' },
          { key: '2022', label: '2022 通胀冲击 ⚡', accent: 'danger' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title='📡 当下泰勒输入'
        subtitle='把这些数字代入下方滑块,看 Fed 偏离规则多少'
        tiles={[
          { id: 'CPIAUCSL', label: 'CPI YoY', change: '1y',
            hint: '同比变化 = 当下通胀 π'
          },
          { id: 'UNRATE', label: '失业率',
            hint: '低于 4.4 → 输出缺口为正,推高规则利率'
          },
          { id: 'DFF', label: '实际 FFR',
            hint: '与规则给出值的差 = Fed 的"裁量空间"'
          },
          { id: 'DGS10', label: '10Y 美债', change: '1y' }
        ]}
      />

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-grid'>
          <View>
            <Text className='output-label'>泰勒规则隐含</Text>
            <Text className='output-big'>{result.impliedRate.toFixed(1)}%</Text>
          </View>
          <View>
            <Text className='output-label'>实际 FFR</Text>
            <Text className='output-big actual'>{actualFFR.toFixed(1)}%</Text>
          </View>
        </View>
        <View className='dev-row'>
          <Text className='dev-label'>偏离值</Text>
          <Text className={`dev-value ${stance.cls}`}>
            {deviation >= 0 ? '+' : ''}{deviation.toFixed(2)}%
          </Text>
          <Text className={`stance-tag ${stance.cls}`}>{stance.label}</Text>
        </View>
        <Text className='formula'>i* = r* + π + α(π - π*) + β(y - y*)</Text>
      </View>

      {note ? <Text className='ch16-note'>{note}</Text> : null}

      <View className='decomp-card'>
        <Text className='decomp-tag'>泰勒规则四分量(总和 = 隐含利率 {result.impliedRate.toFixed(1)}%)</Text>
        {components.map(c => {
          const w = Math.abs(c.value) / maxAbs * 100
          const isNeg = c.value < 0
          return (
            <View key={c.label} className='cmp-row'>
              <Text className='cmp-label'>{c.label}</Text>
              <View className='cmp-bar-wrap'>
                <View className={`cmp-bar ${c.cls} ${isNeg ? 'neg' : ''}`} style={{ width: `${w}%` }}></View>
              </View>
              <Text className={`cmp-value ${c.cls}`}>
                {(c.value >= 0 ? '+' : '') + c.value.toFixed(2)}%
              </Text>
            </View>
          )
        })}
      </View>

      <View className='panel'>
        <Text className='panel-tag'>调当前经济状态</Text>
        <SliderRow label='π · 当前通胀' value={params.inflation} unit='%' min={-2} max={15} step={0.1}
          onChange={v => setParams(p => ({ ...p, inflation: v }))} />
        <SliderRow label='π* · 通胀目标' value={params.inflationTarget} unit='%' min={1} max={4} step={0.1}
          onChange={v => setParams(p => ({ ...p, inflationTarget: v }))} />
        <SliderRow label='y - y* · 产出缺口' value={params.outputGap} unit='%' min={-6} max={5} step={0.1}
          onChange={v => setParams(p => ({ ...p, outputGap: v }))} />
        <SliderRow label='r* · 自然实际利率' value={params.naturalRate} unit='%' min={-1} max={3} step={0.1}
          onChange={v => setParams(p => ({ ...p, naturalRate: v }))} />
        <SliderRow label='实际 FFR(对比基准)' value={actualFFR} unit='%' min={0} max={20} step={0.25}
          onChange={v => setActualFFR(v)} />
      </View>

      <View className='style-card'>
        <Text className='style-tag'>🎚 Fed 政策风格 · α/β 反应系数</Text>
        <SliderRow label='α 通胀反应' value={params.alpha} min={0} max={2} step={0.1}
          onChange={v => setParams(p => ({ ...p, alpha: v }))} />
        <SliderRow label='β 产出反应' value={params.beta} min={0} max={2} step={0.1}
          onChange={v => setParams(p => ({ ...p, beta: v }))} />
        <View className='style-presets'>
          <Text className='preset' onClick={() => setParams(p => ({ ...p, alpha: 1.5, beta: 0.5 }))}>沃尔克(激进)</Text>
          <Text className='preset' onClick={() => setParams(p => ({ ...p, alpha: 0.5, beta: 0.5 }))}>标准泰勒</Text>
          <Text className='preset' onClick={() => setParams(p => ({ ...p, alpha: 0.3, beta: 0.5 }))}>FAIT 鸽派</Text>
        </View>
      </View>

      <View className='strategy-card'>
        <Text className='strategy-tag'>📚 Fed 战略框架演进</Text>
        <View className='str-item'>
          <Text className='str-num'>1</Text>
          <View className='str-body'>
            <Text className='str-title'>双使命(1977 国会立法)</Text>
            <Text className='str-desc'>物价稳定 + 充分就业。这是泰勒规则两个分量(π、y)的法定基础。</Text>
          </View>
        </View>
        <View className='str-item'>
          <Text className='str-num'>2</Text>
          <View className='str-body'>
            <Text className='str-title'>通胀目标制(2012 起)</Text>
            <Text className='str-desc'>明确 2% 目标 + 前瞻反应:通胀预期一超就动。</Text>
          </View>
        </View>
        <View className='str-item'>
          <Text className='str-num'>3</Text>
          <View className='str-body'>
            <Text className='str-title'>FAIT 平均通胀目标(2020.8 Powell)</Text>
            <Text className='str-desc'>允许通胀短期超过 2% 来弥补长期欠收 → 容忍超调。</Text>
            <Text className='str-warn'>⚠ 2022 通胀失锚后被广泛质疑:容忍让 Fed 反应慢了</Text>
          </View>
        </View>
      </View>

      <Text className='hint'>💡 切「2022 通胀冲击 ⚡」→ 猜泰勒规则隐含利率 → 揭示 13%+ vs 实际 1.25% 的 12pp 偏离。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
