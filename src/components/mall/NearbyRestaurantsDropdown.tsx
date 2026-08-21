import AppLink from "@/components/AppLink";
import { ChevronDown, Loader2, MapPin, UtensilsCrossed } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNearbyRestaurants } from "@/hooks/useNearbyRestaurants";

interface Props {
  lat?: number | null;
  lon?: number | null;
  mallName: string;
  language?: string;
  radiusKm?: number;
}

export function NearbyRestaurantsDropdown({
  lat,
  lon,
  mallName,
  language = "zh",
  radiusKm = 1.5,
}: Props) {
  const enabled = lat != null && lon != null;
  const { data, isLoading } = useNearbyRestaurants(
    enabled ? lat! : undefined,
    enabled ? lon! : undefined,
    language,
    radiusKm,
  );

  if (!enabled) return null;

  const restaurants = data ?? [];
  const preview = restaurants.slice(0, 8);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="restaurant-action-btn w-full">
          <UtensilsCrossed className="h-4 w-4" />
          附近寵物友善餐廳
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>{mallName} · 1.5 km 內</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading && (
          <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            載入中…
          </div>
        )}

        {!isLoading && preview.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            附近暫時未有已收錄嘅餐廳
          </div>
        )}

        {preview.map(({ restaurant, distance }) => (
          <DropdownMenuItem key={restaurant.id} asChild>
            <AppLink
              href={`/restaurants/${restaurant.id}`}
              className="flex items-start gap-2 py-2"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {restaurant.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(distance * 1000).toFixed(0)} 米
                  {restaurant.district ? ` · ${restaurant.district}` : ""}
                </div>
              </div>
            </AppLink>
          </DropdownMenuItem>
        ))}

        {restaurants.length > preview.length && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <AppLink href="/restaurants" className="text-primary">
                查看全部 {restaurants.length} 間 →
              </AppLink>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
