// Oras ng biyahe kapag walang nakalagay na ETA. Pareho ito sa buyer at farmer.
export const DELIVERY_SECONDS = 120;

// Gaano katagal ang biyahe, sa segundo. Galing sa napiling oras ng farmer kung meron.
export function deliverySeconds(route) {
  const s = Number(route?.etaSeconds);
  return Number.isFinite(s) && s > 0 ? s : DELIVERY_SECONDS;
}

// Ilang bahagi na ng biyahe ang tapos, mula 0 hanggang 1.
export function progress(route, nowMs = Date.now()) {
  const elapsed = nowMs / 1000 - Number(route.dispatchedAt);
  return Math.min(Math.max(elapsed / deliverySeconds(route), 0), 1);
}

// Kung nasaan na ang rider sa tuwid na linya mula farm papunta sa buyer.
export function riderPosition(route, dest, nowMs = Date.now()) {
  const t = progress(route, nowMs);

  const lat = route.originLat + (dest.lat - route.originLat) * t;
  const lng = route.originLng + (dest.lng - route.originLng) * t;

  return { lat, lng, done: t >= 1 };
}

// Kung nasaan ang rider sa kahabaan ng ruta sa kalsada. coords ay [[lng, lat], ...]
export function positionAlongRoute(coords, t) {
  if (!coords || coords.length < 2) return null;

  const segs = [];
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const d = Math.hypot(coords[i][0] - coords[i - 1][0], coords[i][1] - coords[i - 1][1]);
    segs.push(d);
    total += d;
  }
  if (total === 0) return { lng: coords[0][0], lat: coords[0][1] };

  let target = total * t;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const f = segs[i] === 0 ? 0 : Math.min(target / segs[i], 1);
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      return { lng: x1 + (x2 - x1) * f, lat: y1 + (y2 - y1) * f };
    }
    target -= segs[i];
  }
  return null;
}

// Kukunin ang ruta sa kalsada mula sa OSRM. Ibinabalik ang [[lng, lat], ...]
export async function fetchRoadRoute(originLng, originLat, destLng, destLat) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${originLng},${originLat};${destLng},${destLat}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing failed');

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error('No route found');

  return route.geometry.coordinates;
}