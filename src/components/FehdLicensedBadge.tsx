import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface FehdLicensedBadgeProps {
  variant?: "default" | "onDark";
  className?: string;
}

export function FehdLicensedBadge({
  variant = "default",
  className,
}: FehdLicensedBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold leading-none",
        variant === "onDark"
          ? "border-white/25 bg-white/95 px-2.5 py-1 text-[11px] shadow-sm backdrop-blur-sm"
          : "border-[#2E7D32]/25 bg-[#E8F5E9] px-2 py-1 text-[11px] text-[#2E7D32]",
        className,
      )}
    >
      <span className={variant === "onDark" ? "text-[#2E7D32]" : undefined}>
        {t("restaurant.fehdLicensed")}
      </span>
      <CheckCircle
        className="h-3 w-3 shrink-0 text-[#2E7D32]"
        aria-hidden="true"
      />
    </span>
  );
}
