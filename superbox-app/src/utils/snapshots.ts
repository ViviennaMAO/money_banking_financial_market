/* 三章历史快照 · 复用 prototype.html 的真实数据 */

export interface PredictDef {
  title: string
  question: string
  options: string[]
  correctIdx: number
  revealHeadline: string
  revealMsg: string
}

/* ===== 第 14 章 货币乘数 ===== */
export interface Ch14Snapshot {
  mb: number; r: number; e: number; c: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch14Snapshots: Record<string, Ch14Snapshot> = {
  '2007': {
    mb: 0.85, r: 10, e: 0.04, c: 7,
    note: '2007.8 危机前:乘数 ≈ 8.7。正常时期。'
  },
  '2010': {
    mb: 2.0, r: 10, e: 80, c: 8,
    note: '⚠️ 2010.1 QE 后:乘数从 8.7 砸到 1.2!Fed 注入的钱卡在准备金里——流动性陷阱的微观证据。',
    flash: true,
    predict: {
      title: '你即将切换到「2010.1 QE 后」',
      question: 'Fed QE 把 MB 从 0.85T 推到 2.0T,乘数 m 会变成多少?',
      options: ['跟现在差不多(5 左右)', '涨到 10+(QE 注入大量货币)', '暴跌到 1-2(超储锁住流动性)'],
      correctIdx: 2,
      revealHeadline: '真实 m = 1.2',
      revealMsg: '超额准备金 e 从 0.04% 飙到 80%——Fed 印的钱卡在银行系统。这就是为什么万亿 QE 没引发 1970s 式恶性通胀。'
    }
  },
  '2020': {
    mb: 4.8, r: 0, e: 18, c: 9,
    note: '2020.4 疫情:无 r 时代(Fed 2020.3 起 r=0),但 e 仍是大头。'
  },
  'today': {
    mb: 5.5, r: 0, e: 12, c: 8,
    note: '今天:QT 进行中,e 缓慢下降,M2 增速回升。注意 IORB 已合并 IOER+IORR(2021.7.29)。'
  }
}

/* ===== 第 4 章 债券定价 ===== */
export interface Ch4Snapshot {
  fv: number; couponRate: number; ytm: number; years: number; inflation: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch4Snapshots: Record<string, Ch4Snapshot> = {
  '1981': {
    fv: 1000, couponRate: 14, ytm: 14, years: 10, inflation: 10,
    note: '1981.9 沃尔克紧缩末:10Y 利率 ~14%,通胀 ~10%。后续 1982 起 Fed 大幅降息,债券进入超级牛市。把 ytm 从 14% 拖到 8% 看看价格变化。'
  },
  '2022': {
    fv: 1000, couponRate: 1, ytm: 1, years: 20, inflation: 7,
    note: '⚠️ 2022.3 加息冲击起点:20Y 期 1% 票息债券,利率 1%。Fed 此后把 FFR 推到 5.25%。把 ytm 拖到 5%——见证长债被屠杀。',
    flash: true,
    predict: {
      title: '你即将切换到「2022 加息冲击」',
      question: 'Fed 把 ytm 从 1% 推到 5%,20 年期、1% 票息的债券价格变化最接近?',
      options: [
        '+5%(避险逻辑,债券小涨)',
        '-10%(温和下跌)',
        '-30%(显著下跌,跟股市差不多)',
        '价格腰斩 -50%'
      ],
      correctIdx: 3,
      revealHeadline: '价格腰斩 ≈ -50%',
      revealMsg: '20 年期、低票息债券对利率极度敏感(久期 ~18)。利率涨 4 个百分点 → 价格跌 ~50%。这就是为什么 2022 美国国债 ETF TLT 跌 -31%,比股市跌得更惨——债券不是"低风险资产",高久期债券是利率的杠杆赌注。'
    }
  },
  '2024': {
    fv: 1000, couponRate: 4, ytm: 4.5, years: 10, inflation: 3,
    note: '2024.10:10Y 利率 ~4.5%,核心通胀 ~3%,实际利率 ~1.5%(2008 来高位)。'
  },
  'today': {
    fv: 1000, couponRate: 4, ytm: 4, years: 10, inflation: 2.5,
    note: '今天:利率回落,实际利率仍较高。试试 ytm 拖到 6%(衰退反转)看价格上涨。'
  }
}

/* ===== 第 24 章 通胀 4 机制 ===== */
export interface Ch24Snapshot {
  m2Growth: number
  outputGap: number
  oilShock: number
  expectGap: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch24Snapshots: Record<string, Ch24Snapshot> = {
  '1979': {
    m2Growth: 10, outputGap: -1, oilShock: 120, expectGap: 6,
    note: '1979 滞胀峰值:石油冲击主导(供给 +5%)+ 货币容忍(M2 增 10%)+ 预期失锚(+4%)= CPI 13.5%。供给冲击是核心。'
  },
  '1990s': {
    m2Growth: 4, outputGap: 1, oilShock: 5, expectGap: 0,
    note: '1990s 大缓和:4 机制全在锚定状态。M2 适度增 + 经济温和过热 + 油价稳 + 预期锚定 → CPI 2-3%。教科书"理想通胀"。'
  },
  '2008': {
    m2Growth: 8, outputGap: -3, oilShock: -30, expectGap: -0.5,
    note: '2008-2014 QE 期:M2 增 8% 看似多,但货币乘数砸到 1 → 实际"基础货币"扩张没传到通胀。需求负 + 油跌 + 预期偏低 → CPI 仅 1.7%。"印钱不通胀"案例。'
  },
  '2022': {
    m2Growth: 12, outputGap: 2, oilShock: 80, expectGap: 2,
    note: '⚠️ 2022 通胀冲击:4 机制叠加 — 货币(QE 无限)+ 需求(财政发钱)+ 供给(疫情+俄乌)+ 预期(开始失锚)→ CPI 9.1%。完美风暴。',
    flash: true,
    predict: {
      title: '你即将切换到「2022 通胀冲击」',
      question: '2022.6 美国 CPI 9.1% 创 40 年新高。最准确的归因(选最完整的)?',
      options: [
        '仅货币驱动(Fed 印钱)',
        '仅供给冲击(疫情 + 俄乌)',
        '4 机制全有,以供给 + 预期为主',
        '与 Fed 完全无关'
      ],
      correctIdx: 2,
      revealHeadline: '4 机制全有 · 以供给 + 预期为主',
      revealMsg: '2022 通胀是**完美风暴**:① 货币(2020-2021 QE 无限 + M2 +25%);② 需求(财政 stimulus 直接发钱 5T);③ 供给(疫情供应链 + 俄乌能源);④ 预期(被"暂时性"误判 → 开始失锚)。任一单因素解释都不完整。**弗里德曼"通胀始终是货币现象"对长期对,短期太简化**。教学点:**2022 是 4 种机制叠加,只看一个机制会误判**。这就是为什么 Fed 一开始的"暂时性"判断错了——他们只看了供给侧。'
    }
  },
  'today': {
    m2Growth: 3, outputGap: 0.5, oilShock: -5, expectGap: 1,
    note: '今天:M2 回落 + 经济温和 + 油价稳 + 预期接近锚。CPI 3% 左右,接近 Fed 2% 目标但仍在限制性区间。'
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
  flash?: boolean
  predict?: PredictDef
}

export const ch22Snapshots: Record<string, Ch22Snapshot> = {
  '1960s': {
    adShift: 1, srasShift: 0, potentialY: 100,
    note: '1960s 大缓和:温和 AD 增 + SRAS 平稳。经典菲利普斯曲线时期(失业↓ → 通胀↑ 权衡)。这就是 Burns/Greenspan 早期信奉的世界。'
  },
  '1973': {
    adShift: 0, srasShift: 4, potentialY: 100,
    note: '1973 OPEC 石油禁运:SRAS 大幅左移(原油从 $3 飙到 $12)。AD 几乎不动。教科书级"成本推动型通胀"——同时通胀↑+失业↑+产出↓。'
  },
  '1979': {
    adShift: 1, srasShift: 8, potentialY: 100,
    note: '⚠️ 1979 滞胀峰值:CPI 13.5%(战后最高)+ 失业 5.8% + 经济衰退。Burns 宽松货币 + 第二次石油危机叠加 → 滞胀失控。',
    flash: true,
    predict: {
      title: '你即将切换到「1979 滞胀峰值」',
      question: '1973 OPEC 石油禁运后,Fed 主席 Burns 选择"保就业"继续宽松货币。1979 美国 CPI 通胀峰值多少?',
      options: [
        '5%(轻度通胀)',
        '8%(中度)',
        '13.5%(战后最高)',
        '20%(失控)'
      ],
      correctIdx: 2,
      revealHeadline: '1979 CPI 13.5% — 战后最高',
      revealMsg: '1979 CPI 13.5% 创战后最高,但**失业率仍 5.8%,GDP 还在缩**。这就是滞胀——经典菲利普斯曲线被打破:"失业↓→通胀↑"变成"高失业 + 高通胀"同时存在。原因:**供给冲击(石油)直接推高 SRAS,而非 AD**——经典菲利普斯只描述需求冲击。教学点:**菲利普斯曲线只在需求冲击主导时有效;供给冲击时它失效**。1979 沃尔克接手,用 20% FFR 三年才把通胀打下来(详见第 13 章)。'
    }
  },
  '2008': {
    adShift: -7, srasShift: 0, potentialY: 100,
    note: '2008 危机:AD 大幅左移(信贷冻结 + 信心崩塌)。短期通缩压力 + 失业飙到 10%。需求冲击的教科书案例,与 1973 供给冲击形成对照。'
  },
  '2022': {
    adShift: 5, srasShift: 5, potentialY: 100,
    note: '2022 疫情通胀:AD 大幅右移(财政刺激 + QE 无限)+ SRAS 左移(供应链 + 能源)。**双向夹击 → CPI 9.1%**。这是 1979 来最复杂的通胀。'
  }
}

/* ===== 第 18 章 国际金融体系(三元悖论) ===== */
export type TrilemmaPick = 'fixed' | 'free' | 'independent'  // 固定汇率 / 资本自由 / 独立货币政策

export interface Ch18Snapshot {
  picks: TrilemmaPick[]    // 用户选择的两个
  example: string          // 代表经济体
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch18Snapshots: Record<string, Ch18Snapshot> = {
  'china': {
    picks: ['fixed', 'independent'],
    example: '🇨🇳 中国 · 越南 · 印度',
    note: '制度 1:固定汇率 + 独立货币政策 + 资本管制。中国选择放弃资本自由流动,换取汇率稳定 + 货币政策独立。代价:跨境投资受限,人民币国际化受阻。'
  },
  'us': {
    picks: ['free', 'independent'],
    example: '🇺🇸 美国 · 🇯🇵 日本 · 🇨🇦 加拿大 · 🇦🇺 澳大利亚',
    note: '制度 2:浮动汇率 + 资本自由 + 独立货币政策。多数发达国家选择放弃汇率稳定,接受汇率波动。代价:出口企业承担汇率风险,需要复杂对冲。'
  },
  'hk': {
    picks: ['fixed', 'free'],
    example: '🇭🇰 香港(联系汇率)· 🇪🇺 欧元区成员',
    note: '制度 3:固定汇率 + 资本自由 + 放弃独立货币政策。香港 1983 起钉住 USD,完全跟随 Fed。2022 Fed 加息时港府被迫加息至 5%+,本地经济衰退,但港币稳定。**这是制度选择的代价**。'
  },
  'gbp1992': {
    picks: ['fixed', 'free', 'independent'],   // 试图三个都要 — 不可能
    example: '⚠️ 1992.9 英镑危机',
    note: '⚠️ 1992.9.16 黑色星期三:英国试图同时维持固定汇率(ERM)+ 资本自由 + 独立货币政策。Soros 看穿矛盾大举做空,BoE 一天用 $3.4B 保卫,最终被迫退出 ERM。',
    flash: true,
    predict: {
      title: '你即将切换到「1992.9 英镑危机」',
      question: '1992.9 BoE 用尽外汇储备保卫英镑钉住马克的 ERM 制度。Soros 大举做空英镑,BoE 一天用掉 $3.4B。结果?',
      options: [
        'BoE 成功保卫,英镑稳定',
        '英镑波动但留在 ERM',
        '9.16 黑色星期三:英镑被迫退出 ERM,贬值 15%。Soros 赚 10 亿',
        '欧元区成立提前'
      ],
      correctIdx: 2,
      revealHeadline: '英镑被迫退出 ERM · Soros 赚 10 亿',
      revealMsg: 'BoE 在 1992.9.16 终于宣布退出 ERM,英镑贬值 15%。**这是三元悖论被市场强制执行的经典案例**:英国试图同时维持(1)固定汇率(钉马克)+(2)资本自由 +(3)独立货币政策 → 不可能。Soros 看穿这个矛盾,在 BoE 弹尽粮绝时大举做空,赚了 10 亿美金。教学点:**三元悖论不是理论,是市场会强制执行的物理定律**。1997 亚洲金融危机、2015 SNB 脱钩 EUR/CHF 都是同一机制。'
    }
  },
  'today': {
    picks: ['free', 'independent'],
    example: '默认 · 浮动汇率体系',
    note: '今天:多数主要经济体选制度 2(浮动汇率)。但去美元化趋势让"哪种制度更好"的争论重新激烈。'
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
  flash?: boolean
  predict?: PredictDef
}

export const ch15Snapshots: Record<string, Ch15Snapshot> = {
  '2008': {
    iorb: 0.25, onRrp: 0.05, reserves: 0.05,
    note: '2008 危机前:OMO 是唯一工具,准备金水平极低($0.05T)。Fed 直接用 OMO 微调短端,模型简单但风险大。'
  },
  '2014': {
    iorb: 0.25, onRrp: 0.05, reserves: 2.6,
    note: '2014 充足准备金期:QE3 后准备金 $2.6T,Fed 用 IOER + ON RRP 形成利率走廊。这是新制度的实际起点。'
  },
  '2019': {
    iorb: 2.10, onRrp: 1.95, reserves: 1.4,
    note: '⚠️ 2019.9 REPO 危机:Fed 缩表过头,准备金降到 $1.4T(< 充足水平)。隔夜 REPO 飙到 10%,IORB 失控。',
    flash: true,
    predict: {
      title: '你即将切换到「2019.9 REPO 危机」',
      question: '2019.9 美国 REPO 利率突然飙到 10%(正常 2%)。IORB 是 2.10%,Fed 理论上能用 IORB 锁住短期利率。为什么走廊崩了?',
      options: [
        'Fed 操作错误',
        '银行联手操纵',
        'Fed 缩表过头,银行准备金 $1.4T(< 充足水平 $3T),走廊失锚',
        '监管失败'
      ],
      correctIdx: 2,
      revealHeadline: '准备金不足让 IORB 失去控制力',
      revealMsg: '教科书:"Fed 用 IORB 锁住短期利率"。现实:**当银行准备金供给不足时 IORB 不再起作用**。Fed 此前 2018-2019 缩表把准备金从 $2.6T 缩到 $1.4T(过激),银行间流动性紧张 → 隔夜借钱市场崩 → REPO 飙到 10%。Fed 几小时内紧急启动"非 QE"扩表,后又创设 SRF(2021.7)永久解决。教学点:**利率走廊只在"充足准备金"制度下有效**——这是教材没说清的关键边界条件。'
    }
  },
  '2024': {
    iorb: 4.65, onRrp: 4.55, reserves: 3.3,
    note: '2024:Fed 已完成 2 年 QT,准备金从 $4.5T 降到 $3.3T。主动降速 + SRF 兜底,精确控制走廊。**注意:IORB 是 2021.7 合并 IOER+IORR 后的单一工具**(教材未更新)。'
  },
  'today': {
    iorb: 4.40, onRrp: 4.30, reserves: 3.0,
    note: '今天:Fed 降息但仍 QT。准备金接近"充足"下限。SRF 已待命,可应对类似 2019.9 的场景。'
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
  flash?: boolean
  predict?: PredictDef
}

export const ch16Snapshots: Record<string, Ch16Snapshot> = {
  '1981': {
    inflation: 10, inflationTarget: 2, outputGap: -2, naturalRate: 0.5,
    alpha: 1.5, beta: 0.5, actualFFR: 14,
    note: '1981 沃尔克紧缩:通胀 10%。沃尔克用极激进 α=1.5 → 隐含利率 14%+,实际 FFR 也到 14%。"Fed 真信通胀目标"的标志。'
  },
  '2008': {
    inflation: 2, inflationTarget: 2, outputGap: -4, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 1.0,
    note: '2008 危机:通胀达标 + 产出缺口 -4%。泰勒规则要求 i* = 0.5(过松),但 ZLB 限制让实际只能到 0%。'
  },
  '2010': {
    inflation: 1.5, inflationTarget: 2, outputGap: -3, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 0.25,
    note: '2010-2014 QE 期:通胀低于目标 + 衰退后复苏。泰勒说要 i*=-0.75%,但 ZLB → Fed 用 QE 替代降息。陷阱期间泰勒规则失灵。'
  },
  '2022': {
    inflation: 9.1, inflationTarget: 2, outputGap: 1, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 1.25,
    note: '⚠️ 2022.6 通胀峰值:CPI 达 9.1%,但 Fed 才开始加息,实际 FFR 仅 1.25%。泰勒规则隐含 13%+。1980 来最大滞后。',
    flash: true,
    predict: {
      title: '你即将切换到「2022.6 通胀冲击」',
      question: '2022.6 美国 CPI 达到 9.1% 峰值,实际 FFR 还在 1.25%。按泰勒规则(α=β=0.5),Fed 应该把利率定在?',
      options: [
        '2.5%(温和加息)',
        '5%(快速追赶)',
        '7.5%(激进)',
        '13%+(沃尔克级激进)'
      ],
      correctIdx: 3,
      revealHeadline: '泰勒规则隐含 13%+ · Fed 偏离 12 个百分点',
      revealMsg: '按泰勒:i* = 0.5 + 9.1 + 0.5×(9.1-2) + 0.5×1 = 13.7%。实际 FFR 仅 1.25%。**1980 来最大滞后**。原因:① FAIT 战略允许"暂时"超调;② 判断为暂时性供给冲击;③ 不愿激进打击就业。后果:被迫以 1980 来最快速度追赶加息(2022.3-2023.7 共 525bp)。教学点:**FAIT 容忍超调让 Fed 反应慢**——这是该战略的内在矛盾。'
    }
  },
  'today': {
    inflation: 3, inflationTarget: 2, outputGap: 0, naturalRate: 0.5,
    alpha: 0.5, beta: 0.5, actualFFR: 4.5,
    note: '今天:通胀回落到 3%,Fed 已降息到 4.5%。泰勒规则:i* = 0.5 + 3 + 0.5×1 = 4%。实际略偏紧,Fed 谨慎中。'
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
  flash?: boolean
  predict?: PredictDef
}

export const ch9Snapshots: Record<string, Ch9Snapshot> = {
  'normal': {
    deposits: 100, loanPct: 55, longBondPct: 15, capitalPct: 10, rateShock: 0, withdrawPct: 5,
    note: '正常运营银行:55% 贷款 + 15% 长债 + 30% 准备金/短期资产,资本 10%。Fed 不动 + 提款正常。这是 Basel 标准下的健康银行。'
  },
  '2008': {
    deposits: 100, loanPct: 30, longBondPct: 5, capitalPct: 3, rateShock: 0, withdrawPct: 15,
    note: '2008.9 雷曼前夜:杠杆 30+ 倍(资本仅 3%),大量投行 RMBS/CDO 风险敞口。一旦客户撤资即资本击穿。'
  },
  '2023': {
    deposits: 100, loanPct: 35, longBondPct: 40, capitalPct: 8, rateShock: 4, withdrawPct: 25,
    note: '⚠️ 2023.3 SVB:长债占比 40%(异常高,典型 15%)+ 客户高度集中科技行业 → Fed 加息 4% 撕开 HTM 浮亏 + 储户集中提款 25%。账面看起来正常,真实资本被击穿。',
    flash: true,
    predict: {
      title: '你即将切换到「2023 SVB」',
      question: 'SVB 倒闭前看起来"正常":CET1 ~12%,LCR > 100%,无会计欺诈。为什么 48 小时倒闭?',
      options: [
        '经营违法',
        '资本本来就不足,只是隐瞒',
        'HTM 长债浮亏 + 客户集中 + 利率冲击 = 真实资本被击穿',
        '监管查不出来'
      ],
      correctIdx: 2,
      revealHeadline: '隐性风险公式:HTM + 客户集中 + 利率冲击',
      revealMsg: 'SVB 持有大量长期国债(HTM 不计市价)。Fed 加息让这些国债浮亏 ~$15B,但账面看不出。客户集中(科技公司,90% 存款超 FDIC $250K 限额)→ 风声一来集中提款 → 被迫卖 HTM 浮亏变实亏 → 资本一夜击穿。教学点:看资产负债表,不只看账面数字,还要看*利率敏感度*和*客户结构*。Basel III 后 Fed 在监管中增加了"未实现损益"维度。'
    }
  },
  '2024cre': {
    deposits: 80, loanPct: 60, longBondPct: 10, capitalPct: 9, rateShock: 2, withdrawPct: 8,
    note: '2024 区域银行 + 商业地产敞口:贷款占比高(60%),其中商业地产占大头。Fed 加息让商业地产违约率上升 → 拨备压力 → 利润压缩。慢性危机模式。'
  },
  'today': {
    deposits: 100, loanPct: 50, longBondPct: 12, capitalPct: 12, rateShock: 1, withdrawPct: 6,
    note: '今天:SVB 后监管收紧 + 银行主动降低长债占比。资本充足率上升,流动性储备增加。"修复后"健康水位。'
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
  flash?: boolean
  predict?: PredictDef
}

export const ch6Snapshots: Record<string, Ch6Snapshot> = {
  '1980': {
    shortEnd: 14, longEnd: 11, curveBow: -0.5,
    note: '1980 沃尔克紧缩巅峰:短端 14%(拉到极致打通胀),长端 11%(市场预期会降)。严重倒挂 + 凹陷 → 1981-82 双重衰退如期而至。'
  },
  '2007': {
    shortEnd: 5.25, longEnd: 5.0, curveBow: 0,
    note: '2007.6 危机前:平坦微倒挂,市场嗅到了风险。一年后(2008.9)雷曼倒下。倒挂 → 衰退,经典传导。'
  },
  '2019': {
    shortEnd: 2.4, longEnd: 1.6, curveBow: -0.2,
    note: '2019.8 倒挂:Fed 紧缩末期,市场预期会衰退。但 2020 衰退是疫情触发,不是常规商业周期 — 两个原因混在一起。'
  },
  '2024': {
    shortEnd: 5.4, longEnd: 4.2, curveBow: -0.3,
    note: '⚠️ 2024.7 反常:2s10s 倒挂超过 24 个月,但 GDP 仍 +2.5%。50 年来首次"超长倒挂无衰退"。教科书 8/8 必衰退被打破。',
    flash: true,
    predict: {
      title: '你即将切换到「2024.7 反常」',
      question: '美国 2s10s 倒挂已持续 24 个月,按教科书 8/8 历史经验衰退应该已发生。猜 2024 末美国实际 GDP 增速?',
      options: [
        '衰退 (-2% 以下)',
        '微弱增长 (0-1%)',
        '健康增长 (2-3%)',
        '强劲增长 (3%+)'
      ],
      correctIdx: 2,
      revealHeadline: '答案 +2.5% — 健康增长',
      revealMsg: '50 年来首次"超长倒挂无衰退"。打破"倒挂必衰退"的信仰。可能原因:① 财政刺激持续(IRA/CHIPS)② 劳动力市场异常坚韧 ③ AI 投资潮带动增长 ④ 后疫情消费补偿。教学点:收益率曲线是市场预期的反映,不是真理 — 预期可能错。'
    }
  },
  'today': {
    shortEnd: 4.3, longEnd: 4.6, curveBow: 0.1,
    note: '今天:Fed 已降息,2s10s 转正。市场松一口气,但通胀风险还没完全过去。试试调长端通胀预期看曲线变化。'
  }
}

/* ===== 第 17 章 套息交易 ===== */
export interface Ch17Snapshot {
  id: number; ifv: number; ds: number; lev: number
  note: string
  flash?: boolean
  predict?: PredictDef
}

export const ch17Snapshots: Record<string, Ch17Snapshot> = {
  '2007': {
    id: 5.25, ifv: 0.5, ds: 1, lev: 5,
    note: '2007.7 套息巅峰:利差 4.75% × 5x = 28% 年化,carry trade 黄金时代。'
  },
  '2008': {
    id: 5.0, ifv: 1.0, ds: -18, lev: 10,
    note: '⚠️ 2008.10 雷曼:USD/JPY 单月暴跌 18%,10x 杠杆 -140% → 爆仓。',
    flash: true,
    predict: {
      title: '你即将切换到「2008.10 雷曼崩盘」',
      question: 'USD/JPY 单月跌 18%,10x 杠杆套息策略亏多少?',
      options: ['-30%(还活着)', '-100%(归零)', '-140%(倒欠经纪商)'],
      correctIdx: 2,
      revealHeadline: '真实损失 = -140%',
      revealMsg: '保证金被强平,杠杆放大让你不只是亏完本金,还倒欠经纪商。这是 2008 全球套息平仓潮的微观结果。'
    }
  },
  '2024-7': {
    id: 5.25, ifv: 0.25, ds: 0, lev: 10,
    note: '2024.7:套息利差 5%,市场以为这种关系会永远持续。'
  },
  '2024-8': {
    id: 4.75, ifv: 0.5, ds: -12, lev: 10,
    note: '⚠️ 2024.8 三周内 USD/JPY 162→142(-12%),10x 杠杆 -100%。10 年 carry 收益,3 周亏完。',
    flash: true,
    predict: {
      title: '你即将切换到「2024.8 套息平仓」',
      question: '这 3 周内,10 倍杠杆套息策略亏多少?',
      options: ['-10%(carry 还在)', '-50%(汇率跌 5%)', '-100%(全亏完)', '比 -100% 更糟'],
      correctIdx: 2,
      revealHeadline: '真实损失 = -100%',
      revealMsg: 'BOJ 意外加息 + Fed 转向降息,carry 利差双向夹击。叠加自我实现的平仓潮,USD/JPY 三周从 162 跌到 142。10x 杠杆 = 一夜归零。'
    }
  },
  'today': {
    id: 4.5, ifv: 0.5, ds: 0, lev: 10,
    note: '今天:利差仍在 4%,但市场对"持续"的信心已动摇。'
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
