"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { roundLocationForSearch } from "@/utils/distance";

export type NearbyCoords = { lat: number; lon: number };
export type NearbyLocationHint = "blocked" | "timeout" | "unavailable";

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

async function queryGeolocationState(): Promise<PermissionState | "unknown"> {
  try {
    const status = await navigator.permissions?.query({
      name: "geolocation" as PermissionName,
    });
    return status?.state ?? "unknown";
  } catch {
    return "unknown";
  }
}

function classifyGeoFailure(error: unknown): NearbyLocationHint {
  const code = typeof error === "object" && error && "code" in error
    ? Number((error as { code?: number }).code)
    : null;
  if (code === 3) return "timeout";
  if (code === 2) return "unavailable";
  if (error instanceof Error && error.message === "unavailable") return "unavailable";
  return "blocked";
}

export function useNearbyPlaceSearch() {
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
    async ({ silent = false }: { silent?: boolean } = {}): Promise<NearbyLocationHint | null> => {
      setIsRequesting(true);
      try {
        const permission = await queryGeolocationState();
        if (permission === "denied") {
          setNearbyActive(false);
          return silent ? null : "blocked";
        }

        const position = await readCurrentPosition();
        if (!applyPosition(position)) {
          setNearbyActive(false);
          return silent ? null : "unavailable";
        }
        return null;
      } catch (error) {
        setNearbyActive(false);
        return silent ? null : classifyGeoFailure(error);
      } finally {
        setIsRequesting(false);
      }
    },
    [applyPosition],
  );

  const exitNearby = useCallback(() => {
    setNearbyActive(false);
  }, []);

  useEffect(() => {
    if (didAutoRequest.current) return;
    didAutoRequest.current = true;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const autoRequest = async () => {
      const permission = await queryGeolocationState();
      if (permission === "denied") return;
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
