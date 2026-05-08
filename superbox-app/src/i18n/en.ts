/* English dictionary — mirrors zh.ts shape exactly */

import type { zh } from './zh'

export const en: typeof zh = {
  common: {
    back: 'Back',
    confirm: 'OK',
    cancel: 'Cancel',
    chapter: 'Chapter {n}',
    chapterShort: 'Ch. {n}',
    part: 'Part {n}',
    enterChapter: 'Open chapter',
    minutes: 'min',
    chapters: 'chapters',
    questions: 'questions',
    days: 'days',
    seconds: 'sec',
    langSwitch: '中',           // when in EN, button shows 中 (=switch to Chinese)
    bookCopyright: 'Prototype v2 · Mishkin textbook content © Pearson',
    chineseOnly: 'Detailed simulator content for this chapter is in Chinese for now'
  },

  hero: {
    tag: 'Make Mishkin\'s theory · validated against today\'s market in real time',
    title: 'Turn Money & Banking into a hands-on, playable textbook',
    titleAccent1: 'Money & Banking',
    titleAccent2: 'play with'
  },

  progressMini: {
    label: '📊 Learning dashboard',
    summary: '{done}/{total} chapters · {streak}-day streak',
    due: ' · ⏰ {n} chapter(s) due for review'
  },

  features: {
    toc: '📚 Full Table of Contents',
    tocSub: '6 parts · {n} chapters',
    tocMeta: 'Tap a part to expand / collapse',

    paths: 'Learning Map',
    pathsDesc: 'Reordered by mental modules · {n} curated paths',
    pathsMeta: '30-min onboarding / Rate intuition / Bank failures / Fed toolkit ...',

    mvp: 'Anti-Intuition Picks',
    mvpDesc: '{n} chapters · one "the textbook didn\'t say, but the market will" moment each',
    mvpMeta: 'Historical snapshots · Predict-first · Interactive simulators',

    quiz: 'Cross-Chapter Quiz',
    quizDesc: '{n} curated questions · 4 levels (recall / apply / analyze / synthesize)',
    quizMeta: 'Single chapter / per-part / fully random',

    glossary: 'Glossary',
    glossaryDesc: '{n} core terms · CN-EN · one-line anti-intuition definitions',
    glossaryMeta: 'Search · 8 categories · jump to chapter',

    news: '📰 Today\'s Top 10 Financial News',
    newsLink: 'View all →'
  },

  toc: {
    range: '{range} · {n} chapters',
    mvpInPart: ' · {n} ⭐ MVP',
    statusDone: '✓ Done',
    statusMvp: '⭐ Featured',
    statusBasic: '● Overview'
  },

  pathsPage: {
    title: 'Learning Map',
    subtitle: 'Reordered by mental modules · 9 paths cutting across textbook order',
    outcomeFlag: '🎯',
    nodesNote: 'Same chapter may appear in multiple paths · with different roles'
  },

  mvpPage: {
    title: 'Anti-Intuition Picks',
    subtitleTpl: '{n} jaw-drop moments · one "textbook didn\'t say, market will" per chapter',
    cta: 'Try it →',
    foot: 'Each chapter pairs a historical snapshot · predict-first prompt · interactive formula tool'
  },

  glossaryPage: {
    title: 'Glossary',
    subtitleTpl: '{n} core terms · CN-EN paired · one-line anti-intuition definitions',
    searchPlaceholder: 'Search term / English / keyword',
    filterAll: 'All',
    matched: '{n} match(es)',
    notFound: 'No matching term',
    chapterLink: 'Chapter {n} →',
    foot: 'Mishkin Money & Banking, 11th Ed. · Curated core terminology'
  },

  quizPage: {
    title: 'Cross-Chapter Quiz',
    subtitleTpl: '{n} questions · 25 chapters × 5 each',
    randomTitle: '🎲 Random sampling',
    random8: 'Random 8 from all chapters',
    random8Desc: 'Pull 8 from the full 125 — test holistic mastery',
    random15: 'Random 15 from all chapters',
    random15Desc: 'Longer set, closer to exam style',
    perPart: '📚 Sample by Part',
    perPartTpl: 'Part {n} · 6 questions',
    singleCh: '🎯 Single Chapter Drill',
    singleChTip: '5 high-quality questions per chapter',
    foot: '4 question levels: recall / apply / analyze / synthesize',
    runningMeta: '{n} questions · submit when done to see breakdown',
    crossTitle: 'Cross-chapter Quiz',
    qNo: 'Q{n}',
    pleaseSelect: 'Select an answer first',
    showExplain: 'Show explanation →',
    submit: 'Submit & view summary →',
    backMenu: 'Back to menu',
    backChapter: 'Back to chapter',
    again: 'Try another set',
    score: '{score} pts',
    correctOf: '{correct} / {total} correct',
    levelRecall: 'recall',
    levelApply: 'apply',
    levelAnalyze: 'analyze',
    levelSynth: 'synthesize',
    explainFlag: '💡',
    commentHigh: 'Mastery — you can teach this',
    commentMid1: 'Solid · occasional misses worth revisiting',
    commentMid2: 'Pass · concepts get; depth needs work',
    commentLow: 'Still on the journey · revisit chapters of missed questions'
  },

  progressPage: {
    title: 'Learning Dashboard',
    subtitle: 'Local-storage only · privacy-safe · Ebbinghaus review reminders',
    statCompletion: 'Completion',
    statCompletionSub: '{done}/{total} chapters',
    statStreak: 'Day streak',
    statStreakSubEmpty: 'Start today',
    statDue: 'Due review',
    statDueSub: 'Ebbinghaus due',
    statMinutes: 'Total minutes',
    statMinutesSub: '{n} chapter(s) opened',
    barFull: '🎉 All done · 25 chapters of Mishkin completed',
    barPartial: '{n} more to go · keep going!',
    sectionDue: '⏰ Due for review',
    dueMeta: '{n} chapter(s) due',
    sectionMatrix: '🧭 Chapter progress',
    matrixHint: 'Tap a chapter to jump',
    legendDone: 'Done',
    legendOpen: 'Opened',
    legendLocked: 'Not started',
    sectionRecent: '🕐 Recent activity',
    tagDone: '✓ Done',
    tagProgress: 'In progress',
    tagScore: '{n} pts',
    tagTries: '{n} prediction(s)',
    crossTestTitle: 'Cross-chapter quiz',
    crossTestDesc: 'Test true knowledge transfer across chapters',
    resetBtn: 'Reset all progress',
    resetTitle: 'Reset progress',
    resetContent: 'This wipes all learning records and review queue, irreversible',
    resetCancel: 'Cancel',
    resetConfirm: 'Reset',
    resetDone: 'Cleared',
    foot: 'All data lives only on this device · never uploaded',
    review: 'Review',
    levelTpl: 'L{n}',
    timeJustNow: 'just now',
    timeMinAgo: '{n} min ago',
    timeHrAgo: '{n} hr ago',
    timeDayAgo: '{n} day(s) ago'
  },

  newsPage: {
    title: 'Daily Top 10 Financial News',
    subtitle: 'Each story → instantly mapped to relevant theory → jump to learn',
    backToTop: '← Back to Top 10',
    deepAnalysis: '📰 Deep dive',
    twistFlag: '⚡ Anti-intuition',
    knowledgeFlag: '🎓 Related concepts · tap to learn',
    knowledgeChapter: 'Chapter {n}',
    knowledgeGlossary: 'Term · {ref}',
    knowledgePath: 'Path · {ref}',
    foot: 'Simulated news · adapted from real 2024-25 events',
    expand: 'Expand →'
  },

  chapterUI: {
    chapterTag: 'Ch. {n}',
    historicalFlag: '🕰️ Historical snapshots',
    inputPanel: '🎚️ Inputs',
    outputPanel: '📊 Live calculation',
    eduFormula: '📐 Formula / mechanism',
    eduTwist: '⚡ Anti-intuition hook',
    quizCta: '🧩 Try the 5 quiz questions for this chapter →',
    livePanel: '📡 Real-time data right now',
    nextChapter: 'Next chapter →'
  }
}
