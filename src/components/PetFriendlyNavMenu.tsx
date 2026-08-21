import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import {
  BedDouble,
  House,
  Scissors,
  ShoppingBag,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type DestinationId =
  | "restaurants"
  | "malls"
  | "clinics"
  | "homeVisits"
  | "salons"
  | "lodging";

type GroupId = "goOut" | "care" | "services";

interface Destination {
  id: DestinationId;
  to: string;
  icon: LucideIcon;
  tone: string;
  aliases?: readonly string[];
}

const DESTINATIONS: Record<DestinationId, Destination> = {
  restaurants: {
    id: "restaurants",
    to: "/restaurants",
    icon: UtensilsCrossed,
    tone: "bg-[hsl(14_90%_94%)] text-[hsl(18_82%_42%)]",
    aliases: ["/pet-friendly-restaurants"],
  },
  malls: {
    id: "malls",
    to: "/malls",
    icon: ShoppingBag,
    tone: "bg-[hsl(28_50%_93%)] text-[hsl(22_50%_38%)]",
  },
  clinics: {
    id: "clinics",
    to: "/clinics",
    icon: Stethoscope,
    tone: "bg-[hsl(199_80%_93%)] text-[hsl(199_65%_38%)]",
  },
  homeVisits: {
    id: "homeVisits",
    to: "/home-visits",
    icon: House,
    tone: "bg-[hsl(210_60%_94%)] text-[hsl(210_55%_40%)]",
  },
  salons: {
    id: "salons",
    to: "/salons",
    icon: Scissors,
    tone: "bg-[hsl(330_70%_94%)] text-[hsl(328_62%_42%)]",
  },
  lodging: {
    id: "lodging",
    to: "/lodging",
    icon: BedDouble,
    tone: "bg-[hsl(36_80%_92%)] text-[hsl(32_68%_38%)]",
  },
};

const GROUPS: { id: GroupId; items: DestinationId[] }[] = [
  { id: "goOut", items: ["restaurants", "malls"] },
  { id: "care", items: ["clinics", "homeVisits"] },
  { id: "services", items: ["salons", "lodging"] },
];

function isDestinationActive(pathname: string, destination: Destination) {
  const paths = [destination.to, ...(destination.aliases ?? [])];
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

const DestinationRow = forwardRef<
  HTMLAnchorElement,
  {
    destination: Destination;
    isActive: boolean;
    onNavigate?: () => void;
  }
>(function DestinationRow({ destination, isActive, onNavigate }, ref) {
  const { t } = useTranslation();
  const Icon = destination.icon;

  return (
    <AppLink
      ref={ref}
      href={destination.to}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition-colors",
        "hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground",
        "data-[highlighted]:bg-secondary data-[highlighted]:text-foreground",
        isActive && "bg-secondary text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          destination.tone,
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium leading-tight">
        {t(`nav.petFriendlyMenu.${destination.id}`)}
      </span>
    </AppLink>
  );
});
DestinationRow.displayName = "DestinationRow";

interface PetFriendlyNavMenuProps {
  variant: "dropdown" | "sheet";
  onNavigate?: () => void;
}

const PetFriendlyNavMenu = ({ variant, onNavigate }: PetFriendlyNavMenuProps) => {
  const { t } = useTranslation();
  const pathname = usePathname() || "/";

  return (
    <div className={cn(variant === "sheet" && "rounded-xl border border-border bg-muted/30 p-1.5")}>
      {variant === "sheet" ? (
        <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
          {t("nav.petFriendly")}
        </p>
      ) : null}

      {GROUPS.map((group, index) => {
        const groupLabel = (
          <p className="px-2.5 pb-1 pt-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
            {t(`nav.petFriendlyMenu.${group.id}`)}
          </p>
        );

        const items = group.items.map((id) => {
          const destination = DESTINATIONS[id];
          const isActive = isDestinationActive(pathname, destination);
          const row = (
            <DestinationRow
              destination={destination}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          );

          if (variant === "dropdown") {
            return (
              <DropdownMenuItem
                key={destination.id}
                asChild
                className="p-0 hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground"
              >
                {row}
              </DropdownMenuItem>
            );
          }

          return <div key={destination.id}>{row}</div>;
        });

        if (variant === "dropdown") {
          return (
            <div key={group.id}>
              {index > 0 ? <DropdownMenuSeparator className="my-1.5 bg-border" /> : null}
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
                {t(`nav.petFriendlyMenu.${group.id}`)}
              </DropdownMenuLabel>
              {items}
            </div>
          );
        }

        return (
          <div key={group.id} className={index > 0 ? "mt-1.5 border-t border-border pt-1.5" : undefined}>
            {groupLabel}
            {items}
          </div>
        );
      })}
    </div>
  );
};

export default PetFriendlyNavMenu;
