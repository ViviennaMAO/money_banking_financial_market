/* 每日热点财经 Top 10
 *
 * 2026-05-01 模拟版(无后端依赖)
 * 每条新闻 → 多个知识点 → 跳转对应章节 / 词汇 / 路径
 *
 * 设计原则:
 * - 每条都是真实历史事件改编或 2026 高概率议题
 * - 结合"涉及理论 + 反预期 + 行动建议"
 * - 链接知识点 (chapters / glossary / paths)
 */

export interface NewsKnowledge {
  type: 'chapter' | 'glossary' | 'path'
  ref: string | number     // 章号 / 词条名 / 路径 id
  why: string              // 为什么相关(一句话)
}

export interface NewsItem {
  id: string
  rank: number             // 1-10
  category: 'fed' | 'rate' | 'fx' | 'crypto' | 'china' | 'banking' | 'commodity'
  emoji: string
  date: string             // 2026-05-01
  title: string
  summary: string          // 一句导读
  body: string             // 深度分析(2-3 段)
  twist: string            // 反预期一句
  knowledge: NewsKnowledge[]
}

const TODAY = '2026-05-01'

export const newsTop10: NewsItem[] = [
  {
    id: 'news-1', rank: 1, category: 'fed', emoji: '🏛️', date: TODAY,
    title: 'Fed 5 月会议:维持利率 4.25-4.50%,鲍威尔暗示 6 月或开始降息',
    summary: 'FOMC 一致通过维持联邦基金利率目标区间,但点阵图显示 7 名委员预期年内降息 2 次以上。',
    body: '此次决议在意料之中 — 但语气微妙转向"如果通胀继续向 2% 收敛,我们将考虑放松"。市场反应:2Y 美债利率跌 12bp,股市冲高 1.5%。问题在于:核心 PCE 仍 2.7%,房租和服务业通胀粘性大,Fed 真愿意提前转向?\n\n回看 2024Q4 与 2025Q1,Fed 在"是否真等到 2%"上反复犹豫,这种语气的来回正是市场最难定价的部分 — 不是降不降息,而是"reaction function"本身在变。',
    twist: '点阵图中位数仍预期年内只降 1 次 — 鲍威尔讲的话和 19 个委员的实际投票是两回事',
    knowledge: [
      { type: 'chapter', ref: 16, why: '泰勒规则视角:目前是否已偏离规则要求?' },
      { type: 'chapter', ref: 13, why: 'FOMC 决策机制 — 19 人 vs 12 投票权' },
      { type: 'glossary', ref: 'FAIT', why: 'Fed 当前框架:平均通胀目标制' },
      { type: 'path', ref: 'fed-toolkit', why: '系统了解 Fed 工具与战略' }
    ]
  },
  {
    id: 'news-2', rank: 2, category: 'fx', emoji: '🪙', date: TODAY,
    title: 'USD/JPY 跌破 145,日银副行长讲话引爆套息交易第二轮平仓',
    summary: '日银副行长称"如果通胀持续在 2% 以上,加息空间仍在",对冲基金套息头寸再次被迫平仓。',
    body: '继 2024.8 套息崩盘后,USD/JPY 在 2025 年下半年震荡走弱。今晨日银副行长意外鹰派让市场重新计入"7 月加息 25bp"概率从 18% 升至 45%。日元 1 小时升值 1.8%,套息基金 VAR 触发强平。\n\n本质上这是利率平价(IRP)在动 — 美日利差从 525bp 收窄到 415bp 后,carry trade 的"年化 4% 收益 vs 12% 波动"风险收益比已经反转。这次不是黑天鹅,而是 IRP 路径的可预测延续。',
    twist: '日银的鹰派每次都来得"突然",但看清 IRP 走势的人 6 个月前就能预判 — 直觉错在"日银总是鸽派"',
    knowledge: [
      { type: 'chapter', ref: 17, why: 'IRP 公式 + 套息交易模拟器' },
      { type: 'glossary', ref: '套息交易', why: '为什么利差不是免费午餐' },
      { type: 'path', ref: 'international', why: '汇率思维系统培训' }
    ]
  },
  {
    id: 'news-3', rank: 3, category: 'banking', emoji: '🏦', date: TODAY,
    title: 'NYCB 发布 Q1 财报,商业地产坏账拨备超预期 3 倍',
    summary: '纽约社区银行(NYCB)Q1 商业地产相关坏账拨备 6.4 亿美元,股价单日 -19%。',
    body: '问题集中在写字楼贷款。后疫情时代纽约写字楼空置率仍 22%,租金已 -18% vs 2019。NYCB 的 30% 贷款敞口在 CRE,远超大行平均 7%。\n\n这与 2023 SVB 不同 — SVB 是利率风险(HTM 浮亏),NYCB 是信用风险(借款人违约)。但路径相似:都是某类资产集中度太高,在宏观环境变化下集中爆雷。Basel III 对 CRE 的 RWA 权重过低(50%),这种集中度本应触发额外资本要求。',
    twist: '"地区银行危机已经结束" — 这种说法每次危机后都有,但风险只是从一个角落转移到另一个',
    knowledge: [
      { type: 'chapter', ref: 9, why: '银行管理 — 资产负债与流动性' },
      { type: 'chapter', ref: 11, why: 'Basel III 资本充足 — 漏掉了什么' },
      { type: 'glossary', ref: 'Basel 资本充足率', why: 'CRE 风险加权权重的盲点' },
      { type: 'path', ref: 'banking', why: '系统理解银行倒闭的机制' }
    ]
  },
  {
    id: 'news-4', rank: 4, category: 'rate', emoji: '📈', date: TODAY,
    title: '10Y 美债收益率回落到 4.05%,2s10s 利差转正 +12bp',
    summary: '持续两年多的收益率曲线倒挂正式结束,但市场对"是否预示衰退"分歧加深。',
    body: '2s10s 从 -52bp 回到 +12bp。历史上倒挂结束 → 6-18 个月内衰退是常见路径。但 2024 倒挂期长达 24 个月却没有衰退,本身已经打破了米什金教科书。\n\n两派观点:① QE 时代期限溢价被长期压低,曲线信号已经"不准"了。② "这次不一样"是最危险的话 — 2026 下半年仍可能衰退,只是滞后而已。哪种对?现在没人知道,但收益率曲线的预测力已经不再有 1980-2010 那么强是事实。',
    twist: '"曲线倒挂 → 衰退"在 2024 失效,"倒挂结束 → 衰退" 也可能是同一个失效信号的反面',
    knowledge: [
      { type: 'chapter', ref: 6, why: '收益率曲线为什么会动 — 倒挂的真正信号' },
      { type: 'chapter', ref: 4, why: '理解利率结构与久期数学' },
      { type: 'glossary', ref: '期限结构', why: '形状的真正含义' },
      { type: 'path', ref: 'rates', why: '系统化"利率第六感"' }
    ]
  },
  {
    id: 'news-5', rank: 5, category: 'china', emoji: '🇨🇳', date: TODAY,
    title: 'PBoC 5 月 LPR 维持 3.10% 不变,1Y MLF 也按兵不动',
    summary: '人民银行连续 4 个月维持政策利率,但市场普遍预期 6 月或下调 10bp。',
    body: '中国经济目前面临"低通胀+疲软地产+人民币贬压"三重约束。降息可缓地产但加大贬压,不降则需求继续收缩。这是教科书三元悖论的中国版变体。\n\n值得注意的是:M2 同比 +7.2%,但 V 流速持续下行 → MV = PY 显示出"印钱无效"的中国版本。央行真正在用的是定向工具(PSL/SLF/MLF),不是简单调 LPR。这与 Fed 在 2008 后用 QE 替代降息有相似逻辑。',
    twist: '"中国应该大幅降息救地产" — 但货币政策传导机制(信贷渠道)在房企未真正去杠杆前是堵的,降息也救不动',
    knowledge: [
      { type: 'chapter', ref: 23, why: '货币政策传导 5 渠道为什么会失效' },
      { type: 'chapter', ref: 17, why: '三元悖论 — 中国如何选择' },
      { type: 'chapter', ref: 19, why: '货币需求理论 — V 在不同时代的角色' },
      { type: 'path', ref: 'inflation', why: '理解通胀(以及反向通缩)的根源' }
    ]
  },
  {
    id: 'news-6', rank: 6, category: 'crypto', emoji: '₿', date: TODAY,
    title: 'BTC 突破 9 万美元,现货 ETF 当周净流入 23 亿美元',
    summary: '受 Fed 降息预期和半减效应延后影响,比特币创下历史新高。',
    body: '现货 ETF 通过后,机构资金流入是 2024-26 BTC 上涨的核心驱动 — 这与 2017、2021 的散户驱动有本质不同。但现在的问题:BTC 与纳斯达克相关性 0.62(2024 仅 0.38),这意味着 BTC 越来越像"杠杆科技股"而不是"数字黄金"。\n\n这件事本身就和"BTC 是货币"的叙事矛盾。回看 Ch3:货币三大功能(交易媒介/价值贮藏/记账单位),BTC 当前主要是投机/避险资产,与"货币"是两回事。',
    twist: '"BTC 是新黄金" — 但黄金与股市相关性 -0.1,BTC 是 +0.6,数据上完全相反',
    knowledge: [
      { type: 'chapter', ref: 3, why: '什么是货币 — BTC 满足哪几个功能' },
      { type: 'chapter', ref: 7, why: '资产定价与有效市场 — BTC 是不是泡沫' },
      { type: 'glossary', ref: 'M2', why: '比 M2 增速,理解 BTC 价格的"货币锚"' }
    ]
  },
  {
    id: 'news-7', rank: 7, category: 'commodity', emoji: '🛢️', date: TODAY,
    title: 'Brent 油价回落到 78 美元,OPEC+ 6 月会议或决定增产',
    summary: '中东局势缓和叠加美国库存超预期,布伦特原油单周 -5.4%。',
    body: '油价是宏观冲击中最重要的"AS 移动器"。2022 通胀 9.1% 中,油价贡献至少 30%。如果 OPEC+ 增产、油价持续回到 70-80 区间,核心通胀的下行通道会更顺。\n\n但反过来:如果 OPEC+ 反而减产保价,2026 下半年通胀反弹风险显著。Fed 6 月降息决策的"最大变量"恰恰是这个 — 不是 GDP 数据,而是油价路径。',
    twist: '"油价跌 → 通胀降 → Fed 早降息" — 但 OPEC+ 永远在反向操作,这一链条上的反身性最大',
    knowledge: [
      { type: 'chapter', ref: 22, why: 'AD-AS 模型 — 油价是 AS 冲击的经典案例' },
      { type: 'chapter', ref: 24, why: '通胀根源:供给冲击如何贡献 1979 滞胀' },
      { type: 'path', ref: 'inflation', why: '完整通胀逻辑链' }
    ]
  },
  {
    id: 'news-8', rank: 8, category: 'fed', emoji: '📉', date: TODAY,
    title: 'Fed 资产负债表降至 7.1 万亿,缩表速度或将放缓',
    summary: '从 2022 年 4 月峰值 8.96 万亿降至 7.1 万亿,缩表 1.86 万亿。',
    body: '当前 Fed QT 速度 600 亿/月(国债 250 + MBS 350),但市场观察家预期 6 月会议后会放缓至 350 亿/月。原因是:① 银行准备金已降至 3.4 万亿(2021 高点 4.2),进一步降会触发 2019.9 REPO 飙升风险。② 财政部国债发行量大,Fed 缩表 + 财政发债同时进行流动性吃紧。\n\n这是 Fed 在执行"资产负债表政策" — 与利率政策同样重要,但市场关注度低很多。SRF(常备回购便利)就是为防 2019.9 重演而生。',
    twist: '"加息已经结束" — 但 Fed 还在通过缩表收紧,这部分紧缩等价于多 75bp 加息,几乎被忽略',
    knowledge: [
      { type: 'chapter', ref: 14, why: '货币供给过程 — MB 与 M2 的不同' },
      { type: 'chapter', ref: 15, why: '货币政策工具 — IORB/SRF/ON RRP' },
      { type: 'glossary', ref: 'SRF', why: '为什么需要常备回购便利' }
    ]
  },
  {
    id: 'news-9', rank: 9, category: 'rate', emoji: '🏠', date: TODAY,
    title: '美国 30 年房贷利率回到 6.45%,买家观望情绪浓厚',
    summary: '从 2023 年 10 月 7.79% 高点降至 6.45%,但仍明显高于 2021 年 2.65% 时代。',
    body: '房贷利率 = 10Y 美债 + 抵押证券利差(MBS spread)。10Y 现在 4.05%,MBS spread 约 240bp,合 6.45%。MBS spread 在 2024 年扩大到 280bp(Fed 缩 MBS),现在已经修复。\n\n关键问题:即使利率回到 5.5%,2021 年 2.65% 锁定的低利率房主"不愿卖房" — 这是"利率锁定效应",让 inventory 始终偏紧。这是 2022 加息周期最大的副作用,任何宏观分析都低估了它。',
    twist: '"利率降房价跌" — 但 lock-in 效应让供给迟迟出不来,降息反而会让房价再涨',
    knowledge: [
      { type: 'chapter', ref: 1, why: '房贷月供与利率的关系(每章 1 公式)' },
      { type: 'chapter', ref: 4, why: '现值数学 — 月供怎么算' },
      { type: 'chapter', ref: 23, why: '房屋财富效应 — 5 渠道之一' }
    ]
  },
  {
    id: 'news-10', rank: 10, category: 'fx', emoji: '💶', date: TODAY,
    title: 'ECB 4 月降息 25bp 至 2.50%,LaGarde 暗示 6 月还有空间',
    summary: '欧洲央行连续第三次降息,核心通胀已降至 2.4%,服务业通胀粘性下降。',
    body: 'ECB 比 Fed 更"先行" — Fed 还在等数据,ECB 已经累计降息 75bp。这创造了美欧利差扩大,EUR/USD 跌至 1.085。但 2026 下半年情况可能反转 — 如果 Fed 在 6 月开启降息,而 ECB 因通胀反弹放慢,利差又会反向收窄。\n\n这就是 IRP 在两大经济体之间的动态平衡。汇率的 6 个月级别走势,更多取决于"市场预期的相对路径",而不是当前利率水平。',
    twist: '"ECB 比 Fed 早降 → EUR 走弱永远" — 但前瞻性已经被市场定价,真正的拐点在"预期反转"那一刻',
    knowledge: [
      { type: 'chapter', ref: 17, why: 'IRP 在不同期限上的体现' },
      { type: 'chapter', ref: 18, why: '国际金融体系 — Fed-ECB 协调' },
      { type: 'path', ref: 'international', why: '汇率思维系统化' }
    ]
  }
]

export const newsCategoryLabel: Record<NewsItem['category'], string> = {
  fed: '🏛️ Fed',
  rate: '📈 利率',
  fx: '🪙 汇率',
  crypto: '₿ 加密',
  china: '🇨🇳 中国',
  banking: '🏦 银行',
  commodity: '🛢️ 商品'
}

export function getNews(id: string): NewsItem | undefined {
  return newsTop10.find(n => n.id === id)
}
