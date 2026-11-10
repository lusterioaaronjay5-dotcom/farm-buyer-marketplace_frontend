import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './LocationPicker.css';

// OpenStreetMap tiles. Libre para sa demo, walang API key.
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

const PH_CENTER = [121.774, 12.8797]; // [lng, lat]

function round7(n) {
  return Math.round(n * 1e7) / 1e7;
}

export default function LocationPicker({ value, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Gumawa ng mapa isang beses lang
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: PH_CENTER,
      zoom: 5.5,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.getCanvas().style.cursor = 'crosshair';

    map.on('click', (e) => {
      onChangeRef.current({
        lat: round7(e.lngLat.lat),
        lng: round7(e.lngLat.lng),
      });
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Ilipat ang marker kapag nagbago ang pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const lngLat = [value.lng, value.lat];

    if (markerRef.current) {
      markerRef.current.setLngLat(lngLat);
    } else {
      markerRef.current = new maplibregl.Marker({ color: '#2e7d4f' })
        .setLngLat(lngLat)
        .addTo(map);
    }

    map.easeTo({ center: lngLat, zoom: Math.max(map.getZoom(), 15) });
  }, [value]);

  return (
    <div className="lpk-wrap">
      <div ref={containerRef} className="lpk-map" />
      <p className="lpk-hint">
        I-click ang mapa para mag-pin ng eksaktong lugar ng delivery. Optional lang ito.
      </p>
    </div>
  );
}