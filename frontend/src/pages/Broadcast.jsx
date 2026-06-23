import { useEffect, useState } from 'react';
import { Send, Trash2, Eye, Radio, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Panel } from '../components/common/Panel';
import { Loading, formatDate } from '../components/common/UI';

const Broadcast = () => {
  const { addToast } = useToast();
  const [broadcasts, setBroadcasts] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: '', message: '', broadcastType: 'All Tourists', isEmergency: false,
    radius: 5000, centerLocation: { latitude: 28.6139, longitude: 77.209 }, region: '', targetZone: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([API.get('/broadcasts'), API.get('/zones')])
      .then(([b, z]) => { setBroadcasts(b.data); setZones(z.data); })
      .catch(() => addToast('Failed to load broadcasts', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = { ...form };
      if (form.broadcastType !== 'Zone') delete payload.targetZone;
      if (form.broadcastType !== 'Region') delete payload.region;
      if (form.broadcastType !== 'Radius') { delete payload.radius; delete payload.centerLocation; }
      const { data } = await API.post('/broadcasts', payload);
      setBroadcasts([data, ...broadcasts]);
      addToast(`Broadcast sent to ${data.recipientsCount} tourists`);
      setForm({ title: '', message: '', broadcastType: 'All Tourists', isEmergency: false, radius: 5000, centerLocation: { latitude: 28.6139, longitude: 77.209 }, region: '', targetZone: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Send failed', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/broadcasts/${deleteTarget._id}`);
      addToast('Broadcast deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Emergency Broadcast" subtitle="Send and manage safety notifications to tourists"
        breadcrumb="Operations / Broadcast" />

      <div className="grid-2">
        <Panel title="Compose Broadcast" subtitle="Send alerts to tourists by scope">
          <div style={{ padding: 22 }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Alert Title *</label>
                <input className="form-input" required placeholder="Emergency Weather Warning" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Message *</label>
                <textarea className="form-textarea" required placeholder="Enter warning message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Broadcast Type</label>
                <select className="form-select" value={form.broadcastType} onChange={(e) => setForm({ ...form, broadcastType: e.target.value })}>
                  <option>All Tourists</option><option>Radius</option><option>Zone</option><option>Region</option>
                </select>
              </div>

              {form.broadcastType === 'Radius' && (
                <>
                  <div className="form-group"><label className="form-label">Radius (meters)</label><input type="number" className="form-input" value={form.radius} onChange={(e) => setForm({ ...form, radius: parseInt(e.target.value) })} /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Latitude</label><input type="number" step="any" className="form-input" value={form.centerLocation.latitude} onChange={(e) => setForm({ ...form, centerLocation: { ...form.centerLocation, latitude: parseFloat(e.target.value) } })} /></div>
                    <div className="form-group"><label className="form-label">Longitude</label><input type="number" step="any" className="form-input" value={form.centerLocation.longitude} onChange={(e) => setForm({ ...form, centerLocation: { ...form.centerLocation, longitude: parseFloat(e.target.value) } })} /></div>
                  </div>
                </>
              )}
              {form.broadcastType === 'Zone' && (
                <div className="form-group"><label className="form-label">Target Zone *</label>
                  <select className="form-select" required value={form.targetZone} onChange={(e) => setForm({ ...form, targetZone: e.target.value })}>
                    <option value="">Select zone</option>
                    {zones.map((z) => <option key={z._id} value={z._id}>{z.name} ({z.zoneType})</option>)}
                  </select>
                </div>
              )}
              {form.broadcastType === 'Region' && (
                <div className="form-group"><label className="form-label">Region *</label><input className="form-input" required placeholder="Ladakh, Goa, Delhi..." value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isEmergency} onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })} />
                <AlertTriangle size={16} color="var(--danger)" /><span className="form-label" style={{ margin: 0 }}>Emergency Warning</span>
              </label>

              <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={sending}>
                <Send size={16} /> {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </div>
        </Panel>

        <Panel title="Broadcast History" subtitle={`${broadcasts.length} sent`} actions={<Radio size={18} color="var(--text-muted)" />}>
          {loading ? <Loading /> : (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Title</th><th>Type</th><th>Recipients</th><th>Emergency</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {broadcasts.map((b) => (
                    <tr key={b._id}>
                      <td className="cell-primary">{b.title}</td>
                      <td>{b.broadcastType}</td>
                      <td>{b.recipientsCount}</td>
                      <td>{b.isEmergency ? '⚠️ Yes' : 'No'}</td>
                      <td>{formatDate(b.createdAt)}</td>
                      <td>
                        <div className="quick-actions">
                          <button className="btn-icon" onClick={() => setViewItem(b)} title="View"><Eye size={14} /></button>
                          <button className="btn-icon danger" onClick={() => setDeleteTarget(b)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Broadcast Details"
        footer={<button className="btn btn-outline" onClick={() => setViewItem(null)}>Close</button>}>
        {viewItem && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Title</div><div className="detail-value">{viewItem.title}</div></div>
            <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{viewItem.broadcastType}</div></div>
            <div className="detail-item"><div className="detail-label">Recipients</div><div className="detail-value">{viewItem.recipientsCount}</div></div>
            <div className="detail-item"><div className="detail-label">Sent By</div><div className="detail-value">{viewItem.sentBy?.name}</div></div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Message</div><div className="detail-value">{viewItem.message}</div></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Broadcast" message="Remove this broadcast from history?" confirmLabel="Delete" danger />
    </div>
  );
};

export default Broadcast;
