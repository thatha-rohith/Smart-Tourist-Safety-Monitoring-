import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Download, CheckCircle, Eye, FileText, Calendar, Clock } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { FilterBar, Panel } from '../components/common/Panel';
import { StatCard, Badge, Loading, formatDate } from '../components/common/UI';

const emptyForm = {
  tourist: '', incidentType: 'Other', severity: 'Medium',
  location: { address: '' }, description: '', assignedOfficer: '',
};

const EFIRs = () => {
  const { addToast } = useToast();
  const [efirs, setEfirs] = useState([]);
  const [tourists, setTourists] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEfir, setEditEfir] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    Promise.all([
      API.get(`/efirs?${params}`), API.get('/efirs/stats'),
      API.get('/tourists'), API.get('/users/officers'),
    ])
      .then(([e, s, t, o]) => { setEfirs(e.data); setStats(s.data); setTourists(t.data); setOfficers(o.data); })
      .catch(() => addToast('Failed to load E-FIRs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, status]);

  const openCreate = () => { setEditEfir(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (e) => {
    setEditEfir(e);
    setForm({
      incidentType: e.incidentType, severity: e.severity, description: e.description,
      location: e.location || { address: '' }, status: e.status,
      assignedOfficer: e.assignedOfficer?._id || '', responseAction: e.responseAction,
    });
    setModalOpen(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      if (editEfir) {
        await API.put(`/efirs/${editEfir._id}`, form);
        addToast('E-FIR updated');
      } else {
        await API.post('/efirs', form);
        addToast('E-FIR generated');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await API.put(`/efirs/${id}/verify`);
      addToast('E-FIR verified');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Verify failed', 'error');
    }
  };

  const handleDownload = async (id, num) => {
    const { data } = await API.get(`/efirs/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${num.replace(/\//g, '-')}.txt`;
    a.click();
    addToast('Report downloaded');
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/efirs/${deleteTarget._id}`);
      addToast('E-FIR deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="E-FIR Records" subtitle="Generate, verify, and manage incident reports"
        breadcrumb="Operations / E-FIRs"
        actions={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Generate E-FIR</button>} />

      <div className="grid-stats">
        <StatCard icon={FileText} value={stats.total || 0} label="Total Reports" color="blue" />
        <StatCard icon={CheckCircle} value={stats.verified || 0} label="Verified" color="green" />
        <StatCard icon={Calendar} value={stats.thisMonth || 0} label="This Month" color="cyan" />
        <StatCard icon={Clock} value={stats.pending || 0} label="Pending" color="orange" />
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search E-FIR number, tourist, incident...">
        <select className="form-select" style={{ width: 150 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Closed">Closed</option>
        </select>
      </FilterBar>

      <Panel title="E-FIR Registry" subtitle={`${efirs.length} records`}>
        {loading ? <Loading /> : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>E-FIR No.</th><th>Tourist</th><th>Incident</th><th>Severity</th><th>Location</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {efirs.map((e) => (
                  <tr key={e._id}>
                    <td className="cell-primary">{e.efirNumber}</td>
                    <td><div className="cell-primary">{e.tourist?.user?.name}</div><div className="cell-muted">{e.tourist?.user?.email}</div></td>
                    <td>{e.incidentType}</td>
                    <td><Badge type="severity" value={e.severity} /></td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.location?.address}</td>
                    <td>{formatDate(e.incidentDate)}</td>
                    <td><Badge type="status" value={e.status} /></td>
                    <td>
                      <div className="quick-actions">
                        <Link to={`/dashboard/efirs/${e._id}`} className="btn-icon" title="View"><Eye size={14} /></Link>
                        <button className="btn-icon" onClick={() => openEdit(e)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn-icon" onClick={() => handleDownload(e._id, e.efirNumber)} title="Download"><Download size={14} /></button>
                        {e.status === 'Pending' && <button className="btn-icon success" onClick={() => handleVerify(e._id)} title="Verify"><CheckCircle size={14} /></button>}
                        {e.status !== 'Verified' && <button className="btn-icon danger" onClick={() => setDeleteTarget(e)} title="Delete"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editEfir ? 'Edit E-FIR' : 'Generate E-FIR'} size="md"
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <form onSubmit={handleSave}>
          {!editEfir && (
            <div className="form-group"><label className="form-label">Tourist *</label>
              <select className="form-select" required value={form.tourist} onChange={(e) => setForm({ ...form, tourist: e.target.value })}>
                <option value="">Select tourist</option>
                {tourists.map((t) => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-row">
            <div className="form-group"><label className="form-label">Incident Type</label>
              <select className="form-select" value={form.incidentType} onChange={(e) => setForm({ ...form, incidentType: e.target.value })}>
                {['Theft', 'Assault', 'Medical Emergency', 'Accident', 'Harassment', 'Other'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Severity</label>
              <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {['Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Assigned Officer</label>
            <select className="form-select" value={form.assignedOfficer} onChange={(e) => setForm({ ...form, assignedOfficer: e.target.value })}>
              <option value="">Auto-assign to me</option>
              {officers.map((o) => <option key={o._id} value={o._id}>{o.name} ({o.badgeNumber})</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location.address} onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          {editEfir && (
            <>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Pending</option><option>Verified</option><option>Closed</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Response Action</label><input className="form-input" value={form.responseAction || ''} onChange={(e) => setForm({ ...form, responseAction: e.target.value })} /></div>
            </>
          )}
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete E-FIR" message={`Delete ${deleteTarget?.efirNumber}? Only pending records can be removed.`} confirmLabel="Delete" danger />
    </div>
  );
};

export default EFIRs;
