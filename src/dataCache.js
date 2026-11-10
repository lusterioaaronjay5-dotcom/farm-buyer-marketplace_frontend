import api from './api';

const cache = new Map();
const inflight = new Map();

export function getCached(key) {
  return cache.get(key);
}

export function setCached(key, value) {
  cache.set(key, value);
}

export function invalidate(...keys) {
  keys.forEach((key) => {
    cache.delete(key);
    inflight.delete(key);
  });
}

export function clearCache() {
  cache.clear();
  inflight.clear();
}

// Kumukuha ng data. Kung may cache na, ibabalik agad.
// Kung may request na tumatakbo para sa parehong key, hihintayin ang dati at hindi gagawa ng bago.
export function fetchData(key, url, { force = false } = {}) {
  if (!force && cache.has(key)) {
    return Promise.resolve(cache.get(key));
  }
  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const request = api
    .get(url)
    .then((res) => {
      cache.set(key, res.data);
      return res.data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

export function prefetch(entries) {
  entries.forEach(([key, url]) => {
    fetchData(key, url).catch(() => {});
  });
}