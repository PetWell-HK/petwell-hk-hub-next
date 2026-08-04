import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const logo = "/assets/logo.png";

interface PetWellVerifiedBadgeProps {
  variant?: "default" | "onDark";
  className?: string;
}

export function PetWellVerifiedBadge({
  variant = "default",
  className,
}: PetWellVerifiedBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold leading-none",
        variant === "onDark"
          ? "border-white/25 bg-white/95 px-2.5 py-1 text-[11px] shadow-sm backdrop-blur-sm"
          : "border-primary/25 bg-[#FFF4E6] px-2 py-1 text-[11px] text-[#FF902A]",
        className,
      )}
    >
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="h-3.5 w-auto shrink-0"
      />
      <span className={variant === "onDark" ? "text-primary" : undefined}>
        {t("restaurant.petWellVerified")}
      </span>
      <CheckCircle
        className={cn(
          "h-3 w-3 shrink-0",
          variant === "onDark" ? "text-primary" : "text-[#FF902A]",
        )}
        aria-hidden="true"
      />
    </span>
  );
}
