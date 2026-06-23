import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Shield, RefreshCw, Navigation } from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import useLiveLocation from '../../hooks/useLiveLocation';
import LiveMap from '../../components/map/LiveMap';
import { Badge, Loading, formatDate, getScoreClass } from '../../components/common/UI';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TouristHome = () => {
  const { addToast } = useToast();
  const { refreshTouristProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const { location, tracking, setTracking, error, lastSynced, syncing, pushCurrentPosition } = useLiveLocation(false, 20000);

  const loadProfile = async () => {
    try {
      const { data } = await API.get('/tourists/me');
      setProfile(data);
      if (data.currentLocation) {
        // seed map with server location
      }
    } catch {
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    if (location) {
      setProfile((prev) => prev ? { ...prev, currentLocation: location, safetyStatus: prev.safetyStatus } : prev);
      refreshTouristProfile?.();
    }
  }, [location]);

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      if (tracking === false) pushCurrentPosition();
      await API.post('/tourists/me/sos', { description: 'Emergency SOS - Immediate assistance required' });
      addToast('SOS alert sent! Police have been notified.', 'success');
      setSosOpen(false);
      loadProfile();
    } catch (err) {
      addToast(err.response?.data?.message || 'SOS failed', 'error');
    } finally {
      setSosLoading(false);
    }
  };

  if (loading) return <Loading text="Loading your safety dashboard..." />;

  const mapCenter = location || profile?.currentLocation;
  const markers = mapCenter ? [{
    id: profile?._id,
    lat: mapCenter.latitude,
    lng: mapCenter.longitude,
    name: profile?.user?.name,
    info: mapCenter.address,
  }] : [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Hello, {profile?.user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your live location helps police keep you safe during your visit.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="stat-card-pro">
          <div className={`score-badge ${getScoreClass(profile?.safetyStatus)}`}>{profile?.safetyScore}</div>
          <div className="stat-content">
            <div className="stat-value" style={{ fontSize: 16 }}>Safety Score</div>
            <Badge type="safety" value={profile?.safetyStatus} />
          </div>
        </div>
        <div className="stat-card-pro">
          <div className="stat-icon blue"><Shield size={22} /></div>
          <div className="stat-content">
            <div className="stat-value" style={{ fontSize: 16 }}>{profile?.touristId}</div>
            <div className="stat-label">Your Tourist ID</div>
          </div>
        </div>
      </div>

      <div className="tracking-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={18} /> Live Location Tracking
          </h3>
          {tracking && <span className="live-badge">Live</span>}
        </div>

        <div className={`tracking-status ${tracking ? 'active' : 'inactive'}`}>
          {tracking && <span className="tracking-pulse" />}
          {tracking ? 'Location sharing is ON — officers can see your position' : 'Location sharing is OFF — turn on to enable tracking'}
        </div>

        {error && <div className="alert-box alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            className={`btn ${tracking ? 'btn-outline' : 'btn-success'}`}
            onClick={() => setTracking(!tracking)}
          >
            {tracking ? 'Stop Sharing' : 'Start Live Tracking'}
          </button>
          <button className="btn btn-outline" onClick={pushCurrentPosition} disabled={syncing}>
            <RefreshCw size={14} /> {syncing ? 'Updating...' : 'Update Now'}
          </button>
        </div>

        {mapCenter && (
          <>
            <LiveMap
              center={[mapCenter.latitude, mapCenter.longitude]}
              zoom={15}
              markers={markers}
              height="280px"
            />
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              <strong>{mapCenter.address}</strong><br />
              {mapCenter.latitude?.toFixed(5)}, {mapCenter.longitude?.toFixed(5)}
              {lastSynced && <span> · Updated {formatDate(lastSynced)}</span>}
            </div>
          </>
        )}
      </div>

      <button className="sos-btn" onClick={() => setSosOpen(true)}>
        <AlertTriangle size={24} /> EMERGENCY SOS
      </button>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
        Press only in genuine emergencies. Police will receive your live location instantly.
      </p>

      <ConfirmDialog
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        onConfirm={handleSOS}
        title="Trigger Emergency SOS?"
        message="This will immediately alert police authorities with your current location. Only use in real emergencies."
        confirmLabel={sosLoading ? 'Sending...' : 'Send SOS Now'}
        danger
        loading={sosLoading}
      />
    </div>
  );
};

export default TouristHome;
