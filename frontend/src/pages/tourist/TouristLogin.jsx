import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Shield, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../login.css';

const TouristLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'tourist') {
        navigate('/tourist');
      } else {
        setError('This portal is for tourists only. Officers should use the Authority Login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)' }}>
        <div className="login-left-content">
          <MapPin size={48} color="#fff" />
          <h1>Tourist Safety App</h1>
          <p>Share your live location with police authorities and get instant help during emergencies.</p>
          <div className="login-left-features">
            {[
              { icon: MapPin, text: 'Real-time GPS location sharing' },
              { icon: Bell, text: 'One-tap emergency SOS alerts' },
              { icon: Shield, text: 'Safety score & zone monitoring' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="login-left-feature">
                <div className="login-left-feature-icon"><Icon size={16} /></div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <h2>Tourist Login</h2>
          <p>Sign in to enable live location tracking</p>
          {error && <div className="alert-box alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="arjun.sharma@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="login-demo">
            <strong>Demo:</strong> arjun.sharma@gmail.com / tourist123
          </div>
          <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center', color: 'var(--text-secondary)' }}>
            New tourist? <Link to="/tourist/register" style={{ color: 'var(--accent)' }}>Create account</Link><br />
            <Link to="/login" style={{ color: 'var(--text-muted)' }}>Officer login →</Link> · <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TouristLogin;
