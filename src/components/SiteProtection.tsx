import { useEffect } from "react";
import { getClientCrawlerPolicy } from "@/utils/crawlerPolicy";

/**
 * Lightweight client-side notice for casual scrapers.
 *
 * Do not block right-click or text selection here. That hurts UX, accessibility,
 * translation tools, and normal sharing without stopping real scraping.
 */
const SiteProtection = () => {
  useEffect(() => {
    const css = "color:#FF6B35;font-size:14px;font-weight:bold;";
    // eslint-disable-next-line no-console
    console.log(
      "%cPetWell HK - automated scraping, republication, or bulk extraction is prohibited.",
      css
    );

    const policy = getClientCrawlerPolicy();
    if (policy.isBlocked) {
      // eslint-disable-next-line no-console
      console.warn("This crawler is not permitted to access PetWell public data APIs.");
    }
  }, []);

  return null;
};

export default SiteProtection;
