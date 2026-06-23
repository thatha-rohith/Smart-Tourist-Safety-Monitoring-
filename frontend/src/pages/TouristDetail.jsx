import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, MapPin, Phone, Mail, Globe } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import { Panel } from '../components/common/Panel';
import { Badge, Loading, formatDate, getScoreClass } from '../components/common/UI';
import LiveMap from '../components/map/LiveMap';

const TouristDetail = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});

  const load = () => {
    API.get(`/tourists/${id}`)
      .then(({ data }) => {
        setTourist(data);
        setForm({
          name: data.user?.name, phone: data.user?.phone || '', nationality: data.nationality,
          visitPurpose: data.visitPurpose, emergencyContact: data.emergencyContact || '',
          safetyStatus: data.safetyStatus, safetyScore: data.safetyScore,
        });
      })
      .catch(() => addToast('Failed to load tourist', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      API.get(`/tourists/${id}`).then(({ data }) => setTourist(data)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/tourists/${id}`, form);
      setTourist(data);
      setEditOpen(false);
      addToast('Tourist updated');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <Loading />;
  if (!tourist) return <div>Tourist not found</div>;

  const markers = [{ id: tourist._id, lat: tourist.currentLocation.latitude, lng: tourist.currentLocation.longitude, name: tourist.user?.name, info: tourist.currentLocation.address }];

  return (
    <div>
      <Link to="/dashboard/tourists" className="btn btn-outline btn-sm" style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Tourists
      </Link>

      <PageHeader
        title={tourist.user?.name}
        subtitle={`Tourist ID: ${tourist.touristId} · ${tourist.nationality}`}
        breadcrumb={`Operations / Tourists / ${tourist.touristId}`}
        actions={<button className="btn btn-primary btn-sm" onClick={() => setEditOpen(true)}><Pencil size={14} /> Edit Profile</button>}
      />

      <div className="grid-stats grid-stats-3" style={{ marginBottom: 24 }}>
        <div className="stat-card-pro">
          <div className={`score-badge ${getScoreClass(tourist.safetyStatus)}`} style={{ width: 56, height: 56, fontSize: 16 }}>{tourist.safetyScore}</div>
          <div className="stat-content"><div className="stat-value" style={{ fontSize: 18 }}>Safety Score</div><Badge type="safety" value={tourist.safetyStatus} /></div>
        </div>
        <div className="stat-card-pro"><div className="stat-icon orange"><MapPin size={22} /></div><div className="stat-content"><div className="stat-value">{tourist.locationHistory?.length || 0}</div><div className="stat-label">Location History</div></div></div>
        <div className="stat-card-pro"><div className="stat-icon red"><Phone size={22} /></div><div className="stat-content"><div className="stat-value">{tourist.totalAlerts}</div><div className="stat-label">Total Alerts</div></div></div>
      </div>

      <div className="grid-2">
        <Panel title="Personal Information">
          <div className="detail-card detail-grid">
            <div className="detail-item"><div className="detail-label">Full Name</div><div className="detail-value">{tourist.user?.name}</div></div>
            <div className="detail-item"><div className="detail-label">Tourist ID</div><div className="detail-value">{tourist.touristId}</div></div>
            <div className="detail-item"><div className="detail-label"><Mail size={12} /> Email</div><div className="detail-value">{tourist.user?.email}</div></div>
            <div className="detail-item"><div className="detail-label"><Phone size={12} /> Phone</div><div className="detail-value">{tourist.user?.phone}</div></div>
            <div className="detail-item"><div className="detail-label"><Globe size={12} /> Nationality</div><div className="detail-value">{tourist.nationality}</div></div>
            <div className="detail-item"><div className="detail-label">Visit Purpose</div><div className="detail-value">{tourist.visitPurpose}</div></div>
            <div className="detail-item"><div className="detail-label">Emergency Contact</div><div className="detail-value">{tourist.emergencyContact || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Last Seen</div><div className="detail-value">{formatDate(tourist.currentLocation?.lastUpdated)}</div></div>
          </div>
        </Panel>

        <Panel title="Live Location">
          <div style={{ padding: 16 }}>
            <LiveMap center={[tourist.currentLocation.latitude, tourist.currentLocation.longitude]} zoom={13} markers={markers} height="260px" />
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>Coordinates:</strong> {tourist.currentLocation.latitude.toFixed(4)}, {tourist.currentLocation.longitude.toFixed(4)}<br />
              <strong>Address:</strong> {tourist.currentLocation.address}
            </div>
          </div>
        </Panel>
      </div>

      {tourist.locationHistory?.length > 0 && (
        <Panel title="Location History" subtitle={`${tourist.locationHistory.length} recorded points`} >
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Address</th><th>Latitude</th><th>Longitude</th><th>Time</th></tr></thead>
              <tbody>
                {tourist.locationHistory.slice().reverse().map((loc, i) => (
                  <tr key={i}>
                    <td>{loc.address}</td><td>{loc.latitude.toFixed(4)}</td><td>{loc.longitude.toFixed(4)}</td><td>{formatDate(loc.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Tourist Profile"
        footer={<><button className="btn btn-outline" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save Changes</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nationality</label><input className="form-input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Visit Purpose</label><input className="form-input" value={form.visitPurpose} onChange={(e) => setForm({ ...form, visitPurpose: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Safety Status</label>
              <select className="form-select" value={form.safetyStatus} onChange={(e) => setForm({ ...form, safetyStatus: e.target.value })}>
                {['Safe', 'At Risk', 'Unsafe', 'Critical'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Safety Score</label><input type="number" min="0" max="100" className="form-input" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: parseInt(e.target.value) })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Emergency Contact</label><input className="form-input" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default TouristDetail;
