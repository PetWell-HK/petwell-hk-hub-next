import { PetWellVerifiedBadge } from "@/components/PetWellVerifiedBadge";
import { FehdLicensedBadge } from "@/components/FehdLicensedBadge";
import { NotPetFriendlyBadge } from "@/components/NotPetFriendlyBadge";
import { isRestaurantFehdLicensed } from "@/utils/restaurantExternalMetadata";
import type { RestaurantExternalMetadata } from "@/types/restaurantExternalMetadata";
import type { MultiLangString } from "@/services/restaurantApi";

function hasListingAlert(
  listingAlert?: MultiLangString | string | null,
): boolean {
  if (!listingAlert) return false;
  if (typeof listingAlert === "string") return listingAlert.trim().length > 0;
  return Boolean(listingAlert.zh?.trim() || listingAlert.en?.trim());
}

interface RestaurantVerificationBadgeProps {
  verified?: boolean;
  fehdLicensed?: boolean;
  listingAlert?: MultiLangString | string | null;
  externalMetadata?: RestaurantExternalMetadata | null;
  variant?: "default" | "onDark";
  className?: string;
}

export function RestaurantVerificationBadge({
  verified,
  fehdLicensed,
  listingAlert,
  externalMetadata,
  variant = "default",
  className,
}: RestaurantVerificationBadgeProps) {
  if (hasListingAlert(listingAlert)) {
    return <NotPetFriendlyBadge variant={variant} className={className} />;
  }

  if (isRestaurantFehdLicensed({ fehdLicensed, externalMetadata })) {
    return <FehdLicensedBadge variant={variant} className={className} />;
  }

  if (verified) {
    return <PetWellVerifiedBadge variant={variant} className={className} />;
  }

  return null;
}
