/* 中文字典(权威版,英文版字段镜像)*/

export const zh = {
  // ===== 通用 =====
  common: {
    back: '返回',
    confirm: '确认',
    cancel: '取消',
    chapter: '第 {n} 章',
    chapterShort: '第 {n} 章',
    part: '第 {n} 篇',
    enterChapter: '进入章节',
    minutes: '分钟',
    chapters: '章',
    questions: '题',
    days: '天',
    seconds: '秒',
    langSwitch: 'EN',           // 在中文界面里,切换按钮文案为 EN(指示要切到英文)
    bookCopyright: '原型 v2 · 米什金教材内容版权属 Pearson',
    chineseOnly: '本章详细内容暂为中文版'
  },

  // ===== Hero =====
  hero: {
    tag: '让米什金的理论 · 在今天的市场上立刻验证',
    title: '把货币金融学,变成你能动手玩的活教材',
    titleAccent1: '货币金融学',
    titleAccent2: '动手玩'
  },

  // ===== 进度迷你卡 =====
  progressMini: {
    label: '📊 学习仪表板',
    summary: '{done}/{total} 章完成 · 连续 {streak} 天',
    due: ' · ⏰ {n} 章待复习'
  },

  // ===== 5 大功能卡片 =====
  features: {
    toc: '📚 完整目录',
    tocSub: '6 篇 {n} 章',
    tocMeta: '点击篇名展开 / 收起',

    paths: '学习地图',
    pathsDesc: '打乱原教材顺序 · {n} 条路径按"思维模块"重组',
    pathsMeta: '30 分钟入门 / 利率思维 / 银行倒下 / Fed 工具箱 ...',

    mvp: '反预期精选',
    mvpDesc: '{n} 章 · 每章一个"教材没说,但市场会教你"的瞬间',
    mvpMeta: '历史快照 · 预测先行 · 互动模拟器',

    quiz: '跨章测验',
    quizDesc: '{n} 题精选 · 4 层级(回忆 / 应用 / 分析 / 综合)',
    quizMeta: '单章精练 / 按篇抽题 / 全章随机',

    glossary: '词汇附录',
    glossaryDesc: '{n} 词条 · 中英对照 · 反预期一句话定义',
    glossaryMeta: '搜索 · 8 大类 · 直达章节',

    news: '今日财经 Top 10',
    newsLink: '查看全部 →'
  },

  // ===== 完整目录 mini-card =====
  toc: {
    range: '{range} · {n} 章',
    mvpInPart: ' · {n} 章 ⭐ MVP',
    statusDone: '✓ 已学',
    statusMvp: '⭐ 专属',
    statusBasic: '● 概览版',
    statusLocked: '🔒 付费',
    partLocked: ' · 🔒 付费篇'
  },

  // ===== 付费解锁页 =====
  unlockPage: {
    heroEmoji: '🔓',
    heroTitle: '解锁全部章节',
    heroSubtitle: '一次买断 · 永久可用 · 无订阅',
    forChapterTpl: '你想打开的是 · 第 {n} 章',
    valueTag: '—— 你将获得 ——',
    value1: 'Ch 17-25 · 9 章专属(国际金融 + 货币理论)',
    value2: '9 个反预期模拟器(套息 / IS-LM / AD-AS / 通胀拆解 / 卢卡斯批判)',
    value3: '45 道精选题 · 解锁国际金融 + 宏观模块',
    value4: '30+ 词条章节跳转全开 · 跨章测验无锁',
    priceTag: '—— 价格 ——',
    priceFull: '$19.9',
    priceMeta: '一次性买断 · 永久可用',
    payBtn: '⚡ 立即解锁',
    payBusy: '请在钱包中签名…',
    demoBtn: '🧪 演示解锁(本地标记 · 不付费)',
    demoConfirmTitle: '演示解锁',
    demoConfirmContent: '这会在本地标记为已解锁,不会发起任何支付。仅用于体验,正式版会接入 Luffa 钱包支付。',
    demoConfirmOk: '确认演示解锁',
    demoConfirmCancel: '取消',
    successTitle: '解锁成功!',
    backBtn: '← 返回',
    footnote: '解锁状态存于本设备 · 重装需重新解锁 · 后续可绑定 Luffa 账户跨设备同步',
    payTokenInfo: '通过 Luffa 钱包 · Endless 链',
    edsFallbackNote: '当前用 EDS 兜底(≈ {eds} EDS),USDT 路径待 token 地址确认后启用',
    txInfoTitle: '交易信息',
    txInfoHash: 'TX',
    txInfoAddress: '钱包',
    txInfoAt: '时间'
  },

  // ===== 学习地图页 =====
  pathsPage: {
    title: '学习地图',
    subtitle: '打乱原教材顺序 · 9 条路径 · 按"思维模块"重组',
    outcomeFlag: '🎯',
    nodesNote: '同一章可能出现在多条路径里 · 角色不同'
  },

  // ===== 反预期精选页 =====
  mvpPage: {
    title: '反预期精选',
    subtitleTpl: '{n} 个震撼时刻 · 每章一个"教材没说,但市场会教你"的瞬间',
    cta: '立刻试 →',
    foot: '每章带历史快照 + 反预期预测先行 + 互动公式器'
  },

  // ===== 词汇附录页 =====
  glossaryPage: {
    title: '词汇附录',
    subtitleTpl: '{n} 个核心术语 · 中英对照 · 反预期一句话定义',
    searchPlaceholder: '搜索术语 / 英文 / 关键词',
    filterAll: '全部',
    matched: '匹配 {n} 条',
    notFound: '未找到匹配术语',
    chapterLink: '第 {n} 章 →',
    foot: '米什金《货币金融学》第 11 版 · 核心术语精选'
  },

  // ===== 跨章测验页 =====
  quizPage: {
    title: '跨章联动测验',
    subtitleTpl: '题库共 {n} 题 · 25 章 × 5 题精选',
    randomTitle: '🎲 随机抽题',
    random8: '全章随机 8 题',
    random8Desc: '从 25 章 125 题中抽 8 道,检测综合掌握度',
    random15: '全章随机 15 题',
    random15Desc: '更长形式,接近期末考体验',
    perPart: '📚 按篇抽题',
    perPartTpl: '第 {n} 篇 · 6 题',
    singleCh: '🎯 单章精练',
    singleChTip: '每章 5 道高质量精选题',
    foot: '4 个题目层级:回忆 / 应用 / 分析 / 综合',
    runningMeta: '{n} 题 · 答完点提交查看解析',
    crossTitle: '跨章测验',
    qNo: '第 {n} 题',
    pleaseSelect: '请先选择',
    showExplain: '查看解析 →',
    submit: '提交并查看总评 →',
    backMenu: '返回选择',
    backChapter: '返回章节',
    again: '再来一组',
    score: '{score} 分',
    correctOf: '{correct} / {total} 道正确',
    levelRecall: '回忆',
    levelApply: '应用',
    levelAnalyze: '分析',
    levelSynth: '综合',
    explainFlag: '💡',
    commentHigh: '掌握度极高 — 已可以教别人了',
    commentMid1: '熟练 · 偶尔失手是认知边界,值得回看错题',
    commentMid2: '及格 · 概念已 get,深度待加强',
    commentLow: '还在路上 · 推荐先看错题对应的章节'
  },

  // ===== 进度仪表板 =====
  progressPage: {
    title: '学习仪表盘',
    subtitle: '基于本地存储 · 隐私无忧 · 艾宾浩斯复习提醒',
    statCompletion: '完成度',
    statCompletionSub: '{done}/{total} 章',
    statStreak: '连续天数',
    statStreakSubEmpty: '今日开始',
    statDue: '待复习',
    statDueSub: '艾宾浩斯到期',
    statMinutes: '累计分钟',
    statMinutesSub: '{n} 章打开过',
    barFull: '🎉 全部完成 · 走完了米什金 25 章',
    barPartial: '还差 {n} 章 · 加油!',
    sectionDue: '⏰ 待复习',
    dueMeta: '{n} 章到期',
    sectionMatrix: '🧭 章节进度',
    matrixHint: '点击章节快速跳转',
    legendDone: '已完成',
    legendOpen: '打开过',
    legendLocked: '未学',
    sectionRecent: '🕐 最近活动',
    tagDone: '✓ 完成',
    tagProgress: '进行中',
    tagScore: '{n} 分',
    tagTries: '{n} 次预测',
    crossTestTitle: '跨章联动测验',
    crossTestDesc: '把多章知识点放在同一情景里 · 检测真正的迁移能力',
    resetBtn: '清空所有进度',
    resetTitle: '清空进度',
    resetContent: '将清空所有学习记录和复习队列,无法恢复',
    resetCancel: '取消',
    resetConfirm: '清空',
    resetDone: '已清空',
    foot: '所有数据仅存于设备本地 · 不上传服务器',
    review: '复习',
    levelTpl: 'L{n}',
    timeJustNow: '刚刚',
    timeMinAgo: '{n} 分钟前',
    timeHrAgo: '{n} 小时前',
    timeDayAgo: '{n} 天前'
  },

  // ===== 新闻 =====
  newsPage: {
    title: '每日财经 Top 10',
    subtitle: '每条新闻 → 即时拆解涉及的知识点 → 跳转学习',
    backToTop: '← 返回 Top 10',
    deepAnalysis: '📰 深度分析',
    twistFlag: '⚡ 反预期',
    knowledgeFlag: '🎓 涉及知识点 · 点击进入学习',
    knowledgeChapter: '第 {n} 章',
    knowledgeGlossary: '词条 · {ref}',
    knowledgePath: '路径 · {ref}',
    foot: '新闻为模拟版 · 数据基于 2024-25 真实事件改编',
    expand: '展开 →'
  },

  // ===== 章节通用页(模板) =====
  chapterUI: {
    chapterTag: '第 {n} 章',
    historicalFlag: '🕰️ 历史快照',
    inputPanel: '🎚️ 输入参数',
    outputPanel: '📊 实时计算',
    eduFormula: '📐 公式 / 机制',
    eduTwist: '⚡ 反预期 hook',
    quizCta: '🧩 试试本章 5 道精选题 →',
    livePanel: '📡 当下真实数据',
    nextChapter: '下一章 →'
  }
} as const
