// Kung nasaan na ang rider, batay sa oras ng pag-alis. Pareho ito sa buyer at farmer.
export const DELIVERY_SECONDS = 120;

export function riderPosition(route, dest, nowMs = Date.now()) {
  const elapsed = nowMs / 1000 - Number(route.dispatchedAt);
  const t = Math.min(Math.max(elapsed / DELIVERY_SECONDS, 0), 1);

  const lat = route.originLat + (dest.lat - route.originLat) * t;
  const lng = route.originLng + (dest.lng - route.originLng) * t;

  return { lat, lng, done: t >= 1 };
}