const HIGH_RISK_TERMS = [
  "18+", "18禁", "成人服務", "成人內容", "色情", "三級", "咸濕", "鹹濕",
  "成人影片", "成人视频", "av女優", "av女优", "a片",
  "巨乳", "爆乳", "大奶", "奶子", "乳房", "美胸", "翹臀", "翘臀",
  "處女", "处女", "人妻", "蘿莉", "萝莉", "少女性愛", "少女性爱",
  "約炮", "約砲", "约炮", "约砲", "約p", "一夜情", "援交", "援交妹",
  "包養", "包养", "叫雞", "叫鸡", "樓鳳", "楼凤", "鳳樓", "凤楼",
  "外送茶", "茶莊", "茶庄", "半套", "全套", "無套", "无套",
  "性服務", "性服务", "性交易", "裸聊", "裸照", "肉照", "私密照", "露點", "露点", "開房", "开房",
  "上門服務", "上门服务", "全套服務", "特殊服務", "特殊服务", "手天使", "打飛機", "打飞机", "口交", "吹簫", "吹箫",
  "onlyfans", "fansly", "porn", "porno", "xxx", "nude", "nudes", "nsfw",
  "escort", "hookup", "sex service", "sexual service", "blowjob", "handjob",
  "賭博", "博彩", "賭場", "百家樂", "外圍", "投注", "六合彩", "老虎機",
  "線上賭博", "线上赌博", "網上賭博", "网上赌博", "線上博彩", "线上博彩",
  "網上博彩", "网上博彩", "娛樂城", "娱乐城", "真人荷官", "真人娛樂",
  "捕魚機", "捕鱼机", "德州撲克", "德州扑克", "撲克", "扑克", "poker",
  "casino", "betting", "sportsbook", "บาคาร่า", "บาคาร่าออนไลน์",
  "電子煙", "电子烟", "電煙", "电烟", "煙彈", "烟弹", "煙油", "烟油",
  "香煙", "香烟", "私煙", "私烟", "水貨煙", "水货烟", "免稅煙", "免税烟",
  "雪茄", "水煙", "水烟", "iqos", "heets", "vape", "vaping", "nicotine",
  "假證", "假证", "假身份證", "假身份证", "假護照", "假护照", "假學歷", "假学历",
  "買賣戶口", "买卖户口", "買賣帳戶", "买卖账户", "銀行卡買賣", "银行卡买卖",
  "跑分", "洗錢", "洗钱", "代收款", "代收錢", "代收钱", "黑錢", "黑钱",
  "開山刀", "开山刀", "蝴蝶刀", "伸縮棍", "伸缩棍", "電擊棒", "电击棒",
  "仿真槍", "仿真枪", "bb槍", "bb枪", "氣槍", "气枪", "軍火", "军火",
  "處方藥", "处方药", "安眠藥", "安眠药", "偉哥", "伟哥", "威而鋼", "威而钢",
  "迷姦水", "迷奸水", "白粉", "海洛因", "k仔", "k粉", "笑氣", "笑气",
];

const MEDIUM_RISK_TERMS = [
  "tg群", "telegram群", "電報群", "电报群", "加tg", "加telegram", "加電報", "加电报",
  "加微信", "加line", "搵快錢", "日賺", "月入", "高回報", "包賺",
  "免入息", "免審批", "私人貸款", "財務公司", "借錢", "貸款",
  "免TU", "免tu", "不查征信", "免征信", "秒批", "即批", "低息貸款", "低息贷款",
  "刷單", "刷单", "做任務賺錢", "做任务赚钱", "兼職刷單", "兼职刷单",
  "招聘打字員", "招聘打字员", "網賺", "网赚", "資金盤", "资金盘",
  "usdt", "泰達幣", "泰达币", "虛擬幣", "虚拟币", "加密貨幣", "加密货币",
  "幣圈", "币圈", "炒幣", "炒币", "合約交易", "合约交易", "槓桿交易", "杠杆交易",
  "帶單", "带单", "跟單", "跟单", "搬磚套利", "搬砖套利", "量化交易",
  "殺豬盤", "杀猪盘", "幣安", "币安", "歐易", "欧易", "火幣", "火币",
  "crypto investment", "investment group", "guaranteed profit", "binance", "okx",
  "loan approval", "quick cash", "easy money",
  "大麻", "可卡因", "冰毒", "毒品", "迷藥", "ketamine", "cocaine",
  "weed delivery", "drug delivery",
];

const CONTACT_PATTERNS = [
  /\b(?:telegram|signal|wechat|line|tg)\b/i,
  /(?:加|入|私|搵|找|聯絡|联系)?\s*(?:tg|telegram|電報|电报)(?:\s*(?:群|group|頻道|频道))?/i,
  /(?:\+?852[-\s]?)?[569]\d{3}[-\s]?\d{4}/,
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
  /(?:https?:\/\/|www\.)[^\s]+/i,
  /\b(?:bit\.ly|tinyurl\.com|t\.me|linktr\.ee)\b/i,
];

const HIGH_RISK_PATTERNS = [
  /\b(?:sex|porn|nude|nudes|escort|hookup|blowjob|handjob|onlyfans)\b/i,
  /\b(?:casino|betting|sportsbook|poker|loan shark|payday loan|vape|nicotine)\b/i,
  /(?:約|约|招|搵|找).{0,6}(?:炮|砲|p|援交|包養|包养|裸聊)/i,
  /(?:上門|上门|全套|半套|特殊).{0,6}(?:服務|服务|按摩)/i,
  /(?:買|卖|賣|出售|代購|代购).{0,8}(?:煙|烟|電子煙|电子烟|煙彈|烟弹|vape|iqos|usdt|虛擬幣|虚拟币|戶口|户口|銀行卡|银行卡)/i,
  /(?:線上|线上|網上|网上|真人).{0,8}(?:賭|赌|博彩|娛樂城|娱乐城|百家樂|百家乐|撲克|扑克)/i,
];

export interface ContentModerationResult {
  blocked: boolean;
  score: number;
  reasons: string[];
  matchedTerms: string[];
}

interface ForumContentInput {
  title?: string;
  content?: string;
}

const normalizeText = (value: string) => (
  String(value || "")
    .normalize("NFKC")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .toLowerCase()
);

const compactText = (value: string) => value.replace(/[\s._\-*|/\\]+/g, "");

const collectTermMatches = (text: string, compact: string, terms: string[]) => {
  const matches: string[] = [];
  terms.forEach((term) => {
    const normalizedTerm = normalizeText(term).trim();
    const compactTerm = compactText(normalizedTerm);
    if (
      (normalizedTerm && text.includes(normalizedTerm)) ||
      (compactTerm && compact.includes(compactTerm))
    ) {
      matches.push(term);
    }
  });
  return matches;
};

const scoreContactSignals = (text: string) => (
  CONTACT_PATTERNS.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0)
);

export const moderateForumContent = ({ title = "", content = "" }: ForumContentInput = {}): ContentModerationResult => {
  const text = normalizeText(`${title}\n${content}`);
  const compact = compactText(text);

  const highTerms = collectTermMatches(text, compact, HIGH_RISK_TERMS);
  const mediumTerms = collectTermMatches(text, compact, MEDIUM_RISK_TERMS);
  const highPatternMatches = HIGH_RISK_PATTERNS.filter((pattern) => pattern.test(text)).length;
  const contactSignals = scoreContactSignals(text);
  const repeatedContactSignals = Math.max(0, (text.match(/(?:\+?852[-\s]?)?[569]\d{3}[-\s]?\d{4}/g) || []).length - 1);

  let score = 0;
  score += highTerms.length * 8;
  score += highPatternMatches * 8;
  score += mediumTerms.length * 4;
  score += contactSignals * 2;
  score += repeatedContactSignals * 3;

  const adWithContact = mediumTerms.length > 0 && contactSignals > 0;
  const adultWithContact = highTerms.length > 0 && contactSignals > 0;
  const blocked = highTerms.length > 0 || highPatternMatches > 0 || adWithContact || adultWithContact || score >= 8;

  const reasons: string[] = [];
  if (highTerms.length > 0 || highPatternMatches > 0) reasons.push("adult_or_illicit_content");
  if (mediumTerms.length > 0) reasons.push("spam_or_commercial_content");
  if (contactSignals > 0) reasons.push("external_contact_or_link");
  if (repeatedContactSignals > 0) reasons.push("repeated_contact_details");

  return {
    blocked,
    score,
    reasons,
    matchedTerms: [...new Set([...highTerms, ...mediumTerms])].slice(0, 6),
  };
};

export const getContentModerationMessage = (language = "en") => {
  if (String(language).startsWith("zh")) {
    return "內容可能包含成人、廣告、外部聯絡方式或其他不當資訊。請修改後再提交。";
  }
  return "This content may include adult, spam, external contact, or other inappropriate information. Please edit it before submitting.";
};
