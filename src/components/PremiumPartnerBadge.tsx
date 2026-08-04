import { Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface PremiumPartnerBadgeProps {
  variant?: "default" | "onDark";
  className?: string;
}

/** Partner Hub Premium listing badge — shown to end users on web. */
export function PremiumPartnerBadge({
  variant = "default",
  className,
}: PremiumPartnerBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold leading-none",
        variant === "onDark"
          ? "border-white/25 bg-white/95 px-2.5 py-1 text-[11px] shadow-sm backdrop-blur-sm"
          : "border-[#C9A227]/30 bg-[#FFF8E1] px-2 py-1 text-[11px] text-[#B45309]",
        className,
      )}
    >
      <Award
        className={cn(
          "h-3 w-3 shrink-0",
          variant === "onDark" ? "text-[#B45309]" : "text-[#B45309]",
        )}
        aria-hidden="true"
      />
      <span className={variant === "onDark" ? "text-[#B45309]" : undefined}>
        {t("restaurant.premiumPartner")}
      </span>
    </span>
  );
}
