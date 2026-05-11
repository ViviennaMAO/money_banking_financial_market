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
      ? `Ch.22 · P=${eq.shortP.toFixed(1)} Y=${eq.shortY.toFixed(0)}`
      : `第 22 章 · P=${eq.shortP.toFixed(1)} Y=${eq.shortY.toFixed(0)}`,
    path: '/pages/ch22/index'
  }))

  const adAbs = Math.abs(params.adShift)
  const srasAbs = Math.abs(params.srasShift)
  const dominant = adAbs > srasAbs * 1.5 ? 'demand'
                  : srasAbs > adAbs * 1.5 ? 'supply'
                  : 'mixed'
  const dominantInfo: Record<string, { label: string; cls: string; desc: string }> = {
    demand: {
      label: S('需求冲击主导', 'Demand-shock dominated'),
      cls: 'd-demand',
      desc: S(
        '菲利普斯曲线适用:产出和通胀同向变化(失业↓ → 通胀↑)',
        'Phillips curve applies: output and inflation move together (unemployment↓ → inflation↑)'
      )
    },
    supply: {
      label: S('供给冲击主导', 'Supply-shock dominated'),
      cls: 'd-supply',
      desc: S(
        '⚠ 菲利普斯曲线失效:产出和通胀反向变化(滞胀模式)',
        '⚠ Phillips curve breaks: output and inflation move in opposite directions (stagflation mode)'
      )
    },
    mixed: {
      label: S('混合冲击', 'Mixed shock'),
      cls: 'd-mixed',
      desc: S(
        '需求和供给同时主导,这是 2022 通胀的复杂模式',
        'Demand and supply both dominate — the complex pattern of 2022 inflation'
      )
    }
  }
  const dominantData = dominantInfo[dominant]

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
          { key: '1960s', label: S('1960s 大缓和', '1960s Great Moderation') },
          { key: '1973', label: S('1973 油价冲击', '1973 Oil Shock') },
          { key: '1979', label: S('1979 滞胀 ⚡', '1979 Stagflation ⚡'), accent: 'danger' },
          { key: '2008', label: S('2008 危机', '2008 Crisis') },
          { key: '2022', label: S('2022 双向通胀', '2022 Two-way Inflation') }
        ]}
        onSelect={loadSnapshot}
      />

      <View className={`canvas-card ${flash ? 'flash' : ''}`}>
        <Text className='canvas-tag'>{S('📈 AD-AS 三曲线 · 短期均衡点', '📈 AD-AS three curves · short-run equilibrium')}</Text>
        <ADASCanvas
          adShift={params.adShift}
          srasShift={params.srasShift}
          potentialY={params.potentialY}
        />
        <View className='legend-row'>
          <Text className='legend-item legend-ad'>━ AD {S('总需求', 'Aggregate Demand')}</Text>
          <Text className='legend-item legend-sras'>━ SRAS {S('短期供给', 'Short-Run AS')}</Text>
          <Text className='legend-item legend-lras'>┄ LRAS {S('长期供给', 'Long-Run AS')}</Text>
        </View>
      </View>

      <View className='eq-card'>
        <View className='eq-grid'>
          <View>
            <Text className='eq-label'>{S('短期价格 P*', 'Short-run price P*')}</Text>
            <Text className='eq-big'>{eq.shortP.toFixed(2)}</Text>
          </View>
          <View>
            <Text className='eq-label'>{S('短期产出 Y*', 'Short-run output Y*')}</Text>
            <Text className='eq-big'>{eq.shortY.toFixed(1)}</Text>
          </View>
          <View>
            <Text className='eq-label'>{S('产出缺口', 'Output gap')}</Text>
            <Text className={`eq-mid ${eq.outputGap > 0 ? 'gap-pos' : eq.outputGap < 0 ? 'gap-neg' : 'gap-zero'}`}>
              {eq.outputGap >= 0 ? '+' : ''}{eq.outputGap.toFixed(1)}
            </Text>
          </View>
          <View>
            <Text className='eq-label'>{S('通胀压力', 'Inflation pressure')}</Text>
            <Text className={`eq-mid ${eq.inflationPressure === 'rising' ? 'gap-pos' : eq.inflationPressure === 'falling' ? 'gap-neg' : 'gap-zero'}`}>
              {eq.inflationPressure === 'rising'
                ? S('↑ 上升', '↑ Rising')
                : eq.inflationPressure === 'falling'
                  ? S('↓ 下降', '↓ Falling')
                  : S('— 稳定', '— Stable')}
            </Text>
          </View>
        </View>
        <View className={`dominant-row ${dominantData.cls}`}>
          <Text className='dom-label'>{dominantData.label}</Text>
          <Text className='dom-desc'>{dominantData.desc}</Text>
        </View>
      </View>

      {note ? <Text className='ch22-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>{S('调三个分量', 'Adjust three components')}</Text>
        <SliderRow label={S('AD 移动(财政货币组合)', 'AD shift (fiscal + monetary mix)')} value={params.adShift} unit='' min={-10} max={10} step={0.5}
          onChange={v => setParams(p => ({ ...p, adShift: v }))} />
        <SliderRow label={S('SRAS 移动(成本/通胀预期/供给冲击)', 'SRAS shift (costs / expectations / supply shock)')} value={params.srasShift} unit='' min={-5} max={10} step={0.5}
          onChange={v => setParams(p => ({ ...p, srasShift: v }))} />
        <SliderRow label={S('潜在产出 Y*(LRAS)', 'Potential output Y* (LRAS)')} value={params.potentialY} unit='' min={90} max={110} step={1}
          onChange={v => setParams(p => ({ ...p, potentialY: Math.round(v) }))} />
      </View>

      <View className='shocks-card'>
        <Text className='shocks-tag'>{S('📚 需求冲击 vs 供给冲击 · 关键差异', '📚 Demand vs Supply Shock · Key Differences')}</Text>
        <View className='shock-row shock-demand'>
          <View className='shock-num'>📉</View>
          <View className='shock-body'>
            <Text className='shock-title'>{S('需求冲击(AD 移动)', 'Demand shock (AD moves)')}</Text>
            <Text className='shock-desc'>
              {S(
                'P 和 Y 同向变化。例:2008 危机 AD 左移 → P↓ + Y↓(通缩衰退)。菲利普斯曲线适用。',
                'P and Y move together. Example: 2008 crisis AD shifts left → P↓ + Y↓ (deflationary recession). Phillips curve applies.'
              )}
            </Text>
            <Text className='shock-policy'>
              {S(
                '政策:对称应对(降息或减税刺激)',
                'Policy: symmetric response (rate cuts or tax stimulus)'
              )}
            </Text>
          </View>
        </View>
        <View className='shock-row shock-supply'>
          <View className='shock-num'>⚡</View>
          <View className='shock-body'>
            <Text className='shock-title'>{S('供给冲击(SRAS 移动)', 'Supply shock (SRAS moves)')}</Text>
            <Text className='shock-desc'>
              {S(
                'P 和 Y 反向变化。例:1973 石油 SRAS 左移 → P↑ + Y↓(滞胀)。菲利普斯曲线失效。',
                'P and Y move oppositely. Example: 1973 oil SRAS shifts left → P↑ + Y↓ (stagflation). Phillips curve breaks.'
              )}
            </Text>
            <Text className='shock-policy'>
              {S(
                '政策:两难——救通胀还是救就业?(沃尔克 1981 选了通胀)',
                "Policy: dilemma — fight inflation or save jobs? (Volcker chose inflation in 1981)"
              )}
            </Text>
          </View>
        </View>
        <View className='shock-row shock-mixed'>
          <View className='shock-num'>🌪</View>
          <View className='shock-body'>
            <Text className='shock-title'>{S('混合冲击(2022 模式)', 'Mixed shock (2022 pattern)')}</Text>
            <Text className='shock-desc'>
              {S(
                'AD 右移(财政 + QE)+ SRAS 左移(供应链 + 能源)。需求和供给同时主导。',
                'AD shifts right (fiscal + QE) + SRAS shifts left (supply chain + energy). Demand and supply both dominate.'
              )}
            </Text>
            <Text className='shock-policy'>
              {S(
                '政策:加息后 + 等供给端缓解 + 财政退出。',
                'Policy: hike rates + wait for supply easing + fiscal withdrawal.'
              )}
            </Text>
          </View>
        </View>
      </View>

      <View className='phillips-card'>
        <Text className='phillips-tag'>{S('🌀 菲利普斯曲线 · 它什么时候适用?', '🌀 Phillips Curve · When Does It Apply?')}</Text>
        <Text className='phillips-text'>
          {S(
            '经典菲利普斯:**失业率↓ → 通胀↑**(短期权衡)。1958 年发现以来,被认为是宏观铁律。',
            'Classic Phillips: **unemployment↓ → inflation↑** (short-run trade-off). Since 1958 it was considered an iron law of macro.'
          )}
        </Text>
        <Text className='phillips-emp'>
          {S(
            '**1973 起被打破** — 油价冲击让"高失业 + 高通胀"同时存在(滞胀)。这就是为什么"经典菲利普斯只适用于需求冲击"。',
            "**Broke from 1973 onward** — oil shocks made 'high unemployment + high inflation' coexist (stagflation). This is why 'classic Phillips only applies to demand shocks.'"
          )}
        </Text>
        <Text className='phillips-modern'>
          {S(
            '现代修正:Friedman / Phelps 加入"通胀预期"——长期菲利普斯垂直(自然失业率不变),只有"未预期通胀"短期换得就业。这把菲利普斯从"政策菜单"降级为"短期分析工具"。',
            "Modern fix: Friedman / Phelps added 'inflation expectations' — long-run Phillips is vertical (natural rate unchanged); only 'unexpected inflation' trades for jobs short-term. This demoted Phillips from a 'policy menu' to a 'short-run analytical tool.'"
          )}
        </Text>
      </View>

      <Text className='hint'>
        {S(
          '💡 切「1979 滞胀 ⚡」→ 猜峰值通胀 → 揭示 13.5% + 失业 5.8% 同存。',
          '💡 Switch to "1979 Stagflation ⚡" → predict peak inflation → reveal 13.5% inflation + 5.8% unemployment together.'
        )}
      </Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
