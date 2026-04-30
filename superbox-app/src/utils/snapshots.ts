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
