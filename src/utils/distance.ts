export type GeoPoint = {
  lat?: number | null;
  lon?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

function parseCoordinate(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toLatLon(coords: GeoPoint | null | undefined): { lat: number; lon: number } | null {
  if (!coords) return null;
  const lat = parseCoordinate(coords.lat ?? coords.latitude);
  const lon = parseCoordinate(coords.lon ?? coords.longitude);
  if (lat === null || lon === null) return null;
  return { lat, lon };
}

/** Round GPS so nearby query keys stay stable (~3 decimals ≈ 110m). */
export function roundLocationForSearch(
  location: { lat: number; lon: number } | null | undefined,
  decimals = 3,
): { lat: number; lon: number } | undefined {
  if (!location || location.lat == null || location.lon == null) return undefined;
  const factor = 10 ** decimals;
  return {
    lat: Math.round(Number(location.lat) * factor) / factor,
    lon: Math.round(Number(location.lon) * factor) / factor,
  };
}

export function getDistanceMeters(
  from: GeoPoint | null | undefined,
  to: GeoPoint | null | undefined,
): number | null {
  const origin = toLatLon(from);
  const target = toLatLon(to);
  if (!origin || !target) return null;

  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRad(target.lat - origin.lat);
  const dLon = toRad(target.lon - origin.lon);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(target.lat);
  const haversine =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

export function getNearbyDistanceLabel(
  nearbyActive: boolean,
  origin: GeoPoint | null | undefined,
  place: GeoPoint | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  if (!nearbyActive) return null;
  return formatPlaceDistance(getDistanceMeters(origin, place), t);
}

export function formatPlaceDistance(
  meters: number | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  if (!Number.isFinite(meters) || meters == null || meters < 0) return null;
  if (meters < 1000) {
    return t("placeListing.distanceM", { m: Math.round(meters) });
  }
  return t("placeListing.distanceKm", { km: (meters / 1000).toFixed(1) });
}

export function compareByDistance(
  origin: GeoPoint | null | undefined,
  a: GeoPoint | null | undefined,
  b: GeoPoint | null | undefined,
): number {
  const distanceA = getDistanceMeters(origin, a);
  const distanceB = getDistanceMeters(origin, b);
  if (distanceA == null && distanceB == null) return 0;
  if (distanceA == null) return 1;
  if (distanceB == null) return -1;
  return distanceA - distanceB;
}

export function sortByDistance<T>(
  items: T[],
  origin: GeoPoint | null | undefined,
  getLocation: (item: T) => GeoPoint | null | undefined,
): T[] {
  if (!origin) return items;
  return [...items].sort((left, right) =>
    compareByDistance(origin, getLocation(left), getLocation(right)),
  );
}
