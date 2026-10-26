import { ROOT } from './data.js';

const STRINGS = {
  skip: { zh: '跳到主要內容', en: 'Skip to content' },
  seenMark: { zh: '（已收錄）', en: '(collected)' },
  brand: { zh: 'AI 群俠傳', en: 'AI Wuxia Chronicles' },
  disclaimer: {
    zh: '本站為個人學習用途，非 NVIDIA 或任何公司官方網站，與各公司無合作或背書關係；公司名稱與 Logo 為各自商標，僅用於辨識；股價與財務數字為特定日期的快照，不構成投資建議；內容以 2026-10 公開資訊整理，可能有誤或過時；「圍觀次數」由免費計數服務 Abacus 統計，不使用 cookie。',
    en: 'A personal, fan-made learning project — not affiliated with, endorsed by, or an official site of NVIDIA or any listed company. Company names and logos are trademarks of their owners, used for identification only. Stock and financial figures are dated snapshots, not investment advice. Compiled from public information as of 2026-10; may be inaccurate or outdated. The “watched” count is kept by the free Abacus counter — no cookies.',
  },
  colon: { zh: '：', en: ': ' },
  listSep: { zh: '、', en: ', ' },
  langButton: { zh: 'EN', en: '中' },
  tabMap: { zh: '🗺️ 江湖', en: '🗺️ Map' },
  tabFlow: { zh: '🔀 神兵之路', en: '🔀 Blade Road' },
  tabQuiz: { zh: '⚔️ 比武', en: '⚔️ Duel' },
  tabDict: { zh: '📚 辭典', en: '📚 Lexicon' },
  tabBook: { zh: '📜 秘笈冊', en: '📜 My Scroll' },
  introSkip: { zh: '跳過 ›', en: 'Skip ›' },
  introNext: { zh: '下一格 ›', en: 'Next ›' },
  introEnter: { zh: '踏入江湖 ›', en: 'Enter the Jianghu ›' },
  introReplay: { zh: '重看開場漫畫', en: 'Replay the intro comic' },
  watched: { zh: '👀 已被圍觀 {n} 次', en: '👀 Watched {n} times' },
  starCta: { zh: '⭐ 喜歡的話，到 GitHub 給顆星', en: '⭐ Enjoyed it? Give it a star on GitHub' },
  starNote: { zh: '按讚不用錢，卻能讓更多人看到這個網站。', en: "It's free, and it helps more people find this site." },
  mapTitle: { zh: 'AI 生態系大地圖', en: 'The AI Ecosystem Map' },
  keynoteKicker: { zh: '延伸自 NVIDIA GTC Berlin 主題演講投影片 · 2026.10.21', en: 'Extended from the NVIDIA GTC Berlin keynote slides · Oct 21, 2026' },
  watchKeynote: { zh: '▶ 觀看完整主題演講（中英雙語字幕）', en: '▶ Watch the full keynote (Chinese/English subtitles)' },
  mapLead: {
    zh: '2026 年 10 月 21 日，黃仁勳在柏林 GTC 主題演講中，把 AI 生態系分成 CSPs、AI Labs、AI Natives、Neoclouds、ODM & OEM、Enterprise & Industrial，以及 OpenShell 夥伴。點一個門派，認識裡面的公司吧！',
    en: 'At GTC Berlin on Oct 21, 2026, Jensen Huang grouped the AI ecosystem into CSPs, AI Labs, AI Natives, Neoclouds, ODM & OEM, Enterprise & Industrial, and OpenShell partners. Tap a faction to meet the companies!',
  },
  leaderCta: { zh: '拜見盟主', en: 'Meet the Grandmaster' },
  realName: { zh: '真實身分', en: 'In real life' },
  back: { zh: '‹ 回地圖', en: '‹ Back to map' },
  search: { zh: '搜尋人物…', en: 'Search heroes…' },
  filterImportance: { zh: '重要度', en: 'Importance' },
  filterBond: { zh: '與 NVIDIA 關係', en: 'NVIDIA tie' },
  all: { zh: '全部', en: 'All' },
  noResults: { zh: '找不到符合的人物。', en: 'No heroes match.' },
  members: { zh: '位', en: '' },
  close: { zh: '關閉', en: 'Close' },
  plain: { zh: '💬 一句話認識', en: '💬 In one sentence' },
  profile: { zh: '🏢 公司檔案', en: '🏢 Company profile' },
  details: { zh: '📖 他們在做什麼', en: '📖 What they do' },
  learn: { zh: '🧠 AI 新知', en: '🧠 AI insight' },
  learnTerms: { zh: '相關名詞：', en: 'Related terms: ' },
  insights: { zh: '🔭 產業洞察', en: '🔭 Industry insights' },
  market: { zh: '📈 股價與市場', en: '📈 Stock & market' },
  funding: { zh: '📈 估值與募資', en: '📈 Valuation & funding' },
  privateCo: { zh: '未上市公司', en: 'Private company' },
  dataDate: { zh: '資料日期', en: 'Data as of' },
  liveQuote: { zh: '查看即時股價', en: 'See live quote' },
  notAdvice: { zh: '股價為特定日期的歷史資料，法人看法僅為整理報導，不構成任何投資建議。', en: 'Prices are historical snapshots and analyst views are summarized from reports — not investment advice.' },
  investments: { zh: '💼 投資布局', en: '💼 Investments' },
  stake: { zh: '持股', en: 'Stake' },
  bond: { zh: '🤝 和 NVIDIA 的關係', en: '🤝 Relationship with NVIDIA' },
  impact: { zh: '🌊 對 AI 發展的影響', en: '🌊 Impact on AI' },
  examples: { zh: '🏯 代表企業', en: '🏯 Notable houses' },
  links: { zh: '🔗 介紹連結', en: '🔗 Learn more' },
  linkOfficial: { zh: '🏠 官網', en: '🏠 Official site' },
  linkAbout: { zh: '📖 公司介紹', en: '📖 About' },
  linkNvidia: { zh: '🤝 NVIDIA 相關', en: '🤝 With NVIDIA' },
  sources: { zh: '📜 來源', en: '📜 Sources' },
  asOf: { zh: '更新日期', en: 'As of' },
  unverified: { zh: '待考證', en: 'Unverified' },
  unverifiedNote: {
    zh: '這位人物的資料還在查證中，內容尚未完成。',
    en: 'This hero\'s story is still being researched.',
  },
  nameUncertain: {
    zh: '名稱是從投影片辨識的，可能不準確。',
    en: 'This name was read off a slide and may be inaccurate.',
  },
  noLinks: { zh: '（尚無資料）', en: '(none yet)' },
  newInScroll: { zh: '✨ 已收錄進秘笈冊，學到一個 AI 新知！', en: '✨ Added to your scroll — one more AI insight learned!' },
  bookTitle: { zh: '我的秘笈冊', en: 'My Secret Scroll' },
  bookLead: { zh: '看過的人物會自動收錄。', en: 'Every hero you visit is recorded here.' },
  bookRank: { zh: '目前稱號', en: 'Current rank' },
  bookNext: { zh: '再收集 {n} 位升級為「{rank}」', en: 'Collect {n} more to become “{rank}”' },
  bookMax: { zh: '你已經是一代宗師！', en: 'You have become a Grandmaster!' },
  bookReset: { zh: '清空秘笈冊', en: 'Reset my scroll' },
  bookResetConfirm: { zh: '確定要清空收集紀錄嗎？', en: 'Clear all collected heroes?' },
  quizTitle: { zh: '比武問答', en: 'Duel of Wits' },
  quizLead: { zh: '一次 5 題，不扣分、不計時，答錯也只是多學一招。', en: 'Five questions, no penalties, no timer — a wrong answer is just a new move learned.' },
  quizStart: { zh: '開始比武', en: 'Begin the duel' },
  quizProgress: { zh: '第 {i} / {n} 題', en: 'Question {i} of {n}' },
  quizRight: { zh: '✅ 好身手！', en: '✅ Well struck!' },
  quizWrong: { zh: '📖 再學一招：', en: '📖 A new move learned:' },
  quizNext: { zh: '下一題 ›', en: 'Next ›' },
  quizFinish: { zh: '看結果 ›', en: 'See results ›' },
  quizDone: { zh: '比武結束！答對 {s} / {n} 題', en: 'Duel complete! {s} of {n} correct' },
  quizAgain: { zh: '再比一場', en: 'Duel again' },
  quizRelated: { zh: '相關人物', en: 'Related heroes' },
  quizSee: { zh: '看人物卡', en: 'See hero card' },
  dictTitle: { zh: '江湖辭典', en: 'Lexicon of the Jianghu' },
  dictLead: { zh: '江湖說法與真實名詞對照，看不懂就來這裡查。', en: 'Wuxia terms and their real-world meanings.' },
  dictSearch: { zh: '搜尋詞條…', en: 'Search terms…' },
  flowTitle: { zh: '神兵之路', en: 'The Blade Road' },
  flowPause: { zh: '暫停動畫', en: 'Pause animation' },
  flowPlay: { zh: '播放動畫', en: 'Play animation' },
  notFound: { zh: '此路不通，回地圖吧。', en: 'This path leads nowhere — back to the map.' },
  loadError: { zh: '資料載入失敗，請重新整理。', en: 'Could not load data. Please refresh.' },
  imp3: { zh: '⭐⭐⭐ 一方霸主', en: '⭐⭐⭐ Titan' },
  imp2: { zh: '⭐⭐ 名震一方', en: '⭐⭐ Renowned' },
  imp1: { zh: '⭐ 後起之秀', en: '⭐ Up-and-coming' },
  bondCustomer: { zh: '採購 GPU', en: 'Buys GPUs' },
  bondPartner: { zh: '合作', en: 'Partner' },
  bondInvestee: { zh: 'NVIDIA 有投資', en: 'NVIDIA-backed' },
  bondSupplier: { zh: '供應鏈', en: 'Supplier' },
  industryTag: { zh: '產業卡', en: 'Industry' },
};

export const RANKS = [
  { min: 0, zh: '江湖小蝦米', en: 'Little Shrimp' },
  { min: 0.25, zh: '少俠', en: 'Young Hero' },
  { min: 0.6, zh: '大俠', en: 'Great Hero' },
  { min: 1, zh: '一代宗師', en: 'Grandmaster' },
];

// The URL decides the language: the site root is Traditional Chinese, /en/ is English.
// Each page declares it on <html data-lang>, so shared links always open in the intended language.
const lang = document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';

export const getLang = () => lang;

/** URL of the same view in the other language (keeps the current #/route). */
export function langUrl(next) {
  return new URL(next === 'en' ? 'en/' : './', ROOT).href + location.hash;
}

/** UI string lookup with {placeholder} substitution. */
export function t(key, vars = {}) {
  const entry = STRINGS[key];
  const s = entry ? entry[lang] : key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

/** The public GitHub repo, for the star button. */
export const REPO_URL = 'https://github.com/sean-lee-software-embedded/AI';

/** Pick the current language from a {zh, en} object, falling back to the other. */
export function L(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj[lang === 'zh' ? 'en' : 'zh'] || '';
}

/** Bilingual alt text, as required by the accessibility spec. */
export const altBoth = (obj) => [obj?.zh, obj?.en].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' / ');

export function applyStatic() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.title = lang === 'zh' ? 'AI 群俠傳 · AI Wuxia Chronicles' : 'AI Wuxia Chronicles · AI 群俠傳';
}

