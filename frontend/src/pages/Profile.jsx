import { useState } from 'react';
import { Mail, Phone, Shield, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import PageHeader from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';

const Profile = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
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
      addToast('Profile updated successfully');
      setForm({ ...form, password: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile & Settings" subtitle="Manage your authority account"
        breadcrumb="Account / Profile" />

      <div className="grid-2">
        <Panel title="Officer Profile">
          <div className="detail-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div className="sidebar-avatar" style={{ width: 72, height: 72, fontSize: 28, borderRadius: 14 }}>{user?.name?.charAt(0)}</div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user?.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.role === 'admin' ? 'Administrator' : 'Police Authority'}</p>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label"><Mail size={12} /> Email</div><div className="detail-value">{user?.email}</div></div>
              <div className="detail-item"><div className="detail-label"><BadgeCheck size={12} /> Badge</div><div className="detail-value">{user?.badgeNumber || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label"><Shield size={12} /> Department</div><div className="detail-value">{user?.department || 'Tourist Safety Division'}</div></div>
              <div className="detail-item"><div className="detail-label"><Phone size={12} /> Phone</div><div className="detail-value">{user?.phone || 'Not set'}</div></div>
            </div>
          </div>
        </Panel>

        <Panel title="Account Settings">
          <div style={{ padding: 22 }}>
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" placeholder="Leave blank to keep current" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>

            <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Appearance</h4>
              <button className="btn btn-outline" onClick={toggleTheme}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default Profile;
