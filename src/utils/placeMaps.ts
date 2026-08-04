export function getGoogleMapsUrl(
  address: string,
  location?: { lat: number; lon: number },
) {
  if (location?.lat && location?.lon) {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getGoogleMapsEmbedUrl(
  address: string,
  location?: { lat: number; lon: number },
) {
  const query =
    location?.lat && location?.lon
      ? `${location.lat},${location.lon}`
      : encodeURIComponent(address);
  return `https://www.google.com/maps?q=${query}&z=16&output=embed`;
}
