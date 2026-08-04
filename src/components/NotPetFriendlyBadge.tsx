import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface NotPetFriendlyBadgeProps {
  variant?: "default" | "onDark";
  className?: string;
}

export function NotPetFriendlyBadge({
  variant = "default",
  className,
}: NotPetFriendlyBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold leading-none",
        variant === "onDark"
          ? "border-red-200/80 bg-red-600 px-2.5 py-1 text-[11px] text-white shadow-sm"
          : "border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700",
        className,
      )}
    >
      <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{t("restaurant.notPetFriendly")}</span>
    </span>
  );
}
