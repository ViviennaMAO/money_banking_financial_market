/* 词汇附录
 *
 * 米什金《货币金融学》第 11 版核心词条
 * 每条:中文 + 英文 + 一句定义 + 反预期一句 + 涉及章节
 */

export interface GlossaryItem {
  zh: string                // 中文术语
  en: string                // 英文术语
  short: string             // 一句话定义(≤ 40 字)
  twist?: string            // 反预期一句(可选)
  chapters: number[]        // 涉及章节
}

export interface GlossaryGroup {
  id: string
  title: string
  title_en?: string
  emoji: string
  desc: string
  desc_en?: string
  items: GlossaryItem[]
}

export const glossary: GlossaryGroup[] = [
  {
    id: 'money',
    title: '货币与支付',
    title_en: 'Money & Payments',
    emoji: '💵',
    desc: 'M0–M3、信用货币、数字支付',
    desc_en: 'M0–M3, credit money, digital payments',
    items: [
      { zh: '基础货币', en: 'Monetary base / MB', short: '现金 + 银行准备金,央行直接控制的部分',
        twist: 'Fed 印万亿 MB, M2 几乎没动 — 印钱 ≠ 货币扩张', chapters: [3, 14] },
      { zh: 'M1', en: 'M1', short: '现金 + 活期存款,流动性最强的货币层次',
        chapters: [3] },
      { zh: 'M2', en: 'M2', short: 'M1 + 储蓄存款 + 小额定期 — 最常用的货币总量指标',
        chapters: [3, 14, 19] },
      { zh: '货币乘数', en: 'Money multiplier', short: 'm = (1+c)/(r+e+c),反映 MB → M2 的放大倍数',
        twist: '2008 后 m 砸到 1.2 — 教科书 10x 假设彻底失效', chapters: [14] },
      { zh: '通货存款比', en: 'Currency-deposit ratio (c)', short: '公众持现 / 存款,数字支付时代正在快速下降',
        twist: '中国 c 从 12% 跌到 2% — 重塑货币结构', chapters: [3, 14] }
    ]
  },
  {
    id: 'rates',
    title: '利率与债券',
    title_en: 'Interest Rates & Bonds',
    emoji: '📈',
    desc: '现值、久期、收益率曲线',
    desc_en: 'PV, duration, yield curve',
    items: [
      { zh: '现值', en: 'Present value', short: 'PV = CF/(1+r)^t — 所有金融资产定价的最底层公式',
        chapters: [4] },
      { zh: '到期收益率', en: 'Yield to maturity / YTM', short: '使所有未来现金流现值 = 当前价格的 r',
        chapters: [4, 6] },
      { zh: '久期', en: 'Duration', short: '债券对利率敏感度的度量,长债久期大',
        twist: '2022 长债 ETF -31%,比股市还惨 — 久期 > 17', chapters: [4] },
      { zh: '费雪方程', en: 'Fisher equation', short: 'i = r + π^e — 名义 = 实际 + 通胀预期',
        twist: '2022 Fed 没加息,10Y 已飙 200bp+ — 费雪独立推动', chapters: [4, 5] },
      { zh: '可贷资金', en: 'Loanable funds', short: '债券市场视角:利率由资金供求决定',
        chapters: [5] },
      { zh: '流动性偏好', en: 'Liquidity preference', short: '货币市场视角:利率由 M 与 Md 决定',
        chapters: [5, 19] },
      { zh: '风险结构', en: 'Risk structure', short: '同期限债券因违约/流动性/税收差异产生的利差',
        chapters: [6] },
      { zh: '期限结构', en: 'Term structure', short: '收益率曲线 — 同信用、不同期限的利率序列',
        twist: '2024 倒挂 24 个月却无衰退 — 50 年来首次', chapters: [6] }
    ]
  },
  {
    id: 'stock',
    title: '股票与有效市场',
    title_en: 'Stocks & EMH',
    emoji: '📉',
    desc: '戈登增长、EMH、行为金融',
    desc_en: 'Gordon growth, EMH, behavioral finance',
    items: [
      { zh: '戈登增长模型', en: 'Gordon growth model', short: 'P = D₁/(r-g) — 永续增长的股息折现',
        twist: '1999 dotcom 隐含 g > GDP — 数学就在尖叫泡沫', chapters: [7] },
      { zh: '有效市场假说', en: 'Efficient market hypothesis / EMH', short: '价格充分反映已知信息 — 弱/半强/强三种形式',
        chapters: [7, 25] },
      { zh: '理性预期', en: 'Rational expectations', short: '预期 = 用所有可得信息得到的最优预测',
        chapters: [7, 25] }
    ]
  },
  {
    id: 'banking',
    title: '银行与监管',
    title_en: 'Banking & Regulation',
    emoji: '🏦',
    desc: '信息不对称、Basel、TBTF',
    desc_en: 'Asymmetric info, Basel, TBTF',
    items: [
      { zh: '信息不对称', en: 'Information asymmetry', short: '一方比另一方知道得多 — 金融摩擦的根源',
        chapters: [8, 9] },
      { zh: '逆向选择', en: 'Adverse selection', short: '坏借款人更愿意借 — 交易前的信息问题',
        chapters: [8] },
      { zh: '道德风险', en: 'Moral hazard', short: '借到钱后拿去赌 — 交易后的信息问题',
        chapters: [8] },
      { zh: '存款挤兑', en: 'Bank run', short: '存款人争相提取 — 自我实现的预期',
        twist: '2023 SVB 48 小时挤兑 — 数字时代速度 >> 经典模型', chapters: [9, 12] },
      { zh: 'Basel 资本充足率', en: 'Basel CET1 / Tier 1', short: '巴塞尔协议要求的核心一级资本占风险加权资产比',
        twist: 'SVB 在 Basel III 下"完全合规"却倒闭', chapters: [11] },
      { zh: 'HTM / AFS', en: 'Held-to-Maturity / Available-for-Sale', short: '会计分类影响浮亏是否计入资本',
        twist: 'SVB 账面 CET1 12%,HTM 浮亏一夜击穿真实资本', chapters: [9, 11] },
      { zh: 'TBTF', en: 'Too big to fail', short: '大到不能倒 — 隐性政府担保扭曲风险定价',
        chapters: [11] },
      { zh: '影子银行', en: 'Shadow banking', short: '银行业务的"非银行"实体,如 MMF、回购市场',
        twist: 'SVB 后单周 $2.5T 资金从银行迁移到 MMF', chapters: [10, 12] }
    ]
  },
  {
    id: 'central-bank',
    title: '中央银行与货币政策',
    title_en: 'Central Banking',
    emoji: '🏛️',
    desc: 'FOMC、利率走廊、泰勒规则',
    desc_en: 'FOMC, rate corridor, Taylor rule',
    items: [
      { zh: 'FOMC', en: 'Federal Open Market Committee', short: 'Fed 货币政策决策机构,12 名委员投票',
        chapters: [13] },
      { zh: '联邦基金利率', en: 'Federal Funds Rate / FFR', short: '银行间隔夜拆借利率 — Fed 主要政策利率',
        chapters: [13, 15] },
      { zh: 'IORB', en: 'Interest on Reserve Balances', short: '准备金利率 — 利率走廊上沿',
        twist: '2019.9 REPO 飙 10% 让 IORB 失去控制力', chapters: [15] },
      { zh: 'ON RRP', en: 'Overnight Reverse Repo', short: '隔夜逆回购利率 — 利率走廊下沿',
        chapters: [15] },
      { zh: 'SRF', en: 'Standing Repo Facility', short: '常备回购便利 — 应急流动性供给',
        chapters: [15] },
      { zh: '公开市场操作', en: 'Open Market Operation / OMO', short: 'Fed 通过买卖国债调节准备金',
        chapters: [15] },
      { zh: '泰勒规则', en: 'Taylor rule', short: 'i* = r* + π + 0.5(π-π*) + 0.5(y-y*)',
        twist: '2022 通胀 9.1%, 泰勒说 13%+, Fed 实际 1.25%', chapters: [16] },
      { zh: 'FAIT', en: 'Flexible Average Inflation Targeting', short: '灵活平均通胀目标制 — 2020 Fed 新框架',
        chapters: [16, 24] },
      { zh: '央行独立性', en: 'Central bank independence', short: '货币政策不受短期政治干预 — 抗通胀的制度基础',
        chapters: [13] }
    ]
  },
  {
    id: 'international',
    title: '国际金融',
    title_en: 'International Finance',
    emoji: '🌏',
    desc: '汇率、IRP、三元悖论',
    desc_en: 'FX, IRP, impossible trinity',
    items: [
      { zh: '利率平价', en: 'Interest Rate Parity / IRP', short: 'F/S = (1+iₕ)/(1+iₓ) — 远期汇率理论',
        chapters: [17] },
      { zh: '套息交易', en: 'Carry trade', short: '借低利率货币、买高利率货币吃利差',
        twist: '2024.8 USD/JPY 三周从 162→142,10x 杠杆 -100%', chapters: [17] },
      { zh: '三元悖论', en: 'Impossible trinity', short: '汇率稳定 / 资本自由 / 独立货币政策三者只能选其二',
        twist: '1992 英镑危机 — 市场会强制执行,像物理定律', chapters: [17, 18] },
      { zh: 'Fed swap line', en: 'Fed swap line', short: 'Fed 与外央行的美元互换额度 — 全球美元流动性后盾',
        chapters: [18] },
      { zh: '美元体系', en: 'Dollar system', short: '美元作为全球储备货币的不对称地位',
        chapters: [18] }
    ]
  },
  {
    id: 'macro',
    title: '宏观模型',
    title_en: 'Macro Models',
    emoji: '📐',
    desc: 'IS-LM、AD-AS、菲利普斯曲线',
    desc_en: 'IS-LM, AD-AS, Phillips curve',
    items: [
      { zh: 'IS 曲线', en: 'IS curve', short: '产品市场均衡 — 利率与产出的反向关系',
        chapters: [20] },
      { zh: 'LM 曲线', en: 'LM curve', short: '货币市场均衡 — 利率与产出的正向关系',
        chapters: [20] },
      { zh: '挤出效应', en: 'Crowding-out effect', short: '财政扩张推高 r,挤出私人投资',
        twist: '1981 里根+沃尔克 — 财扩+货紧把 USD 推高 50%', chapters: [21] },
      { zh: '总需求', en: 'Aggregate Demand / AD', short: '价格水平与总需求量的反向关系',
        chapters: [22] },
      { zh: '总供给', en: 'Aggregate Supply / AS', short: '短期向上倾斜、长期垂直于潜在产出',
        chapters: [22] },
      { zh: '菲利普斯曲线', en: 'Phillips curve', short: '失业率与通胀率短期权衡',
        twist: '1979 滞胀 — 通胀 13.5% + 失业 5.8% 同存,曲线被打破', chapters: [22, 24] },
      { zh: '流动性陷阱', en: 'Liquidity trap', short: '名义利率接近 0,LM 失效 — 货币政策无力',
        chapters: [20, 23] }
    ]
  },
  {
    id: 'inflation',
    title: '通胀与预期',
    title_en: 'Inflation & Expectations',
    emoji: '🔥',
    desc: '通胀、传导渠道、卢卡斯批判',
    desc_en: 'Inflation, transmission, Lucas critique',
    items: [
      { zh: '货币数量论', en: 'Quantity theory of money / QTM', short: 'MV = PY — 货币×流通速度 = 价格×产出',
        twist: '2008-14 M2 +50%, CPI 仅 +1.7% — V 暴跌 30% 抵消', chapters: [19, 24] },
      { zh: '流通速度', en: 'Velocity / V', short: 'V = PY/M — 一单位货币年内被使用的次数',
        chapters: [19] },
      { zh: '5 大传导渠道', en: 'Monetary transmission', short: '利率/资产/信贷/资产负债表/财富 — Fed 影响实体的通路',
        twist: '2008-2014 QE 万亿但复苏缓 — 5 渠道里 3 个失效', chapters: [23] },
      { zh: '卢卡斯批判', en: 'Lucas critique', short: '基于历史数据估的政策反应函数,在政策改变后会失效',
        twist: '2008 QE 历史模型预测通胀 5-10%, 实际 1.7%', chapters: [25] },
      { zh: '时间不一致性', en: 'Time inconsistency', short: '事前最优 ≠ 事后最优 — 政策可信度的根源',
        chapters: [25] },
      { zh: '通胀预期', en: 'Inflation expectations', short: 'π^e — 工资 / 定价 / 利率的关键输入',
        chapters: [16, 22, 24] },
      { zh: '工资-物价螺旋', en: 'Wage-price spiral', short: '通胀预期内化为工资,推动新一轮涨价',
        chapters: [22, 24] }
    ]
  }
]

export function searchGlossary(query: string): GlossaryItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const result: GlossaryItem[] = []
  for (const group of glossary) {
    for (const item of group.items) {
      const hay = (item.zh + item.en + item.short).toLowerCase()
      if (hay.includes(q)) result.push(item)
    }
  }
  return result
}

export const totalTerms = glossary.reduce((s, g) => s + g.items.length, 0)
