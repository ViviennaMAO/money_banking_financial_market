import { Canvas } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { adasEquilibrium } from '../../utils/formulas'
import { tokens } from '../../theme/tokens'

interface Props {
  adShift: number
  srasShift: number
  potentialY: number
}

const CANVAS_ID = 'adasCanvas'

export default function ADASCanvas({ adShift, srasShift, potentialY }: Props) {
  useEffect(() => {
    const ctx = Taro.createCanvasContext(CANVAS_ID)
    const W = 320, H = 240
    const pad = { l: 38, r: 20, t: 20, b: 38 }

    // 网格
    ctx.setStrokeStyle(tokens.bg3)
    ctx.setLineWidth(0.5)
    for (let i = 0; i <= 6; i++) {
      const y = pad.t + (H - pad.t - pad.b) * i / 6
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke()
    }

    // 轴
    ctx.setStrokeStyle('#5a6280')
    ctx.setLineWidth(1)
    ctx.beginPath(); ctx.moveTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.stroke()

    // 坐标转换 · Y∈[80,120], P∈[0,15]
    const yMin = 80, yMax = 120, pMin = 0, pMax = 15
    const xScale = (Y: number) => pad.l + (Math.min(Math.max(Y, yMin), yMax) - yMin) / (yMax - yMin) * (W - pad.l - pad.r)
    const yScale = (P: number) => (H - pad.b) - (Math.min(Math.max(P, pMin), pMax) - pMin) / (pMax - pMin) * (H - pad.t - pad.b)

    // 刻度
    ctx.setFontSize(9)
    ctx.setFillStyle(tokens.textDim)
    for (let Y = 90; Y <= 120; Y += 10) {
      ctx.fillText(`${Y}`, xScale(Y) - 8, H - pad.b + 14)
    }
    for (let P = 0; P <= 15; P += 5) {
      ctx.fillText(`${P}`, 4, yScale(P) + 3)
    }
    ctx.fillText('Y', W - 14, H - pad.b + 14)
    ctx.fillText('P', pad.l - 12, pad.t + 4)

    // AD 曲线: Y = 100 + 5*adShift - 1.5*P
    // 反解: P = (100 + 5*adShift - Y) / 1.5
    ctx.setStrokeStyle(tokens.accent)
    ctx.setLineWidth(2.5)
    ctx.beginPath()
    const y_at_p0 = 100 + 5 * adShift - 1.5 * 0
    const y_at_pmax = 100 + 5 * adShift - 1.5 * pMax
    ctx.moveTo(xScale(y_at_p0), yScale(0))
    ctx.lineTo(xScale(y_at_pmax), yScale(pMax))
    ctx.stroke()

    // SRAS 曲线: P = 4 + srasShift + 0.3*(Y - 100)
    ctx.setStrokeStyle(tokens.warn)
    ctx.setLineWidth(2.5)
    ctx.beginPath()
    const p_sras_y_min = 4 + srasShift + 0.3 * (yMin - 100)
    const p_sras_y_max = 4 + srasShift + 0.3 * (yMax - 100)
    ctx.moveTo(xScale(yMin), yScale(p_sras_y_min))
    ctx.lineTo(xScale(yMax), yScale(p_sras_y_max))
    ctx.stroke()

    // LRAS: 垂直线在 potentialY
    ctx.setStrokeStyle(tokens.success)
    ctx.setLineWidth(2.5)
    ctx.setLineDash?.([6, 4])
    ctx.beginPath()
    ctx.moveTo(xScale(potentialY), yScale(0))
    ctx.lineTo(xScale(potentialY), yScale(pMax))
    ctx.stroke()
    ctx.setLineDash?.([])

    // 短期均衡点
    const eq = adasEquilibrium(adShift, srasShift, potentialY)
    if (eq.shortP >= pMin && eq.shortP <= pMax && eq.shortY >= yMin && eq.shortY <= yMax) {
      ctx.setFillStyle(tokens.danger)
      ctx.beginPath()
      ctx.arc(xScale(eq.shortY), yScale(eq.shortP), 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.setFontSize(9)
      ctx.setFillStyle(tokens.danger)
      ctx.fillText('E*', xScale(eq.shortY) + 8, yScale(eq.shortP) - 4)
    }

    // 标签
    ctx.setFontSize(10)
    ctx.setFillStyle(tokens.accent)
    ctx.fillText('AD', xScale(y_at_pmax) + 4, yScale(pMax) + 12)
    ctx.setFillStyle(tokens.warn)
    ctx.fillText('SRAS', xScale(yMax) - 28, yScale(p_sras_y_max) - 4)
    ctx.setFillStyle(tokens.success)
    ctx.fillText('LRAS', xScale(potentialY) + 4, pad.t + 12)

    ctx.draw()
  }, [adShift, srasShift, potentialY])

  return (
    <Canvas
      canvasId={CANVAS_ID}
      id={CANVAS_ID}
      style='width: 100%; height: 240px;'
    />
  )
}
