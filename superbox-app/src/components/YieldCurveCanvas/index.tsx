import { Canvas } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { yieldAtTenor, spread2s10s } from '../../utils/formulas'
import { tokens } from '../../theme/tokens'

interface Props {
  shortEnd: number
  longEnd: number
  curveBow: number
}

const CANVAS_ID = 'yieldCurveCanvas'

export default function YieldCurveCanvas({ shortEnd, longEnd, curveBow }: Props) {
  useEffect(() => {
    const ctx = Taro.createCanvasContext(CANVAS_ID)
    const W = 320, H = 220
    const pad = { l: 36, r: 20, t: 20, b: 36 }

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
    ctx.beginPath()
    ctx.moveTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.stroke()

    // 坐标转换 · 期限 0-30 / 收益率 0-16
    const yMax = 16
    const tenorMax = 30
    const xScale = (t: number) => pad.l + Math.min(Math.max(t, 0), tenorMax) * (W - pad.l - pad.r) / tenorMax
    const yScale = (y: number) => (H - pad.b) - Math.min(Math.max(y, 0), yMax) * (H - pad.t - pad.b) / yMax

    // 期限刻度标签
    ctx.setFontSize(9)
    ctx.setFillStyle(tokens.textDim)
    const tenorMarks = [2, 5, 10, 20, 30]
    tenorMarks.forEach(t => {
      const x = xScale(t)
      ctx.fillText(`${t}Y`, x - 6, H - pad.b + 14)
    })

    // 收益率刻度
    for (let y = 0; y <= 16; y += 4) {
      ctx.fillText(`${y}%`, 4, yScale(y) + 3)
    }

    // 平滑曲线(取多点采样)
    const isInverted = spread2s10s(shortEnd, longEnd, curveBow) < 0
    ctx.setStrokeStyle(isInverted ? tokens.danger : tokens.accent)
    ctx.setLineWidth(2.5)
    ctx.beginPath()
    const samples = 60
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * tenorMax
      const y = yieldAtTenor(shortEnd, longEnd, curveBow, t)
      if (i === 0) ctx.moveTo(xScale(t), yScale(y))
      else ctx.lineTo(xScale(t), yScale(y))
    }
    ctx.stroke()

    // 关键期限点
    const keyTenors = [2, 5, 10, 30]
    const colors = [tokens.warn, tokens.accent, tokens.danger, tokens.success]
    keyTenors.forEach((t, i) => {
      const y = yieldAtTenor(shortEnd, longEnd, curveBow, t)
      const cx = xScale(t)
      const cy = yScale(y)
      // 圆点
      ctx.setFillStyle(colors[i])
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fill()
      // 数值标签
      ctx.setFontSize(10)
      ctx.setFillStyle(colors[i])
      ctx.fillText(`${y.toFixed(1)}%`, cx + 6, cy - 6)
    })

    // 倒挂提示
    if (isInverted) {
      ctx.setFontSize(11)
      ctx.setFillStyle(tokens.danger)
      ctx.fillText('⚠ 倒挂', W - pad.r - 50, pad.t + 12)
    }

    ctx.draw()
  }, [shortEnd, longEnd, curveBow])

  return (
    <Canvas
      canvasId={CANVAS_ID}
      id={CANVAS_ID}
      style='width: 100%; height: 220px;'
    />
  )
}
