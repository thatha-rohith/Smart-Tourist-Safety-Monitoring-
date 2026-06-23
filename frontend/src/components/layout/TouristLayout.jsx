import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { MapPin, Bell, User, LogOut, Shield, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import './tourist-layout.css';

const TouristLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/tourist/login');
  };

  const navItems = [
    { path: '/tourist', label: 'Live Tracking', icon: MapPin, end: true },
    { path: '/tourist/alerts', label: 'My Alerts', icon: Bell },
    { path: '/tourist/broadcasts', label: 'Safety Alerts', icon: Radio },
    { path: '/tourist/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="tourist-layout">
      <aside className="tourist-sidebar">
        <div className="tourist-sidebar-logo">
          <Shield size={28} color="#38bdf8" style={{ marginBottom: 8 }} />
          <h2>Tourist Safety App</h2>
          <span>Stay connected · Stay safe</span>
        </div>
        <nav className="tourist-nav">
          {navItems.map(({ path, label, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end} className={({ isActive }) => `tourist-link${isActive ? ' active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button className="tourist-link" onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', marginTop: 12 }}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>Logged in as</div>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ color: '#38bdf8', fontSize: 11 }}>{user?.touristProfile?.touristId}</div>
        </div>
      </aside>

      <div className="tourist-main">
        <header className="tourist-topbar">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Smart Tourist Safety Monitoring</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="topbar-btn" onClick={toggleTheme}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
            <Link to="/tourist/profile" className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12, borderRadius: 8, textDecoration: 'none' }}>
              {user?.name?.charAt(0)}
            </Link>
          </div>
        </header>
        <main className="tourist-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TouristLayout;
