import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  deliverySeconds,
  fetchRoadRoute,
  positionAlongRoute,
  progress,
  riderPosition,
} from './routeProgress';
import './DeliveryMap.css';

const STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

// Kulay at label ng pin ayon sa status ng order
const STATUS_META = {
  pending: { label: 'Pending', color: '#b7791f' },
  confirmed: { label: 'Confirmed', color: '#2b6cb0' },
  preparing: { label: 'Preparing', color: '#c05621' },
  out_for_delivery: { label: 'Out for Delivery', color: '#6b46c1' },
  completed: { label: 'Completed', color: '#2e7d4f' },
  delivered: { label: 'Completed', color: '#2e7d4f' },
  cancelled: { label: 'Cancelled', color: '#c53030' },
};

const FALLBACK = { label: 'Pending', color: '#b7791f' };

// Gumagawa ng popup gamit ang DOM para hindi tumakbo ang HTML ng address
function buildPopup(label, meta) {
  const wrap = document.createElement('div');
  wrap.style.fontSize = '13px';
  wrap.style.lineHeight = '1.4';

  const status = document.createElement('strong');
  status.textContent = meta.label;
  status.style.color = meta.color;
  wrap.appendChild(status);

  if (label) {
    const text = document.createElement('div');
    text.textContent = label;
    wrap.appendChild(text);
  }
  return wrap;
}

// Link sa Google Maps. Kung may originAddress, mula doon ang ruta papunta sa pin.
function buildDirectionsUrl(lat, lng, originAddress) {
  const params = new URLSearchParams({
    api: '1',
    destination: `${lat},${lng}`,
    travelmode: 'driving',
  });
  if (originAddress) params.set('origin', originAddress);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

// Iguhit ang ruta sa mapa. Kung hindi pa handa ang style, hihintayin muna.
function drawRouteLine(map, coords) {
  const data = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
  };

  const apply = () => {
    const existing = map.getSource('route');
    if (existing) {
      existing.setData(data);
      return;
    }
    map.addSource('route', { type: 'geojson', data });
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#6b46c1',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });
  };

  if (map.isStyleLoaded()) apply();
  else map.once('load', apply);
}

export default function DeliveryMap({ lat, lng, label, status, originAddress, route }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const popupRef = useRef(null);
  const riderRef = useRef(null);
  const [roadCoords, setRoadCoords] = useState(null);
  const [arrived, setArrived] = useState(false);
  const meta = STATUS_META[status] || FALLBACK;

  // Datos ng ruta ng rider. Galing sa database, kaya Number() muna.
  const originLat = route?.originLat != null ? Number(route.originLat) : null;
  const originLng = route?.originLng != null ? Number(route.originLng) : null;
  const dispatchedAt = route?.dispatchedAt != null ? Number(route.dispatchedAt) : null;
  const etaSeconds = route?.etaSeconds != null ? Number(route.etaSeconds) : null;
  const hasRoute =
    status === 'out_for_delivery' &&
    originLat != null &&
    originLng != null &&
    dispatchedAt != null;

  // Gumawa ng mapa kapag nagbago ang coordinates
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [lng, lat],
      zoom: 15,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    const pin = document.createElement('div');
    pin.style.width = '22px';
    pin.style.height = '22px';
    pin.style.borderRadius = '50%';
    pin.style.border = '3px solid #fff';
    pin.style.boxShadow = '0 2px 6px rgba(0,0,0,0.35)';
    pin.style.cursor = 'pointer';
    pin.style.background = meta.color;

    const popup = new maplibregl.Popup({ offset: 16 }).setDOMContent(
      buildPopup(label, meta)
    );
    const marker = new maplibregl.Marker({ element: pin })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;
    popupRef.current = popup;

    return () => {
      markerRef.current = null;
      popupRef.current = null;
      riderRef.current = null;
      mapRef.current = null;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  // Palitan ang kulay at popup kapag nagbago ang status
  useEffect(() => {
    const marker = markerRef.current;
    if (marker) marker.getElement().style.background = meta.color;

    const popup = popupRef.current;
    if (popup) popup.setDOMContent(buildPopup(label, meta));
  }, [meta, label]);

  // Kunin ang ruta sa kalsada. Kapag pumalya, tuwid na linya ang gagamitin.
  useEffect(() => {
    if (!hasRoute) {
      setRoadCoords(null);
      return undefined;
    }

    let cancelled = false;
    fetchRoadRoute(originLng, originLat, lng, lat)
      .then((coords) => {
        if (!cancelled) setRoadCoords(coords);
      })
      .catch(() => {
        if (!cancelled) setRoadCoords(null);
      });

    return () => {
      cancelled = true;
    };
  }, [hasRoute, originLat, originLng, lat, lng]);

  // Iguhit ang linya ng ruta. Kung walang road route, tuwid na linya ang gagamitin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasRoute) return;

    const coords = roadCoords || [
      [originLng, originLat],
      [lng, lat],
    ];
    drawRouteLine(map, coords);
  }, [hasRoute, roadCoords, originLat, originLng, lat, lng]);

  // Gumagalaw na rider sa mapa habang out for delivery
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasRoute) return undefined;

    const el = document.createElement('div');
    el.textContent = '🚚';
    el.style.fontSize = '20px';
    el.style.lineHeight = '24px';
    el.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))';

    const rider = new maplibregl.Marker({ element: el })
      .setLngLat([originLng, originLat])
      .addTo(map);
    riderRef.current = rider;

    const r = { originLat, originLng, dispatchedAt, etaSeconds };
    let timer = null;

    function update() {
      const t = progress(r);
      const pos =
        (roadCoords && positionAlongRoute(roadCoords, t)) ||
        riderPosition(r, { lat, lng });

      rider.setLngLat([pos.lng, pos.lat]);
      setArrived(t >= 1);

      if (t >= 1 && timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    update();
    timer = setInterval(update, 1000);

    return () => {
      if (timer) clearInterval(timer);
      rider.remove();
      if (riderRef.current === rider) riderRef.current = null;
    };
  }, [hasRoute, originLat, originLng, dispatchedAt, etaSeconds, lat, lng, roadCoords]);

  // Linisin ang "nasa buyer na" kapag hindi na out for delivery
  useEffect(() => {
    if (!hasRoute) setArrived(false);
  }, [hasRoute]);

  const coordsText = `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  const directionsUrl = buildDirectionsUrl(lat, lng, originAddress);

  const arrivalText =
    hasRoute && dispatchedAt != null
      ? new Date((dispatchedAt + deliverySeconds({ etaSeconds })) * 1000).toLocaleTimeString(
          'en-PH',
          { hour: '2-digit', minute: '2-digit' }
        )
      : null;

  return (
    <div className="dmap-wrap">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          color: meta.color,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: meta.color,
            display: 'inline-block',
          }}
        />
        {meta.label}
      </div>

      {hasRoute && (
        <div style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
          {arrived ? 'Nasa buyer na ang order' : `Tinatayang dating: ${arrivalText}`}
        </div>
      )}

      <div ref={containerRef} className="dmap-map" />

      <div className="dmap-foot">
        <span className="dmap-coords">{coordsText}</span>
        <a
          className="dmap-link"
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buksan sa Google Maps ›
        </a>
      </div>
    </div>
  );
}