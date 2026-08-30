"use client";

import { CalendarDays, Megaphone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import AppLink from "@/components/AppLink";
import { eventsSiteUrl } from "@/lib/sites";
import { cn } from "@/lib/utils";

type PartnershipItem = {
  id: "merchant" | "events";
  tone: string;
  icon: typeof Megaphone;
} & ({ to: string; href?: never } | { href: string; to?: never });

function partnershipItems(language: string): PartnershipItem[] {
  return [
    {
      id: "merchant",
      to: "/other-services",
      icon: Megaphone,
      tone: "bg-[hsl(24_90%_94%)] text-[hsl(18_82%_42%)]",
    },
    {
      id: "events",
      href: eventsSiteUrl(language),
      icon: CalendarDays,
      tone: "bg-[hsl(199_80%_93%)] text-[hsl(199_65%_38%)]",
    },
  ];
}

function PartnershipRow({
  item,
  isActive,
  onNavigate,
}: {
  item: PartnershipItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const className = cn(
    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition-colors",
    "hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground",
    "data-[highlighted]:bg-secondary data-[highlighted]:text-foreground",
    isActive && "bg-secondary text-foreground",
  );
  const body = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          item.tone,
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-tight">
          {t(`nav.partnershipMenu.${item.id}`)}
        </span>
        <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
          {t(`nav.partnershipMenu.${item.id}Hint`)}
        </span>
      </span>
    </>
  );

  if (item.href) {
    return (
      <a href={item.href} className={className} onClick={onNavigate}>
        {body}
      </a>
    );
  }

  return (
    <AppLink
      href={item.to}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      {body}
    </AppLink>
  );
}

interface PartnershipNavMenuProps {
  variant: "dropdown" | "sheet";
  onNavigate?: () => void;
}

const PartnershipNavMenu = ({ variant, onNavigate }: PartnershipNavMenuProps) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname() || "/";
  const items = partnershipItems(i18n.language);

  return (
    <div className={cn(variant === "sheet" && "rounded-xl border border-border bg-muted/30 p-1.5")}>
      {variant === "sheet" ? (
        <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
          {t("nav.otherServices")}
        </p>
      ) : null}

      {items.map((item) => {
        const isActive = item.to
          ? pathname === item.to || pathname.startsWith(`${item.to}/`)
          : false;
        const row = (
          <PartnershipRow item={item} isActive={isActive} onNavigate={onNavigate} />
        );

        if (variant === "dropdown") {
          return (
            <DropdownMenuItem
              key={item.id}
              asChild
              className="p-0 hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground"
            >
              {row}
            </DropdownMenuItem>
          );
        }

        return <div key={item.id}>{row}</div>;
      })}
    </div>
  );
};

export default PartnershipNavMenu;
