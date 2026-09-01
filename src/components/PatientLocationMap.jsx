import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const PatientLocationMap = ({ location = { lat: 10.8505, lng: 76.2711 }, patientName = 'Patient' }) => {
  const [mapInstance, setMapInstance] = React.useState(null);

  const handleRecenter = () => {
    if (mapInstance && location?.lat && location?.lng) {
      mapInstance.flyTo([location.lat, location.lng], 16, { duration: 1.2 });
    }
  };

  return (
    <div
      className="glass-card map-full-v2"
      style={{
        padding: '1.6rem',
        borderRadius: '24px',
        background: 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
        border: '1px solid var(--glass-border, rgba(0, 230, 230, 0.14))',
        boxShadow: 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FaMapMarkerAlt style={{ color: '#00e6e6', fontSize: '1.3rem' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Live GPS Geofence & Location
            </h3>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)} • Precision: High
            </p>
          </div>
        </div>

        <button
          onClick={handleRecenter}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            background: 'rgba(0, 230, 230, 0.12)',
            color: '#00e6e6',
            border: '1px solid rgba(0, 230, 230, 0.25)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            gap: '0.4rem'
          }}
        >
          <FaLocationArrow /> Center on {patientName}
        </button>
      </div>

      {/* Map Element */}
      <div
        style={{
          width: '100%',
          height: '280px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 230, 230, 0.12)'
        }}
      >
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
          ref={setMapInstance}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          {/* Safe Geofence Zone Circle */}
          <Circle
            center={[location.lat, location.lng]}
            radius={250}
            pathOptions={{
              color: '#00e6e6',
              fillColor: '#00e6e6',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 6'
            }}
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div style={{ color: '#000', fontSize: '0.85rem', lineHeight: 1.4 }}>
                <strong>🧓 {patientName}</strong>
                <br />
                Status: Inside Safe Zone
                <br />
                GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default PatientLocationMap;
