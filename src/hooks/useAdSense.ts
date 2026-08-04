import { useEffect } from "react";
import { ADSENSE_CLIENT } from "@/config/adsense";

const ADSENSE_SCRIPT_ID = "google-adsense-script";

let scriptLoadPromise: Promise<void> | null = null;

export function loadAdSenseScript(client = ADSENSE_CLIENT): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (document.getElementById(ADSENSE_SCRIPT_ID)) {
    return Promise.resolve();
  }

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.id = ADSENSE_SCRIPT_ID;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => {
        scriptLoadPromise = null;
        reject(new Error("Failed to load Google AdSense script"));
      };
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

/** Load the AdSense script. Use only on blog pages. */
export function useAdSense(): void {
  useEffect(() => {
    loadAdSenseScript().catch(() => {
      // Silently ignore — common when blocked by ad blockers
    });
  }, []);
}
