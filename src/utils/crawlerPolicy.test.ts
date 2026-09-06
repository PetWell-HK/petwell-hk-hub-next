import { describe, expect, it } from "vitest";
import { isAllowedSearchCrawler, isBlockedCrawler } from "./crawlerPolicy";

describe("crawlerPolicy", () => {
  it("allows Google, Bing, and AI search crawlers", () => {
    expect(isAllowedSearchCrawler("Googlebot/2.1")).toBe(true);
    expect(isAllowedSearchCrawler("OAI-SearchBot/1.3")).toBe(true);
    expect(isAllowedSearchCrawler("ChatGPT-User")).toBe(true);
    expect(isAllowedSearchCrawler("PerplexityBot/1.0")).toBe(true);
    expect(isAllowedSearchCrawler("Perplexity-User")).toBe(true);
    expect(isAllowedSearchCrawler("Claude-SearchBot/1.0")).toBe(true);
    expect(isAllowedSearchCrawler("Claude-User")).toBe(true);
    expect(isBlockedCrawler("OAI-SearchBot/1.3")).toBe(false);
    expect(isBlockedCrawler("PerplexityBot/1.0")).toBe(false);
  });

  it("blocks training scrapers without blocking search bots", () => {
    expect(isBlockedCrawler("GPTBot/1.3")).toBe(true);
    expect(isBlockedCrawler("ClaudeBot")).toBe(true);
    expect(isBlockedCrawler("Google-Extended")).toBe(true);
    expect(isBlockedCrawler("CCBot/2.0")).toBe(true);
    expect(isAllowedSearchCrawler("GPTBot/1.3")).toBe(false);
  });
});
