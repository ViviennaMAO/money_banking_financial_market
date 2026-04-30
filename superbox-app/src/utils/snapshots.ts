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
