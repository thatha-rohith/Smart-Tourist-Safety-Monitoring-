import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, MapPin, Bell, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './login.css';

const Login = () => {
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
      if (user.role === 'authority' || user.role === 'admin') {
        navigate('/dashboard');
      } else {
        setError('Access denied. Only police authorities can access the dashboard.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <Shield size={48} color="#38bdf8" />
          <h1>Police Authority Portal</h1>
          <p>Secure access to the Smart Tourist Safety Monitoring System dashboard for authorized officers.</p>
          <div className="login-left-features">
            {[
              { icon: MapPin, text: 'Live tourist location tracking' },
              { icon: Bell, text: 'Real-time SOS alert management' },
              { icon: FileText, text: 'E-FIR generation & verification' },
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
          <h2>Officer Login</h2>
          <p>Enter your credentials to access the dashboard</p>

          {error && <div className="alert-box alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="form-input" placeholder="officer@police.gov.in"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-input" placeholder="Enter your password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="login-demo">
            <strong>Demo Credentials:</strong><br />
            Authority: rajesh@police.gov.in / police123<br />
            Admin: admin@stsms.gov.in / admin123
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Tourist? <Link to="/tourist/login" style={{ color: 'var(--accent)' }}>Tourist App Login</Link><br />
            <Link to="/" style={{ color: 'var(--primary-light)' }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
