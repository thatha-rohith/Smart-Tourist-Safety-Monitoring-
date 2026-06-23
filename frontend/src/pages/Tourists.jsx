import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Users, Shield, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { FilterBar, Panel, EmptyState } from '../components/common/Panel';
import { StatCard, Badge, Loading, formatDate, getScoreClass } from '../components/common/UI';

const emptyForm = {
  name: '', email: '', password: '', phone: '', nationality: 'Indian', visitPurpose: 'Tourism',
  emergencyContact: '', safetyStatus: 'Safe', safetyScore: 100,
};

const Tourists = () => {
  const { addToast } = useToast();
  const [tourists, setTourists] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    Promise.all([API.get(`/tourists?${params}`), API.get('/tourists/stats')])
      .then(([t, s]) => { setTourists(t.data); setStats(s.data); })
      .catch(() => addToast('Failed to load tourists', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, statusFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      API.get(`/tourists?${params}`).then(({ data }) => setTourists(data)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [search, statusFilter]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t) => {
    setEditItem(t);
    setForm({
      name: t.user?.name, email: t.user?.email, phone: t.user?.phone || '', password: '',
      nationality: t.nationality, visitPurpose: t.visitPurpose, emergencyContact: t.emergencyContact || '',
      safetyStatus: t.safetyStatus, safetyScore: t.safetyScore,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await API.put(`/tourists/${editItem._id}`, form);
        addToast('Tourist updated successfully');
      } else {
        await API.post('/tourists', form);
        addToast('Tourist registered successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/tourists/${deleteTarget._id}`);
      addToast('Tourist deactivated');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Tourist Management" subtitle="Monitor registered tourists and their safety status — live refresh every 15s"
        breadcrumb="Operations / Tourists"
        actions={
          <>
            <span className="live-badge" style={{ alignSelf: 'center' }}>Live</span>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Register Tourist</button>
          </>
        } />

      <div className="grid-stats">
        <StatCard icon={Users} value={stats.total || 0} label="Total Tourists" color="blue" />
        <StatCard icon={Shield} value={stats.safe || 0} label="Safe" color="green" />
        <StatCard icon={AlertTriangle} value={stats.atRisk || 0} label="At Risk" color="orange" />
        <StatCard icon={Users} value={stats.active || 0} label="Active" color="cyan" />
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search name, email, tourist ID...">
        <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Safe">Safe</option>
          <option value="At Risk">At Risk</option>
          <option value="Unsafe">Unsafe</option>
          <option value="Critical">Critical</option>
        </select>
      </FilterBar>

      <Panel title="Tourist Registry" subtitle={`${tourists.length} records`}>
        {loading ? <Loading /> : tourists.length === 0 ? (
          <EmptyState icon={Users} title="No tourists found" action={<button className="btn btn-primary" onClick={openCreate}>Register Tourist</button>} />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Tourist</th><th>ID</th><th>Contact</th><th>Score</th><th>Status</th><th>Last Seen</th><th>Alerts</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tourists.map((t) => (
                  <tr key={t._id}>
                    <td><div className="cell-primary">{t.user?.name}</div><div className="cell-muted">{t.nationality}</div></td>
                    <td>{t.touristId}</td>
                    <td><div className="cell-muted">{t.user?.email}</div>{t.user?.phone}</td>
                    <td><span className={`score-badge ${getScoreClass(t.safetyStatus)}`}>{t.safetyScore}</span></td>
                    <td><Badge type="safety" value={t.safetyStatus} /></td>
                    <td>{formatDate(t.currentLocation?.lastUpdated)}</td>
                    <td>{t.totalAlerts}</td>
                    <td>
                      <div className="quick-actions">
                        <Link to={`/dashboard/tourists/${t._id}`} className="btn-icon" title="View"><Eye size={14} /></Link>
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(t)}><Pencil size={14} /></button>
                        {t.isActive !== false && <button className="btn-icon danger" title="Deactivate" onClick={() => setDeleteTarget(t)}><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Tourist' : 'Register New Tourist'} size="lg"
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Register'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" required disabled={!!editItem} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">{editItem ? 'Password' : 'Password *'}</label><input type="password" className="form-input" required={!editItem} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editItem ? 'Optional' : 'tourist123'} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nationality</label><input className="form-input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Visit Purpose</label><input className="form-input" value={form.visitPurpose} onChange={(e) => setForm({ ...form, visitPurpose: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Emergency Contact</label><input className="form-input" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Safety Status</label><select className="form-select" value={form.safetyStatus} onChange={(e) => setForm({ ...form, safetyStatus: e.target.value })}><option>Safe</option><option>At Risk</option><option>Unsafe</option><option>Critical</option></select></div>
          </div>
          {editItem && (
            <div className="form-group"><label className="form-label">Safety Score (0-100)</label><input type="number" min="0" max="100" className="form-input" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: parseInt(e.target.value) })} /></div>
          )}
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Deactivate Tourist" message={`Deactivate ${deleteTarget?.user?.name}? Their account will be disabled.`} confirmLabel="Deactivate" danger />
    </div>
  );
};

export default Tourists;
