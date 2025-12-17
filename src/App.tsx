import { useEffect, useRef, useState, useCallback } from 'react';
import { Geoman } from '@geoman-io/maplibre-geoman-free';
import '@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapGL } from '@vis.gl/react-maplibre';
import type { Map } from 'maplibre-gl';

const mapStyle = {
  version: 8 as const,
  sources: {
    'osm-tiles': {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster' as const,
      source: 'osm-tiles',
    },
  ],
};

function useGeoman(
  map: Map | null,
  id: string,
  enabled: boolean,
  removeSourcesRef: React.RefObject<boolean>
) {
  const geomanRef = useRef<Geoman | null>(null);

  useEffect(() => {
    if (!map || !enabled) return;

    console.log(`[${id}] constructing geoman`);
    geomanRef.current = new Geoman(map, {});

    return () => {
      const removeSources = removeSourcesRef.current;
      console.log(`[${id}] destroying geoman (removeSources: ${removeSources})`);
      geomanRef.current?.destroy({ removeSources });
      geomanRef.current = null;
    };
  }, [map, id, enabled, removeSourcesRef]);

  return geomanRef.current;
}

function MapInstance({ id, onRemove }: { id: string; onRemove: () => void }) {
  const mapRef = useRef<{ getMap: () => Map } | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [geomanEnabled, setGeomanEnabled] = useState(true);
  const removeSourcesRef = useRef(true);

  useGeoman(map, id, geomanEnabled, removeSourcesRef);

  const toggleGeoman = useCallback(() => {
    setGeomanEnabled((prev) => !prev);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleGeoman}
            style={{
              padding: '8px 16px',
              background: geomanEnabled ? '#44aa44' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Geoman: {geomanEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={onRemove}
            style={{
              padding: '8px 16px',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'white',
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            defaultChecked={true}
            onChange={(e) => { removeSourcesRef.current = e.target.checked; }}
          />
          Remove sources on destroy
        </label>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
        }}
      >
        {id}
      </div>
      <MapGL
        ref={mapRef}
        mapStyle={mapStyle}
        initialViewState={{ longitude: Math.random() * 20 - 10, latitude: 51, zoom: 5 }}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setMap(mapRef.current?.getMap() ?? null)}
      />
    </div>
  );
}

export default function App() {
  const [maps, setMaps] = useState<string[]>(['map-1', 'map-2']);
  const counterRef = useRef(3);

  const addMap = () => {
    setMaps((prev) => [...prev, `map-${counterRef.current++}`]);
  };

  const removeMap = (id: string) => {
    setMaps((prev) => prev.filter((m) => m !== id));
  };

  const removeAllMaps = () => {
    setMaps([]);
  };

  const resetMaps = () => {
    setMaps(['map-1', 'map-2']);
    counterRef.current = 3;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: 10, background: '#333', display: 'flex', gap: 10 }}>
        <button onClick={addMap} style={{ padding: '8px 16px' }}>
          Add Map
        </button>
        <button onClick={removeAllMaps} style={{ padding: '8px 16px' }}>
          Remove All
        </button>
        <button onClick={resetMaps} style={{ padding: '8px 16px' }}>
          Reset
        </button>
        <span style={{ color: 'white', alignSelf: 'center' }}>
          Maps: {maps.length}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: maps.length === 1 ? '1fr' : 'repeat(2, 1fr)',
          gap: 4,
          padding: 4,
          background: '#222',
        }}
      >
        {maps.map((id) => (
          <MapInstance key={id} id={id} onRemove={() => removeMap(id)} />
        ))}
      </div>
    </div>
  );
}
