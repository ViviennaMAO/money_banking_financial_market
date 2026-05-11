/* 三章历史快照 · 复用 prototype.html 的真实数据 */

export interface PredictDef {
  title: string
  title_en?: string
  question: string
  question_en?: string
  options: string[]
  options_en?: string[]
  correctIdx: number
  revealHeadline: string
  revealHeadline_en?: string
  revealMsg: string
  revealMsg_en?: string
}

/* ===== 第 14 章 货币乘数 ===== */
export interface Ch14Snapshot {
  mb: number; r: number; e: number; c: number
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch14Snapshots: Record<string, Ch14Snapshot> = {
  '2007': {
    mb: 0.85, r: 10, e: 0.04, c: 7,
    note: '2007.8 危机前:乘数 ≈ 8.7。正常时期。',
    note_en: '2007.8 pre-crisis: multiplier ≈ 8.7. A normal period.'
  },
  '2010': {
    mb: 2.0, r: 10, e: 80, c: 8,
    note: '⚠️ 2010.1 QE 后:乘数从 8.7 砸到 1.2!Fed 注入的钱卡在准备金里——流动性陷阱的微观证据。',
    note_en: '⚠️ 2010.1 post-QE: multiplier crashed from 8.7 to 1.2! Fed-injected money stayed in reserves — micro evidence of the liquidity trap.',
    flash: true,
    predict: {
      title: '你即将切换到「2010.1 QE 后」',
      title_en: 'You\'re about to switch to \'2010.1 Post-QE\'',
      question: 'Fed QE 把 MB 从 0.85T 推到 2.0T,乘数 m 会变成多少?',
      question_en: 'Fed QE pushed MB from 0.85T to 2.0T. What does the multiplier m become?',
      options: ['跟现在差不多(5 左右)', '涨到 10+(QE 注入大量货币)', '暴跌到 1-2(超储锁住流动性)'],
      correctIdx: 2,
      revealHeadline: '真实 m = 1.2',
      revealHeadline_en: 'Actual m = 1.2',
      revealMsg: '超额准备金 e 从 0.04% 飙到 80%——Fed 印的钱卡在银行系统。这就是为什么万亿 QE 没引发 1970s 式恶性通胀。',
      revealMsg_en: 'Excess reserves jumped from 0.04% to 80% — Fed-printed money stuck in the banking system. This is why trillion-dollar QE didn\'t trigger 1970s-style hyperinflation.'
    }
  },
  '2020': {
    mb: 4.8, r: 0, e: 18, c: 9,
    note: '2020.4 疫情:无 r 时代(Fed 2020.3 起 r=0),但 e 仍是大头。',
    note_en: '2020.4 pandemic: zero-r era (Fed cut to r=0 in 2020.3), but excess reserves still dominate.'
  },
  'today': {
    mb: 5.5, r: 0, e: 12, c: 8,
    note: '今天:QT 进行中,e 缓慢下降,M2 增速回升。注意 IORB 已合并 IOER+IORR(2021.7.29)。',
    note_en: 'Today: QT underway, excess reserves slowly receding, M2 growth picking up. Note IORB merged IOER+IORR on 2021.7.29.'
  }
}

/* ===== 第 4 章 债券定价 ===== */
export interface Ch4Snapshot {
  fv: number; couponRate: number; ytm: number; years: number; inflation: number
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch4Snapshots: Record<string, Ch4Snapshot> = {
  '1981': {
    fv: 1000, couponRate: 14, ytm: 14, years: 10, inflation: 10,
    note: '1981.9 沃尔克紧缩末:10Y 利率 ~14%,通胀 ~10%。后续 1982 起 Fed 大幅降息,债券进入超级牛市。把 ytm 从 14% 拖到 8% 看看价格变化。',
    note_en: '1981.9 Volcker tightening peak: 10Y yield ~14%, inflation ~10%. Fed slashed rates from 1982; bonds entered a super bull market. Drag YTM from 14% to 8% to watch the price change.'
  },
  '2022': {
    fv: 1000, couponRate: 1, ytm: 1, years: 20, inflation: 7,
    note: '⚠️ 2022.3 加息冲击起点:20Y 期 1% 票息债券,利率 1%。Fed 此后把 FFR 推到 5.25%。把 ytm 拖到 5%——见证长债被屠杀。',
    note_en: '⚠️ 2022.3 hike cycle inception: 20Y bond, 1% coupon, 1% yield. Fed later pushed FFR to 5.25%. Drag YTM to 5% — watch long bonds get slaughtered.',
    flash: true,
    predict: {
      title: '你即将切换到「2022 加息冲击」',
      title_en: 'You\'re about to switch to \'2022 Hike Shock\'',
      question: 'Fed 把 ytm 从 1% 推到 5%,20 年期、1% 票息的债券价格变化最接近?',
      question_en: 'Fed pushed YTM from 1% to 5%. For a 20Y, 1%-coupon bond, the price change is closest to:',
      options: [
        '+5%(避险逻辑,债券小涨)',
        '-10%(温和下跌)',
        '-30%(显著下跌,跟股市差不多)',
        '价格腰斩 -50%'
      ],
      options_en: [
        '+5% (flight-to-safety, mild rally)',
        '-10% (modest drawdown)',
        '-30% (significant fall, similar to stocks)',
        'Halved, -50%'
      ],
      correctIdx: 3,
      revealHeadline: '价格腰斩 ≈ -50%',
      revealHeadline_en: 'Price halved ≈ -50%',
      revealMsg: '20 年期、低票息债券对利率极度敏感(久期 ~18)。利率涨 4 个百分点 → 价格跌 ~50%。这就是为什么 2022 美国国债 ETF TLT 跌 -31%,比股市跌得更惨——债券不是"低风险资产",高久期债券是利率的杠杆赌注。',
      revealMsg_en: 'Long-duration low-coupon bonds are extremely rate-sensitive (duration ~18). Rates +4pp → price -50%. That\'s why 2022 long-bond ETF TLT crashed -31%, worse than stocks — bonds aren\'t "low-risk"; high-duration bonds are leveraged bets on interest rates.'
    }
  },
  '2024': {
    fv: 1000, couponRate: 4, ytm: 4.5, years: 10, inflation: 3,
    note: '2024.10:10Y 利率 ~4.5%,核心通胀 ~3%,实际利率 ~1.5%(2008 来高位)。',
    note_en: '2024.10: 10Y yield ~4.5%, core inflation ~3%, real rate ~1.5% (highest since 2008).'
  },
  'today': {
    fv: 1000, couponRate: 4, ytm: 4, years: 10, inflation: 2.5,
    note: '今天:利率回落,实际利率仍较高。试试 ytm 拖到 6%(衰退反转)看价格上涨。',
    note_en: 'Today: yields have receded, real rate still elevated. Try dragging YTM to 6% (recession reversal) to see prices rally.'
  }
}

/* ===== 第 11 章 金融监管 Basel ===== */
export interface Ch11Snapshot {
  era: string
  era_en?: string
  baselReq: number
  bankActual: number
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch11Snapshots: Record<string, Ch11Snapshot> = {
  'basel1': {
    era: 'Basel I (1988)',
    era_en: 'Basel I (1988)', baselReq: 8, bankActual: 9,
    note: 'Basel I:简单的 8% 资本充足率 / 风险加权资产。粗糙但开创了监管全球化。',
    note_en: 'Basel I: a simple 8% capital ratio / risk-weighted assets. Crude, but it launched global regulatory harmonization.'
  },
  '2008': {
    era: 'Basel II 失败',
    era_en: 'Basel II Failed', baselReq: 8, bankActual: 7,
    note: '2008 危机:Basel II 失败 — 银行用"内部模型"低估风险,实际杠杆 30+ 倍。雷曼倒闭前 CET1 看起来正常。',
    note_en: '2008 crisis: Basel II failed — banks used \'internal models\' that underestimated risk, with real leverage 30x+. Lehman\'s CET1 looked fine just before it collapsed.'
  },
  '2018': {
    era: 'Basel III 全面实施',
    era_en: 'Basel III Full Implementation', baselReq: 11, bankActual: 13,
    note: 'Basel III (2010-2018):大幅加严 — 最低 CET1 4.5% + 资本缓冲 2.5% + 稳健缓冲 2-3% = ~10-13%。引入 LCR / NSFR。',
    note_en: 'Basel III (2010-2018): substantially tightened — minimum CET1 4.5% + capital conservation buffer 2.5% + countercyclical 2-3% = ~10-13%. Introduced LCR / NSFR.'
  },
  '2023': {
    era: 'SVB 在 Basel III 下倒闭',
    era_en: 'SVB Collapse under Basel III', baselReq: 11, bankActual: 12,
    note: '⚠️ 2023.3 SVB:CET1 12% > Basel III 要求,LCR > 100%。所有指标都"合规"。但仍 48 小时倒闭。',
    note_en: '⚠️ 2023.3 SVB: CET1 12% > Basel III requirement, LCR > 100%. All metrics \'compliant\'. Still collapsed in 48 hours.',
    flash: true,
    predict: {
      title: '你即将切换到「2023 SVB Basel III 下倒闭」',
      title_en: 'You\'re about to switch to \'2023 SVB under Basel III collapse\'',
      question: 'SVB 倒闭前:CET1 12% > Basel III 要求(11%),LCR > 100%,所有监管指标合规。为什么 Basel III 没能阻止 SVB?',
      question_en: 'Before SVB collapsed: CET1 12% > Basel III requirement (11%), LCR > 100%, all metrics compliant. Why didn\'t Basel III stop it?',
      options: [
        '监管太宽松',
        'Basel III 漏掉了"利率风险"和"客户集中度"',
        'SVB 数据造假',
        '监管套利'
      ],
      options_en: [
        'Regulation too loose',
        'Basel III missed \'interest-rate risk\' and \'customer concentration\'',
        'SVB falsified data',
        'Regulatory arbitrage'
      ],
      correctIdx: 1,
      revealHeadline: 'Basel III 漏掉了利率风险 + 客户集中度',
      revealHeadline_en: 'Basel III missed interest-rate risk + customer concentration',
      revealMsg: 'Basel III 主要监管"信用风险"+ "市场风险"+ "操作风险"。但 SVB 的根源是:① **HTM 长债浮亏被会计豁免** — 持有到期不计市价 → 监管看不到;② **客户集中度** — 90% 科技公司,FDIC 限额外存款 → 挤兑速度远超模型。**Basel III 在 SVB 后被进一步修订(2024+),把利率风险和集中度纳入新框架**。**监管永远是"上次危机的解药" — 危机会找新的形式爆发**。',
      revealMsg_en: 'Basel III mainly regulates \'credit risk\' + \'market risk\' + \'operational risk\'. But SVB\'s root causes were: ① **HTM long-bond unrealized losses are accounting-exempt** — held-to-maturity isn\'t marked, regulators can\'t see; ② **Customer concentration** — 90% tech firms, deposits above FDIC limits → run velocity far exceeded models. **Basel III was further revised after SVB (2024+) to incorporate rate risk and concentration**. **Regulation is always \'the remedy for the last crisis\' — crises find new forms to break out**.'
    }
  },
  'today': {
    era: '2024+ Basel "末班车"',
    era_en: '2024+ Basel "Endgame"', baselReq: 13, bankActual: 13,
    note: '今天:Fed 在 SVB 后提议"Basel III 末班车"修订,加严利率风险监管 + 客户集中度。但仍未完全实施。监管落后于现实是常态。',
    note_en: 'Today: post-SVB the Fed proposed the \'Basel III endgame\' revisions, tightening interest-rate risk supervision + customer-concentration rules. Still not fully implemented. Regulation lagging reality is the norm.'
  }
}

/* ===== 第 10 章 银行业结构 ===== */
export interface Ch10Snapshot {
  iorb: number
  mmfYield: number
  bankDeposits: number
  mmfSize: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch10Snapshots: Record<string, Ch10Snapshot> = {
  '1980': {
    iorb: 0.05, mmfYield: 0.05, bankDeposits: 1.5, mmfSize: 0.05,
    note: '1980 影子银行萌芽:MMF 刚诞生,规模微小。商业银行仍是绝对主力。'
  },
  '2008': {
    iorb: 2.0, mmfYield: 2.0, bankDeposits: 7.5, mmfSize: 3.5,
    note: '2008 危机:MMF 挤兑(雷曼后 Reserve Primary Fund "破净")— Fed 紧急 backstop 才稳住。监管首次正视影子银行。'
  },
  '2023': {
    iorb: 4.65, mmfYield: 5.05, bankDeposits: 17.6, mmfSize: 6.0,
    note: '⚠️ 2023.3 SVB 后:MMF 收益 5.05% vs 银行存款 ~0.5%,资金加速迁移。MMF 规模 $6T 超过中小银行总存款。',
    flash: true,
    predict: {
      title: '你即将切换到「2023.3 SVB 后的资金大迁移」',
      question: '2023.3 SVB 倒闭后,IORB 4.65% vs MMF 5%+,但商业银行存款利率仍 ~0.5%。一周内有多少资金从银行流向 MMF?',
      options: [
        '$200B(常规波动)',
        '$500B',
        '$1T 左右',
        '$2.5T+(史上最大单周迁移)'
      ],
      correctIdx: 3,
      revealHeadline: '$2.5T+ 单周迁移 · 史上最大',
      revealMsg: 'SVB 倒闭引发的"利率套利大迁移":银行存款 0.5%,MMF 5%+,差距太大。客户大举把存款转到 MMF。**MMF 规模到 $6T,超过美国所有中小银行总存款**。**影子银行不再是"次要的灰色地带",而是美国金融体系核心**。Fed 不得不创设 BTFP 救银行 + ON RRP 接住 MMF 的钱 — 影子银行 + 传统银行 + 央行三体平衡。'
    }
  },
  'today': {
    iorb: 4.40, mmfYield: 4.50, bankDeposits: 18, mmfSize: 6.4,
    note: '今天:Fed 已降息,但 MMF/银行差距仍在,资金继续偏向 MMF。"利率走廊"时代新常态。'
  }
}

/* ===== 第 21 章 IS-LM 政策组合 ===== */
export interface Ch21Snapshot {
  fiscalShift: number
  monetaryShift: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch21Snapshots: Record<string, Ch21Snapshot> = {
  '1981': {
    fiscalShift: 70, monetaryShift: -90,
    note: '⚠️ 1981-82 里根 + 沃尔克:财政大幅扩张(减税 + 国防)+ 货币极致紧缩(FFR 推到 19%)。**政策冲突教科书案例** — USD 飙升 + LDC 拉美债务危机爆发。',
    flash: true,
    predict: {
      title: '你即将切换到「1981-82 里根 + 沃尔克」',
      question: '1981 里根减税 + 国防扩张(财政扩张),沃尔克把 FFR 推到 19% 反通胀(货币极紧)。这种"财扩 + 货紧"组合的最大副作用?',
      options: [
        '通胀失控',
        '经济陷入大萧条',
        'USD 飙升 + 触发拉美 LDC 债务危机',
        '美国财政破产'
      ],
      correctIdx: 2,
      revealHeadline: 'USD 飙升 + 拉美债务危机',
      revealMsg: '1981-85 USD 升值 50%(对 G10 货币),原因:① 高利率吸引外资 ② 高增长预期。但拉美国家(墨西哥、阿根廷、巴西)用美元借钱,USD 升值意味着**还款负担飙升 50%+** → 1982.8 墨西哥违约,触发 LDC 债务危机。10 年间拉美 GDP 累计下滑,被称为"失落的十年"。**政策组合冲突的副作用从不只在国内,会通过汇率渠道传染全球**。今日 2024 美国"财政赤字 + Fed 紧缩"是同一组合的现代版。'
    }
  },
  '2008': {
    fiscalShift: 50, monetaryShift: 90,
    note: '2008-09 双扩张:奥巴马 ARRA 财政刺激(0.8T)+ Fed QE1 + ZLB。利率被压到 0,产出温和恢复。但 ZLB 后政策力度被打折(联系第 23 章)。'
  },
  '1995': {
    fiscalShift: -40, monetaryShift: 30,
    note: '1990s 末克林顿 + Greenspan:财政减赤(预算盈余)+ 货币温和宽松。低利率推高资产价 → 1999 dotcom 泡沫种子。'
  },
  '2020': {
    fiscalShift: 90, monetaryShift: 90,
    note: '2020 疫情双扩张极致:CARES 系列 5T+ 财政 + Fed 无限 QE。两个 90% 上限组合 — 史无前例。结果:V 型反弹 + 2022 通胀 9.1%。'
  },
  '2024': {
    fiscalShift: 60, monetaryShift: -70,
    note: '2024 现状:美国财政赤字 GDP 6%(扩张)+ Fed 紧缩 5.5% / QT 进行中。"财扩 + 货紧"组合再现,长债被双向推高。'
  }
}

/* ===== 第 25 章 卢卡斯批判 ===== */
export interface Ch25Snapshot {
  policyStrength: number     // 政策力度
  expectedness: number       // 公众预期度
  credibility: number        // 央行可信度
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch25Snapshots: Record<string, Ch25Snapshot> = {
  '1979pre': {
    policyStrength: 50, expectedness: 25, credibility: 25,
    note: '1979 沃尔克前夜:Burns 时代 Fed 信誉差。即使想紧缩,公众认为"会让步",政策力度被打折。**没有可信度,政策乘数严重弱化**。'
  },
  '1982': {
    policyStrength: 80, expectedness: 70, credibility: 80,
    note: '1982 沃尔克坚守:经过 3 年极致紧缩,公众已相信"Fed 真的反通胀"。可信度建立后,即使政策被预期,效果仍然显著(预期反向 → 通胀预期下降 → 自我强化反通胀)。'
  },
  '2008': {
    policyStrength: 80, expectedness: 10, credibility: 70,
    note: '⚠️ 2008.11 QE1 启动:史上首次,经典模型(IS-LM)基于历史数据预测通胀飙升。但 QE 是新政策,公众和模型都没"经验"。结果:模型预测全错。',
    flash: true,
    predict: {
      title: '你即将切换到「2008.11 QE1 启动」',
      question: '2008 Fed 启动 QE1,经济学家(基于 IS-LM 等历史模型)预测美国通胀 1-2 年内飙到 5-10%。实际 2009-2014 通胀?',
      options: [
        '5-10%(模型预测对)',
        '3-5%(温和上升)',
        '2% 左右(基本稳定)',
        '1.7%(几乎没动)'
      ],
      correctIdx: 3,
      revealHeadline: '通胀仅 1.7% · 历史模型预测全错',
      revealMsg: '经典模型基于历史数据(1980 通胀时代)估计 M → P 系数。但 QE 是史上首次,公众没有"经验"预测它。结果:① 银行持币不放贷(乘数砸到 1)② 公众通胀预期保持 2% 锚定,自我强化稳定。**这就是卢卡斯批判的活生生案例**:估计的"政策乘数"基于旧政策环境,改了政策本身,系数不再适用。教学点:**模型不能只看历史数据,要看"政策制度"是否改变**——这是为什么 2020 后宏观经济学家更谨慎使用历史回归。'
    }
  },
  '2020': {
    policyStrength: 70, expectedness: 85, credibility: 70,
    note: '2020 FAIT 战略:Fed 提前宣布"允许通胀短期超调"。公众完全预期 → 政策效果被消化。同时"暂时性"判断让 Fed 反应慢 → 2022 通胀失锚。'
  },
  'today': {
    policyStrength: 30, expectedness: 65, credibility: 75,
    note: '今天:Fed 信誉中等(2022 后部分受损)。政策力度温和,被市场充分预期 → 效果可预测但温和。'
  }
}

/* ===== 第 19 章 货币需求 MV=PY ===== */
export interface Ch19Snapshot {
  m: number       // M2 万亿
  v: number       // V 速度
  p: number       // 价格指数
  y: number       // 实际 GDP 万亿
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch19Snapshots: Record<string, Ch19Snapshot> = {
  '1960s': {
    m: 0.4, v: 4.0, p: 0.2, y: 8,
    note: '1960s 数量论时代:V 稳定在 4 左右(那时 M 用 M1)。Friedman 认为 V 是稳定函数,数量论可预测通胀。这是数量论的"鼎盛期"。'
  },
  '1980s': {
    m: 1.6, v: 1.95, p: 0.5, y: 6.3,
    note: '1980s 沃尔克紧缩:M 增速放缓,但通胀下降 + 实际 GDP 反弹。V 适度上升(高利率 + 持币机会成本上升)。'
  },
  '2008': {
    m: 21, v: 1.4, p: 1.0, y: 21,
    note: '⚠️ 2008-2014 QE:M2 从 8 → 12T(+50%),CPI 只 +1.7%/年。V 从 2.0 跌到 1.4(-30%)直接抵消了 M 增长 → MV 缓增 = PY 缓增。',
    flash: true,
    predict: {
      title: '你即将切换到「2008-2014 QE 期」',
      question: 'Friedman 说"通胀就是货币现象 — 印多少钱,通胀涨多少"。但 2008-2014 美国 M2 +50%,CPI 只 +1.7%/年。原因?',
      options: [
        'Fed 数据撒谎',
        'M2 没真的增加',
        '货币流通速度 V 大幅下降抵消了 M 增长',
        '通胀数据错'
      ],
      correctIdx: 2,
      revealHeadline: 'V 暴跌 30% 抵消了 M 增长',
      revealMsg: '**MV = PY 是会计恒等式,不是行为方程**。当 V 不稳定,数量论失效。2008-2014 V 从 2.0 跌到 1.4(下降 30%),抵消了 M2 +50% 的影响。原因:① 危机后家庭/企业去杠杆,持币不消费;② 银行准备金锁住不放贷(联系第 14 章 m 砸到 1);③ 利率到 0,持币机会成本极低。**Friedman 假设 V 稳定 — 这个假设短期不成立**。教学点:数量论是"长期渐近真理",短期 V 波动可让 M 与 P 关系完全失效。'
    }
  },
  '2022': {
    m: 21.7, v: 1.55, p: 1.18, y: 22,
    note: '2022 通胀:M2 从 18 飙到 21.7(2020-2021 +25%),V 触底回升到 1.55,P 从 1.0 → 1.18(累积 18%)。V 部分恢复 + M 增长 → CPI 飙到 9.1%。'
  },
  'today': {
    m: 21, v: 1.7, p: 1.22, y: 25,
    note: '今天:M2 平稳,V 接近 1.7(略低于历史均值)。P 累积上涨,Y 增长。MV ≈ PY 大致平衡。'
  }
}

/* ===== 第 24 章 通胀 4 机制 ===== */
export interface Ch24Snapshot {
  m2Growth: number
  outputGap: number
  oilShock: number
  expectGap: number
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch24Snapshots: Record<string, Ch24Snapshot> = {
  '1979': {
    m2Growth: 10, outputGap: -1, oilShock: 120, expectGap: 6,
    note: '1979 滞胀峰值:石油冲击主导(供给 +5%)+ 货币容忍(M2 增 10%)+ 预期失锚(+4%)= CPI 13.5%。供给冲击是核心。',
    note_en: '1979 stagflation peak: oil shock dominant (supply +5%) + monetary tolerance (M2 +10%) + un-anchored expectations (+4%) = CPI 13.5%. The supply shock was the core.'
  },
  '1990s': {
    m2Growth: 4, outputGap: 1, oilShock: 5, expectGap: 0,
    note: '1990s 大缓和:4 机制全在锚定状态。M2 适度增 + 经济温和过热 + 油价稳 + 预期锚定 → CPI 2-3%。教科书"理想通胀"。',
    note_en: '1990s Great Moderation: all 4 mechanisms anchored. Moderate M2 growth + mild overheating + stable oil + anchored expectations → CPI 2-3%. The textbook \'ideal inflation\'.'
  },
  '2008': {
    m2Growth: 8, outputGap: -3, oilShock: -30, expectGap: -0.5,
    note: '2008-2014 QE 期:M2 增 8% 看似多,但货币乘数砸到 1 → 实际"基础货币"扩张没传到通胀。需求负 + 油跌 + 预期偏低 → CPI 仅 1.7%。"印钱不通胀"案例。',
    note_en: '2008-2014 QE era: M2 +8% looks high, but the multiplier crashed to 1 → actual \'base money\' expansion didn\'t reach inflation. Negative demand + falling oil + low expectations → CPI only 1.7%. The \'printing without inflation\' case.'
  },
  '2022': {
    m2Growth: 12, outputGap: 2, oilShock: 80, expectGap: 2,
    note: '⚠️ 2022 通胀冲击:4 机制叠加 — 货币(QE 无限)+ 需求(财政发钱)+ 供给(疫情+俄乌)+ 预期(开始失锚)→ CPI 9.1%。完美风暴。',
    note_en: '⚠️ 2022 inflation shock: all 4 mechanisms stacked — monetary (unlimited QE) + demand (fiscal handouts) + supply (pandemic + Russia-Ukraine) + expectations (beginning to un-anchor) → CPI 9.1%. Perfect storm.',
    flash: true,
    predict: {
      title: '你即将切换到「2022 通胀冲击」',
      title_en: 'You\'re about to switch to \'2022 Inflation Shock\'',
      question: '2022.6 美国 CPI 9.1% 创 40 年新高。最准确的归因(选最完整的)?',
      question_en: '2022.6 US CPI 9.1%, 40-year high. The most accurate attribution (pick the most complete)?',
      options: [
        '仅货币驱动(Fed 印钱)',
        '仅供给冲击(疫情 + 俄乌)',
        '4 机制全有,以供给 + 预期为主',
        '与 Fed 完全无关'
      ],
      options_en: [
        'Monetary only (Fed printed)',
        'Supply shock only (pandemic + Russia-Ukraine)',
        'All 4 mechanisms, dominated by supply + expectations',
        'Nothing to do with the Fed'
      ],
      correctIdx: 2,
      revealHeadline: '4 机制全有 · 以供给 + 预期为主',
      revealHeadline_en: 'All 4 mechanisms · dominated by supply + expectations',
      revealMsg: '2022 通胀是**完美风暴**:① 货币(2020-2021 QE 无限 + M2 +25%);② 需求(财政 stimulus 直接发钱 5T);③ 供给(疫情供应链 + 俄乌能源);④ 预期(被"暂时性"误判 → 开始失锚)。任一单因素解释都不完整。**弗里德曼"通胀始终是货币现象"对长期对,短期太简化**。教学点:**2022 是 4 种机制叠加,只看一个机制会误判**。这就是为什么 Fed 一开始的"暂时性"判断错了——他们只看了供给侧。',
      revealMsg_en: '2022 inflation was a **perfect storm**: ① Monetary (2020-2021 unlimited QE + M2 +25%); ② Demand (fiscal stimulus, $5T direct handouts); ③ Supply (pandemic supply chains + Russia-Ukraine energy); ④ Expectations (misjudged as \'transitory\' → began un-anchoring). Any single-factor explanation is incomplete. **Friedman\'s \'inflation is always a monetary phenomenon\' is right long-run, too simplistic short-run**. Teaching point: **2022 stacked 4 mechanisms; looking at one alone leads to misjudgment**. This is why the Fed\'s initial \'transitory\' call was wrong — they only looked at the supply side.'
    }
  },
  'today': {
    m2Growth: 3, outputGap: 0.5, oilShock: -5, expectGap: 1,
    note: '今天:M2 回落 + 经济温和 + 油价稳 + 预期接近锚。CPI 3% 左右,接近 Fed 2% 目标但仍在限制性区间。',
    note_en: 'Today: M2 receding + mild economy + stable oil + expectations near anchor. CPI around 3%, close to Fed\'s 2% target but still in restrictive territory.'
  }
}

/* ===== 第 23 章 货币政策 5 大传导渠道 ===== */
export interface Ch23Snapshot {
  fedAction: number
  bankHealth: number
  borrowerNetworth: number
  ratePosition: number
  consumerLeverage: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch23Snapshots: Record<string, Ch23Snapshot> = {
  '1990s': {
    fedAction: 30, bankHealth: 75, borrowerNetworth: 70, ratePosition: 60, consumerLeverage: 55,
    note: '1990s 大缓和:5 大渠道全开。银行健康 + 借款人净值好 + 消费者杠杆中等。Fed 一调利率立刻传导,经典菲利普斯曲线适用。'
  },
  '2001': {
    fedAction: -60, bankHealth: 70, borrowerNetworth: 60, ratePosition: 65, consumerLeverage: 60,
    note: '2001 dotcom 后:Fed 大幅降息(6.5%→1%)。利率渠道 + 资产价格渠道有效,但信贷渠道弱(银行对科技业警惕)。最终带动房贷大潮 → 埋下 2008 种子。'
  },
  '2008': {
    fedAction: -90, bankHealth: 22, borrowerNetworth: 28, ratePosition: 5, consumerLeverage: 80,
    note: '⚠️ 2008-2014 QE 期:Fed 极致宽松($4T+)+ 利率到 ZLB。但银行不放贷 + 借款人净值崩塌 + 消费者去杠杆 → 5 个渠道里 3 个失效。',
    flash: true,
    predict: {
      title: '你即将切换到「2008-2014 QE 期」',
      question: 'Fed 把利率推到 0 + QE 万亿规模 + 7 年极致宽松。但 GDP 复苏极其缓慢,失业率 10%+ 持续。为什么?',
      options: [
        '财政紧缩抵消',
        '5 大传导渠道里 3 个失效:信贷阻塞 + 资产负债表崩 + 流动性陷阱',
        '通胀预期失锚',
        '美元贬值'
      ],
      correctIdx: 1,
      revealHeadline: '5 渠道里 3 个失效',
      revealMsg: '利率渠道:✗ 已 ZLB,无法继续降。资产价格:○ 部分有效(QE 推高股价 + 房价)。**信贷渠道**:✗ 银行净值受损,不愿放贷。**资产负债表**:✗ 借款人净值被资产价格暴跌击穿,信用受限。**流动性效应**:✗ 消费者集体去杠杆,不借钱不消费。**Fed 把"水"灌进系统但流不到实体**——这就是为什么 QE 万亿 M2 几乎不增。教学点:**货币政策不是单一管道,是 5 通道并联。任一渠道阻塞都会减弱整体效果**。'
    }
  },
  '2020': {
    fedAction: -85, bankHealth: 75, borrowerNetworth: 75, ratePosition: 5, consumerLeverage: 65,
    note: '2020 疫情应对:Fed 极致宽松,但银行健康 + 借款人净值高(2008 后修复)+ 财政直接发钱(stimulus check)绕过银行。这次 5 渠道有 4 个工作 → V 型反弹。'
  },
  '2022': {
    fedAction: 90, bankHealth: 80, borrowerNetworth: 70, ratePosition: 95, consumerLeverage: 60,
    note: '2022 加息周期:Fed 极致紧缩(525bp/16 个月)。5 渠道全开,传导效率高 → 但因起点位置极高 + 财政赤字大,通胀仍 9.1% 才回落。'
  }
}

/* ===== 第 22 章 AD-AS 模型 ===== */
export interface Ch22Snapshot {
  adShift: number
  srasShift: number
  potentialY: number
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch22Snapshots: Record<string, Ch22Snapshot> = {
  '1960s': {
    adShift: 1, srasShift: 0, potentialY: 100,
    note: '1960s 大缓和:温和 AD 增 + SRAS 平稳。经典菲利普斯曲线时期(失业↓ → 通胀↑ 权衡)。这就是 Burns/Greenspan 早期信奉的世界。',
    note_en: '1960s Great Moderation: mild AD growth + stable SRAS. The classic Phillips curve era (unemployment↓ → inflation↑ trade-off). This was the world Burns and early Greenspan believed in.'
  },
  '1973': {
    adShift: 0, srasShift: 4, potentialY: 100,
    note: '1973 OPEC 石油禁运:SRAS 大幅左移(原油从 $3 飙到 $12)。AD 几乎不动。教科书级"成本推动型通胀"——同时通胀↑+失业↑+产出↓。',
    note_en: '1973 OPEC oil embargo: SRAS shifts left sharply (crude from $3 to $12). AD barely moves. Textbook cost-push inflation — inflation↑ + unemployment↑ + output↓ all at once.'
  },
  '1979': {
    adShift: 1, srasShift: 8, potentialY: 100,
    note: '⚠️ 1979 滞胀峰值:CPI 13.5%(战后最高)+ 失业 5.8% + 经济衰退。Burns 宽松货币 + 第二次石油危机叠加 → 滞胀失控。',
    note_en: '⚠️ 1979 stagflation peak: CPI 13.5% (post-war high) + 5.8% unemployment + recession. Burns\' loose money + second oil crisis → stagflation out of control.',
    flash: true,
    predict: {
      title: '你即将切换到「1979 滞胀峰值」',
      title_en: 'You\'re about to switch to \'1979 Stagflation Peak\'',
      question: '1973 OPEC 石油禁运后,Fed 主席 Burns 选择"保就业"继续宽松货币。1979 美国 CPI 通胀峰值多少?',
      question_en: 'After the 1973 OPEC oil embargo, Fed Chair Burns kept money loose to \'protect employment.\' What was the 1979 US CPI inflation peak?',
      options: [
        '5%(轻度通胀)',
        '8%(中度)',
        '13.5%(战后最高)',
        '20%(失控)'
      ],
      options_en: [
        '5% (mild)',
        '8% (moderate)',
        '13.5% (post-war high)',
        '20% (out of control)'
      ],
      correctIdx: 2,
      revealHeadline: '1979 CPI 13.5% — 战后最高',
      revealHeadline_en: '1979 CPI 13.5% — post-war high',
      revealMsg: '1979 CPI 13.5% 创战后最高,但**失业率仍 5.8%,GDP 还在缩**。这就是滞胀——经典菲利普斯曲线被打破:"失业↓→通胀↑"变成"高失业 + 高通胀"同时存在。原因:**供给冲击(石油)直接推高 SRAS,而非 AD**——经典菲利普斯只描述需求冲击。教学点:**菲利普斯曲线只在需求冲击主导时有效;供给冲击时它失效**。1979 沃尔克接手,用 20% FFR 三年才把通胀打下来(详见第 13 章)。',
      revealMsg_en: '1979 CPI 13.5% was a post-war high — but **unemployment was still 5.8%, GDP still shrinking**. This is stagflation: the classic Phillips curve broke. \'Unemployment↓ → inflation↑\' became \'high unemployment + high inflation\' simultaneously. Reason: **supply shocks (oil) push SRAS directly, not AD** — the classic Phillips curve only describes demand shocks. Teaching point: **the Phillips curve only works when demand shocks dominate; it fails for supply shocks**. Volcker took over in 1979 and used 20% FFR over three years to break inflation (see Ch.13).'
    }
  },
  '2008': {
    adShift: -7, srasShift: 0, potentialY: 100,
    note: '2008 危机:AD 大幅左移(信贷冻结 + 信心崩塌)。短期通缩压力 + 失业飙到 10%。需求冲击的教科书案例,与 1973 供给冲击形成对照。',
    note_en: '2008 crisis: AD shifts left sharply (credit freeze + collapsing confidence). Short-term deflationary pressure + unemployment spike to 10%. A textbook demand-shock case, contrasting with the 1973 supply shock.'
  },
  '2022': {
    adShift: 5, srasShift: 5, potentialY: 100,
    note: '2022 疫情通胀:AD 大幅右移(财政刺激 + QE 无限)+ SRAS 左移(供应链 + 能源)。**双向夹击 → CPI 9.1%**。这是 1979 来最复杂的通胀。',
    note_en: '2022 pandemic inflation: AD shifts right sharply (fiscal stimulus + unlimited QE) + SRAS shifts left (supply chain + energy). **Two-way squeeze → CPI 9.1%**. The most complex inflation episode since 1979.'
  }
}

/* ===== 第 18 章 国际金融体系(三元悖论) ===== */
export type TrilemmaPick = 'fixed' | 'free' | 'independent'  // 固定汇率 / 资本自由 / 独立货币政策

export interface Ch18Snapshot {
  picks: TrilemmaPick[]    // 用户选择的两个
  example: string          // 代表经济体
  example_en?: string
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch18Snapshots: Record<string, Ch18Snapshot> = {
  'china': {
    picks: ['fixed', 'independent'],
    example: '🇨🇳 中国 · 越南 · 印度',
    note: '制度 1:固定汇率 + 独立货币政策 + 资本管制。中国选择放弃资本自由流动,换取汇率稳定 + 货币政策独立。代价:跨境投资受限,人民币国际化受阻。',
    note_en: 'Regime 1: fixed FX + independent monetary policy + capital controls. China gives up free capital movement in exchange for stable FX + monetary autonomy. Cost: cross-border investment limited, RMB internationalization hampered.'
  },
  'us': {
    picks: ['free', 'independent'],
    example: '🇺🇸 美国 · 🇯🇵 日本 · 🇨🇦 加拿大 · 🇦🇺 澳大利亚',
    note: '制度 2:浮动汇率 + 资本自由 + 独立货币政策。多数发达国家选择放弃汇率稳定,接受汇率波动。代价:出口企业承担汇率风险,需要复杂对冲。',
    note_en: 'Regime 2: floating FX + free capital + independent monetary policy. Most developed countries give up FX stability for volatility. Cost: exporters bear FX risk, need complex hedging.'
  },
  'hk': {
    picks: ['fixed', 'free'],
    example: '🇭🇰 香港(联系汇率)· 🇪🇺 欧元区成员',
    note: '制度 3:固定汇率 + 资本自由 + 放弃独立货币政策。香港 1983 起钉住 USD,完全跟随 Fed。2022 Fed 加息时港府被迫加息至 5%+,本地经济衰退,但港币稳定。**这是制度选择的代价**。',
    note_en: 'Regime 3: fixed FX + free capital + give up monetary independence. HK has pegged USD since 1983, fully tracking the Fed. When Fed hiked in 2022, HK was forced to 5%+ — local recession, but HKD stable. **This is the cost of regime choice**.'
  },
  'gbp1992': {
    picks: ['fixed', 'free', 'independent'],   // 试图三个都要 — 不可能
    example: '⚠️ 1992.9 英镑危机',
    note: '⚠️ 1992.9.16 黑色星期三:英国试图同时维持固定汇率(ERM)+ 资本自由 + 独立货币政策。Soros 看穿矛盾大举做空,BoE 一天用 $3.4B 保卫,最终被迫退出 ERM。',
    note_en: '⚠️ 1992.9.16 Black Wednesday: the UK tried to hold all three — fixed FX (ERM) + free capital + independent monetary policy. Soros saw the contradiction, shorted aggressively; BoE burned $3.4B in one day, eventually forced out of ERM.',
    flash: true,
    predict: {
      title: '你即将切换到「1992.9 英镑危机」',
      title_en: 'You\'re about to switch to \'1992.9 GBP crisis\'',
      question: '1992.9 BoE 用尽外汇储备保卫英镑钉住马克的 ERM 制度。Soros 大举做空英镑,BoE 一天用掉 $3.4B。结果?',
      question_en: '1992.9: BoE burned FX reserves defending GBP\'s ERM peg to DEM. Soros shorted aggressively; BoE used $3.4B in one day. Outcome?',
      options: [
        'BoE 成功保卫,英镑稳定',
        '英镑波动但留在 ERM',
        '9.16 黑色星期三:英镑被迫退出 ERM,贬值 15%。Soros 赚 10 亿',
        '欧元区成立提前'
      ],
      options_en: [
        'BoE defended successfully, GBP stable',
        'GBP wobbled but stayed in ERM',
        'Black Wednesday 9.16: GBP forced out of ERM, devalued 15%. Soros earned $1B',
        'Eurozone formed early'
      ],
      correctIdx: 2,
      revealHeadline: '英镑被迫退出 ERM · Soros 赚 10 亿',
      revealHeadline_en: 'GBP forced out of ERM · Soros earned $1B',
      revealMsg: 'BoE 在 1992.9.16 终于宣布退出 ERM,英镑贬值 15%。**这是三元悖论被市场强制执行的经典案例**:英国试图同时维持(1)固定汇率(钉马克)+(2)资本自由 +(3)独立货币政策 → 不可能。Soros 看穿这个矛盾,在 BoE 弹尽粮绝时大举做空,赚了 10 亿美金。教学点:**三元悖论不是理论,是市场会强制执行的物理定律**。1997 亚洲金融危机、2015 SNB 脱钩 EUR/CHF 都是同一机制。',
      revealMsg_en: 'BoE finally announced ERM exit on 1992.9.16, GBP devalued 15%. **A classic case of the impossible trinity enforced by markets**: the UK tried to hold (1) fixed FX (DEM peg) + (2) free capital + (3) independent monetary policy → impossible. Soros saw through it and shorted heavily as BoE ran out of ammo, earning $1B. Teaching point: **the impossible trinity isn\'t theory — it\'s a physics law markets enforce**. The 1997 Asian crisis and 2015 SNB EUR/CHF unpeg are the same mechanism.'
    }
  },
  'today': {
    picks: ['free', 'independent'],
    example: '默认 · 浮动汇率体系',
    example_en: 'Default · floating FX regime',
    note: '今天:多数主要经济体选制度 2(浮动汇率)。但去美元化趋势让"哪种制度更好"的争论重新激烈。',
    note_en: "Today: most major economies are on Regime 2 (floating FX). But the de-dollarization trend has reignited the debate over 'which regime is best'."
  }
}

/* ===== 第 13 章 FOMC 点阵图 ===== */
export interface Ch13Snapshot {
  inflationGap: number
  outputGap: number
  uncertainty: number
  actualFFR: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch13Snapshots: Record<string, Ch13Snapshot> = {
  '1981': {
    inflationGap: 10, outputGap: -2, uncertainty: 30, actualFFR: 19.1,
    note: '⚠️ 1981.6 沃尔克紧缩巅峰:通胀 12%,失业率 7.5%,FFR 推到 19.1%(史上最高)。农民开拖拉机围 Fed 大楼,无数企业倒闭。沃尔克坚持不让步。',
    flash: true,
    predict: {
      title: '你即将切换到「1981.6 沃尔克紧缩」',
      question: '1981 沃尔克把 FFR 推到 19.1%,引发 1981-82 双重衰退,失业率 11%,无数企业破产。农民开拖拉机围 Fed 大楼。问:沃尔克会让步吗?',
      options: [
        '让步,降息救经济',
        '部分让步,温和降息',
        '不让步,继续紧缩',
        '不让步,通胀 1986 降到 1.5%,大缓和起点'
      ],
      correctIdx: 3,
      revealHeadline: '不让步 — 通胀 1986 降到 1.5%,开启大缓和',
      revealMsg: '沃尔克坚持紧缩 3 年,直到通胀降到 1.5%(1986)。**短期承担骂名换长期通胀稳定** = 央行独立性的核心价值。1984-2007 大缓和(GDP 波动率减半 + 通胀 2-3%)正是这次坚持的成果。土耳其反例:Erdogan 强迫央行降息(2021-2023)→ 里拉崩盘 -75% + 通胀 80%+。教学点:**Fed 的"政治隔离"结构(7 理事 14 年任期 + 联储行长地区任命)是反通胀的制度基础**。'
    }
  },
  '2008': {
    inflationGap: -1, outputGap: -4, uncertainty: 80, actualFFR: 0.16,
    note: '2008.12 紧急 ZLB:通胀转负,失业率 7.3% 飙升中。FOMC 把 FFR 推到 0.25%,启动 QE1。委员意见高度一致(危机中无人敢鸽派)。'
  },
  '2015': {
    inflationGap: -1.3, outputGap: -1, uncertainty: 60, actualFFR: 0.40,
    note: '2015.12 启动加息:Fed 终于离开 ZLB,但通胀还低于目标。委员意见分歧(部分担心过早加息)。耶伦时期的"渐进加息"开始。'
  },
  '2022': {
    inflationGap: 7.1, outputGap: 1, uncertainty: 70, actualFFR: 1.58,
    note: '2022.6 通胀冲击:CPI 9.1% 创 40 年新高,但 FFR 仅 1.58%(滞后泰勒规则 12pp)。FOMC 委员意见分裂——鹰派要 75bp,鸽派要保留弹性。'
  },
  'today': {
    inflationGap: 1, outputGap: 0, uncertainty: 40, actualFFR: 4.5,
    note: '今天:通胀回落但仍超目标,经济稳健。委员观点回归正态分布。Fed 在"维持限制性"和"避免过紧"之间走钢丝。'
  }
}

/* ===== 第 15 章 Fed 利率走廊 ===== */
export interface Ch15Snapshot {
  iorb: number
  onRrp: number
  reserves: number      // $T
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch15Snapshots: Record<string, Ch15Snapshot> = {
  '2008': {
    iorb: 0.25, onRrp: 0.05, reserves: 0.05,
    note: '2008 危机前:OMO 是唯一工具,准备金水平极低($0.05T)。Fed 直接用 OMO 微调短端,模型简单但风险大。',
    note_en: 'Pre-2008 crisis: OMO was the only tool, reserves extremely low ($0.05T). Fed used OMO to fine-tune the short end — simple model, high risk.'
  },
  '2014': {
    iorb: 0.25, onRrp: 0.05, reserves: 2.6,
    note: '2014 充足准备金期:QE3 后准备金 $2.6T,Fed 用 IOER + ON RRP 形成利率走廊。这是新制度的实际起点。',
    note_en: '2014 ample-reserves era: post-QE3 reserves $2.6T, Fed used IOER + ON RRP to form the rate corridor. The practical start of the new regime.'
  },
  '2019': {
    iorb: 2.10, onRrp: 1.95, reserves: 1.4,
    note: '⚠️ 2019.9 REPO 危机:Fed 缩表过头,准备金降到 $1.4T(< 充足水平)。隔夜 REPO 飙到 10%,IORB 失控。',
    note_en: '⚠️ 2019.9 REPO crisis: Fed shrank the balance sheet too far, reserves fell to $1.4T (< ample). Overnight REPO spiked to 10%, IORB lost control.',
    flash: true,
    predict: {
      title: '你即将切换到「2019.9 REPO 危机」',
      title_en: 'You\'re about to switch to \'2019.9 REPO crisis\'',
      question: '2019.9 美国 REPO 利率突然飙到 10%(正常 2%)。IORB 是 2.10%,Fed 理论上能用 IORB 锁住短期利率。为什么走廊崩了?',
      question_en: '2019.9: US REPO rate suddenly spiked to 10% (normal 2%). IORB was 2.10% — Fed should have anchored short rates with IORB. Why did the corridor break?',
      options: [
        'Fed 操作错误',
        '银行联手操纵',
        'Fed 缩表过头,银行准备金 $1.4T(< 充足水平 $3T),走廊失锚',
        '监管失败'
      ],
      options_en: [
        'Fed operational mistake',
        'Banks colluded',
        'Fed shrank balance sheet too far; reserves $1.4T (< ample level $3T); corridor un-anchored',
        'Regulatory failure'
      ],
      correctIdx: 2,
      revealHeadline: '准备金不足让 IORB 失去控制力',
      revealHeadline_en: 'Insufficient reserves stripped IORB of its control',
      revealMsg: '教科书:"Fed 用 IORB 锁住短期利率"。现实:**当银行准备金供给不足时 IORB 不再起作用**。Fed 此前 2018-2019 缩表把准备金从 $2.6T 缩到 $1.4T(过激),银行间流动性紧张 → 隔夜借钱市场崩 → REPO 飙到 10%。Fed 几小时内紧急启动"非 QE"扩表,后又创设 SRF(2021.7)永久解决。教学点:**利率走廊只在"充足准备金"制度下有效**——这是教材没说清的关键边界条件。',
      revealMsg_en: 'Textbook: \'Fed uses IORB to lock the short rate.\' Reality: **when bank reserves are insufficient, IORB stops working**. Fed\'s 2018-2019 QT shrank reserves from $2.6T to $1.4T (too aggressive) → interbank liquidity tight → overnight market broke → REPO spiked to 10%. Fed emergency \'non-QE\' expansion within hours, later created SRF (2021.7) as a permanent fix. Teaching point: **the rate corridor only works under the \'ample reserves\' regime** — a key boundary condition textbooks don\'t make clear.'
    }
  },
  '2024': {
    iorb: 4.65, onRrp: 4.55, reserves: 3.3,
    note: '2024:Fed 已完成 2 年 QT,准备金从 $4.5T 降到 $3.3T。主动降速 + SRF 兜底,精确控制走廊。**注意:IORB 是 2021.7 合并 IOER+IORR 后的单一工具**(教材未更新)。',
    note_en: '2024: Fed completed 2 years of QT, reserves down from $4.5T to $3.3T. Actively slowing + SRF backstop, precise corridor control. **Note: IORB is the single tool after merging IOER+IORR in 2021.7** (textbooks not yet updated).'
  },
  'today': {
    iorb: 4.40, onRrp: 4.30, reserves: 3.0,
    note: '今天:Fed 降息但仍 QT。准备金接近"充足"下限。SRF 已待命,可应对类似 2019.9 的场景。',
    note_en: 'Today: Fed cutting but still QT. Reserves near the \'ample\' floor. SRF is on standby, ready for a 2019.9-style scenario.'
  }
}

/* ===== 第 16 章 泰勒规则 ===== */
export interface Ch16Snapshot {
  inflation: number
  inflationTarget: number
  outputGap: number
  naturalRate: number
  alpha: number
  beta: number
  actualFFR: number       // 实际联邦基金利率
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch16Snapshots: Record<string, Ch16Snapshot> = {
  '1981': {
    inflation: 10, inflationTarget: 2, outputGap: -2, naturalRate: 0.5,
    alpha: 1.5, beta: 0.5, actualFFR: 14,
    note: '1981 沃尔克紧缩:通胀 10%。沃尔克用极激进 α=1.5 → 隐含利率 14%+,实际 FFR 也到 14%。"Fed 真信通胀目标"的标志。',
    note_en: '1981 Volcker tightening: inflation 10%. Volcker used an aggressive α=1.5 → implied rate 14%+, actual FFR also at 14%. The hallmark of "Fed truly believes its inflation target".'
  },
  '2008': {
    inflation: 2, inflationTarget: 2, outputGap: -4, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 1.0,
    note: '2008 危机:通胀达标 + 产出缺口 -4%。泰勒规则要求 i* = 0.5(过松),但 ZLB 限制让实际只能到 0%。',
    note_en: '2008 crisis: inflation on-target + output gap -4%. Taylor rule prescribes i* = 0.5 (too easy), but ZLB caps actual rate at 0%.'
  },
  '2010': {
    inflation: 1.5, inflationTarget: 2, outputGap: -3, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 0.25,
    note: '2010-2014 QE 期:通胀低于目标 + 衰退后复苏。泰勒说要 i*=-0.75%,但 ZLB → Fed 用 QE 替代降息。陷阱期间泰勒规则失灵。',
    note_en: '2010-2014 QE era: inflation below target + post-recession recovery. Taylor implies i* = -0.75%, but ZLB → Fed used QE in lieu of cuts. The Taylor rule breaks inside a liquidity trap.'
  },
  '2022': {
    inflation: 9.1, inflationTarget: 2, outputGap: 1, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 1.25,
    note: '⚠️ 2022.6 通胀峰值:CPI 达 9.1%,但 Fed 才开始加息,实际 FFR 仅 1.25%。泰勒规则隐含 13%+。1980 来最大滞后。',
    note_en: '⚠️ 2022.6 inflation peak: CPI hit 9.1%, but Fed had just begun hiking, actual FFR only 1.25%. Taylor rule implies 13%+. The biggest lag since 1980.',
    flash: true,
    predict: {
      title: '你即将切换到「2022.6 通胀冲击」',
      title_en: 'You\'re about to switch to \'2022.6 Inflation Shock\'',
      question: '2022.6 美国 CPI 达到 9.1% 峰值,实际 FFR 还在 1.25%。按泰勒规则(α=β=0.5),Fed 应该把利率定在?',
      question_en: 'By 2022.6 US CPI peaked at 9.1%, actual FFR only 1.25%. Per the Taylor rule (α=β=0.5), where should the Fed have set rates?',
      options: [
        '2.5%(温和加息)',
        '5%(快速追赶)',
        '7.5%(激进)',
        '13%+(沃尔克级激进)'
      ],
      options_en: [
        '2.5% (mild hike)',
        '5% (fast catch-up)',
        '7.5% (aggressive)',
        '13%+ (Volcker-level aggressive)'
      ],
      correctIdx: 3,
      revealHeadline: '泰勒规则隐含 13%+ · Fed 偏离 12 个百分点',
      revealHeadline_en: 'Taylor rule implies 13%+ · Fed lagged by 12 percentage points',
      revealMsg: '按泰勒:i* = 0.5 + 9.1 + 0.5×(9.1-2) + 0.5×1 = 13.7%。实际 FFR 仅 1.25%。**1980 来最大滞后**。原因:① FAIT 战略允许"暂时"超调;② 判断为暂时性供给冲击;③ 不愿激进打击就业。后果:被迫以 1980 来最快速度追赶加息(2022.3-2023.7 共 525bp)。教学点:**FAIT 容忍超调让 Fed 反应慢**——这是该战略的内在矛盾。',
      revealMsg_en: 'Taylor: i* = 0.5 + 9.1 + 0.5×(9.1-2) + 0.5×1 = 13.7%. Actual FFR only 1.25%. **The biggest lag since 1980**. Reasons: ① FAIT framework permits "temporary" overshoots; ② Diagnosed as transitory supply shock; ③ Reluctance to aggressively hurt employment. Consequence: forced to catch up at the fastest pace since 1980 (525bp from 2022.3 to 2023.7). Teaching point: **FAIT\'s tolerance of overshoot delays Fed response** — an inherent contradiction in the strategy.'
    }
  },
  'today': {
    inflation: 3, inflationTarget: 2, outputGap: 0, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 4.5,
    note: '今天:通胀回落到 3%,Fed 已降息到 4.5%。泰勒规则:i* = 0.5 + 3 + 0.5×1 = 4%。实际略偏紧,Fed 谨慎中。',
    note_en: 'Today: inflation back to 3%, Fed cut to 4.5%. Taylor rule: i* = 0.5 + 3 + 0.5×1 = 4%. Actual slightly tighter than rule — Fed remains cautious.'
  }
}

/* ===== 第 9 章 银行压力测试 ===== */
export interface Ch9Snapshot {
  deposits: number     // 十亿美元
  loanPct: number
  longBondPct: number
  capitalPct: number
  rateShock: number
  withdrawPct: number
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch9Snapshots: Record<string, Ch9Snapshot> = {
  'normal': {
    deposits: 100, loanPct: 55, longBondPct: 15, capitalPct: 10, rateShock: 0, withdrawPct: 5,
    note: '正常运营银行:55% 贷款 + 15% 长债 + 30% 准备金/短期资产,资本 10%。Fed 不动 + 提款正常。这是 Basel 标准下的健康银行。',
    note_en: 'Normally operating bank: 55% loans + 15% long bonds + 30% reserves/short assets, 10% capital. Fed steady + normal withdrawals. A healthy bank under Basel.'
  },
  '2008': {
    deposits: 100, loanPct: 30, longBondPct: 5, capitalPct: 3, rateShock: 0, withdrawPct: 15,
    note: '2008.9 雷曼前夜:杠杆 30+ 倍(资本仅 3%),大量投行 RMBS/CDO 风险敞口。一旦客户撤资即资本击穿。',
    note_en: '2008.9 eve of Lehman: leverage 30x+ (capital only 3%), heavy investment-bank RMBS/CDO exposure. Customer flight → instant capital breach.'
  },
  '2023': {
    deposits: 100, loanPct: 35, longBondPct: 40, capitalPct: 8, rateShock: 4, withdrawPct: 25,
    note: '⚠️ 2023.3 SVB:长债占比 40%(异常高,典型 15%)+ 客户高度集中科技行业 → Fed 加息 4% 撕开 HTM 浮亏 + 储户集中提款 25%。账面看起来正常,真实资本被击穿。',
    note_en: '⚠️ 2023.3 SVB: long-bond share 40% (unusually high vs typical 15%) + customer base highly concentrated in tech → Fed +4% rates exposed HTM unrealized losses + concentrated 25% deposit run. Book metrics look fine, real capital crushed.',
    flash: true,
    predict: {
      title: '你即将切换到「2023 SVB」',
      title_en: 'You\'re about to switch to \'2023 SVB\'',
      question: 'SVB 倒闭前看起来"正常":CET1 ~12%,LCR > 100%,无会计欺诈。为什么 48 小时倒闭?',
      question_en: 'Before collapse SVB looked \'fine\': CET1 ~12%, LCR > 100%, no accounting fraud. Why did it die in 48 hours?',
      options: [
        '经营违法',
        '资本本来就不足,只是隐瞒',
        'HTM 长债浮亏 + 客户集中 + 利率冲击 = 真实资本被击穿',
        '监管查不出来'
      ],
      options_en: [
        'Illegal operations',
        'Capital was already low, just hidden',
        'HTM long-bond losses + customer concentration + rate shock = real capital crushed',
        'Regulator couldn\'t detect'
      ],
      correctIdx: 2,
      revealHeadline: '隐性风险公式:HTM + 客户集中 + 利率冲击',
      revealHeadline_en: 'Hidden-risk formula: HTM + concentration + rate shock',
      revealMsg: 'SVB 持有大量长期国债(HTM 不计市价)。Fed 加息让这些国债浮亏 ~$15B,但账面看不出。客户集中(科技公司,90% 存款超 FDIC $250K 限额)→ 风声一来集中提款 → 被迫卖 HTM 浮亏变实亏 → 资本一夜击穿。教学点:看资产负债表,不只看账面数字,还要看*利率敏感度*和*客户结构*。Basel III 后 Fed 在监管中增加了"未实现损益"维度。',
      revealMsg_en: 'SVB held a large pile of long Treasuries (HTM, not marked-to-market). Fed hikes generated ~$15B unrealized losses, invisible on the book. Customers were concentrated (tech firms, 90% of deposits above FDIC\'s $250K limit) → as the rumor spread, withdrawals concentrated → SVB forced to sell HTM, realizing losses → capital crushed overnight. Teaching point: read a bank balance sheet not just for book numbers — also for *interest-rate sensitivity* and *customer structure*. Post-SVB regulation now incorporates \'unrealized loss\' explicitly.'
    }
  },
  '2024cre': {
    deposits: 80, loanPct: 60, longBondPct: 10, capitalPct: 9, rateShock: 2, withdrawPct: 8,
    note: '2024 区域银行 + 商业地产敞口:贷款占比高(60%),其中商业地产占大头。Fed 加息让商业地产违约率上升 → 拨备压力 → 利润压缩。慢性危机模式。',
    note_en: '2024 regional banks + CRE exposure: loan share high (60%), heavily in commercial real estate. Fed hikes lifted CRE default rates → provision pressure → margin compression. Chronic-crisis mode.'
  },
  'today': {
    deposits: 100, loanPct: 50, longBondPct: 12, capitalPct: 12, rateShock: 1, withdrawPct: 6,
    note: '今天:SVB 后监管收紧 + 银行主动降低长债占比。资本充足率上升,流动性储备增加。"修复后"健康水位。',
    note_en: 'Today: post-SVB regulation tightened + banks proactively reduced long-bond exposure. Capital ratios up, liquidity buffers stronger. The "post-fix" healthy level.'
  }
}

/* ===== 第 8 章 信息不对称 ===== */
export interface Ch8Snapshot {
  asymmetry: number    // 0-100
  monitoring: number   // 0-100
  screening: number    // 0-100(高=筛选成本高)
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch8Snapshots: Record<string, Ch8Snapshot> = {
  '2008': {
    asymmetry: 88, monitoring: 22, screening: 78,
    note: '2008 次贷危机:MBS 嵌套 CDO 嵌套 CDS,谁也不知道真实风险 → 银行间停止借贷 → TED spread 飙到史上最高。逆向选择极致。'
  },
  '2023': {
    asymmetry: 75, monitoring: 35, screening: 50,
    note: '⚠️ 2023.3 SVB 倒闭:经典挤兑被压缩到 48 小时 — 因为信息传播速度被 Twitter/银行 App 加速。',
    flash: true,
    predict: {
      title: '你即将切换到「2023 SVB 倒闭」',
      question: 'SVB 在 48 小时内被挤兑。1907 第一次教科书级挤兑发生时,完成需要数周。为什么 2023 这么快?',
      options: [
        '银行经营更差',
        '信息不对称更严重',
        '监管失败',
        '数字时代 + 社交媒体让信息传播速度远超经典模型'
      ],
      correctIdx: 3,
      revealHeadline: '数字时代信息传递速度 >> 经典模型',
      revealMsg: '1907 经典挤兑发生在物理银行外,排队需要时间。2023 SVB:科技公司 CEO 群里一条消息 → 数小时全网扩散 → 银行 App 一键转账 → 48 小时蒸发 $42B 存款。教学点:经典信息不对称模型仍对,但参数(传递速度)需要重新校准。这就是为什么 2023 后 Fed 要更快出手 BTFP。'
    }
  },
  '2014': {
    asymmetry: 92, monitoring: 12, screening: 85,
    note: '2014-2018 中国 P2P 爆雷:监管滞后 + 信息几乎为零 → 平台跑路 → 投资者血本无归。教科书级"无监管下的市场崩溃"。'
  },
  '2002': {
    asymmetry: 60, monitoring: 28, screening: 45,
    note: '2002 SOX 法案前:安然(Enron)/世通(WorldCom)虚假账目 → 主-代理问题失控。SOX 后大幅强化外部审计监督。'
  },
  'today': {
    asymmetry: 38, monitoring: 72, screening: 32,
    note: '今天:监管+科技减少了部分信息差(实时披露+大数据风控)。但社交媒体也加速了挤兑速度。是双刃剑。'
  }
}

/* ===== 第 7 章 戈登增长模型 + EMH ===== */
export interface Ch7Snapshot {
  D: number       // 下一期分红
  g: number       // 永续增长率(%)
  r: number       // 必要回报率(%)
  marketPrice: number // 实际市场价(用于反推隐含增长)
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch7Snapshots: Record<string, Ch7Snapshot> = {
  '1999': {
    D: 1, g: 18, r: 8, marketPrice: 200,
    note: '⚠️ 1999.12 dotcom 泡沫:互联网股票 PE 100+,隐含永续增长率 20%+。但 GDP 长期 ~3% — 数学上不可能。这就是泡沫。',
    flash: true,
    predict: {
      title: '你即将切换到「1999 dotcom 泡沫」',
      question: '1999 互联网股票 PE 飙到 100+。按戈登模型反推,需要假设永续增长率多少才能支撑这个估值?',
      options: [
        'g = 5%(温和增长)',
        'g = 10%(科技公司常态)',
        'g = 15%(高速期)',
        'g = 20%+(违反 GDP 增长极限)'
      ],
      correctIdx: 3,
      revealHeadline: '需要 g = 20%+,违反 GDP 增长极限',
      revealMsg: 'GDP 长期增长 ~3%。任何公司永续增长率超过 GDP 增长 → 终极意味着这家公司将来比整个经济还大,数学上不可能。1999 dotcom 估值的"隐含 g"就是这种荒谬数字。这是戈登模型反推泡沫的经典案例。2024 部分 AI 股估值要小心同样的陷阱。'
    }
  },
  '2008': {
    D: 2, g: 2, r: 12, marketPrice: 20,
    note: '2008.10 雷曼:风险溢价飙升 → r 升 → P 暴跌(分母 r-g 变大)。这是利率渠道传导到股价的教科书案例。'
  },
  '2010': {
    D: 2, g: 5, r: 6, marketPrice: 200,
    note: '2010-2014 QE:Fed 把无风险利率压到 0,r 大幅下降 → 股票折现率低 → P 攀升。"低利率 = 高估值"的根源。'
  },
  '2024': {
    D: 4, g: 12, r: 9, marketPrice: 130,
    note: '2024 AI 牛市:NVDA 类股票分红低 + 高增长预期。试试调 g 看 P 怎么动 — AI 概念是否真值得 g=12%?'
  },
  'today': {
    D: 3, g: 4, r: 8, marketPrice: 75,
    note: '今天:回归正常水位。D=3, g=4%, r=8% → P ≈ 75。这是"成熟蓝筹股"的典型估值。'
  }
}

/* ===== 第 5 章 利率行为 ===== */
export interface Ch5Snapshot {
  realRate: number
  inflationExpect: number
  riskPremium: number
  fedAdjust: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch5Snapshots: Record<string, Ch5Snapshot> = {
  '1981': {
    realRate: 2, inflationExpect: 10, riskPremium: 1, fedAdjust: 1,
    note: '1981 沃尔克紧缩巅峰:π_e 高位失锚 → 名义利率被推到 14%。这就是高通胀环境下的费雪效应。'
  },
  '2008': {
    realRate: 0, inflationExpect: 2, riskPremium: 3, fedAdjust: -1,
    note: '2008.10 雷曼:风险溢价飙升(避险持币),Fed 紧急降息救市。流动性偏好视角主导:大家想持现金,Fed 投放流动性满足。'
  },
  '2010': {
    realRate: -1, inflationExpect: 2, riskPremium: 0.5, fedAdjust: -1.5,
    note: '2010-2014 QE:实际利率为负(财政抑制),Fed 通过 QE 进一步压低长端 → 流动性偏好视角的"流动性陷阱"特征。'
  },
  '2022': {
    realRate: 0, inflationExpect: 2, riskPremium: 0.5, fedAdjust: 0,
    note: '⚠️ 2022.3 通胀冲击起点:Fed 还没加息,但通胀预期从 2% 飙升。下面看费雪效应如何独立推高名义利率。',
    flash: true,
    predict: {
      title: '你即将切换到「2022 通胀冲击」',
      question: '2022.3 之前 Fed 还没正式加息,但 π_e 从 2% 飙到 4%。10Y 国债收益率应该?',
      options: [
        '没变化(Fed 没动,利率不动)',
        '小幅上升 +50bp',
        '大幅上升 +200bp+(费雪效应)',
        '反而下降(衰退预期)'
      ],
      correctIdx: 2,
      revealHeadline: '大幅上升 +200bp+ — 费雪效应',
      revealMsg: '实际利率不变,名义利率几乎完全反映通胀预期上升 — 这就是费雪效应。Fed 还没加息,10Y 已飙 200bp+。教学点:**通胀预期是利率的主要推手,Fed 只是其中一个因素**。后续 Fed 才被迫加息追赶。'
    }
  },
  'today': {
    realRate: 1.5, inflationExpect: 2.5, riskPremium: 0.5, fedAdjust: 0,
    note: '今天:实际利率 +1.5%(2008 后高位),通胀预期回到 2.5%,Fed 中性。这是"正常水位"的样子。'
  }
}

/* ===== 第 6 章 收益率曲线 ===== */
export interface Ch6Snapshot {
  shortEnd: number      // 2Y 短端
  longEnd: number       // 30Y 长端
  curveBow: number      // 凸度
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch6Snapshots: Record<string, Ch6Snapshot> = {
  '1980': {
    shortEnd: 14, longEnd: 11, curveBow: -0.5,
    note: '1980 沃尔克紧缩巅峰:短端 14%(拉到极致打通胀),长端 11%(市场预期会降)。严重倒挂 + 凹陷 → 1981-82 双重衰退如期而至。',
    note_en: '1980 Volcker tightening peak: short end 14% (extreme to break inflation), long end 11% (market expecting cuts). Deep inversion + concave shape → the 1981-82 double-dip recession arrived on schedule.'
  },
  '2007': {
    shortEnd: 5.25, longEnd: 5.0, curveBow: 0,
    note: '2007.6 危机前:平坦微倒挂,市场嗅到了风险。一年后(2008.9)雷曼倒下。倒挂 → 衰退,经典传导。',
    note_en: '2007.6 pre-crisis: flat with mild inversion, market sensing risk. A year later (2008.9) Lehman collapsed. Inversion → recession, classic transmission.'
  },
  '2019': {
    shortEnd: 2.4, longEnd: 1.6, curveBow: -0.2,
    note: '2019.8 倒挂:Fed 紧缩末期,市场预期会衰退。但 2020 衰退是疫情触发,不是常规商业周期 — 两个原因混在一起。',
    note_en: '2019.8 inversion: end of Fed tightening, market pricing recession. But the 2020 recession was triggered by the pandemic, not a regular business cycle — two causes blended.'
  },
  '2024': {
    shortEnd: 5.4, longEnd: 4.2, curveBow: -0.3,
    note: '⚠️ 2024.7 反常:2s10s 倒挂超过 24 个月,但 GDP 仍 +2.5%。50 年来首次"超长倒挂无衰退"。教科书 8/8 必衰退被打破。',
    note_en: '⚠️ 2024.7 anomaly: 2s10s inverted for 24+ months, yet GDP still +2.5%. First time in 50 years of an ultra-long inversion without recession. The 8/8 textbook record was broken.',
    flash: true,
    predict: {
      title: '你即将切换到「2024.7 反常」',
      title_en: 'You\'re about to switch to \'2024.7 Anomaly\'',
      question: '美国 2s10s 倒挂已持续 24 个月,按教科书 8/8 历史经验衰退应该已发生。猜 2024 末美国实际 GDP 增速?',
      question_en: 'US 2s10s has been inverted for 24 months. By the textbook 8-of-8 record, recession should have hit. What was US real GDP growth at end-2024?',
      options: [
        '衰退 (-2% 以下)',
        '微弱增长 (0-1%)',
        '健康增长 (2-3%)',
        '强劲增长 (3%+)'
      ],
      options_en: [
        'Recession (below -2%)',
        'Weak growth (0-1%)',
        'Healthy growth (2-3%)',
        'Strong growth (3%+)'
      ],
      correctIdx: 2,
      revealHeadline: '答案 +2.5% — 健康增长',
      revealHeadline_en: 'Answer: +2.5% — healthy growth',
      revealMsg: '50 年来首次"超长倒挂无衰退"。打破"倒挂必衰退"的信仰。可能原因:① 财政刺激持续(IRA/CHIPS)② 劳动力市场异常坚韧 ③ AI 投资潮带动增长 ④ 后疫情消费补偿。教学点:收益率曲线是市场预期的反映,不是真理 — 预期可能错。',
      revealMsg_en: 'First "ultra-long inversion without recession" in 50 years. Breaks the "inversion → recession" dogma. Possible reasons: ① Sustained fiscal stimulus (IRA/CHIPS) ② Unusually resilient labor market ③ AI investment wave ④ Post-pandemic consumption catch-up. Teaching point: the yield curve reflects market expectations, not truth — expectations can be wrong.'
    }
  },
  'today': {
    shortEnd: 4.3, longEnd: 4.6, curveBow: 0.1,
    note: '今天:Fed 已降息,2s10s 转正。市场松一口气,但通胀风险还没完全过去。试试调长端通胀预期看曲线变化。',
    note_en: 'Today: Fed has cut, 2s10s back in positive territory. Markets exhale, but inflation risk isn\'t fully gone. Try adjusting long-end inflation expectations to see the curve shift.'
  }
}

/* ===== 第 17 章 套息交易 ===== */
export interface Ch17Snapshot {
  id: number; ifv: number; ds: number; lev: number
  note: string
  note_en?: string
  flash?: boolean
  predict?: PredictDef
}

export const ch17Snapshots: Record<string, Ch17Snapshot> = {
  '2007': {
    id: 5.25, ifv: 0.5, ds: 1, lev: 5,
    note: '2007.7 套息巅峰:利差 4.75% × 5x = 28% 年化,carry trade 黄金时代。',
    note_en: '2007.7 carry-trade peak: 4.75% spread × 5x leverage = 28% annualized — the golden age of carry trades.'
  },
  '2008': {
    id: 5.0, ifv: 1.0, ds: -18, lev: 10,
    note: '⚠️ 2008.10 雷曼:USD/JPY 单月暴跌 18%,10x 杠杆 -140% → 爆仓。',
    note_en: '⚠️ 2008.10 Lehman: USD/JPY crashed 18% in one month, 10x leverage = -140% → margin call wipeout.',
    flash: true,
    predict: {
      title: '你即将切换到「2008.10 雷曼崩盘」',
      title_en: 'You\'re about to switch to \'2008.10 Lehman Collapse\'',
      question: 'USD/JPY 单月跌 18%,10x 杠杆套息策略亏多少?',
      question_en: 'USD/JPY fell 18% in one month. How much does a 10x-leveraged carry strategy lose?',
      options: ['-30%(还活着)', '-100%(归零)', '-140%(倒欠经纪商)'],
      options_en: ['-30% (still alive)', '-100% (zero out)', '-140% (owe broker money)'],
      correctIdx: 2,
      revealHeadline: '真实损失 = -140%',
      revealHeadline_en: 'Actual loss = -140%',
      revealMsg: '保证金被强平,杠杆放大让你不只是亏完本金,还倒欠经纪商。这是 2008 全球套息平仓潮的微观结果。',
      revealMsg_en: 'Margin call → forced liquidation. Leverage amplifies losses — you don\'t just zero out, you owe the broker. This is the micro-level outcome of the 2008 global carry-unwind.'
    }
  },
  '2024-7': {
    id: 5.25, ifv: 0.25, ds: 0, lev: 10,
    note: '2024.7:套息利差 5%,市场以为这种关系会永远持续。',
    note_en: '2024.7: carry spread at 5%, markets assumed the relationship would last forever.'
  },
  '2024-8': {
    id: 4.75, ifv: 0.5, ds: -12, lev: 10,
    note: '⚠️ 2024.8 三周内 USD/JPY 162→142(-12%),10x 杠杆 -100%。10 年 carry 收益,3 周亏完。',
    note_en: '⚠️ 2024.8: USD/JPY went 162→142 (-12%) in three weeks. 10x leverage = -100%. A decade of carry yield wiped out in 3 weeks.',
    flash: true,
    predict: {
      title: '你即将切换到「2024.8 套息平仓」',
      title_en: 'You\'re about to switch to \'2024.8 Carry Unwind\'',
      question: '这 3 周内,10 倍杠杆套息策略亏多少?',
      question_en: 'Over these 3 weeks, how much does a 10x-leveraged carry strategy lose?',
      options: ['-10%(carry 还在)', '-50%(汇率跌 5%)', '-100%(全亏完)', '比 -100% 更糟'],
      options_en: ['-10% (carry still works)', '-50% (FX down 5%)', '-100% (wiped out)', 'Worse than -100%'],
      correctIdx: 2,
      revealHeadline: '真实损失 = -100%',
      revealHeadline_en: 'Actual loss = -100%',
      revealMsg: 'BOJ 意外加息 + Fed 转向降息,carry 利差双向夹击。叠加自我实现的平仓潮,USD/JPY 三周从 162 跌到 142。10x 杠杆 = 一夜归零。',
      revealMsg_en: 'BOJ surprise hike + Fed pivot to cuts — carry spread squeezed from both sides. Combined with a self-fulfilling unwind, USD/JPY went 162→142 in three weeks. 10x leverage = wiped out overnight.'
    }
  },
  'today': {
    id: 4.5, ifv: 0.5, ds: 0, lev: 10,
    note: '今天:利差仍在 4%,但市场对"持续"的信心已动摇。',
    note_en: 'Today: spread still at 4%, but market confidence in "sustainability" has been shaken.'
  }
}

/* ===== 第 20 章 IS-LM ===== */
export interface Ch20Snapshot {
  a: number; b: number; c: number; d: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch20Snapshots: Record<string, Ch20Snapshot> = {
  '1962': {
    a: 28, b: 2, c: 5, d: 2,
    note: '1962 肯尼迪减税:IS 右移 → i*↑ Y*↑,标准凯恩斯刺激。'
  },
  '1980': {
    a: 20, b: 2, c: 1.5, d: 2,
    note: '1980 沃尔克紧缩:LM 左移到极致 → i* 飙升到 19%(实际),Y* 下滑触发深衰退。'
  },
  '2010': {
    a: 14, b: 2, c: 50, d: 2,
    note: '⚠️ 2010 流动性陷阱:Fed QE 让 c 飙到 50,但 i* 已 = 0,LM 推右多少 Y* 都不动。',
    flash: true,
    predict: {
      title: '你即将切换到「2010 流动性陷阱」',
      question: 'Fed 把 LM 大幅右移(QE 万亿),Y* 会涨多少?',
      options: ['Y* 大涨(教科书式刺激)', 'Y* 涨 1-2%(部分有效)', 'Y* 几乎不动(陷阱)'],
      correctIdx: 2,
      revealHeadline: 'Y* 几乎不动',
      revealMsg: '在 ZLB,LM 水平段无限延展,QE 把 c 推到 50 也不影响均衡 Y*。Fed "推不动弦"——这是日本 1990s 起的常态,也是为什么财政政策在陷阱里反而最有效。'
    }
  },
  '2020': {
    a: 30, b: 2, c: 35, d: 2,
    note: '2020.4:财政货币双扩张,IS 和 LM 都右移,Y* 强劲反弹但埋下 2022 通胀种子。'
  },
  'today': {
    a: 22, b: 2, c: 8, d: 2,
    note: '今天:Fed QT + 财政赤字共存,IS 高 LM 紧,长债被双向推高。'
  }
}
