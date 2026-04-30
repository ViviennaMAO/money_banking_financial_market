# Taro PoC 脚手架

> **目的**:把 [prototype.html](../prototype.html) 翻译成 Taro 项目骨架。工程师 clone 之后,**第一周内能跑通"第 14 章乘数模拟器在 SuperBox 真机上的 happy path"**——这是 PoC 的成功标准。
> **不在范围**:完整三章功能。PoC 只做**第 14 章 + 一个 Canvas 示范(IS-LM 简化版)**,验证最关键的技术风险。
> **关键技术验证点**:Taro 编译 → SuperBox / iOS JIT 性能 / Canvas 重绘流畅度 / wx.showShareMenu 真机效果。

---

## 1. 创建项目

```bash
# Taro 4.x 已稳定,小程序生态对 wx.* 兼容好
npx @tarojs/cli@latest init mishkin-app

# 选项:
#  - 框架: React
#  - TypeScript: Yes
#  - CSS 预处理: Sass
#  - 模板: 默认

cd mishkin-app
pnpm install
pnpm add zustand @tanstack/react-query immer
pnpm add -D @types/wechat-miniprogram   # wx.* 类型声明,SuperBox 兼容
```

关键 `package.json` 依赖确认:

```json
{
  "dependencies": {
    "@tarojs/components": "4.x",
    "@tarojs/runtime": "4.x",
    "@tarojs/taro": "4.x",
    "@tarojs/plugin-framework-react": "4.x",
    "react": "18.x",
    "zustand": "5.x",
    "@tanstack/react-query": "5.x",
    "immer": "10.x"
  },
  "scripts": {
    "dev:weapp": "taro build --type weapp --watch",
    "dev:h5": "taro build --type h5 --watch",
    "build:weapp": "taro build --type weapp",
    "build:h5": "taro build --type h5"
  }
}
```

> **关键判断**:SuperBox 文档里只提到 `wx.*` API,实测时**先用 `taro build --type weapp` 编译微信小程序产物,再放到 SuperBox IDE 里测试**。如果 IDE 接受,说明字节码兼容;如果不接受,联系 Luffa BD 拿 SuperBox 专用编译目标。这个验证必须在 PoC 第 1 天做。

---

## 2. 项目目录结构

```
mishkin-app/
├── config/
│   └── index.ts                  # Taro 编译配置
├── src/
│   ├── app.config.ts             # 小程序全局配置(类 app.json)
│   ├── app.tsx                   # 根组件
│   ├── app.scss                  # 全局样式(暗色主题变量)
│   ├── pages/
│   │   ├── home/
│   │   │   ├── index.tsx
│   │   │   ├── index.config.ts
│   │   │   └── index.module.scss
│   │   ├── ch14/                 # 货币乘数(PoC P0)
│   │   ├── ch17/                 # 套息(PoC 不做)
│   │   ├── ch20/                 # IS-LM(PoC 做 Canvas 示范)
│   │   ├── news/
│   │   └── quiz/
│   ├── components/
│   │   ├── SimulatorShell/       # 通用模拟器壳(预测/挑战/自解释)
│   │   ├── SnapshotBar/
│   │   ├── PredictModal/
│   │   ├── RevealModal/
│   │   └── ISLMCanvas/           # Canvas 示范
│   ├── services/
│   │   ├── luffa.ts              # wx.* 封装(见 [05] §6)
│   │   └── api.ts                # 后端通信
│   ├── stores/
│   │   ├── userStore.ts          # 用户档案 + 元认知
│   │   └── predictStore.ts       # 前测/预测/反预期数据
│   ├── utils/
│   │   ├── formulas.ts           # 三章公式纯函数(脱离 React)
│   │   └── snapshots.ts          # 历史快照数据
│   └── theme/
│       └── tokens.ts             # 颜色 / 字号 / 间距常量
├── package.json
└── tsconfig.json
```

---

## 3. 关键文件:全局配置

### 3.1 `src/app.config.ts`

```typescript
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/ch14/index',
    'pages/ch17/index',
    'pages/ch20/index',
    'pages/news/index',
    'pages/quiz/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0a0e1a',
    navigationBarTitleText: '米什金互动学习',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0a0e1a',
  },
  // 自定义 tabBar(底部导航)
  tabBar: {
    color: '#8b8fa8',
    selectedColor: '#3b82f6',
    backgroundColor: '#131826',
    list: [
      { pagePath: 'pages/home/index', text: '首页', iconPath: 'assets/home.png', selectedIconPath: 'assets/home-active.png' },
      { pagePath: 'pages/news/index', text: '新闻', iconPath: 'assets/news.png', selectedIconPath: 'assets/news-active.png' },
    ]
  },
  // 暗色主题
  themeLocation: 'theme.json',
})
```

### 3.2 `src/theme/tokens.ts`(对照 prototype.html 的色板)

```typescript
export const tokens = {
  bg: '#0a0e1a',
  bg2: '#131826',
  bg3: '#1c2236',
  text: '#e6edf3',
  textDim: '#8b8fa8',
  accent: '#3b82f6',
  warn: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  purple: '#a78bfa',
  cyan: '#06b6d4',
} as const

export type ColorKey = keyof typeof tokens
```

---

## 4. 关键文件:第 14 章模拟器(完整 Taro 版)

### 4.1 `src/utils/formulas.ts`(纯函数,无 React 依赖)

```typescript
// 货币乘数:m = (1+c) / (r+e+c)
export function moneyMultiplier(r: number, e: number, c: number): number {
  const denom = r + e + c
  if (denom < 0.001) return Infinity
  return (1 + c) / denom
}

export function m2(mb: number, r: number, e: number, c: number): number {
  return mb * moneyMultiplier(r, e, c)
}

// 套息交易回报
export function carryReturn(id: number, ifv: number, dsPercent: number, leverage: number) {
  const carry = (id - ifv) / 4   // 季度化
  const ret = carry + dsPercent
  return {
    carry,
    dsLoss: dsPercent,
    nominal: ret,
    leveraged: ret * leverage,
    breakeven: -carry,
  }
}

// IS-LM 均衡
export function islmEquilibrium(a: number, b: number, c: number, d: number) {
  let i_star = (a - c) / (b + d)
  if (i_star >= 0) return { i_star, Y_star: c + d * i_star, trap: false }
  return { i_star: 0, Y_star: a, trap: true }
}
```

### 4.2 `src/utils/snapshots.ts`

```typescript
export interface PredictDef {
  title: string
  question: string
  options: string[]
  correctIdx: number
  revealHeadline: string
  revealMsg: string
}

export interface Ch14Snapshot {
  mb: number; r: number; e: number; c: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch14Snapshots: Record<string, Ch14Snapshot> = {
  '2007': { mb: 0.85, r: 10, e: 0.04, c: 7, note: '2007.8 危机前:乘数 ≈ 8.7。正常时期。' },
  '2010': {
    mb: 2.0, r: 10, e: 80, c: 8,
    note: '⚠️ 2010.1 QE 后:乘数从 8.7 砸到 1.2!Fed 注入的钱卡在准备金里。',
    flash: true,
    predict: {
      title: '你即将切换到「2010.1 QE 后」',
      question: 'Fed QE 把 MB 从 0.85T 推到 2.0T,乘数 m 会变成多少?',
      options: ['跟现在差不多(5 左右)', '涨到 10+', '暴跌到 1-2'],
      correctIdx: 2,
      revealHeadline: '真实 m = 1.2',
      revealMsg: '超额准备金 e 从 0.04% 飙到 80%——Fed 印的钱卡在银行系统。这就是为什么万亿 QE 没引发 1970s 式恶性通胀。',
    }
  },
  '2020': { mb: 4.8, r: 0, e: 18, c: 9, note: '2020.4 疫情:无 r 时代,但 e 仍是大头。' },
  'today': { mb: 5.5, r: 0, e: 12, c: 8, note: '今天:QT 进行中,e 缓慢下降,M2 增速回升。' },
}
```

### 4.3 `src/pages/ch14/index.tsx`

```tsx
import { View, Text, ScrollView, Slider, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { ch14Snapshots, type PredictDef } from '@/utils/snapshots'
import { moneyMultiplier, m2 } from '@/utils/formulas'
import PredictModal from '@/components/PredictModal'
import RevealModal from '@/components/RevealModal'
import { tokens } from '@/theme/tokens'
import styles from './index.module.scss'

export default function Ch14Page() {
  const [params, setParams] = useState({ mb: 5.5, r: 0, e: 12, c: 8 })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const m = moneyMultiplier(params.r/100, params.e/100, params.c/100)
  const totalM2 = m2(params.mb, params.r/100, params.e/100, params.c/100)

  function loadSnapshot(key: string) {
    const s = ch14Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch14Snapshots[key]
    setParams({ mb: s.mb, r: s.r, e: s.e, c: s.c })
    setNote(s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    setReveal({
      headline: (correct ? '✅ 内化了 · ' : '🎯 多数人都和你想的一样 · ') + predict.revealHeadline,
      msg: predict.revealMsg,
      correct,
    })
    setPredict(null)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingSnap) { applySnapshot(pendingSnap); setPendingSnap(null) }
  }

  // 转发分享(必须在 Page onShareAppMessage 钩子返回)
  Taro.useShareAppMessage(() => ({
    title: `第 14 章:乘数 = ${m.toFixed(2)}`,
    path: `/pages/ch14/index?preset=${params.mb},${params.r},${params.e},${params.c}`,
  }))

  // 进入页面时若 URL 有 preset 参数,应用它
  Taro.useDidShow(() => {
    const opts = Taro.getCurrentInstance().router?.params
    if (opts?.preset) {
      const [mb, r, e, c] = opts.preset.split(',').map(Number)
      setParams({ mb, r, e, c })
    }
  })

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>💱 货币乘数实验室</Text>
        <Text className={styles.chapter}>第 14 章</Text>
      </View>

      <View className={styles.snapBar}>
        {[
          { k: '2007', label: '2007.8 危机前' },
          { k: '2010', label: '2010.1 QE 后 ⚡', accent: 'danger' },
          { k: '2020', label: '2020.4 疫情' },
          { k: 'today', label: '今天', accent: 'primary' },
        ].map(s => (
          <Button key={s.k} className={`${styles.snapBtn} ${styles[s.accent || 'plain']}`} onClick={() => loadSnapshot(s.k)}>
            {s.label}
          </Button>
        ))}
      </View>

      <View className={styles.sliderPanel}>
        <SliderRow label="MB · 基础货币" value={params.mb} unit="$T" min={0.5} max={10} step={0.1}
          onChange={v => setParams(p => ({ ...p, mb: v }))} />
        <SliderRow label="r · 法准率" value={params.r} unit="%" min={0} max={20} step={0.5}
          onChange={v => setParams(p => ({ ...p, r: v }))} />
        <SliderRow label="e · 超储率" value={params.e} unit="%" min={0} max={80} step={0.5}
          onChange={v => setParams(p => ({ ...p, e: v }))} />
        <SliderRow label="c · 现金/存款" value={params.c} unit="%" min={0} max={30} step={0.5}
          onChange={v => setParams(p => ({ ...p, c: v }))} />
      </View>

      <View className={`${styles.output} ${flash ? styles.flash : ''}`}>
        <View className={styles.outputRow}>
          <View>
            <Text className={styles.label}>乘数 m</Text>
            <Text className={styles.bigNum}>{m.toFixed(2)}</Text>
          </View>
          <View>
            <Text className={styles.label}>M2 理论值</Text>
            <Text className={styles.bigNum}>${totalM2.toFixed(1)}T</Text>
          </View>
        </View>
        {note && <Text className={styles.note}>{note}</Text>}
      </View>

      {predict && <PredictModal def={predict} onAnswer={onPredictAnswer} />}
      {reveal && <RevealModal headline={reveal.headline} msg={reveal.msg} onClose={onRevealClose} />}
    </ScrollView>
  )
}

// 内联子组件
function SliderRow(props: { label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <View className={styles.sliderRow}>
      <View className={styles.sliderHeader}>
        <Text>{props.label}</Text>
        <Text className={styles.sliderValue}>{props.value.toFixed(props.step < 1 ? 1 : 0)}{props.unit}</Text>
      </View>
      <Slider min={props.min} max={props.max} step={props.step} value={props.value}
        activeColor={tokens.accent} backgroundColor={tokens.bg3} blockColor={tokens.accent}
        onChanging={(e) => props.onChange(e.detail.value)} />
    </View>
  )
}
```

### 4.4 `src/components/PredictModal/index.tsx`

```tsx
import { View, Text, Button } from '@tarojs/components'
import type { PredictDef } from '@/utils/snapshots'
import styles from './index.module.scss'

export default function PredictModal(props: { def: PredictDef; onAnswer: (idx: number) => void }) {
  return (
    <View className={styles.overlay}>
      <View className={styles.modal}>
        <Text className={styles.tag}>🎯 预测先行 · 生成效应</Text>
        <Text className={styles.title}>{props.def.title}</Text>
        <Text className={styles.question}>{props.def.question}</Text>
        <View className={styles.options}>
          {props.def.options.map((opt, i) => (
            <Button key={i} className={styles.option} onClick={() => props.onAnswer(i)}>{opt}</Button>
          ))}
        </View>
        <Text className={styles.hint}>猜对猜错都给反馈,被打脸是学习时刻</Text>
      </View>
    </View>
  )
}
```

---

## 5. 关键示范:第 20 章 IS-LM 用 Canvas

prototype.html 用 SVG。在 Taro 里 SVG 受限,**改用 Canvas 重绘**。这是整个 PoC 最重要的技术验证——如果 Canvas 不流畅,IS-LM 沙盘就要降级用 H5 嵌套。

### 5.1 `src/components/ISLMCanvas/index.tsx`

```tsx
import { Canvas } from '@tarojs/components'
import { useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { islmEquilibrium } from '@/utils/formulas'
import { tokens } from '@/theme/tokens'

export default function ISLMCanvas(props: { a: number; b: number; c: number; d: number }) {
  const canvasId = 'islmCanvas'

  useEffect(() => {
    draw()
  }, [props.a, props.b, props.c, props.d])

  function draw() {
    const ctx = Taro.createCanvasContext(canvasId)
    const W = 320, H = 220
    const pad = { l: 30, r: 20, t: 20, b: 40 }

    // 网格
    ctx.setStrokeStyle(tokens.bg3)
    ctx.setLineWidth(0.5)
    for (let i = 0; i < 10; i++) {
      const x = pad.l + (W - pad.l - pad.r) * i / 9
      ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, H - pad.b); ctx.stroke()
    }

    // 轴
    ctx.setStrokeStyle('#5a6280'); ctx.setLineWidth(1)
    ctx.beginPath(); ctx.moveTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.stroke()

    // 坐标转换
    const xScale = (Y: number) => pad.l + Math.min(Math.max(Y, 0), 30) * (W - pad.l - pad.r) / 30
    const yScale = (i: number) => (H - pad.b) - Math.min(Math.max(i, 0), 12) * (H - pad.t - pad.b) / 12

    const { a, b, c, d } = props

    // IS:i = (a - Y) / b
    ctx.setStrokeStyle(tokens.accent); ctx.setLineWidth(2)
    ctx.beginPath()
    const isI0 = a / b
    if (isI0 > 12) {
      ctx.moveTo(xScale(a - 12 * b), yScale(12))
    } else {
      ctx.moveTo(xScale(0), yScale(isI0))
    }
    ctx.lineTo(xScale(a), yScale(0))
    ctx.stroke()

    // LM:水平段 + 上斜段
    ctx.setStrokeStyle(tokens.warn); ctx.setLineWidth(2)
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
    ctx.setFontSize(10); ctx.setFillStyle(tokens.danger)
    ctx.fillText(eq.trap ? 'E* (陷阱)' : 'E*', xScale(eq.Y_star) + 8, yScale(eq.i_star) - 4)
    ctx.setFillStyle(tokens.accent); ctx.fillText('IS', xScale(a) + 5, yScale(0) - 4)
    ctx.setFillStyle(tokens.warn); ctx.fillText('LM', xScale(Math.min(c + 12 * d, 28)), yScale(11))

    ctx.draw()
  }

  return <Canvas canvasId={canvasId} id={canvasId} style="width: 320px; height: 220px;" />
}
```

**性能验证清单**(必须在 PoC 第 1 周做):

- [ ] iOS 真机滑块拖拽,Canvas 重绘 ≥ 30fps
- [ ] Android 真机 ≥ 50fps
- [ ] SuperBox IDE 模拟器无 console error
- [ ] 切换历史快照动画无卡顿
- [ ] 如果 iOS < 20fps:用 `wx.createOffscreenCanvas` 双缓冲;仍不行 → IS-LM 降级用 webview 嵌套 H5

---

## 6. wx.* 服务封装

完整代码见 [05 §6](05_技术架构选型_v0.md)。这里只列 PoC 阶段需要先做的:

```typescript
// src/services/luffa.ts
import Taro from '@tarojs/taro'

export const luffa = {
  async login() {
    const { code } = await Taro.login()
    return code
  },
  async getUserProfile() {
    return await Taro.getUserProfile({ desc: '用于个性化学习路径分流' })
  },
  enableShare() {
    Taro.showShareMenu({
      withShareTicket: true,
      // @ts-ignore SuperBox 文档显示该字段
      showShareItems: ['LuffachatFriends', 'LuffachatMoment'],
    })
  },
  async subscribePush(templateIds: string[]) {
    return await Taro.requestSubscribeMessage({ tmplIds: templateIds })
  },
}
```

PoC 阶段只测 `enableShare` 和 `login`——其他等模板消息 ID、用户档案后端接口齐了再测。

---

## 7. PoC 验证清单(给工程师的 1 周交付)

### Week 1 必交付

| Day | 任务 | 验收 |
|---|---|---|
| 1 | `taro init` + 编译 weapp 产物 + 拖到 SuperBox IDE 试运行 | IDE 不报错,空白页加载成功 |
| 1 | 联系 Luffa BD,问 [05 §1.2] 的 Q-A(Channel) | 拿到答案 |
| 2 | home / ch14 两个页面跑通,样式对照 prototype.html v0 | 视觉与 prototype 一致 |
| 3 | 接入 SliderRow + Snapshot + 公式纯函数 | 点滑块实时算 m / M2 |
| 4 | PredictModal + RevealModal,接入 2010 快照预测先行 | 反预期流程跑通 |
| 5 | ISLMCanvas 接入第 20 章页面 | Canvas 在 iOS 真机帧率 ≥ 30 |
| 5 | wx.showShareMenu + onShareAppMessage 测分享 | 实际能转到 Luffa 好友列表 |
| 5 | 提交 PoC 报告 | 见下 §8 |

### PoC 不在范围(Week 2+ 才做)

- 第 17 章模拟器 / 完整 RAG / 后端 API / 题库 / 新闻三联单
- 用户认证 / 数据持久化 / 推送
- 其他 Luffa SDK 深度集成

---

## 8. PoC 报告模板(Week 1 末提交)

```markdown
# PoC 验证报告

## 通过 / 不通过 矩阵

| 风险点 | 状态 | 证据 |
|---|---|---|
| Taro 编译产物在 SuperBox 运行 | ✅ / ❌ | 截图 / 错误日志 |
| iOS Canvas 重绘 fps | ___ fps | Performance 截图 |
| Android Canvas 重绘 fps | ___ fps | 同上 |
| 滑块拖拽流畅度(主观) | 流畅 / 卡顿 | 视频 |
| wx.showShareMenu 转发到 Luffa 好友 | ✅ / ❌ | 截图 |
| Luffa BD 答 Q-A(Channel) | 有 / 无 / 部分 | 邮件截图 |

## Go / No-Go 决策

- 全 ✅:进入 Week 2 全功能开发
- iOS Canvas < 20 fps:IS-LM 降级用 webview + H5
- Taro 编译失败:联系 Luffa 技术拿专用编译模板,或考虑原生 WXML
- Q-A 通过:启动"读书会"功能开发
- Q-A 未通过:延后 Channel 功能,只做"分享给好友"

## 建议
[工程师写]
```

---

## 9. 与 prototype.html 的差异(给评审看)

| 维度 | prototype.html | Taro 实际 |
|---|---|---|
| DOM | `<div>`、`<span>` | `<View>`、`<Text>` |
| 样式 | Tailwind 类 | SCSS Module + tokens |
| 状态 | useState | useState + Zustand(全局) |
| 滑块 | `<input type="range">` | `<Slider>` |
| 弹窗 | absolute div | View + 高 z-index 浮层 |
| SVG | 原生 SVG | Canvas API |
| 路由 | anchor (#ch14) | Taro.navigateTo |
| 分享 | 无 | wx.showShareMenu + onShareAppMessage |

视觉 100% 可复刻——色板、间距、字号、动画时长都从 [theme/tokens.ts] 引用 prototype 的实际值。

---

## 10. 长期演进路线(Week 2+,供参考)

```
Week 2:  ch17 + ch20 完整功能 + 后端 API 接入
Week 3:  RAG 知识库 + AI 答疑 + 题库前 30 道
Week 4:  新闻三联单 + 看板联动 + 间隔复习
Week 5:  整体联调 + iOS/Android 真机测试 + 性能调优
Week 6:  内测发布 100 用户 → 收集前测/后测数据
Week 7:  基于数据迭代题库 / 误区 / 微课
Week 8:  正式发布
```

---

*v0 草稿。等 PoC 报告回来后我们更新这份文档:把"待验证"标记替换为真实数据,把"假设性的降级方案"替换为执行方案。*
