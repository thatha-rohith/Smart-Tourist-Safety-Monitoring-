import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const zoneColors = { Restricted: '#dc2626', Risky: '#f59e0b', Safe: '#10b981' };

const LiveMap = ({ center = [28.6139, 77.209], zoom = 12, markers = [], zones = [], height = '400px' }) => {
  return (
    <div className="map-container" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map((zone) => (
          <Circle
            key={zone._id}
            center={[zone.location.latitude, zone.location.longitude]}
            radius={zone.radius}
            pathOptions={{ color: zoneColors[zone.zoneType] || '#3b82f6', fillOpacity: 0.15 }}
          >
            <Popup>
              <strong>{zone.name}</strong><br />
              Type: {zone.zoneType}<br />
              Radius: {zone.radius}m
            </Popup>
          </Circle>
        ))}
        {markers.map((m) => (
          <Marker key={m.id || m._id} position={[m.lat, m.lng]}>
            <Popup>
              <strong>{m.name}</strong><br />
              {m.info && <span>{m.info}</span>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
