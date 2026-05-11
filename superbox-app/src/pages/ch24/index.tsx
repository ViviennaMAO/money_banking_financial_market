import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch24Snapshots, type PredictDef } from '../../utils/snapshots'
import { inflationDecomp } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import LiveData from '../../components/LiveData'
import { useT } from '../../i18n'
import './index.scss'

const compColors: Record<string, string> = {
  '货币驱动 M': 'comp-mon',
  '需求拉动 D': 'comp-dem',
  '供给推动 S': 'comp-sup',
  '预期驱动 E': 'comp-exp'
}

// 中文 component key → 英文显示
const COMP_LABEL_EN: Record<string, string> = {
  '货币驱动 M': 'Monetary M',
  '需求拉动 D': 'Demand-pull D',
  '供给推动 S': 'Supply-push S',
  '预期驱动 E': 'Expectations E'
}

export default function Ch24Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const labelComp = (zh: string) => (locale === 'en' ? (COMP_LABEL_EN[zh] || zh) : zh)
  const [params, setParams] = useState({
    m2Growth: 3, outputGap: 0.5, oilShock: -5, expectGap: 1
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => inflationDecomp(params.m2Growth, params.outputGap, params.oilShock, params.expectGap),
    [params]
  )

  // 总通胀状态
  const totalStatus = result.total > 8 ? { label: S('🔴 失控', '🔴 Out of control'), cls: 'inf-bad' }
                    : result.total > 4 ? { label: S('🟡 偏高', '🟡 Elevated'), cls: 'inf-mid' }
                    : result.total < 0 ? { label: S('🔵 通缩', '🔵 Deflation'), cls: 'inf-cold' }
                    : { label: S('🟢 温和', '🟢 Moderate'), cls: 'inf-good' }

  // 计算各分量占比(用于条形图)
  const totalAbs = result.components.reduce((sum, c) => sum + Math.abs(c.value), 0) || 1

  function loadSnapshot(key: string) {
    const s = ch24Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch24Snapshots[key]
    setParams({
      m2Growth: s.m2Growth, outputGap: s.outputGap,
      oilShock: s.oilShock, expectGap: s.expectGap
    })
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
      ? `Ch.24 · Inflation ${result.total.toFixed(1)}% · Driver: ${labelComp(result.dominant)}`
      : `第 24 章 · 通胀 ${result.total.toFixed(1)}% · 主导:${result.dominant}`,
    path: '/pages/ch24/index'
  }))

  return (
    <ScrollView scrollY className='ch24'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🔥 通胀 4 机制拆解', '🔥 Inflation 4-Mechanism Decomposition')}</Text>
        <Text className='page-meta'>{S('第 24 章', 'Chapter 24')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1979', label: S('1979 滞胀', '1979 Stagflation') },
          { key: '1990s', label: S('1990s 大缓和', '1990s Great Moderation') },
          { key: '2008', label: S('2008-14 QE 谜', '2008-14 QE puzzle') },
          { key: '2022', label: S('2022 通胀 ⚡', '2022 Inflation ⚡'), accent: 'danger' },
          { key: 'today', label: S('今天', 'Today'), accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title={S('📡 当下通胀全景', '📡 Inflation panorama — right now')}
        subtitle={S(
          'Headline / Core / PCE / 通胀预期 — 4 个数字告诉 Fed 该不该动',
          'Headline / Core / PCE / inflation expectations — 4 numbers telling the Fed whether to act'
        )}
        tiles={[
          { id: 'CPIAUCSL', label: S('CPI 总', 'CPI headline'), change: '1y',
            hint: S('同比变化 = 总通胀,媒体头版数字', "YoY change = headline inflation, the front-page number") },
          { id: 'CPILFESL', label: S('核心 CPI', 'Core CPI'), change: '1y',
            hint: S("剔除食品+能源,Fed 真正盯的\"粘性通胀\"", "Ex food+energy, the 'sticky inflation' the Fed actually watches") },
          { id: 'PCEPILFE', label: S('核心 PCE', 'Core PCE'), change: '1y',
            hint: S("Fed 法定目标变量 — 比 Core CPI 更\"官方\"", "Fed's official target variable — more 'official' than Core CPI") },
          { id: 'T10YIE', label: S('10Y 通胀盈亏平衡', '10Y breakeven inflation'),
            hint: S('市场对未来 10 年通胀预期', "Market's expectation for inflation over the next 10 years") }
        ]}
      />

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-row'>
          <View>
            <Text className='output-label'>{S('总通胀率 π', 'Total inflation π')}</Text>
            <Text className={`output-big ${totalStatus.cls}`}>{result.total.toFixed(2)}%</Text>
            <Text className='output-formula'>{S('= 基础 + M + D + S + E', '= Base + M + D + S + E')}</Text>
          </View>
          <View className='status-box'>
            <Text className={`status-tag ${totalStatus.cls}`}>{totalStatus.label}</Text>
            <View className='dom-block'>
              <Text className='dom-label'>{S('主导机制', 'Dominant mechanism')}</Text>
              <Text className={`dom-value ${compColors[result.dominant] || ''}`}>{labelComp(result.dominant)}</Text>
            </View>
          </View>
        </View>
      </View>

      {note ? <Text className='ch24-note'>{note}</Text> : null}

      {/* 4-mechanism bar chart */}
      <View className='decomp-card'>
        <Text className='decomp-tag'>{S('📊 4 机制贡献分解', '📊 4-Mechanism Contribution Breakdown')}</Text>
        <View className='base-row'>
          <Text className='base-label'>{S('基础通胀', 'Base inflation')}</Text>
          <View className='base-bar-wrap'>
            <View className='base-bar' style={{ width: `${(result.base / Math.max(result.total, 1)) * 100}%` }}></View>
          </View>
          <Text className='base-value'>+{result.base.toFixed(1)}%</Text>
        </View>

        {result.components.map(c => {
          const pct = Math.abs(c.value) / totalAbs * 100
          const isNeg = c.value < 0
          return (
            <View key={c.key} className={`comp-row ${compColors[c.name]}`}>
              <Text className='comp-label'>{labelComp(c.name)}</Text>
              <View className='comp-bar-wrap'>
                <View className={`comp-bar ${compColors[c.name]} ${isNeg ? 'neg' : ''}`} style={{ width: `${pct}%` }}></View>
              </View>
              <Text className={`comp-value ${compColors[c.name]}`}>
                {c.value >= 0 ? '+' : ''}{c.value.toFixed(2)}%
              </Text>
            </View>
          )
        })}

        <View className='total-line'>
          <Text className='total-eq'>= {result.total.toFixed(2)}%</Text>
        </View>
      </View>

      <View className='panel'>
        <Text className='panel-tag'>{S('调四个驱动因子', 'Adjust the four drivers')}</Text>
        <SliderRow label={S('M2 同比增速 · 货币驱动', 'M2 YoY growth · Monetary')} value={params.m2Growth} unit='%' min={-5} max={30} step={0.5}
          onChange={v => setParams(p => ({ ...p, m2Growth: v }))} />
        <SliderRow label={S('产出缺口 · 需求拉动', 'Output gap · Demand-pull')} value={params.outputGap} unit='%' min={-6} max={6} step={0.1}
          onChange={v => setParams(p => ({ ...p, outputGap: v }))} />
        <SliderRow label={S('油价同比变动 · 供给推动', 'Oil price YoY · Supply-push')} value={params.oilShock} unit='%' min={-50} max={150} step={5}
          onChange={v => setParams(p => ({ ...p, oilShock: Math.round(v) }))} />
        <SliderRow label={S('通胀预期偏离锚 · 预期驱动', 'Inflation expectations deviation · Expectations')} value={params.expectGap} unit='%' min={-2} max={8} step={0.1}
          onChange={v => setParams(p => ({ ...p, expectGap: v }))} />
      </View>

      <View className='friedman-card'>
        <Text className='friedman-tag'>{S('📚 弗里德曼 vs 现代通胀理论', '📚 Friedman vs Modern Inflation Theory')}</Text>
        <View className='fri-row'>
          <Text className='fri-label'>{S('Friedman 名言', "Friedman's famous line")}</Text>
          <Text className='fri-quote'>
            {S('"通胀始终是货币现象"', '"Inflation is always and everywhere a monetary phenomenon"')}
          </Text>
        </View>
        <Text className='fri-detail'>
          {S(
            '长期看:对的 — 没有持续的货币扩张,通胀无法长期维持。',
            'Long run: right — without sustained monetary expansion, inflation cannot persist.'
          )}
        </Text>
        <Text className='fri-detail-bad'>
          {S(
            '但短期看:太简化 — 2008-2014 QE 万亿但通胀仅 1.7%(因为乘数砸到 1);1973 油价冲击让通胀飙升与 M 几乎无关。**单一机制无法解释短期通胀**。',
            "But short run: too simplistic — 2008-2014 QE trillions yet inflation only 1.7% (multiplier crashed to 1); 1973 oil shock spiked inflation almost independent of M. **A single mechanism can't explain short-run inflation**."
          )}
        </Text>
        <Text className='fri-modern'>
          {S(
            '现代视角:**通胀是 4 机制混合**(货币 + 需求 + 供给 + 预期)。不同时期不同机制主导,这是为什么 2022 Fed 一开始判断"暂时性"是错的——他们只看了供给侧,忽视了货币 + 需求 + 预期叠加。',
            "Modern view: **inflation is a 4-mechanism mix** (monetary + demand + supply + expectations). Different periods are dominated by different mechanisms — which is why the Fed's initial 'transitory' call in 2022 was wrong: they only looked at supply, ignoring the stacking of monetary + demand + expectations."
          )}
        </Text>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「2022 通胀 ⚡」→ 猜归因 → 揭示 4 机制叠加完美风暴。',
          "💡 Switch to '2022 Inflation ⚡' → attribute the cause → reveal the 4-mechanism perfect storm."
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
