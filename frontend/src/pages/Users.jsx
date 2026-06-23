import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, UserPlus, ShieldCheck, UserX } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { FilterBar, Panel, EmptyState } from '../components/common/Panel';
import { StatCard, Badge, Loading } from '../components/common/UI';

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'authority', badgeNumber: '', department: 'Tourist Safety Division' };

const Users = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('status', statusFilter);
    Promise.all([API.get(`/users?${params}`), API.get('/users/stats')])
      .then(([u, s]) => { setUsers(u.data); setStats(s.data); })
      .catch(() => addToast('Failed to load officers', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [search, roleFilter, statusFilter]);

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', role: u.role, badgeNumber: u.badgeNumber || '', department: u.department || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        delete payload.email;
        await API.put(`/users/${editUser._id}`, payload);
        addToast('Officer updated successfully');
      } else {
        await API.post('/users', form);
        addToast('Officer created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await API.delete(`/users/${deleteTarget._id}`);
      addToast('Officer deactivated');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const toggleActive = async (u) => {
    try {
      await API.put(`/users/${u._id}`, { isActive: !u.isActive });
      addToast(u.isActive ? 'Officer deactivated' : 'Officer activated');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Officer Management"
        subtitle="Create and manage police authority accounts"
        breadcrumb="Administration / Officers"
        actions={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Officer</button>}
      />

      <div className="grid-stats grid-stats-3">
        <StatCard icon={ShieldCheck} value={stats.total || 0} label="Total Officers" color="blue" />
        <StatCard icon={UserPlus} value={stats.active || 0} label="Active Officers" color="green" />
        <StatCard icon={UserX} value={(stats.total || 0) - (stats.active || 0)} label="Inactive" color="orange" />
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email, badge...">
        <select className="form-select" style={{ width: 150 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="authority">Authority</option>
          <option value="admin">Admin</option>
        </select>
        <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      <Panel title="Officer Directory" subtitle={`${users.length} records`}>
        {loading ? <Loading /> : users.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No officers found" description="Create your first police authority account." action={<button className="btn btn-primary" onClick={openCreate}>Add Officer</button>} />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Officer</th><th>Email</th><th>Role</th><th>Badge</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><div className="cell-primary">{u.name}</div><div className="cell-muted">{u.phone || '—'}</div></td>
                    <td>{u.email}</td>
                    <td><Badge type="role" value={u.role} /></td>
                    <td>{u.badgeNumber || '—'}</td>
                    <td>{u.department || '—'}</td>
                    <td><span className={`status-dot ${u.isActive ? 'active' : 'inactive'}`} />{u.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <div className="quick-actions">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(u)}><Pencil size={14} /></button>
                        <button className="btn-icon" title={u.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(u)}><Eye size={14} /></button>
                        {u.isActive && <button className="btn-icon danger" title="Deactivate" onClick={() => setDeleteTarget(u)}><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit Officer' : 'Add New Officer'} size="md"
        footer={<><button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editUser ? 'Update Officer' : 'Create Officer'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" required disabled={!!editUser} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="authority">Authority</option><option value="admin">Admin</option></select></div>
            <div className="form-group"><label className="form-label">Badge Number</label><input className="form-input" value={form.badgeNumber} onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">{editUser ? 'New Password' : 'Password *'}</label><input type="password" className="form-input" required={!editUser} placeholder={editUser ? 'Leave blank to keep' : 'Min 6 characters'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeactivate}
        title="Deactivate Officer" message={`Deactivate ${deleteTarget?.name}? They will no longer access the dashboard.`} confirmLabel="Deactivate" danger />
    </div>
  );
};

export default Users;
