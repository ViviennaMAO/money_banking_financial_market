/* 第 12 章 金融危机时间轴数据
 * 5 个历史危机 × 5 个时间帧 × 4 个指标(信用利差 / VIX / 银行倒闭 / Fed 救助)
 * 用户拖动 progress 0-100 在 5 帧之间线性插值
 */

import type { PredictDef } from '../utils/snapshots'

export type StageKey = 'pre' | 'stage1' | 'stage2' | 'stage3' | 'recovery'

export interface CrisisFrame {
  progress: number          // 0-100
  creditSpread: number      // bp(基点)
  vix: number               // 10-90
  bankFailures: number      // 月度数量
  fedResponse: number       // Fed 资产负债表 $B
  stage: StageKey
  stageLabel: string
  eventNote: string
}

export interface CrisisCase {
  key: string
  name: string
  emoji: string
  intro: string
  predict?: PredictDef
  frames: CrisisFrame[]
}

export const crisisCases: Record<string, CrisisCase> = {
  '2008': {
    key: '2008',
    name: '2008 全球金融危机',
    emoji: '🏚️',
    intro: '教科书级三阶段:房贷扩张 → 雷曼爆发 → 5 年缓慢复苏。米什金《金融危机》开篇案例。',
    frames: [
      { progress: 0,   creditSpread: 90,  vix: 12, bankFailures: 0,  fedResponse: 850,  stage: 'pre',     stageLabel: '阶段 1 · 信贷扩张', eventNote: '2003-2006 美国房价 +30%,次级贷规模翻倍' },
      { progress: 25,  creditSpread: 200, vix: 25, bankFailures: 1,  fedResponse: 880,  stage: 'stage1',  stageLabel: '阶段 1 末 · 警示', eventNote: '2007.8 BNP Paribas 冻结三只基金 — 第一个警钟' },
      { progress: 50,  creditSpread: 600, vix: 89, bankFailures: 5,  fedResponse: 2300, stage: 'stage2',  stageLabel: '阶段 2 · 雷曼倒闭', eventNote: '2008.9.15 雷曼破产,VIX 史上最高 89' },
      { progress: 75,  creditSpread: 450, vix: 50, bankFailures: 15, fedResponse: 3500, stage: 'stage3',  stageLabel: '阶段 3 · 债务通缩', eventNote: '2009-2010 失业率 10%+,银行业整合' },
      { progress: 100, creditSpread: 200, vix: 25, bankFailures: 5,  fedResponse: 4500, stage: 'recovery', stageLabel: '复苏(5 年)',     eventNote: '2014 失业率回到 5.6%,但 m 仍砸在 1.x' }
    ]
  },

  '2020': {
    key: '2020',
    name: '2020 疫情冲击',
    emoji: '🦠',
    intro: '⚡ 历史首次:Fed 在阶段二内极速救助,直接跳过阶段三(债务通缩)。打破经典框架。',
    predict: {
      title: '你即将切换到「2020 疫情冲击」',
      question: '按米什金三阶段,2020 疫情应该走完阶段一(泡沫)→ 阶段二(爆发)→ 阶段三(通缩衰退几年)。但实际呢?',
      options: [
        '走完三阶段,衰退 5 年',
        '走完三阶段,衰退 1 年',
        '跳过阶段三 — Fed 在阶段二内极速救助,V 型反弹',
        '没有发生危机'
      ],
      correctIdx: 2,
      revealHeadline: '阶段三被直接跳过',
      revealMsg: '历史首次:Fed 用 2 周内启动了 $4T 救助(QE 无限 + 公司债购买 + 工资保护贷款)。米什金"阶段三:债务通缩"被跳过。从衰退到 GDP 反超只用 6 个月。教学点:**框架是基于历史观察,但救助速度变了 → 阶段可以被跳过**。这就是为什么 2023 SVB 时 Fed 知道"危机可以阻止"——经验来自 2020。'
    },
    frames: [
      { progress: 0,   creditSpread: 100, vix: 14, bankFailures: 0, fedResponse: 4150, stage: 'pre',      stageLabel: '正常运行',           eventNote: '2020.2 风平浪静,标普 500 创新高' },
      { progress: 25,  creditSpread: 350, vix: 82, bankFailures: 0, fedResponse: 4250, stage: 'stage2',   stageLabel: '阶段 2 · 极速恐慌',  eventNote: '2020.3 全球封锁,VIX 飙到 82' },
      { progress: 50,  creditSpread: 250, vix: 30, bankFailures: 0, fedResponse: 7200, stage: 'stage2',   stageLabel: '⚡ Fed 极速救助',     eventNote: '2020.4 QE 无限 + PMCCF/SMCCF 公司债购买' },
      { progress: 75,  creditSpread: 120, vix: 22, bankFailures: 0, fedResponse: 7400, stage: 'recovery', stageLabel: 'V 型反弹',           eventNote: '2020.6 GDP 季度环比 +33%(史上最强反弹)' },
      { progress: 100, creditSpread: 90,  vix: 16, bankFailures: 0, fedResponse: 8900, stage: 'recovery', stageLabel: '⚡ 阶段 3 跳过',      eventNote: '2021.6 GDP 反超疫情前水平,但埋下 2022 通胀' }
    ]
  },

  '2023': {
    key: '2023',
    name: '2023 SVB 银行业',
    emoji: '🏦',
    intro: 'Fed 在 48 小时内出手,危机控制在区域银行层面。BTFP 工具阻断系统性蔓延。',
    frames: [
      { progress: 0,   creditSpread: 130, vix: 18, bankFailures: 0, fedResponse: 8500, stage: 'pre',      stageLabel: '加息中累积压力',     eventNote: '2022 Fed 加息累积让长债浮亏 ~$1.7T(全行业)' },
      { progress: 25,  creditSpread: 165, vix: 27, bankFailures: 0, fedResponse: 8400, stage: 'stage1',  stageLabel: '阶段 1 · SVB 风声',   eventNote: '2023.3.8 SVB 公布出售证券组合 + $2B 增发' },
      { progress: 50,  creditSpread: 195, vix: 30, bankFailures: 1, fedResponse: 8500, stage: 'stage2',  stageLabel: '阶段 2 · 48 小时挤兑', eventNote: '2023.3.10 SVB 被关闭(48 小时存款蒸发 $42B)' },
      { progress: 75,  creditSpread: 175, vix: 25, bankFailures: 2, fedResponse: 8800, stage: 'stage2',  stageLabel: '⚡ Fed 创设 BTFP',    eventNote: '2023.3.12 BTFP 启动,允许国债面值抵押融资' },
      { progress: 100, creditSpread: 130, vix: 18, bankFailures: 3, fedResponse: 8500, stage: 'recovery', stageLabel: '快速控制',           eventNote: '2023.5 First Republic 被吸收,系统性蔓延阻断' }
    ]
  },

  '1929': {
    key: '1929',
    name: '1929 大萧条',
    emoji: '📉',
    intro: '经典三阶段:股市泡沫 → 黑色星期四 → 4 年债务通缩。Fed 完全失败,数千银行倒闭。',
    frames: [
      { progress: 0,   creditSpread: 50,  vix: 15, bankFailures: 0,   fedResponse: 50,  stage: 'pre',      stageLabel: '阶段 1 · 牛市狂热',     eventNote: '1928 道指翻倍,杠杆投机泛滥' },
      { progress: 25,  creditSpread: 200, vix: 60, bankFailures: 5,   fedResponse: 60,  stage: 'stage2',   stageLabel: '阶段 2 · 黑色星期四',    eventNote: '1929.10.24 道指单日 -11%,集中抛售' },
      { progress: 50,  creditSpread: 800, vix: 90, bankFailures: 30,  fedResponse: 70,  stage: 'stage3',   stageLabel: '阶段 3 · 银行业倒闭潮', eventNote: '1930-1933 共 9000+ 家银行倒闭' },
      { progress: 75,  creditSpread: 600, vix: 65, bankFailures: 25,  fedResponse: 75,  stage: 'stage3',   stageLabel: '阶段 3 · 债务通缩深渊', eventNote: '1933 失业率 25%,GDP -30%' },
      { progress: 100, creditSpread: 300, vix: 35, bankFailures: 8,   fedResponse: 95,  stage: 'recovery', stageLabel: '缓慢复苏(10 年+)',    eventNote: '直到 1939 二战才真正复苏' }
    ]
  },

  '2021china': {
    key: '2021china',
    name: '2021+ 中国房地产',
    emoji: '🏗️',
    intro: '慢性危机,不是一次性爆发。三道红线 → 恒大违约 → 2024 仍在阶段二/三之间。',
    frames: [
      { progress: 0,   creditSpread: 200, vix: 16, bankFailures: 0, fedResponse: 0, stage: 'pre',     stageLabel: '阶段 1 · 房价 / 信贷扩张', eventNote: '2010-2020 房价持续上涨,开发商高杠杆' },
      { progress: 25,  creditSpread: 350, vix: 18, bankFailures: 0, fedResponse: 0, stage: 'stage1', stageLabel: '阶段 1 末 · 三道红线', eventNote: '2020.8 三道红线限制开发商融资' },
      { progress: 50,  creditSpread: 800, vix: 22, bankFailures: 0, fedResponse: 0, stage: 'stage2', stageLabel: '阶段 2 · 恒大违约', eventNote: '2021.12 恒大正式违约,$300B 债务' },
      { progress: 75,  creditSpread: 700, vix: 20, bankFailures: 0, fedResponse: 0, stage: 'stage2', stageLabel: '阶段 2 持续 · 烂尾扩散', eventNote: '2022-2023 多家房企暴雷,业主断供潮' },
      { progress: 100, creditSpread: 500, vix: 18, bankFailures: 0, fedResponse: 0, stage: 'stage3', stageLabel: '阶段 2/3 之间', eventNote: '2024 央行政策放松,但房地产复苏缓慢' }
    ]
  }
}
