/* 米什金《货币金融学》第 11 版完整章节结构
 * 6 篇 · 25 章
 * implemented=true 的章节有专属页面;否则跳到 /pages/placeholder/
 */

export interface Chapter {
  num: number              // 章节号 1-25
  title: string            // 章名
  emoji: string            // 视觉标识
  brief: string            // 一句话介绍(≤25 字)
  difficulty: 1 | 2 | 3 | 4 | 5
  duration?: string        // 学习时长估计
  implemented: boolean     // 是否已实现专属页面
  pagePath?: string        // 已实现 → 跳转路径
  hook?: string            // 反预期 hook(MVP 三章才有)
}

export interface Part {
  num: number              // 篇号 1-6
  title: string
  desc: string             // 篇介绍
  range: string            // 章节范围
  chapters: Chapter[]
}

export const parts: Part[] = [
  {
    num: 1,
    title: '导论',
    desc: '为什么研究货币、银行和金融市场',
    range: '第 1-3 章',
    chapters: [
      {
        num: 1, title: '为什么研究货币、银行和金融市场', emoji: '🌐',
        brief: '金融市场如何影响你的日常生活',
        difficulty: 1, duration: '8 分钟',
        implemented: false
      },
      {
        num: 2, title: '金融体系概览', emoji: '🏛️',
        brief: '直接融资 vs 间接融资,从一张图看懂',
        difficulty: 1, duration: '8 分钟',
        implemented: false
      },
      {
        num: 3, title: '什么是货币', emoji: '💵',
        brief: 'M0 / M1 / M2 / M3 的层次',
        difficulty: 1, duration: '6 分钟',
        implemented: false
      }
    ]
  },
  {
    num: 2,
    title: '金融市场',
    desc: '利率、债券、股票的定价与行为',
    range: '第 4-7 章',
    chapters: [
      {
        num: 4, title: '理解利率', emoji: '📈',
        brief: '现值、到期收益率、费雪方程',
        difficulty: 2, duration: '12 分钟',
        implemented: false
      },
      {
        num: 5, title: '利率行为', emoji: '⚖️',
        brief: '可贷资金 vs 流动性偏好',
        difficulty: 3, duration: '10 分钟',
        implemented: false
      },
      {
        num: 6, title: '利率的风险结构与期限结构', emoji: '📊',
        brief: '收益率曲线为什么会倒挂',
        difficulty: 3, duration: '12 分钟',
        implemented: false
      },
      {
        num: 7, title: '股票市场、理性预期与有效市场假说', emoji: '📉',
        brief: '戈登增长 + EMH 三种形式',
        difficulty: 3, duration: '12 分钟',
        implemented: false
      }
    ]
  },
  {
    num: 3,
    title: '金融机构',
    desc: '银行、影子银行、监管与危机',
    range: '第 8-12 章',
    chapters: [
      {
        num: 8, title: '金融结构的经济学分析', emoji: '🔍',
        brief: '信息不对称 / 逆向选择 / 道德风险',
        difficulty: 3, duration: '10 分钟',
        implemented: false
      },
      {
        num: 9, title: '银行业与金融机构的管理', emoji: '🏦',
        brief: '资产负债管理 + 流动性管理',
        difficulty: 3, duration: '12 分钟',
        implemented: false
      },
      {
        num: 10, title: '银行业:结构与竞争', emoji: '🏢',
        brief: '商业银行 vs 投行 vs 影子银行',
        difficulty: 2, duration: '8 分钟',
        implemented: false
      },
      {
        num: 11, title: '金融监管的经济学分析', emoji: '⚖️',
        brief: 'Basel + 存款保险 + TBTF',
        difficulty: 3, duration: '10 分钟',
        implemented: false
      },
      {
        num: 12, title: '金融危机', emoji: '🔥',
        brief: '危机三阶段 · 2008 / 2020 / 2023 案例',
        difficulty: 4, duration: '15 分钟',
        implemented: false
      }
    ]
  },
  {
    num: 4,
    title: '中央银行与货币政策实施',
    desc: '⭐ MVP 重点篇 · Fed 工具箱与决策',
    range: '第 13-16 章',
    chapters: [
      {
        num: 13, title: '中央银行与联邦储备体系', emoji: '🏛️',
        brief: 'FOMC 决策机制 + 央行独立性',
        difficulty: 2, duration: '10 分钟',
        implemented: false
      },
      {
        num: 14, title: '货币供给过程', emoji: '💱',
        brief: '货币乘数 m=(1+c)/(r+e+c)',
        difficulty: 3, duration: '12 分钟',
        implemented: true,
        pagePath: '/pages/ch14/index',
        hook: 'Fed 印万亿,M2 却几乎没动 — 乘数砸到 1.2 那一刻'
      },
      {
        num: 15, title: '货币政策工具', emoji: '🔧',
        brief: 'OMO / IORB / SRF / ON RRP 利率走廊',
        difficulty: 3, duration: '12 分钟',
        implemented: false
      },
      {
        num: 16, title: '货币政策操作:战略与战术', emoji: '🎯',
        brief: '泰勒规则 · FAIT · 通胀目标制',
        difficulty: 4, duration: '14 分钟',
        implemented: false
      }
    ]
  },
  {
    num: 5,
    title: '国际金融与货币政策',
    desc: '⭐ MVP 重点篇 · 汇率与资本流动',
    range: '第 17-18 章',
    chapters: [
      {
        num: 17, title: '外汇市场 · 利率平价', emoji: '🪙',
        brief: 'IRP + 套息交易 + 三元悖论',
        difficulty: 4, duration: '14 分钟',
        implemented: true,
        pagePath: '/pages/ch17/index',
        hook: '2024.8 USD/JPY 三周从 162→142,10x 杠杆 -100%'
      },
      {
        num: 18, title: '国际金融体系', emoji: '🌏',
        brief: '美元体系 + Fed swap line + 制度演进',
        difficulty: 4, duration: '12 分钟',
        implemented: false
      }
    ]
  },
  {
    num: 6,
    title: '货币理论',
    desc: '⭐ MVP 重点篇 · IS-LM-AD-AS 框架',
    range: '第 19-25 章',
    chapters: [
      {
        num: 19, title: '货币需求理论', emoji: '🧮',
        brief: '货币数量论 · 凯恩斯 · 弗里德曼',
        difficulty: 4, duration: '12 分钟',
        implemented: false
      },
      {
        num: 20, title: 'IS-LM 模型', emoji: '📐',
        brief: '产品市场 + 货币市场均衡',
        difficulty: 5, duration: '15 分钟',
        implemented: true,
        pagePath: '/pages/ch20/index',
        hook: '流动性陷阱里 LM 怎么右移,Y* 都不动'
      },
      {
        num: 21, title: 'IS-LM 中的货币与财政政策', emoji: '⚙️',
        brief: '挤出效应 · 政策组合冲突',
        difficulty: 5, duration: '12 分钟',
        implemented: false
      },
      {
        num: 22, title: '总需求与总供给分析', emoji: '📊',
        brief: 'AD-AS · 短期 vs 长期 · 菲利普斯曲线',
        difficulty: 5, duration: '15 分钟',
        implemented: false
      },
      {
        num: 23, title: '货币政策传导机制', emoji: '🔄',
        brief: '5 大渠道:利率/资产/信贷/资产负债表/财富',
        difficulty: 5, duration: '14 分钟',
        implemented: false
      },
      {
        num: 24, title: '货币政策与通货膨胀', emoji: '🔥',
        brief: '通胀根源 · 大缓和 · FAIT',
        difficulty: 5, duration: '14 分钟',
        implemented: false
      },
      {
        num: 25, title: '理性预期与政策含义', emoji: '🧠',
        brief: '卢卡斯批判 · 时间不一致性',
        difficulty: 5, duration: '12 分钟',
        implemented: false
      }
    ]
  }
]

/* 工具函数 */
export function findChapter(num: number): { part: Part; chapter: Chapter } | null {
  for (const part of parts) {
    const ch = part.chapters.find(c => c.num === num)
    if (ch) return { part, chapter: ch }
  }
  return null
}

export const mvpChapters = parts
  .flatMap(p => p.chapters)
  .filter(c => c.implemented && c.hook)

export const totalChapters = parts.reduce((sum, p) => sum + p.chapters.length, 0)
export const implementedCount = parts.flatMap(p => p.chapters).filter(c => c.implemented).length
