import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/config/adsense";

interface AdSenseUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const AdSenseUnit = ({ slot, format = "auto", className = "" }: AdSenseUnitProps) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current || !slot) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // Ad blockers may throw
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={`my-8 flex justify-center overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseUnit;
