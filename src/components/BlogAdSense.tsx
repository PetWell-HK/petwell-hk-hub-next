import { useAdSense } from "@/hooks/useAdSense";
import { ADSENSE_SLOTS } from "@/config/adsense";
import AdSenseUnit from "@/components/AdSenseUnit";

type BlogAdPlacement = "top" | "bottom" | "both";

interface BlogAdSenseProps {
  placement?: BlogAdPlacement;
}

/**
 * Loads AdSense on blog pages only. Renders manual ad units when slot IDs are configured.
 */
const BlogAdSense = ({ placement = "both" }: BlogAdSenseProps) => {
  useAdSense();

  const showTop = placement === "top" || placement === "both";
  const showBottom = placement === "bottom" || placement === "both";

  return (
    <>
      {showTop && ADSENSE_SLOTS.articleTop && (
        <AdSenseUnit slot={ADSENSE_SLOTS.articleTop} />
      )}
      {showBottom && ADSENSE_SLOTS.articleBottom && (
        <AdSenseUnit slot={ADSENSE_SLOTS.articleBottom} />
      )}
    </>
  );
};

export default BlogAdSense;
