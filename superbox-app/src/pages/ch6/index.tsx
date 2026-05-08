import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { ch6Snapshots, type PredictDef } from '../../utils/snapshots'
import { spread2s10s, yieldAtTenor } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import YieldCurveCanvas from '../../components/YieldCurveCanvas'
import { useT } from '../../i18n'
import './index.scss'

export default function Ch6Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

  const [params, setParams] = useState({
    shortEnd: 4.3, longEnd: 4.6, curveBow: 0.1
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const spread = spread2s10s(params.shortEnd, params.longEnd, params.curveBow)
  const isInverted = spread < 0
  const y2 = yieldAtTenor(params.shortEnd, params.longEnd, params.curveBow, 2)
  const y10 = yieldAtTenor(params.shortEnd, params.longEnd, params.curveBow, 10)

  function loadSnapshot(key: string) {
    const s = ch6Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch6Snapshots[key]
    setParams({ shortEnd: s.shortEnd, longEnd: s.longEnd, curveBow: s.curveBow })
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
    if (pendingSnap) {
      applySnapshot(pendingSnap)
      setPendingSnap(null)
    }
  }

  Taro.useShareAppMessage(() => ({
    title: locale === 'en'
      ? `Ch.6 · 2s10s = ${spread > 0 ? '+' : ''}${(spread * 100).toFixed(0)}bp${isInverted ? ' (inverted)' : ''}`
      : `第 6 章 · 2s10s = ${spread > 0 ? '+' : ''}${(spread * 100).toFixed(0)}bp${isInverted ? ' (倒挂)' : ''}`,
    path: '/pages/ch6/index'
  }))

  return (
    <ScrollView scrollY className='ch6'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>📊 {S('收益率曲线沙盘', 'Yield Curve Sandbox')}</Text>
        <Text className='page-meta'>{S('第 6 章', 'Chapter 6')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1980', label: S('1980 沃尔克', '1980 Volcker') },
          { key: '2007', label: S('2007.6 危机前', '2007.6 Pre-crisis') },
          { key: '2019', label: S('2019.8 倒挂', '2019.8 Inversion') },
          { key: '2024', label: S('2024.7 反常 ⚡', '2024.7 Anomaly ⚡'), accent: 'danger' },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`canvas-card ${flash ? 'flash' : ''}`}>
        <YieldCurveCanvas
          shortEnd={params.shortEnd}
          longEnd={params.longEnd}
          curveBow={params.curveBow}
        />
        <View className='spread-row'>
          <View className='spread-cell'>
            <Text className='spread-label'>2Y</Text>
            <Text className='spread-value'>{y2.toFixed(2)}%</Text>
          </View>
          <View className='spread-cell'>
            <Text className='spread-label'>10Y</Text>
            <Text className='spread-value'>{y10.toFixed(2)}%</Text>
          </View>
          <View className={`spread-cell spread-key ${isInverted ? 'inv' : 'norm'}`}>
            <Text className='spread-label'>{S('2s10s 利差', '2s10s spread')}</Text>
            <Text className='spread-value'>
              {(spread > 0 ? '+' : '') + (spread * 100).toFixed(0)}bp
            </Text>
            {isInverted ? <Text className='inv-tag'>⚠ {S('倒挂', 'Inverted')}</Text> : null}
          </View>
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>{S('调三个滑块,塑造曲线形态', 'Drag the three sliders to shape the curve')}</Text>
        <SliderRow label={S('2Y 短端利率(Fed 政策)', '2Y short rate (Fed policy)')} value={params.shortEnd} unit='%' min={0} max={16} step={0.1}
          onChange={v => setParams(p => ({ ...p, shortEnd: v }))} />
        <SliderRow label={S('30Y 长端利率(市场预期)', '30Y long rate (market expectation)')} value={params.longEnd} unit='%' min={0} max={16} step={0.1}
          onChange={v => setParams(p => ({ ...p, longEnd: v }))} />
        <SliderRow label={S('中段凸度(0=直线 / +=拱起 / -=凹)', 'Curvature (0=line / +=hump / -=concave)')} value={params.curveBow} min={-1.5} max={1.5} step={0.1}
          onChange={v => setParams(p => ({ ...p, curveBow: v }))} />
      </View>

      {note ? <View className={`note-card ${isInverted ? 'note-inv' : 'note-ok'}`}><Text>{note}</Text></View> : null}

      <View className='theories'>
        <Text className='theories-tag'>{S('📚 解释期限结构的三大理论', '📚 Three theories explaining term structure')}</Text>
        <View className='th-item'>
          <Text className='th-num'>1</Text>
          <View className='th-body'>
            <Text className='th-title'>{S('纯预期假说', 'Pure Expectations Hypothesis')}</Text>
            <Text className='th-desc'>
              {S(
                '长期利率 = 未来短期利率的均值。倒挂 = 市场预期 Fed 会降息。',
                'Long rate = average of expected future short rates. Inversion = market expects Fed to cut.'
              )}
            </Text>
          </View>
        </View>
        <View className='th-item'>
          <Text className='th-num'>2</Text>
          <View className='th-body'>
            <Text className='th-title'>{S('流动性溢价理论', 'Liquidity Premium Theory')}</Text>
            <Text className='th-desc'>
              {S(
                '长期债流动性差 → 需要溢价补偿 → 曲线天然向上(主流解释)。',
                'Long bonds are less liquid → demand a premium → naturally upward-sloping curve (mainstream explanation).'
              )}
            </Text>
          </View>
        </View>
        <View className='th-item'>
          <Text className='th-num'>3</Text>
          <View className='th-body'>
            <Text className='th-title'>{S('市场分割理论', 'Market Segmentation Theory')}</Text>
            <Text className='th-desc'>
              {S(
                '不同期限市场是分割的(养老金买长债 / 银行买短债)。',
                'Different maturity markets are segmented (pensions buy long, banks buy short).'
              )}
            </Text>
          </View>
        </View>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2024.7 反常」⚡ → 猜倒挂 24 个月后 GDP 怎样 → 揭示 +2.5% 健康增长。倒挂不是真理。',
          '💡 Switch to "2024.7 Anomaly" ⚡ → predict GDP after 24 months of inversion → reveal +2.5% healthy growth. Inversion isn\'t truth.'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
