/* 米什金《货币金融学》第 11 版完整章节结构
 * 6 篇 · 25 章
 *
 * 路由约定:
 * - MVP 三章(14/17/20):专属页面 /pages/chXX/index(完整模拟器)
 * - 其他 22 章:通用 chapter 页 /pages/chapter/index?ch=N(导言+概念卡+知识检测)
 * - 后续每章升级为专属页时,只需改 pagePath
 */

export interface Chapter {
  num: number              // 章节号 1-25
  title: string            // 章名
  title_en?: string        // 英文章名
  emoji: string            // 视觉标识
  brief: string            // 一句话介绍(≤25 字)
  brief_en?: string
  difficulty: 1 | 2 | 3 | 4 | 5
  duration?: string        // 学习时长估计
  implemented: boolean     // 是否有可访问页面(全 true,因为通用 chapter 页能渲染所有)
  pagePath?: string        // 跳转路径
  hook?: string            // 反预期 hook(MVP 三章才有,首页大卡片显示)
  hook_en?: string
  tier?: 'mvp' | 'basic'   // mvp = 专属模拟器;basic = 通用页
}

export interface Part {
  num: number
  title: string
  title_en?: string
  desc: string
  desc_en?: string
  range: string
  chapters: Chapter[]
}

const generic = (num: number) => `/pages/chapter/index?ch=${num}`

export const parts: Part[] = [
  {
    num: 1, title: '导论', title_en: 'Introduction',
    desc: '为什么研究货币、银行和金融市场', desc_en: 'Why study money, banks and financial markets',
    range: '第 1-3 章',
    chapters: [
      { num: 1, title: '为什么研究货币、银行和金融市场', title_en: 'Why Study Money, Banking and Financial Markets', emoji: '🌐',
        brief: '金融市场如何影响你的日常生活', brief_en: 'How financial markets shape your daily life',
        difficulty: 1, duration: '8 分钟',
        implemented: true, pagePath: '/pages/ch1/index', tier: 'mvp',
        hook: '利率涨 1% 月供涨 41%(2022 加息买房力直接腰斩)',
        hook_en: 'Rates +1% → mortgage payment +41% (2022 hikes halved homebuying power)' },
      { num: 2, title: '金融体系概览', title_en: 'An Overview of the Financial System', emoji: '🏛️',
        brief: '直接融资 vs 间接融资,从一张图看懂', brief_en: 'Direct vs indirect finance, in one picture',
        difficulty: 1, duration: '8 分钟',
        implemented: true, pagePath: '/pages/ch2/index', tier: 'mvp',
        hook: '支付宝 / Apple Pay 是支付层 — 没替代银行,但改变 c',
        hook_en: 'Alipay / Apple Pay are payment layers — they didn\'t replace banks, but reshaped the c ratio' },
      { num: 3, title: '什么是货币', title_en: 'What Is Money', emoji: '💵',
        brief: 'M0 / M1 / M2 / M3 的层次', brief_en: 'The M0 / M1 / M2 / M3 hierarchy',
        difficulty: 1, duration: '6 分钟',
        implemented: true, pagePath: '/pages/ch3/index', tier: 'mvp',
        hook: '中国 c 从 12% 跌到 2% — 数字支付重塑货币结构',
        hook_en: 'China\'s currency-to-deposit ratio fell from 12% to 2% — digital payments reshaped money' }
    ]
  },
  {
    num: 2, title: '金融市场', title_en: 'Financial Markets',
    desc: '利率、债券、股票的定价与行为', desc_en: 'Pricing and behavior of rates, bonds, stocks',
    range: '第 4-7 章',
    chapters: [
      { num: 4, title: '理解利率', title_en: 'Understanding Interest Rates', emoji: '📈',
        brief: '现值、到期收益率、费雪方程', brief_en: 'PV, YTM, Fisher equation',
        difficulty: 2, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch4/index', tier: 'mvp',
        hook: '2022 长债 ETF TLT 跌 -31%,比股市还惨 — 债券真是"低风险"吗?',
        hook_en: '2022 long-bond ETF TLT crashed -31% — worse than stocks. Is "low-risk" still a thing?' },
      { num: 5, title: '利率行为', title_en: 'The Behavior of Interest Rates', emoji: '⚖️',
        brief: '可贷资金 vs 流动性偏好', brief_en: 'Loanable funds vs liquidity preference',
        difficulty: 3, duration: '10 分钟',
        implemented: true, pagePath: '/pages/ch5/index', tier: 'mvp',
        hook: '2022 Fed 还没加息,10Y 已飙 200bp+ — 费雪效应独立推动',
        hook_en: '2022 Fed hadn\'t hiked yet, 10Y already +200bp — Fisher effect driving on its own' },
      { num: 6, title: '利率的风险结构与期限结构', title_en: 'Risk and Term Structure of Interest Rates', emoji: '📊',
        brief: '收益率曲线为什么会倒挂', brief_en: 'Why the yield curve inverts',
        difficulty: 3, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch6/index', tier: 'mvp',
        hook: '2024 倒挂 24 个月却无衰退 — 50 年来首次,教科书被打破',
        hook_en: '2024: 24 months of inversion, no recession — first failure in 50 years' },
      { num: 7, title: '股票市场、理性预期与有效市场假说', title_en: 'The Stock Market, Rational Expectations, EMH', emoji: '📉',
        brief: '戈登增长 + EMH 三种形式', brief_en: 'Gordon growth + 3 EMH forms',
        difficulty: 3, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch7/index', tier: 'mvp',
        hook: '1999 dotcom 隐含 g=20%+,数学上比 GDP 还大 — 泡沫的本质',
        hook_en: '1999 dotcom implied g >20%, mathematically larger than GDP — the essence of a bubble' }
    ]
  },
  {
    num: 3, title: '金融机构', title_en: 'Financial Institutions',
    desc: '银行、影子银行、监管与危机', desc_en: 'Banks, shadow banking, regulation, crises',
    range: '第 8-12 章',
    chapters: [
      { num: 8, title: '金融结构的经济学分析', title_en: 'An Economic Analysis of Financial Structure', emoji: '🔍',
        brief: '信息不对称 / 逆向选择 / 道德风险', brief_en: 'Asymmetric info / adverse selection / moral hazard',
        difficulty: 3, duration: '10 分钟',
        implemented: true, pagePath: '/pages/ch8/index', tier: 'mvp',
        hook: '2023 SVB 48 小时挤兑 — 数字时代信息传递速度 >> 经典模型',
        hook_en: '2023 SVB run took 48 hours — digital-era info speed dwarfs classic models' },
      { num: 9, title: '银行业与金融机构的管理', title_en: 'Banking and the Management of Financial Institutions', emoji: '🏦',
        brief: '资产负债管理 + 流动性管理', brief_en: 'Balance sheet & liquidity management',
        difficulty: 3, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch9/index', tier: 'mvp',
        hook: 'SVB 账面 CET1 12% 看似正常,HTM 浮亏一夜击穿真实资本',
        hook_en: 'SVB book CET1 12% looked fine — HTM unrealized losses crushed real capital overnight' },
      { num: 10, title: '银行业:结构与竞争', title_en: 'Banking Industry: Structure and Competition', emoji: '🏢',
        brief: '商业银行 vs 投行 vs 影子银行', brief_en: 'Commercial vs investment vs shadow banks',
        difficulty: 2, duration: '8 分钟',
        implemented: true, pagePath: '/pages/ch10/index', tier: 'mvp',
        hook: '2023 SVB 后单周 $2.5T 资金从银行迁移到 MMF — 史上最大',
        hook_en: 'Post-SVB 2023: $2.5T moved from banks to MMFs in one week — largest in history' },
      { num: 11, title: '金融监管的经济学分析', title_en: 'Economic Analysis of Financial Regulation', emoji: '⚖️',
        brief: 'Basel + 存款保险 + TBTF', brief_en: 'Basel + deposit insurance + TBTF',
        difficulty: 3, duration: '10 分钟',
        implemented: true, pagePath: '/pages/ch11/index', tier: 'mvp',
        hook: 'SVB 在 Basel III 下"完全合规"却倒闭 — 监管永远落后于现实',
        hook_en: 'SVB was "fully Basel III compliant" yet collapsed — regulation always lags reality' },
      { num: 12, title: '金融危机', title_en: 'Financial Crises', emoji: '🔥',
        brief: '危机三阶段 · 2008 / 2020 / 2023 案例', brief_en: '3-stage crisis · 2008 / 2020 / 2023 cases',
        difficulty: 4, duration: '15 分钟',
        implemented: true, pagePath: '/pages/ch12/index', tier: 'mvp',
        hook: '2020 疫情跳过阶段三 — Fed 极速救助打破米什金经典框架',
        hook_en: '2020 pandemic skipped Stage 3 — Fed\'s rapid rescue broke Mishkin\'s classic framework' }
    ]
  },
  {
    num: 4, title: '中央银行与货币政策实施', title_en: 'Central Banking and Conduct of Monetary Policy',
    desc: '⭐ MVP 重点篇 · Fed 工具箱与决策', desc_en: '⭐ MVP focus · Fed toolkit and decisions',
    range: '第 13-16 章',
    chapters: [
      { num: 13, title: '中央银行与联邦储备体系', title_en: 'Central Banks and the Federal Reserve System', emoji: '🏛️',
        brief: 'FOMC 决策机制 + 央行独立性', brief_en: 'FOMC mechanics + central-bank independence',
        difficulty: 2, duration: '10 分钟',
        implemented: true, pagePath: '/pages/ch13/index', tier: 'mvp',
        hook: '1981 沃尔克坚持 20% FFR 引发双衰退,但开启大缓和 25 年',
        hook_en: 'Volcker held 20% FFR through 1981 double-dip — paid for 25 years of Great Moderation' },
      { num: 14, title: '货币供给过程', title_en: 'The Money Supply Process', emoji: '💱',
        brief: '货币乘数 m=(1+c)/(r+e+c)', brief_en: 'Money multiplier m=(1+c)/(r+e+c)',
        difficulty: 3, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch14/index', tier: 'mvp',
        hook: 'Fed 印万亿,M2 却几乎没动 — 乘数砸到 1.2 那一刻',
        hook_en: 'Fed printed trillions, M2 barely moved — the multiplier crashed to 1.2' },
      { num: 15, title: '货币政策工具', title_en: 'Tools of Monetary Policy', emoji: '🔧',
        brief: 'OMO / IORB / SRF / ON RRP 利率走廊', brief_en: 'OMO / IORB / SRF / ON RRP rate corridor',
        difficulty: 3, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch15/index', tier: 'mvp',
        hook: '2019.9 REPO 飙到 10% — 准备金不足让 IORB 失去控制力',
        hook_en: '2019.9 REPO spiked to 10% — IORB lost control as reserves got tight' },
      { num: 16, title: '货币政策操作:战略与战术', title_en: 'Monetary Policy: Strategy and Tactics', emoji: '🎯',
        brief: '泰勒规则 · FAIT · 通胀目标制', brief_en: 'Taylor rule · FAIT · inflation targeting',
        difficulty: 4, duration: '14 分钟',
        implemented: true, pagePath: '/pages/ch16/index', tier: 'mvp',
        hook: '2022 通胀 9.1%,泰勒说 13%+,Fed 实际 1.25% — 1980 来最大滞后',
        hook_en: '2022 CPI 9.1%, Taylor rule said 13%+, Fed only at 1.25% — biggest lag since 1980' }
    ]
  },
  {
    num: 5, title: '国际金融与货币政策', title_en: 'International Finance and Monetary Policy',
    desc: '⭐ MVP 重点篇 · 汇率与资本流动', desc_en: '⭐ MVP focus · FX and capital flows',
    range: '第 17-18 章',
    chapters: [
      { num: 17, title: '外汇市场 · 利率平价', title_en: 'Foreign Exchange Market · Interest Rate Parity', emoji: '🪙',
        brief: 'IRP + 套息交易 + 三元悖论', brief_en: 'IRP + carry trade + impossible trinity',
        difficulty: 4, duration: '14 分钟',
        implemented: true, pagePath: '/pages/ch17/index', tier: 'mvp',
        hook: '2024.8 USD/JPY 三周从 162→142,10x 杠杆 -100%',
        hook_en: '2024.8 USD/JPY: 162→142 in 3 weeks, 10x leveraged carry → -100%' },
      { num: 18, title: '国际金融体系', title_en: 'The International Financial System', emoji: '🌏',
        brief: '美元体系 + Fed swap line + 制度演进', brief_en: 'Dollar system + Fed swap lines + institutional evolution',
        difficulty: 4, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch18/index', tier: 'mvp',
        hook: '1992 英镑危机 — 三元悖论是市场会强制执行的物理定律',
        hook_en: '1992 GBP crisis — the impossible trinity is a physics law markets enforce' }
    ]
  },
  {
    num: 6, title: '货币理论', title_en: 'Monetary Theory',
    desc: '⭐ MVP 重点篇 · IS-LM-AD-AS 框架', desc_en: '⭐ MVP focus · IS-LM-AD-AS framework',
    range: '第 19-25 章',
    chapters: [
      { num: 19, title: '货币需求理论', title_en: 'The Demand for Money', emoji: '🧮',
        brief: '货币数量论 · 凯恩斯 · 弗里德曼', brief_en: 'Quantity theory · Keynes · Friedman',
        difficulty: 4, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch19/index', tier: 'mvp',
        hook: '2008-14 M2 +50% 但 CPI 仅 +1.7% — V 暴跌 30% 抵消',
        hook_en: '2008-14: M2 +50% but CPI only +1.7% — V crashed 30% absorbing it' },
      { num: 20, title: 'IS-LM 模型', title_en: 'The IS-LM Model', emoji: '📐',
        brief: '产品市场 + 货币市场均衡', brief_en: 'Goods market + money market equilibrium',
        difficulty: 5, duration: '15 分钟',
        implemented: true, pagePath: '/pages/ch20/index', tier: 'mvp',
        hook: '流动性陷阱里 LM 怎么右移,Y* 都不动',
        hook_en: 'In a liquidity trap, no matter how far LM shifts right, Y* won\'t move' },
      { num: 21, title: 'IS-LM 中的货币与财政政策', title_en: 'Monetary and Fiscal Policy in IS-LM', emoji: '⚙️',
        brief: '挤出效应 · 政策组合冲突', brief_en: 'Crowding-out · policy mix conflicts',
        difficulty: 5, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch21/index', tier: 'mvp',
        hook: '1981 里根 + 沃尔克 — 财扩+货紧 → USD 飙 50% + 拉美危机',
        hook_en: '1981 Reagan + Volcker — fiscal-easy + monetary-tight → USD +50% + Latin Am. crisis' },
      { num: 22, title: '总需求与总供给分析', title_en: 'Aggregate Demand and Aggregate Supply', emoji: '📊',
        brief: 'AD-AS · 短期 vs 长期 · 菲利普斯曲线', brief_en: 'AD-AS · SR vs LR · Phillips curve',
        difficulty: 5, duration: '15 分钟',
        implemented: true, pagePath: '/pages/ch22/index', tier: 'mvp',
        hook: '1979 滞胀 — 通胀 13.5% + 失业 5.8% 同存,菲利普斯曲线被打破',
        hook_en: '1979 stagflation — 13.5% inflation + 5.8% unemployment together, Phillips curve broken' },
      { num: 23, title: '货币政策传导机制', title_en: 'Monetary Policy Transmission Mechanisms', emoji: '🔄',
        brief: '5 大渠道:利率/资产/信贷/资产负债表/财富', brief_en: '5 channels: rate / asset / credit / balance sheet / wealth',
        difficulty: 5, duration: '14 分钟',
        implemented: true, pagePath: '/pages/ch23/index', tier: 'mvp',
        hook: '2008-2014 QE 万亿但复苏缓慢 — 5 渠道里 3 个失效',
        hook_en: '2008-2014 trillions of QE but slow recovery — 3 of the 5 channels failed' },
      { num: 24, title: '货币政策与通货膨胀', title_en: 'Monetary Policy and Inflation', emoji: '🔥',
        brief: '通胀根源 · 大缓和 · FAIT', brief_en: 'Inflation roots · Great Moderation · FAIT',
        difficulty: 5, duration: '14 分钟',
        implemented: true, pagePath: '/pages/ch24/index', tier: 'mvp',
        hook: '2022 通胀 9.1% — 4 机制叠加完美风暴,弗里德曼短期错',
        hook_en: '2022 CPI 9.1% — 4 mechanisms in perfect storm, Friedman wrong in the short run' },
      { num: 25, title: '理性预期与政策含义', title_en: 'Rational Expectations and Policy Implications', emoji: '🧠',
        brief: '卢卡斯批判 · 时间不一致性', brief_en: 'Lucas critique · time inconsistency',
        difficulty: 5, duration: '12 分钟',
        implemented: true, pagePath: '/pages/ch25/index', tier: 'mvp',
        hook: '2008 QE 历史模型预测通胀 5-10%,实际 1.7% — 卢卡斯批判活案例',
        hook_en: '2008 QE: historical models predicted 5-10% inflation, actual 1.7% — Lucas critique alive' }
    ]
  }
]

/* ===== 工具函数 ===== */

export function findChapter(num: number): { part: Part; chapter: Chapter } | null {
  for (const part of parts) {
    const ch = part.chapters.find(c => c.num === num)
    if (ch) return { part, chapter: ch }
  }
  return null
}

export const mvpChapters = parts
  .flatMap(p => p.chapters)
  .filter(c => c.tier === 'mvp')

export const totalChapters = parts.reduce((sum, p) => sum + p.chapters.length, 0)
export const mvpCount = mvpChapters.length
export const basicCount = parts.flatMap(p => p.chapters).filter(c => c.tier === 'basic').length
