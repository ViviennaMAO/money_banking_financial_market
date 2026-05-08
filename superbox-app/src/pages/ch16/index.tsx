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
import { useT } from '../../i18n'
import './index.scss'

export default function Ch16Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

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
  const stance = deviation > 1.5
    ? { label: S('过紧', 'Too tight'), cls: 'st-tight' }
    : deviation < -1.5
      ? { label: S('过松', 'Too loose'), cls: 'st-loose' }
      : { label: S('合理', 'Reasonable'), cls: 'st-fair' }

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
    setNote(locale === 'en' && s.note_en ? s.note_en : s.note)
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
      ? `Ch.16 · Taylor ${result.impliedRate.toFixed(1)}% vs actual ${actualFFR}%`
      : `第 16 章 · 泰勒 ${result.impliedRate.toFixed(1)}% vs 实际 ${actualFFR}%`,
    path: '/pages/ch16/index'
  }))

  const components = [
    { label: S('r* 自然实际利率', 'r* Natural real rate'), value: params.naturalRate, cls: 'cmp-r' },
    { label: S('π 当前通胀', 'π Current inflation'), value: params.inflation, cls: 'cmp-pi' },
    { label: S('α(π-π*) 通胀缺口', 'α(π-π*) Inflation gap'), value: result.inflationContrib, cls: 'cmp-gap' },
    { label: S('β·y 产出缺口', 'β·y Output gap'), value: result.outputContrib, cls: 'cmp-y' }
  ]
  const maxAbs = Math.max(...components.map(c => Math.abs(c.value)), 1)

  return (
    <ScrollView scrollY className='ch16'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>🎯 {S('泰勒规则计算器', 'Taylor Rule Calculator')}</Text>
        <Text className='page-meta'>{S('第 16 章', 'Chapter 16')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1981', label: S('1981 沃尔克', '1981 Volcker') },
          { key: '2008', label: S('2008 危机', '2008 Crisis') },
          { key: '2010', label: S('2010 QE', '2010 QE') },
          { key: '2022', label: S('2022 通胀冲击 ⚡', '2022 Inflation Shock ⚡'), accent: 'danger' },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title={S('📡 当下泰勒输入', '📡 Live Taylor Inputs')}
        subtitle={S(
          '把这些数字代入下方滑块,看 Fed 偏离规则多少',
          'Plug these into the sliders below to see how far the Fed is from the rule'
        )}
        tiles={[
          { id: 'CPIAUCSL', label: 'CPI YoY', change: '1y',
            hint: S('同比变化 = 当下通胀 π', 'YoY change = current inflation π')
          },
          { id: 'UNRATE', label: S('失业率', 'Unemployment'),
            hint: S(
              '低于 4.4 → 输出缺口为正,推高规则利率',
              'Below 4.4 → positive output gap → pushes rule rate up'
            )
          },
          { id: 'DFF', label: S('实际 FFR', 'Actual FFR'),
            hint: S(
              '与规则给出值的差 = Fed 的"裁量空间"',
              'Gap from rule = Fed\'s "discretionary room"'
            )
          },
          { id: 'DGS10', label: S('10Y 美债', '10Y Treasury'), change: '1y' }
        ]}
      />

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-grid'>
          <View>
            <Text className='output-label'>{S('泰勒规则隐含', 'Taylor implied')}</Text>
            <Text className='output-big'>{result.impliedRate.toFixed(1)}%</Text>
          </View>
          <View>
            <Text className='output-label'>{S('实际 FFR', 'Actual FFR')}</Text>
            <Text className='output-big actual'>{actualFFR.toFixed(1)}%</Text>
          </View>
        </View>
        <View className='dev-row'>
          <Text className='dev-label'>{S('偏离值', 'Deviation')}</Text>
          <Text className={`dev-value ${stance.cls}`}>
            {deviation >= 0 ? '+' : ''}{deviation.toFixed(2)}%
          </Text>
          <Text className={`stance-tag ${stance.cls}`}>{stance.label}</Text>
        </View>
        <Text className='formula'>i* = r* + π + α(π - π*) + β(y - y*)</Text>
      </View>

      {note ? <Text className='ch16-note'>{note}</Text> : null}

      <View className='decomp-card'>
        <Text className='decomp-tag'>
          {S(
            `泰勒规则四分量(总和 = 隐含利率 ${result.impliedRate.toFixed(1)}%)`,
            `Taylor 4-component decomposition (sum = implied ${result.impliedRate.toFixed(1)}%)`
          )}
        </Text>
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
        <Text className='panel-tag'>{S('调当前经济状态', 'Adjust current macro state')}</Text>
        <SliderRow label={S('π · 当前通胀', 'π · Current inflation')} value={params.inflation} unit='%' min={-2} max={15} step={0.1}
          onChange={v => setParams(p => ({ ...p, inflation: v }))} />
        <SliderRow label={S('π* · 通胀目标', 'π* · Inflation target')} value={params.inflationTarget} unit='%' min={1} max={4} step={0.1}
          onChange={v => setParams(p => ({ ...p, inflationTarget: v }))} />
        <SliderRow label={S('y - y* · 产出缺口', 'y - y* · Output gap')} value={params.outputGap} unit='%' min={-6} max={5} step={0.1}
          onChange={v => setParams(p => ({ ...p, outputGap: v }))} />
        <SliderRow label={S('r* · 自然实际利率', 'r* · Natural real rate')} value={params.naturalRate} unit='%' min={-1} max={3} step={0.1}
          onChange={v => setParams(p => ({ ...p, naturalRate: v }))} />
        <SliderRow label={S('实际 FFR(对比基准)', 'Actual FFR (baseline)')} value={actualFFR} unit='%' min={0} max={20} step={0.25}
          onChange={v => setActualFFR(v)} />
      </View>

      <View className='style-card'>
        <Text className='style-tag'>{S('🎚 Fed 政策风格 · α/β 反应系数', '🎚 Fed policy style · α/β reaction coefficients')}</Text>
        <SliderRow label={S('α 通胀反应', 'α Inflation response')} value={params.alpha} min={0} max={2} step={0.1}
          onChange={v => setParams(p => ({ ...p, alpha: v }))} />
        <SliderRow label={S('β 产出反应', 'β Output response')} value={params.beta} min={0} max={2} step={0.1}
          onChange={v => setParams(p => ({ ...p, beta: v }))} />
        <View className='style-presets'>
          <Text className='preset' onClick={() => setParams(p => ({ ...p, alpha: 1.5, beta: 0.5 }))}>
            {S('沃尔克(激进)', 'Volcker (aggressive)')}
          </Text>
          <Text className='preset' onClick={() => setParams(p => ({ ...p, alpha: 0.5, beta: 0.5 }))}>
            {S('标准泰勒', 'Standard Taylor')}
          </Text>
          <Text className='preset' onClick={() => setParams(p => ({ ...p, alpha: 0.3, beta: 0.5 }))}>
            {S('FAIT 鸽派', 'FAIT dovish')}
          </Text>
        </View>
      </View>

      <View className='strategy-card'>
        <Text className='strategy-tag'>{S('📚 Fed 战略框架演进', '📚 Fed strategy framework evolution')}</Text>
        <View className='str-item'>
          <Text className='str-num'>1</Text>
          <View className='str-body'>
            <Text className='str-title'>{S('双使命(1977 国会立法)', 'Dual mandate (1977 Humphrey-Hawkins Act)')}</Text>
            <Text className='str-desc'>
              {S(
                '物价稳定 + 充分就业。这是泰勒规则两个分量(π、y)的法定基础。',
                'Price stability + maximum employment. The legal basis for the two Taylor components (π, y).'
              )}
            </Text>
          </View>
        </View>
        <View className='str-item'>
          <Text className='str-num'>2</Text>
          <View className='str-body'>
            <Text className='str-title'>{S('通胀目标制(2012 起)', 'Inflation Targeting (since 2012)')}</Text>
            <Text className='str-desc'>
              {S(
                '明确 2% 目标 + 前瞻反应:通胀预期一超就动。',
                'Explicit 2% target + forward-looking: act when expectations drift above target.'
              )}
            </Text>
          </View>
        </View>
        <View className='str-item'>
          <Text className='str-num'>3</Text>
          <View className='str-body'>
            <Text className='str-title'>{S('FAIT 平均通胀目标(2020.8 Powell)', 'FAIT Flexible Average Inflation Targeting (2020.8 Powell)')}</Text>
            <Text className='str-desc'>
              {S(
                '允许通胀短期超过 2% 来弥补长期欠收 → 容忍超调。',
                'Allows temporary overshoots above 2% to compensate for prior undershoots → tolerates overshooting.'
              )}
            </Text>
            <Text className='str-warn'>
              {S(
                '⚠ 2022 通胀失锚后被广泛质疑:容忍让 Fed 反应慢了',
                '⚠ Widely criticized after 2022 inflation un-anchored: tolerance made Fed slow to react'
              )}
            </Text>
          </View>
        </View>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2022 通胀冲击 ⚡」→ 猜泰勒规则隐含利率 → 揭示 13%+ vs 实际 1.25% 的 12pp 偏离。',
          '💡 Switch to "2022 Inflation Shock ⚡" → predict the Taylor implied rate → reveal a 13%+ vs actual 1.25% (12pp deviation).'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
