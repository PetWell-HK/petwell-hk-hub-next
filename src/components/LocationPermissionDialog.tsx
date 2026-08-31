"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Lock, MapPinOff, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NearbyLocationHint } from "@/hooks/useNearbyPlaceSearch";

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function LocationPermissionDialog({
  hint,
  isRetrying = false,
  onRetry,
  onDismiss,
}: {
  hint: NearbyLocationHint | null;
  isRetrying?: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const ios = useMemo(() => isIosDevice(), []);

  const copy = ((): {
    icon: typeof Lock;
    title: string;
    description: string;
    steps: string[] | null;
  } | null => {
    switch (hint) {
      case "timeout":
        return {
          icon: Timer,
          title: t("placeListing.locationTimeoutTitle"),
          description: t("placeListing.locationTimeoutBody"),
          steps: null,
        };
      case "unavailable":
        return {
          icon: MapPinOff,
          title: t("placeListing.locationUnavailableTitle"),
          description: t("placeListing.locationUnavailable"),
          steps: null,
        };
      case "blocked":
        return {
          icon: Lock,
          title: t("placeListing.locationBlockedTitle"),
          description: ios
            ? t("placeListing.locationBlockedIos")
            : t("placeListing.locationBlockedBody"),
          steps: ios
            ? null
            : [
                t("placeListing.locationBlockedStep1"),
                t("placeListing.locationBlockedStep2"),
                t("placeListing.locationBlockedStep3"),
              ],
        };
      case null:
        return null;
      default: {
        const exhaustive: never = hint;
        return exhaustive;
      }
    }
  })();

  if (!copy) return null;
  const Icon = copy.icon;

  return (
    <Dialog open={Boolean(hint)} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="max-w-[22rem] gap-4 rounded-2xl p-5 sm:max-w-sm">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle className="text-base leading-snug">{copy.title}</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {copy.description}
          </DialogDescription>
        </DialogHeader>
        {copy.steps ? (
          <ol className="space-y-2.5 rounded-xl bg-muted/60 px-3 py-3">
            {copy.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5 text-[13px] leading-snug text-foreground">
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-primary shadow-sm">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        ) : null}
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button type="button" className="w-full" onClick={onRetry} disabled={isRetrying}>
            {t("placeListing.locationRetry")}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onDismiss}>
            {t("placeListing.locationDismiss")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LocationPermissionDialog;
