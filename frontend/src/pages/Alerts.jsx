import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, CheckCircle, Eye, AlertTriangle, Bell, Clock } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { FilterBar, Panel } from '../components/common/Panel';
import { StatCard, Badge, Loading, formatDate } from '../components/common/UI';

const emptyForm = {
  tourist: '', alertType: 'Safety alert', severity: 'Medium', description: '',
  location: { latitude: 28.6139, longitude: 77.209, address: '' },
};

const Alerts = () => {
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewAlert, setViewAlert] = useState(null);
  const [editAlert, setEditAlert] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (severity) params.set('severity', severity);
    if (status) params.set('status', status);
    Promise.all([API.get(`/alerts?${params}`), API.get('/alerts/stats'), API.get('/tourists')])
      .then(([a, s, t]) => { setAlerts(a.data); setStats(s.data); setTourists(t.data); })
      .catch(() => addToast('Failed to load alerts', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, severity, status]);

  const openCreate = () => { setEditAlert(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (a) => {
    setEditAlert(a);
    setForm({
      tourist: a.tourist?._id, alertType: a.alertType, severity: a.severity,
      description: a.description, status: a.status,
      location: a.location || emptyForm.location,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editAlert) {
        await API.put(`/alerts/${editAlert._id}`, form);
        addToast('Alert updated');
      } else {
        await API.post('/alerts', form);
        addToast('Alert created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await API.put(`/alerts/${id}/resolve`, { responseAction: 'Resolved by officer' });
      addToast('Alert marked as resolved');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/alerts/${deleteTarget._id}`);
      addToast('Alert deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Alert Management" subtitle="Monitor, create, and respond to safety alerts"
        breadcrumb="Operations / Alerts"
        actions={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Create Alert</button>} />

      <div className="grid-stats">
        <StatCard icon={AlertTriangle} value={stats.critical || 0} label="Critical" color="red" />
        <StatCard icon={Bell} value={stats.high || 0} label="High Priority" color="orange" />
        <StatCard icon={Clock} value={stats.pending || 0} label="Pending" color="blue" />
        <StatCard icon={CheckCircle} value={stats.resolved || 0} label="Resolved" color="green" />
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search tourist or alert type...">
        <select className="form-select" style={{ width: 150 }} value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All Severity</option>
          {['Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 150 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
        </select>
      </FilterBar>

      <Panel title="Alert Queue" subtitle={`${alerts.length} records`}>
        {loading ? <Loading /> : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Tourist</th><th>Type</th><th>Severity</th><th>Location</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a._id}>
                    <td><div className="cell-primary">{a.tourist?.user?.name}</div><div className="cell-muted">{a.tourist?.user?.email}</div></td>
                    <td>{a.alertType}</td>
                    <td><Badge type="severity" value={a.severity} /></td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.location?.address}</td>
                    <td><Badge type="status" value={a.status} /></td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>
                      <div className="quick-actions">
                        <button className="btn-icon" onClick={() => setViewAlert(a)} title="View"><Eye size={14} /></button>
                        <button className="btn-icon" onClick={() => openEdit(a)} title="Edit"><Pencil size={14} /></button>
                        {a.status === 'Pending' && <button className="btn-icon success" onClick={() => handleResolve(a._id)} title="Resolve"><CheckCircle size={14} /></button>}
                        <Link to={`/dashboard/tourists/${a.tourist?._id}`} className="btn-icon" title="Location"><Eye size={14} /></Link>
                        <button className="btn-icon danger" onClick={() => setDeleteTarget(a)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAlert ? 'Edit Alert' : 'Create Alert'} size="md"
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <form onSubmit={handleSave}>
          {!editAlert && (
            <div className="form-group"><label className="form-label">Tourist *</label>
              <select className="form-select" required value={form.tourist} onChange={(e) => setForm({ ...form, tourist: e.target.value })}>
                <option value="">Select tourist</option>
                {tourists.map((t) => <option key={t._id} value={t._id}>{t.user?.name} ({t.touristId})</option>)}
              </select>
            </div>
          )}
          <div className="form-row">
            <div className="form-group"><label className="form-label">Alert Type</label>
              <select className="form-select" value={form.alertType} onChange={(e) => setForm({ ...form, alertType: e.target.value })}>
                {['SOS alert', 'Emergency alert', 'Safety alert', 'Location-based alert', 'Restricted zone alert'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Severity</label>
              <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {['Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {editAlert && (
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Pending</option><option>Resolved</option>
              </select>
            </div>
          )}
          <div className="form-group"><label className="form-label">Location Address</label>
            <input className="form-input" value={form.location.address} onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} />
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </Modal>

      <Modal open={!!viewAlert} onClose={() => setViewAlert(null)} title="Alert Details" size="md"
        footer={<button className="btn btn-outline" onClick={() => setViewAlert(null)}>Close</button>}>
        {viewAlert && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Tourist</div><div className="detail-value">{viewAlert.tourist?.user?.name}</div></div>
            <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{viewAlert.alertType}</div></div>
            <div className="detail-item"><div className="detail-label">Severity</div><Badge type="severity" value={viewAlert.severity} /></div>
            <div className="detail-item"><div className="detail-label">Status</div><Badge type="status" value={viewAlert.status} /></div>
            <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{viewAlert.location?.address}</div></div>
            <div className="detail-item"><div className="detail-label">Time</div><div className="detail-value">{formatDate(viewAlert.createdAt)}</div></div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Description</div><div className="detail-value">{viewAlert.description}</div></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Alert" message="This alert will be permanently removed." confirmLabel="Delete" danger />
    </div>
  );
};

export default Alerts;
