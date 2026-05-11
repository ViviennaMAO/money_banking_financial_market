import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch22Snapshots, type PredictDef } from '../../utils/snapshots'
import { adasEquilibrium } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import ADASCanvas from '../../components/ADASCanvas'
import { useT } from '../../i18n'
import './index.scss'

export default function Ch22Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({ adShift: 0, srasShift: 0, potentialY: 100 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const eq = useMemo(
    () => adasEquilibrium(params.adShift, params.srasShift, params.potentialY),
    [params]
  )

  function loadSnapshot(key: string) {
    const s = ch22Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch22Snapshots[key]
    setParams({ adShift: s.adShift, srasShift: s.srasShift, potentialY: s.potentialY })
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
    title: `第 22 章 · P=${eq.shortP.toFixed(1)} Y=${eq.shortY.toFixed(0)}`,
    path: '/pages/ch22/index'
  }))

  // 判断当前情境(需求 vs 供给冲击主导)
  const adAbs = Math.abs(params.adShift)
  const srasAbs = Math.abs(params.srasShift)
  const dominant = adAbs > srasAbs * 1.5 ? 'demand'
                  : srasAbs > adAbs * 1.5 ? 'supply'
                  : 'mixed'
  const dominantInfo = {
    demand: { label: '需求冲击主导', cls: 'd-demand', desc: '菲利普斯曲线适用:产出和通胀同向变化(失业↓ → 通胀↑)' },
    supply: { label: '供给冲击主导', cls: 'd-supply', desc: '⚠ 菲利普斯曲线失效:产出和通胀反向变化(滞胀模式)' },
    mixed: { label: '混合冲击', cls: 'd-mixed', desc: '需求和供给同时主导,这是 2022 通胀的复杂模式' }
  }[dominant]

  return (
    <ScrollView scrollY className='ch22'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('📊 AD-AS 沙盘', '📊 AD-AS Sandbox')}</Text>
        <Text className='page-meta'>{S('第 22 章', 'Chapter 22')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1960s', label: '1960s 大缓和' },
          { key: '1973', label: '1973 油价冲击' },
          { key: '1979', label: '1979 滞胀 ⚡', accent: 'danger' },
          { key: '2008', label: '2008 危机' },
          { key: '2022', label: '2022 双向通胀' }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`canvas-card ${flash ? 'flash' : ''}`}>
        <Text className='canvas-tag'>📈 AD-AS 三曲线 · 短期均衡点</Text>
        <ADASCanvas
          adShift={params.adShift}
          srasShift={params.srasShift}
          potentialY={params.potentialY}
        />
        <View className='legend-row'>
          <Text className='legend-item legend-ad'>━ AD 总需求</Text>
          <Text className='legend-item legend-sras'>━ SRAS 短期供给</Text>
          <Text className='legend-item legend-lras'>┄ LRAS 长期供给</Text>
        </View>
      </View>

      <View className='eq-card'>
        <View className='eq-grid'>
          <View>
            <Text className='eq-label'>短期价格 P*</Text>
            <Text className='eq-big'>{eq.shortP.toFixed(2)}</Text>
          </View>
          <View>
            <Text className='eq-label'>短期产出 Y*</Text>
            <Text className='eq-big'>{eq.shortY.toFixed(1)}</Text>
          </View>
          <View>
            <Text className='eq-label'>产出缺口</Text>
            <Text className={`eq-mid ${eq.outputGap > 0 ? 'gap-pos' : eq.outputGap < 0 ? 'gap-neg' : 'gap-zero'}`}>
              {eq.outputGap >= 0 ? '+' : ''}{eq.outputGap.toFixed(1)}
            </Text>
          </View>
          <View>
            <Text className='eq-label'>通胀压力</Text>
            <Text className={`eq-mid ${eq.inflationPressure === 'rising' ? 'gap-pos' : eq.inflationPressure === 'falling' ? 'gap-neg' : 'gap-zero'}`}>
              {eq.inflationPressure === 'rising' ? '↑ 上升' : eq.inflationPressure === 'falling' ? '↓ 下降' : '— 稳定'}
            </Text>
          </View>
        </View>
        <View className={`dominant-row ${dominantInfo.cls}`}>
          <Text className='dom-label'>{dominantInfo.label}</Text>
          <Text className='dom-desc'>{dominantInfo.desc}</Text>
        </View>
      </View>

      {note ? <Text className='ch22-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调三个分量</Text>
        <SliderRow label='AD 移动(财政货币组合)' value={params.adShift} unit='' min={-10} max={10} step={0.5}
          onChange={v => setParams(p => ({ ...p, adShift: v }))} />
        <SliderRow label='SRAS 移动(成本/通胀预期/供给冲击)' value={params.srasShift} unit='' min={-5} max={10} step={0.5}
          onChange={v => setParams(p => ({ ...p, srasShift: v }))} />
        <SliderRow label='潜在产出 Y*(LRAS)' value={params.potentialY} unit='' min={90} max={110} step={1}
          onChange={v => setParams(p => ({ ...p, potentialY: Math.round(v) }))} />
      </View>

      <View className='shocks-card'>
        <Text className='shocks-tag'>📚 需求冲击 vs 供给冲击 · 关键差异</Text>
        <View className='shock-row shock-demand'>
          <View className='shock-num'>📉</View>
          <View className='shock-body'>
            <Text className='shock-title'>需求冲击(AD 移动)</Text>
            <Text className='shock-desc'>P 和 Y 同向变化。例:2008 危机 AD 左移 → P↓ + Y↓(通缩衰退)。菲利普斯曲线适用。</Text>
            <Text className='shock-policy'>政策:对称应对(降息或减税刺激)</Text>
          </View>
        </View>
        <View className='shock-row shock-supply'>
          <View className='shock-num'>⚡</View>
          <View className='shock-body'>
            <Text className='shock-title'>供给冲击(SRAS 移动)</Text>
            <Text className='shock-desc'>P 和 Y 反向变化。例:1973 石油 SRAS 左移 → P↑ + Y↓(滞胀)。菲利普斯曲线失效。</Text>
            <Text className='shock-policy'>政策:两难——救通胀还是救就业?(沃尔克 1981 选了通胀)</Text>
          </View>
        </View>
        <View className='shock-row shock-mixed'>
          <View className='shock-num'>🌪</View>
          <View className='shock-body'>
            <Text className='shock-title'>混合冲击(2022 模式)</Text>
            <Text className='shock-desc'>AD 右移(财政 + QE)+ SRAS 左移(供应链 + 能源)。需求和供给同时主导。</Text>
            <Text className='shock-policy'>政策:加息后 + 等供给端缓解 + 财政退出。</Text>
          </View>
        </View>
      </View>

      <View className='phillips-card'>
        <Text className='phillips-tag'>🌀 菲利普斯曲线 · 它什么时候适用?</Text>
        <Text className='phillips-text'>
          经典菲利普斯:**失业率↓ → 通胀↑**(短期权衡)。
          1958 年发现以来,被认为是宏观铁律。
        </Text>
        <Text className='phillips-emp'>
          **1973 起被打破** — 油价冲击让"高失业 + 高通胀"同时存在(滞胀)。
          这就是为什么"经典菲利普斯只适用于需求冲击"。
        </Text>
        <Text className='phillips-modern'>
          现代修正:Friedman / Phelps 加入"通胀预期"——长期菲利普斯垂直(自然失业率不变),
          只有"未预期通胀"短期换得就业。这把菲利普斯从"政策菜单"降级为"短期分析工具"。
        </Text>
      </View>

      <Text className='hint'>💡 切「1979 滞胀 ⚡」→ 猜峰值通胀 → 揭示 13.5% + 失业 5.8% 同存。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
