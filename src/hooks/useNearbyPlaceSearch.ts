"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { roundLocationForSearch } from "@/utils/distance";

export type NearbyCoords = { lat: number; lon: number };

function readCurrentPosition(): Promise<NearbyCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 60_000,
      },
    );
  });
}

export function useNearbyPlaceSearch() {
  const { t } = useTranslation();
  const [coords, setCoords] = useState<NearbyCoords | null>(null);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const didAutoRequest = useRef(false);

  const applyPosition = useCallback((position: NearbyCoords) => {
    const rounded = roundLocationForSearch(position);
    if (!rounded) return false;
    setCoords(rounded);
    setNearbyActive(true);
    return true;
  }, []);

  const requestNearby = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      setIsRequesting(true);
      try {
        const position = await readCurrentPosition();
        const applied = applyPosition(position);
        if (!applied) {
          setNearbyActive(false);
          if (!silent) {
            toast({
              title: t("placeListing.locationDenied"),
            });
          }
          return false;
        }
        return true;
      } catch {
        setNearbyActive(false);
        if (!silent) {
          toast({
            title: t("placeListing.locationDenied"),
          });
        }
        return false;
      } finally {
        setIsRequesting(false);
      }
    },
    [applyPosition, t],
  );

  const exitNearby = useCallback(() => {
    setNearbyActive(false);
  }, []);

  useEffect(() => {
    if (didAutoRequest.current) return;
    didAutoRequest.current = true;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const autoRequest = async () => {
      try {
        const permission = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });
        if (permission?.state === "denied") return;
      } catch {
        // Safari / older browsers may not support Permissions for geolocation.
      }
      await requestNearby({ silent: true });
    };

    void autoRequest();
  }, [requestNearby]);

  return {
    nearbyActive: nearbyActive && Boolean(coords),
    coords,
    isRequesting,
    requestNearby: () => requestNearby({ silent: false }),
    exitNearby,
  };
}
