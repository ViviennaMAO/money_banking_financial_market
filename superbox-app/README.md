# 米什金互动学习 · Luffa SuperBox 小程序

基于 Taro 4 + React 18 + TypeScript 的 SuperBox 小程序,把三章 MVP(第 14 章货币乘数 / 第 17 章利率平价 / 第 20 章 IS-LM)从 prototype.html 翻译到原生小程序形态。

## 已实现

| 页面 | 路径 | 关键交互 |
|---|---|---|
| 首页 | `pages/home` | 三章入口 + 6 条学习科学锚点徽章 |
| 第 14 章 货币乘数 | `pages/ch14` | 4 滑块 + 4 历史快照 + 预测先行 + 反预期红闪 + 转发分享 |
| 第 17 章 套息交易 | `pages/ch17` | 4 滑块 + 5 历史快照 + 风险标签心跳 + 反预期 |
| 第 20 章 IS-LM | `pages/ch20` | Canvas 画 IS+LM 双线 + 5 历史快照 + 流动性陷阱模式自动呈现 |
| 新闻三联单 | `pages/news` | BOJ 加息样板 + L1 直觉答题 |
| 前测 | `pages/quiz` | 3 题不揭晓答案 |

## 技术栈

- Taro 4.0.9(目标 weapp 平台,SuperBox 兼容)
- React 18 + TypeScript 5
- Sass + 暗色主题(对照 prototype.html v1)
- Canvas 2D(IS-LM 沙盘)
- `Taro.useShareAppMessage` 接入分享(基础版)

## 编译产物

```
dist/                       448 KB(远小于 SuperBox 通常 2MB 上限)
├── app.js / app.json / app.wxss
├── pages/{home,ch14,ch17,ch20,news,quiz}/
│   ├── index.wxml / index.js / index.wxss / index.json
├── comp.* / base.* / vendors.* / runtime.* / taro.*
└── project.config.json
```

## SuperBox IDE 导入步骤

```
1. 打开 SuperBox IDE
2. 导入项目 → 选择 dist/ 目录
3. 项目类型:小程序
4. AppId:用 `touristappid` 或你的真实 AppId
5. 编译运行 → 模拟器看效果
6. 真机测试:扫码或推送到手机
```

> 注:`project.config.json` 已包含基础配置,可在 IDE 里调整。

## 重新编译

```bash
cd superbox-app

# 安装(已完成,无需再跑)
# npm install

# 重新编译 weapp(改完 src/ 后)
npm run build:weapp

# 监听模式(开发用)
npm run dev:weapp

# H5 调试模式(浏览器里调)
npm run dev:h5
```

## 已知差异 vs prototype.html

| 维度 | prototype | SuperBox |
|---|---|---|
| DOM | `<div>`、`<span>` | `<View>`、`<Text>`(Taro 自动转 WXML)|
| 滑块 | `<input type="range">` + Tailwind | Taro `<Slider>` 原生 |
| SVG 图表 | 第 20 章 SVG | **改 Canvas**(SuperBox WXML 不支持 SVG 拖拽)|
| 弹窗 | absolute div + Tailwind | `<View>` 浮层 + SCSS |
| 分享 | 无 | `Taro.useShareAppMessage` 接入 |

视觉一致性:**色板、间距、字号、动画时长**都对照 prototype 的 v1 实际值。Canvas 实现的 IS-LM 沙盘视觉略有简化但核心(双线 + 均衡点 + 陷阱模式)完整。

## 真机测试 checklist(交付时跑)

- [ ] iOS 真机滑块拖拽 ≥ 30fps
- [ ] Android 真机 Canvas 重绘流畅
- [ ] 切换 2010 / 2024-8 / 2010 三个反预期快照,弹窗正常
- [ ] 红闪动画在真机上正常触发
- [ ] `Taro.useShareAppMessage` 转发能弹出分享菜单
- [ ] 暗色背景在两端一致(SuperBox 不会反白)

## 仍待补的(v0.2)

| 功能 | 来源 | 工作量 |
|---|---|---|
| 自解释 AI 评分(§2.9) | [02 §2.9] | 2 人日(后端 LLM 接入) |
| 教别人评分(§3.7) | [02 §3.7] | 同上 |
| 完整闯关测验 | [08] 题库 | 3 人日(题库 + 错题诊断) |
| 看板因子接入 | [11] 数据 pipeline | 5 人日 |
| Channel / 群组功能 | 等 Luffa BD 答 Q-A | 待 |

> 当前是 PoC v0:**6 页面跑通 + 三章模拟器核心交互完整**,验证了 Taro → SuperBox 的可行性。下一步基于真机反馈决定先做 LLM 评分还是题库联调。

## 文件统计

```
src/
├── app.config.ts / app.tsx / app.scss
├── theme/tokens.ts                    # 色板常量
├── utils/
│   ├── formulas.ts                    # 三章公式(纯函数,无 React)
│   └── snapshots.ts                   # 历史快照数据 + 预测/反预期定义
├── services/luffa.ts                  # wx.* 封装(login / share / push)
├── components/
│   ├── PredictModal/                  # 预测先行弹窗
│   ├── RevealModal/                   # 反预期揭示弹窗
│   ├── SnapshotBar/                   # 历史快照按钮组
│   ├── SliderRow/                     # 滑块行(label + value + slider)
│   └── ISLMCanvas/                    # IS-LM Canvas 绘图
└── pages/{home,ch14,ch17,ch20,news,quiz}/
    ├── index.tsx
    ├── index.config.ts
    └── index.scss
```

源码 ~1500 行,编译产物 448K。

---

*v0 · 2026-04-30*
