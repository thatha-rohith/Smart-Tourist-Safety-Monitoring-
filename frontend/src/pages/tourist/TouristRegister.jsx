import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../login.css';

const TouristRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/tourist');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left" style={{ background: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' }}>
        <div className="login-left-content">
          <MapPin size={48} color="#fff" />
          <h1>Join Tourist Safety</h1>
          <p>Register to share your location and stay protected throughout your journey in India.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrapper">
          <h2>Create Account</h2>
          <p>Register as a tourist</p>
          {error && <div className="alert-box alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creating...' : 'Register & Start'}</button>
          </form>
          <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
            Already registered? <Link to="/tourist/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TouristRegister;
