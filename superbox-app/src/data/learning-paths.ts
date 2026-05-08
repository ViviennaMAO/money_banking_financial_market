/* 模块化学习地图
 *
 * 打乱原教材 25 章顺序,按"现代学习者真正需要的思维模块"重组。
 * 每条路径内章节的"逻辑顺序" ≠ 教材顺序,但更适合从一个具体问题出发。
 *
 * 设计原则:
 * - 每条路径只解决一个"统一问题",有明确入口、出口
 * - 路径长度控制在 3-6 章,可一两周内吃透
 * - 同一章可出现在多条路径(角色不同)
 * - 路径标签:level / theme / minutes / outcome
 */

export interface PathNode {
  ch: number               // 章号
  role: string             // 这一章在该路径中的角色,例如"地基""工具""转折"
  role_en?: string
  why: string              // 一句话:为什么要在这条路径里读这一章
  why_en?: string
}

export interface LearningPath {
  id: string
  emoji: string
  title: string            // 路径名(以"问题"或"动词"开头)
  title_en?: string
  tag: string              // 短标签 e.g. 入门 · 6 章 · 60 min
  tag_en?: string
  level: 1 | 2 | 3 | 4 | 5 // 难度
  minutes: number          // 总分钟数
  hook: string             // 反预期诱饵
  hook_en?: string
  outcome: string          // 学完能做什么
  outcome_en?: string
  color: string            // 主题色 className
  nodes: PathNode[]
}

export const learningPaths: LearningPath[] = [
  /* ============ 路径 A · 新手 30 分钟入门 ============ */
  {
    id: 'starter',
    emoji: '🚀',
    title: '30 分钟搞懂金融市场是什么',
    title_en: 'Get the financial system in 30 minutes',
    tag: '入门 · 4 章 · 30 min',
    tag_en: 'Beginner · 4 chapters · 30 min',
    level: 1,
    minutes: 30,
    hook: '不学公式、不看曲线 — 4 章建立"为什么有银行 / 钱是什么 / 你和它的关系"',
    hook_en: 'No formulas, no curves — 4 chapters to grasp "why banks exist / what money is / how it touches you"',
    outcome: '能向不懂金融的朋友解释:为什么 Fed 一加息你就要换房贷',
    outcome_en: 'Explain to a non-finance friend: why a Fed hike forces you to refinance',
    color: 'path-blue',
    nodes: [
      { ch: 1, role: '动机', why: '把利率涨 1% 月供涨 41% 这种切肤之痛先建立起来' },
      { ch: 3, role: '货币', why: '搞清 M0/M1/M2 — 数字支付时代货币结构正在重构' },
      { ch: 2, role: '系统', why: '一张图看懂直接 vs 间接融资、为什么需要银行' },
      { ch: 10, role: '机构', why: '商行 / 投行 / 影子银行 / MMF — 真实金融生态' }
    ]
  },

  /* ============ 路径 B · 债券手 / 利率思维 ============ */
  {
    id: 'rates',
    emoji: '📈',
    title: '把"利率"变成你的第六感',
    title_en: 'Make \'interest rate\' your sixth sense',
    tag: '核心 · 5 章 · 60 min',
    tag_en: 'Core · 5 chapters · 60 min',
    level: 3,
    minutes: 60,
    hook: '2022 长债 ETF -31% 不是黑天鹅 — 是久期数学的必然',
    hook_en: '2022 long-bond ETF -31% wasn\'t a black swan — it was the necessary math of duration',
    outcome: '看到收益率曲线倒挂,能立刻判断:衰退,还是这次不一样',
    outcome_en: 'See an inverted yield curve and instantly judge: recession, or this time different?',
    color: 'path-amber',
    nodes: [
      { ch: 4, role: '地基', why: '现值、到期收益率、费雪方程 — 利率工具箱' },
      { ch: 5, role: '机制', why: '可贷资金 vs 流动性偏好 — 利率为什么会动' },
      { ch: 6, role: '形状', why: '收益率曲线为什么倒挂 / 何时不再灵' },
      { ch: 19, role: '深化', why: '货币数量论 · 凯恩斯 · 弗里德曼 — V 在不同时代的角色' },
      { ch: 7, role: '应用', why: '股票定价里 r 是什么 — 把利率思维带到风险资产' }
    ]
  },

  /* ============ 路径 C · 银行 / 危机 ============ */
  {
    id: 'banking',
    emoji: '🏦',
    title: '一家银行是怎样倒下的',
    title_en: 'How a bank actually goes down',
    tag: '深度 · 5 章 · 65 min',
    tag_en: 'Deep · 5 chapters · 65 min',
    level: 4,
    minutes: 65,
    hook: 'SVB 在 Basel III 下"完全合规"却 48 小时归零 — 监管永远落后于现实',
    hook_en: 'SVB was "fully Basel III compliant" yet vanished in 48 hours — regulation always lags reality',
    outcome: '看到任何银行报表能识别:HTM 浮亏 / 流动性错配 / TBTF 风险',
    outcome_en: 'Read any bank balance sheet and spot: HTM unrealized losses / liquidity mismatch / TBTF risk',
    color: 'path-red',
    nodes: [
      { ch: 8, role: '理论', why: '信息不对称 / 逆向选择 / 道德风险 — 危机的发动机' },
      { ch: 9, role: '机制', why: '资产负债 + 流动性管理 — SVB 怎么死的' },
      { ch: 11, role: '边界', why: 'Basel + 存款保险 + TBTF — 监管能管什么、不能管什么' },
      { ch: 10, role: '生态', why: '影子银行 vs 商行 — 资金为什么会逃' },
      { ch: 12, role: '总结', why: '危机三阶段 · 2008/2020/2023 三案例对比' }
    ]
  },

  /* ============ 路径 D · 央行工具箱 ============ */
  {
    id: 'fed-toolkit',
    emoji: '🔧',
    title: '走进 FOMC:Fed 怎样动手',
    title_en: 'Inside FOMC: how the Fed actually moves',
    tag: '深度 · 4 章 · 50 min',
    tag_en: 'Deep · 4 chapters · 50 min',
    level: 4,
    minutes: 50,
    hook: '2019.9 REPO 飙到 10% — 货币政策最尖锐的工具,失控只用 3 小时',
    hook_en: '2019.9 REPO spiked to 10% — even the sharpest tool can lose control in 3 hours',
    outcome: '能区分 IORB / SRF / ON RRP / OMO,知道 Fed 加息的"真实操作流程"',
    outcome_en: 'Distinguish IORB / SRF / ON RRP / OMO and know the Fed\'s real operational sequence',
    color: 'path-purple',
    nodes: [
      { ch: 13, role: '组织', why: 'FOMC 决策机制 + 央行独立性 — 谁说了算' },
      { ch: 14, role: '机制', why: '货币乘数 m=(1+c)/(r+e+c) — 印钱 ≠ 货币扩张' },
      { ch: 15, role: '工具', why: 'OMO / IORB / SRF / ON RRP 利率走廊 — 一线工具' },
      { ch: 16, role: '战略', why: '泰勒规则 · FAIT — 工具背后的决策原则' }
    ]
  },

  /* ============ 路径 E · 国际金融 ============ */
  {
    id: 'international',
    emoji: '🌏',
    title: '汇率背后的物理定律',
    title_en: 'The physics of exchange rates',
    tag: '深度 · 3 章 · 40 min',
    tag_en: 'Deep · 3 chapters · 40 min',
    level: 4,
    minutes: 40,
    hook: '2024.8 USD/JPY 三周从 162→142,10x 杠杆 -100% — 套息可不是稳定收益',
    hook_en: '2024.8 USD/JPY 162→142 in 3 weeks, 10x carry → -100% — carry isn\'t free lunch',
    outcome: '能用 IRP + 三元悖论分析任何汇率剧变事件',
    outcome_en: 'Use IRP + the impossible trinity to dissect any FX shock',
    color: 'path-cyan',
    nodes: [
      { ch: 17, role: '机制', why: 'IRP + 套息 + 三元悖论 — 汇率思维的地基' },
      { ch: 18, role: '体系', why: '美元体系 + Fed swap line — 全球金融的隐形血管' },
      { ch: 21, role: '联动', why: '财政 + 货币组合,如 1981 里根+沃尔克 → USD 飙 50%' }
    ]
  },

  /* ============ 路径 F · 宏观模型 ============ */
  {
    id: 'macro',
    emoji: '📐',
    title: 'IS-LM-AD-AS:把经济画成 4 条线',
    title_en: 'IS-LM-AD-AS: the economy in 4 lines',
    tag: '高阶 · 4 章 · 60 min',
    tag_en: 'Advanced · 4 chapters · 60 min',
    level: 5,
    minutes: 60,
    hook: '2008 QE 历史模型预测通胀 5-10%,实际 1.7% — 卢卡斯批判活案例',
    hook_en: '2008 QE: historical models said 5-10% inflation, actual 1.7% — Lucas critique alive',
    outcome: '能用 4 条线分析任何政策冲击(降息 / 财扩 / 油价飙)',
    outcome_en: 'Use 4 lines to analyze any policy shock (cut / fiscal / oil spike)',
    color: 'path-indigo',
    nodes: [
      { ch: 20, role: '骨架', why: '产品市场 + 货币市场均衡 — IS/LM 两条线' },
      { ch: 21, role: '政策', why: '货币 + 财政 → 挤出 / 政策冲突' },
      { ch: 22, role: '总量', why: 'AD/AS — 把价格水平加进来' },
      { ch: 25, role: '反思', why: '卢卡斯批判 · 时间不一致性 — 模型的边界' }
    ]
  },

  /* ============ 路径 G · 通胀与传导 ============ */
  {
    id: 'inflation',
    emoji: '🔥',
    title: '通胀的根源:9.1% 是怎么来的',
    title_en: 'Roots of inflation: where did 9.1% come from',
    tag: '深度 · 4 章 · 55 min',
    tag_en: 'Deep · 4 chapters · 55 min',
    level: 5,
    minutes: 55,
    hook: '2022 通胀 9.1%,泰勒说 13%+,Fed 实际 1.25% — 1980 来最大滞后',
    hook_en: '2022 CPI 9.1%, Taylor said 13%+, Fed only 1.25% — biggest lag since 1980',
    outcome: '能拆解任何一次通胀:供给冲击 / 需求 / 预期 / 工资-物价',
    outcome_en: 'Decompose any inflation episode: supply shock / demand / expectations / wage-price',
    color: 'path-orange',
    nodes: [
      { ch: 24, role: '总论', why: '通胀根源 · 大缓和 · FAIT — 4 机制叠加' },
      { ch: 23, role: '传导', why: '5 渠道:利率/资产/信贷/资产负债表/财富' },
      { ch: 16, role: '规则', why: '泰勒规则会怎么说 — 数学 vs 现实裁量' },
      { ch: 22, role: '模型', why: 'AD-AS 解释 1979 滞胀 — 菲利普斯曲线被打破' }
    ]
  },

  /* ============ 路径 H · 危机时间线 ============ */
  {
    id: 'crisis',
    emoji: '⚡',
    title: '5 场危机走一遍 — 历史是最好的教师',
    title_en: '5 crises in one walk — history is the best teacher',
    tag: '案例 · 5 章 · 70 min',
    tag_en: 'Cases · 5 chapters · 70 min',
    level: 4,
    minutes: 70,
    hook: '2020 疫情跳过阶段三 — Fed 极速救助打破米什金经典三阶段框架',
    hook_en: '2020 pandemic skipped Stage 3 — Fed\'s rapid rescue broke Mishkin\'s classic 3-stage frame',
    outcome: '看到任何危机苗头,能立刻判断"现在在第几阶段"',
    outcome_en: 'Spot any crisis seed and instantly judge: which stage are we at right now',
    color: 'path-rose',
    nodes: [
      { ch: 12, role: '总图', why: '危机三阶段 · 5 大案例时间线' },
      { ch: 8, role: '机制', why: '为什么会有挤兑、为什么信息不对称放大恐慌' },
      { ch: 9, role: '细节', why: 'SVB 案 — HTM 浮亏一夜击穿真实资本' },
      { ch: 11, role: '监管', why: 'Basel 为什么没拦住 — TBTF 死循环' },
      { ch: 18, role: '国际', why: '1992 英镑危机 — 三元悖论是物理定律' }
    ]
  },

  /* ============ 路径 I · 反预期速通 ============ */
  {
    id: 'counterintuitive',
    emoji: '🎯',
    title: '反预期 9 章 — 直觉错在哪里',
    title_en: 'Anti-intuition speedrun · 9 chapters where instinct is wrong',
    tag: '主题 · 9 章 · 90 min',
    tag_en: 'Theme · 9 chapters · 90 min',
    level: 3,
    minutes: 90,
    hook: '"教材怎么说"和"市场会怎么教你" — 这条路只走两者偏离最大的章',
    hook_en: '"What the textbook says" vs "what the market will teach" — only chapters where they diverge most',
    outcome: '把直觉的"应该"全部纠正,留下市场会确认的部分',
    outcome_en: 'Strip away your "shoulds" and keep only what the market confirms',
    color: 'path-violet',
    nodes: [
      { ch: 4, role: '债券', why: '"低风险" -31% — 久期是隐形杀手' },
      { ch: 6, role: '曲线', why: '24 个月倒挂无衰退 — 教科书第一次失败' },
      { ch: 7, role: '股市', why: 'dotcom 隐含 g > GDP — 数学早就说了泡沫' },
      { ch: 14, role: '货币', why: 'Fed 印万亿 M2 不动 — 乘数砸到 1.2' },
      { ch: 15, role: '工具', why: '2019.9 REPO 飙 10% — IORB 失控' },
      { ch: 16, role: '规则', why: '泰勒说 13% 实际 1.25% — 战略让位裁量' },
      { ch: 17, role: '汇率', why: '套息 -100% — 利差 ≠ 收益' },
      { ch: 23, role: '传导', why: 'QE 万亿复苏缓 — 5 渠道 3 个失效' },
      { ch: 25, role: '预期', why: 'QE 通胀 1.7% — 卢卡斯批判活在 2008' }
    ]
  }
]

/* ===== 主题分组 ===== */

export interface PathGroup {
  id: string
  title: string
  desc: string
  pathIds: string[]
}

export const pathGroups: PathGroup[] = [
  {
    id: 'foundation',
    title: '🌱 起步线',
    desc: '从 0 开始,30 分钟知道自己要学什么',
    pathIds: ['starter']
  },
  {
    id: 'core',
    title: '⚙️ 三大核心思维',
    desc: '利率、银行、央行 — 三个最重要的思维模块',
    pathIds: ['rates', 'banking', 'fed-toolkit']
  },
  {
    id: 'advanced',
    title: '🌐 进阶 · 国际与宏观',
    desc: '把视野扩展到全球 + 宏观模型',
    pathIds: ['international', 'macro', 'inflation']
  },
  {
    id: 'theme',
    title: '🎯 主题速通',
    desc: '危机时间线 / 反预期合集 — 跳出章节看大图',
    pathIds: ['crisis', 'counterintuitive']
  }
]

export function findPath(id: string): LearningPath | undefined {
  return learningPaths.find(p => p.id === id)
}
