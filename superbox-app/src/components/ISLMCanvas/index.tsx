import { Canvas } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { islmEquilibrium } from '../../utils/formulas'
import { tokens } from '../../theme/tokens'

interface Props {
  a: number
  b: number
  c: number
  d: number
}

const CANVAS_ID = 'islmCanvas'

export default function ISLMCanvas({ a, b, c, d }: Props) {
  useEffect(() => {
    const ctx = Taro.createCanvasContext(CANVAS_ID)
    const W = 320, H = 220
    const pad = { l: 30, r: 20, t: 20, b: 40 }

    // 网格
    ctx.setStrokeStyle(tokens.bg3)
    ctx.setLineWidth(0.5)
    for (let i = 0; i < 10; i++) {
      const x = pad.l + (W - pad.l - pad.r) * i / 9
      ctx.beginPath()
      ctx.moveTo(x, pad.t)
      ctx.lineTo(x, H - pad.b)
      ctx.stroke()
    }

    // 轴
    ctx.setStrokeStyle('#5a6280')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(pad.l, H - pad.b)
    ctx.lineTo(W - pad.r, H - pad.b)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pad.l, pad.t)
    ctx.lineTo(pad.l, H - pad.b)
    ctx.stroke()

    // 坐标转换:Y∈[0,30] → x∈[30, 300];i∈[0,12] → y∈[180, 20]
    const xScale = (Y: number) => pad.l + Math.min(Math.max(Y, 0), 30) * (W - pad.l - pad.r) / 30
    const yScale = (i: number) => (H - pad.b) - Math.min(Math.max(i, 0), 12) * (H - pad.t - pad.b) / 12

    // IS 曲线:i = (a - Y) / b → 端点 (Y=0, i=a/b) 到 (Y=a, i=0)
    ctx.setStrokeStyle(tokens.accent)
    ctx.setLineWidth(2)
    ctx.beginPath()
    const isI0 = a / b
    if (isI0 > 12) {
      ctx.moveTo(xScale(a - 12 * b), yScale(12))
    } else {
      ctx.moveTo(xScale(0), yScale(isI0))
    }
    ctx.lineTo(xScale(Math.min(a, 30)), yScale(0))
    ctx.stroke()

    // LM 曲线:水平段 i=0 from Y=0 to Y=c,然后上斜段 i=(Y-c)/d
    ctx.setStrokeStyle(tokens.warn)
    ctx.setLineWidth(2)
    ctx.beginPath()
    ctx.moveTo(xScale(0), yScale(0))
    ctx.lineTo(xScale(Math.min(c, 30)), yScale(0))
    if (c < 30) {
      const Yend = Math.min(c + 12 * d, 30)
      const iend = (Yend - c) / d
      ctx.lineTo(xScale(Yend), yScale(iend))
    }
    ctx.stroke()

    // 均衡点
    const eq = islmEquilibrium(a, b, c, d)
    ctx.setFillStyle(eq.trap ? tokens.warn : tokens.danger)
    ctx.beginPath()
    ctx.arc(xScale(eq.Y_star), yScale(eq.i_star), 5, 0, Math.PI * 2)
    ctx.fill()

    // 标签
    ctx.setFontSize(10)
    ctx.setFillStyle(tokens.danger)
    ctx.fillText(eq.trap ? 'E* (陷阱)' : 'E*', xScale(eq.Y_star) + 8, yScale(eq.i_star) - 4)
    ctx.setFillStyle(tokens.accent)
    ctx.fillText('IS', xScale(Math.min(a, 28)) + 5, yScale(0) - 4)
    ctx.setFillStyle(tokens.warn)
    ctx.fillText('LM', xScale(Math.min(c + 6 * d, 28)) + 4, yScale(Math.min(6, ((Math.min(c + 6 * d, 30) - c) / d))) + 12)
    ctx.setFillStyle(tokens.textDim)
    ctx.fillText('Y', W - 12, H - pad.b + 4)
    ctx.fillText('i', pad.l - 18, pad.t + 4)

    ctx.draw()
  }, [a, b, c, d])

  return (
    <Canvas
      canvasId={CANVAS_ID}
      id={CANVAS_ID}
      style='width: 100%; height: 220px;'
    />
  )
}
