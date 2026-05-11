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

export default function Ch24Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
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
  const totalStatus = result.total > 8 ? { label: '🔴 失控', cls: 'inf-bad' }
                    : result.total > 4 ? { label: '🟡 偏高', cls: 'inf-mid' }
                    : result.total < 0 ? { label: '🔵 通缩', cls: 'inf-cold' }
                    : { label: '🟢 温和', cls: 'inf-good' }

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
    title: `第 24 章 · 通胀 ${result.total.toFixed(1)}% · 主导:${result.dominant}`,
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
          { key: '1979', label: '1979 滞胀' },
          { key: '1990s', label: '1990s 大缓和' },
          { key: '2008', label: '2008-14 QE 谜' },
          { key: '2022', label: '2022 通胀 ⚡', accent: 'danger' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      <LiveData
        title='📡 当下通胀全景'
        subtitle='Headline / Core / PCE / 通胀预期 — 4 个数字告诉 Fed 该不该动'
        tiles={[
          { id: 'CPIAUCSL',  label: 'CPI 总', change: '1y',
            hint: '同比变化 = 总通胀,媒体头版数字'
          },
          { id: 'CPILFESL',  label: '核心 CPI', change: '1y',
            hint: '剔除食品+能源,Fed 真正盯的"粘性通胀"'
          },
          { id: 'PCEPILFE',  label: '核心 PCE', change: '1y',
            hint: 'Fed 法定目标变量 — 比 Core CPI 更"官方"'
          },
          { id: 'T10YIE',    label: '10Y 通胀盈亏平衡',
            hint: '市场对未来 10 年通胀预期'
          }
        ]}
      />

      <View className={`output ${flash ? 'flash' : ''}`}>
        <View className='output-row'>
          <View>
            <Text className='output-label'>总通胀率 π</Text>
            <Text className={`output-big ${totalStatus.cls}`}>{result.total.toFixed(2)}%</Text>
            <Text className='output-formula'>= 基础 + M + D + S + E</Text>
          </View>
          <View className='status-box'>
            <Text className={`status-tag ${totalStatus.cls}`}>{totalStatus.label}</Text>
            <View className='dom-block'>
              <Text className='dom-label'>主导机制</Text>
              <Text className={`dom-value ${compColors[result.dominant] || ''}`}>{result.dominant}</Text>
            </View>
          </View>
        </View>
      </View>

      {note ? <Text className='ch24-note'>{note}</Text> : null}

      {/* 4 机制条形图 */}
      <View className='decomp-card'>
        <Text className='decomp-tag'>📊 4 机制贡献分解</Text>
        <View className='base-row'>
          <Text className='base-label'>基础通胀</Text>
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
              <Text className='comp-label'>{c.name}</Text>
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
        <Text className='panel-tag'>调四个驱动因子</Text>
        <SliderRow label='M2 同比增速 · 货币驱动' value={params.m2Growth} unit='%' min={-5} max={30} step={0.5}
          onChange={v => setParams(p => ({ ...p, m2Growth: v }))} />
        <SliderRow label='产出缺口 · 需求拉动' value={params.outputGap} unit='%' min={-6} max={6} step={0.1}
          onChange={v => setParams(p => ({ ...p, outputGap: v }))} />
        <SliderRow label='油价同比变动 · 供给推动' value={params.oilShock} unit='%' min={-50} max={150} step={5}
          onChange={v => setParams(p => ({ ...p, oilShock: Math.round(v) }))} />
        <SliderRow label='通胀预期偏离锚 · 预期驱动' value={params.expectGap} unit='%' min={-2} max={8} step={0.1}
          onChange={v => setParams(p => ({ ...p, expectGap: v }))} />
      </View>

      <View className='friedman-card'>
        <Text className='friedman-tag'>📚 弗里德曼 vs 现代通胀理论</Text>
        <View className='fri-row'>
          <Text className='fri-label'>Friedman 名言</Text>
          <Text className='fri-quote'>"通胀始终是货币现象"</Text>
        </View>
        <Text className='fri-detail'>
          长期看:对的 — 没有持续的货币扩张,通胀无法长期维持。
        </Text>
        <Text className='fri-detail-bad'>
          但短期看:太简化 — 2008-2014 QE 万亿但通胀仅 1.7%(因为乘数砸到 1);
          1973 油价冲击让通胀飙升与 M 几乎无关。**单一机制无法解释短期通胀**。
        </Text>
        <Text className='fri-modern'>
          现代视角:**通胀是 4 机制混合**(货币 + 需求 + 供给 + 预期)。
          不同时期不同机制主导,这是为什么 2022 Fed 一开始判断"暂时性"是错的——
          他们只看了供给侧,忽视了货币 + 需求 + 预期叠加。
        </Text>
      </View>

      <Text className='hint'>💡 切「2022 通胀 ⚡」→ 猜归因 → 揭示 4 机制叠加完美风暴。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
