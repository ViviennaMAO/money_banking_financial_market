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
import { useT } from '../../i18n'
import './index.scss'

export default function Ch4Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)

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
      ? `Ch.4 · At YTM ${params.ytm}%, bond = $${calc.P.toFixed(0)}`
      : `第 4 章 · 利率 ${params.ytm}% 时债券价 $${calc.P.toFixed(0)}`,
    path: '/pages/ch4/index'
  }))

  const premiumStatus = calc.premium > 0.5
    ? S('溢价', 'Premium')
    : (calc.premium < -0.5 ? S('折价', 'Discount') : S('平价', 'Par'))
  const premiumCls = calc.premium > 0 ? 'pos' : (calc.premium < 0 ? 'neg' : 'neu')

  return (
    <ScrollView scrollY className='ch4'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>📈 {S('债券定价器', 'Bond Pricer')}</Text>
        <Text className='page-meta'>{S('第 4 章', 'Chapter 4')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1981', label: S('1981 沃尔克末', '1981 End-Volcker') },
          { key: '2022', label: S('2022 加息冲击 ⚡', '2022 Hike Shock ⚡'), accent: 'danger' },
          { key: '2024', label: S('2024.10', '2024.10') },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title={S('📡 当下利率快照', '📡 Live Rate Snapshot')}
        subtitle={S(
          '教材里的 r,在今天的 FRED 数据中是这些数字',
          'The textbook r — these are today\'s FRED numbers'
        )}
        tiles={[
          { id: 'DGS2',  label: S('2 年期美债', '2-Year Treasury') },
          { id: 'DGS10', label: S('10 年期美债', '10-Year Treasury') },
          { id: 'DGS30', label: S('30 年期美债', '30-Year Treasury') },
          { id: 'T10YIE', label: S('10Y 通胀盈亏平衡', '10Y Breakeven Inflation'),
            hint: S(
              '费雪方程的 π^e:把 i - π^e ≈ 实际利率',
              'Fisher π^e: real rate ≈ i - π^e'
            )
          }
        ]}
      />

      <View className='panel'>
        <Text className='panel-tag'>
          {S(
            `债券:面值 ${params.fv} · 期限 ${params.years} 年 · 票息 ${params.couponRate}%`,
            `Bond: FV ${params.fv} · ${params.years}Y · ${params.couponRate}% coupon`
          )}
        </Text>
        <SliderRow label={S('FV · 面值', 'FV · Face value')} value={params.fv} prefix='$' min={100} max={10000} step={100}
          onChange={v => setParams(p => ({ ...p, fv: v }))} />
        <SliderRow label={S('c · 票息率', 'c · Coupon rate')} value={params.couponRate} unit='%' min={0} max={20} step={0.25}
          onChange={v => setParams(p => ({ ...p, couponRate: v }))} />
        <SliderRow label={S('i / YTM · 市场利率', 'i / YTM · Market rate')} value={params.ytm} unit='%' min={0} max={20} step={0.25}
          onChange={v => setParams(p => ({ ...p, ytm: v }))} />
        <SliderRow label={S('n · 到期年限', 'n · Years to maturity')} value={params.years} unit={S('年', 'yr')} min={1} max={30} step={1}
          onChange={v => setParams(p => ({ ...p, years: Math.round(v) }))} />
        <SliderRow label={S('π · 通胀(用于实际利率)', 'π · Inflation (for real rate)')} value={params.inflation} unit='%' min={-2} max={15} step={0.25}
          onChange={v => setParams(p => ({ ...p, inflation: v }))} />
      </View>

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-grid'>
          <View>
            <Text className='output-label'>{S('价格 P', 'Price P')}</Text>
            <Text className={`output-big ${premiumCls}`}>${calc.P.toFixed(0)}</Text>
          </View>
          <View>
            <Text className='output-label'>{S('溢价 / 折价', 'Premium / Discount')}</Text>
            <Text className={`output-mid ${premiumCls}`}>
              {(calc.premium >= 0 ? '+' : '') + calc.premium.toFixed(1)}%
            </Text>
            <Text className='output-tiny'>{premiumStatus}</Text>
          </View>
          <View>
            <Text className='output-label'>{S('修正久期', 'Modified duration')}</Text>
            <Text className='output-mid'>{calc.dur.toFixed(2)}</Text>
            <Text className='output-tiny'>
              {S(`利率 +1% → 价跌 ≈ ${calc.dur.toFixed(1)}%`, `+1% rate → price ≈ -${calc.dur.toFixed(1)}%`)}
            </Text>
          </View>
          <View>
            <Text className='output-label'>{S('实际利率', 'Real rate')}</Text>
            <Text className={`output-mid ${calc.real > 0 ? 'pos' : 'neg'}`}>
              {(calc.real >= 0 ? '+' : '') + calc.real.toFixed(2)}%
            </Text>
            <Text className='output-tiny'>{S('费雪方程', 'Fisher equation')}</Text>
          </View>
        </View>
        {note ? <Text className='output-note'>{note}</Text> : null}
      </View>

      <View className='laws'>
        <Text className='laws-tag'>{S('📚 三条不可违反的"利率定律"', '📚 Three inviolable "rate laws"')}</Text>
        <View className='law-item'>
          <Text className='law-num'>1</Text>
          <Text className='law-text'>
            {S(
              '**利率↑ → 债券价↓**(反向关系) — 把 ytm 从 4% 拖到 5% 试试',
              '**Rates ↑ → bond price ↓** (inverse relationship) — drag YTM from 4% to 5%'
            )}
          </Text>
        </View>
        <View className='law-item'>
          <Text className='law-num'>2</Text>
          <Text className='law-text'>
            {S(
              '**期限越长,价格对利率越敏感**(久期效应) — 把 n 从 5 拖到 30 试试',
              '**Longer maturity → more rate-sensitive** (duration effect) — drag n from 5 to 30'
            )}
          </Text>
        </View>
        <View className='law-item'>
          <Text className='law-num'>3</Text>
          <Text className='law-text'>
            {S(
              '**实际利率才是真实成本** = 名义 - 通胀(费雪方程)',
              '**Real rate is the true cost** = nominal − inflation (Fisher equation)'
            )}
          </Text>
        </View>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2022 加息冲击」⚡ → 猜价格变化 → 揭示 -50%。债券不是"低风险资产"。',
          '💡 Switch to "2022 Hike Shock" ⚡ → predict the price change → reveal -50%. Bonds aren\'t "low-risk".'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
