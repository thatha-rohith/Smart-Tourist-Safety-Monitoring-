import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { Panel } from '../../components/common/Panel';

const TouristProfile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      await API.put('/auth/profile', payload);
      addToast('Profile updated');
      setForm({ ...form, password: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Profile</h1>
      <Panel title="Account Details">
        <div style={{ padding: 22 }}>
          <div className="detail-grid" style={{ marginBottom: 24 }}>
            <div className="detail-item"><div className="detail-label">Tourist ID</div><div className="detail-value">{user?.touristProfile?.touristId}</div></div>
            <div className="detail-item"><div className="detail-label">Email</div><div className="detail-value">{user?.email}</div></div>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" placeholder="Leave blank to keep" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </Panel>
    </div>
  );
};

export default TouristProfile;
