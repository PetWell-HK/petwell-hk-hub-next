import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, Smartphone, X } from "lucide-react";

const DISMISS_KEY = "petwell:appUpsell:dismissed:v1";

const AppUpsellBanner = () => {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 border-t bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-5">
          {/* Phone mockup */}
          <div className="hidden sm:flex relative shrink-0 w-16 h-20 md:w-20 md:h-24 items-center justify-center">
            <div className="absolute inset-0 bg-white/15 rounded-[14px] border-2 border-white/50" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-white/40 rounded-full" />
            <Bell className="relative w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm md:text-base leading-tight">
              想第一時間知道減價？
            </p>
            <p className="text-xs md:text-sm text-white/90 leading-snug mt-0.5 hidden sm:block">
              下載 PetWell App，開啟價格提醒，追蹤清單同步手機，唔使再手動格價。
            </p>
            <p className="text-[11px] text-white/90 leading-snug mt-0.5 sm:hidden">
              開啟價格提醒，追蹤清單同步手機。
            </p>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              className="bg-white text-primary hover:bg-white/90 h-8 md:h-9 px-2.5 md:px-4 text-xs md:text-sm gap-1"
            >
              <Link to="/download">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">下載 App</span>
                <span className="xs:hidden">下載</span>
              </Link>
            </Button>
            <button
              onClick={dismiss}
              className="text-white/90 hover:text-white text-[11px] md:text-xs underline whitespace-nowrap hidden md:inline"
            >
              繼續喺網頁使用
            </button>
            <button
              onClick={dismiss}
              aria-label="關閉"
              className="md:hidden p-1 -mr-1 text-white/90 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppUpsellBanner;
