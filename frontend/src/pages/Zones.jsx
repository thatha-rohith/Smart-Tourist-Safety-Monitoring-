import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Shield, AlertTriangle, MapPin } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { FilterBar, Panel } from '../components/common/Panel';
import { StatCard, Badge, Loading } from '../components/common/UI';
import LiveMap from '../components/map/LiveMap';

const emptyForm = {
  name: '', zoneType: 'Restricted', location: { latitude: 28.6139, longitude: 77.209, address: '' },
  radius: 1000, status: 'Active', description: '',
};

const Zones = () => {
  const { addToast } = useToast();
  const [zones, setZones] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [zoneType, setZoneType] = useState('');
  const [sort, setSort] = useState('name');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editZone, setEditZone] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (zoneType) params.set('zoneType', zoneType);
    if (sort) params.set('sort', sort);
    Promise.all([API.get(`/zones?${params}`), API.get('/zones/stats')])
      .then(([z, s]) => { setZones(z.data); setStats(s.data); })
      .catch(() => addToast('Failed to load zones', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, zoneType, sort]);

  const openCreate = () => { setEditZone(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (z) => {
    setEditZone(z);
    setForm({ name: z.name, zoneType: z.zoneType, location: z.location, radius: z.radius, status: z.status, description: z.description || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editZone) {
        await API.put(`/zones/${editZone._id}`, form);
        addToast('Zone updated');
      } else {
        await API.post('/zones', form);
        addToast('Zone created');
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
      await API.delete(`/zones/${deleteTarget._id}`);
      addToast('Zone deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="Zone Management" subtitle="Define restricted, risky, and safe tourist zones"
        breadcrumb="Operations / Zones"
        actions={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Create Zone</button>} />

      <div className="grid-stats grid-stats-3">
        <StatCard icon={Shield} value={stats.restricted || 0} label="Restricted" color="red" />
        <StatCard icon={AlertTriangle} value={stats.risky || 0} label="Risky" color="orange" />
        <StatCard icon={MapPin} value={stats.safe || 0} label="Safe" color="green" />
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search zone name...">
        <select className="form-select" style={{ width: 150 }} value={zoneType} onChange={(e) => setZoneType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Restricted">Restricted</option>
          <option value="Risky">Risky</option>
          <option value="Safe">Safe</option>
        </select>
        <select className="form-select" style={{ width: 160 }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Sort A-Z</option>
          <option value="-name">Sort Z-A</option>
          <option value="created">Newest</option>
        </select>
      </FilterBar>

      <div className="grid-2">
        <Panel title="Zone Registry" subtitle={`${zones.length} zones`}>
          {loading ? <Loading /> : (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Zone</th><th>Type</th><th>Radius</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {zones.map((z) => (
                    <tr key={z._id}>
                      <td><div className="cell-primary">{z.name}</div><div className="cell-muted">{z.location.address}</div></td>
                      <td><Badge type="zone" value={z.zoneType} /></td>
                      <td>{z.radius}m</td>
                      <td><Badge type="status" value={z.status} /></td>
                      <td>
                        <div className="quick-actions">
                          <button className="btn-icon" onClick={() => openEdit(z)} title="Edit"><Pencil size={14} /></button>
                          <button className="btn-icon danger" onClick={() => setDeleteTarget(z)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Zone Map" subtitle="Interactive zone visualization">
          <div style={{ padding: 16 }}>
            <LiveMap center={[28.6139, 77.209]} zoom={5} zones={zones} height="420px" />
          </div>
        </Panel>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editZone ? 'Edit Zone' : 'Create Zone'} size="md"
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Zone'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-group"><label className="form-label">Zone Name *</label><input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.zoneType} onChange={(e) => setForm({ ...form, zoneType: e.target.value })}><option>Restricted</option><option>Risky</option><option>Safe</option></select></div>
            <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.location.address} onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Latitude</label><input type="number" step="any" className="form-input" value={form.location.latitude} onChange={(e) => setForm({ ...form, location: { ...form.location, latitude: parseFloat(e.target.value) } })} /></div>
            <div className="form-group"><label className="form-label">Longitude</label><input type="number" step="any" className="form-input" value={form.location.longitude} onChange={(e) => setForm({ ...form, location: { ...form.location, longitude: parseFloat(e.target.value) } })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Radius (meters)</label><input type="number" className="form-input" value={form.radius} onChange={(e) => setForm({ ...form, radius: parseInt(e.target.value) })} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Zone" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" danger />
    </div>
  );
};

export default Zones;
