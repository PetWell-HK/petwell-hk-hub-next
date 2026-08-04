const SEARCH_ENGINE_ALLOWLIST = [
  "googlebot",
  "googlebot-image",
  "bingbot",
  "duckduckbot",
  "slurp",
  "baiduspider",
  "yandexbot",
];

const SOCIAL_PREVIEW_ALLOWLIST = [
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
];

const BLOCKED_CRAWLER_PATTERNS = [
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "ccbot",
  "anthropic-ai",
  "claudebot",
  "claude-web",
  "google-extended",
  "perplexitybot",
  "bytespider",
  "amazonbot",
  "applebot-extended",
  "cohere-ai",
  "meta-externalagent",
  "diffbot",
  "ahrefsbot",
  "semrushbot",
  "dotbot",
  "mj12bot",
  "blexbot",
  "dataforseobot",
  "petalbot",
  "scrapy",
  "python-requests",
  "curl",
  "wget",
];

const normalizeUserAgent = (userAgent?: string) =>
  (userAgent || "").toLowerCase();

export const isAllowedSearchCrawler = (userAgent?: string) => {
  const normalized = normalizeUserAgent(userAgent);
  return [...SEARCH_ENGINE_ALLOWLIST, ...SOCIAL_PREVIEW_ALLOWLIST].some((crawler) =>
    normalized.includes(crawler)
  );
};

export const isBlockedCrawler = (userAgent?: string) => {
  const normalized = normalizeUserAgent(userAgent);

  if (!normalized || isAllowedSearchCrawler(normalized)) {
    return false;
  }

  return BLOCKED_CRAWLER_PATTERNS.some((crawler) => normalized.includes(crawler));
};

export const getClientCrawlerPolicy = () => {
  if (typeof navigator === "undefined") {
    return { isBlocked: false, userAgent: "" };
  }

  const userAgent = navigator.userAgent || "";
  return {
    isBlocked: isBlockedCrawler(userAgent),
    userAgent,
  };
};
