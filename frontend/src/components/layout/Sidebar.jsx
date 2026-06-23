import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bell, MapPin, FileText, Radio,
  User, LogOut, Shield, UserCog,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import './layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/dashboard/tourists', label: 'Tourists', icon: Users },
  { path: '/dashboard/alerts', label: 'Alerts', icon: Bell, badge: true },
  { path: '/dashboard/zones', label: 'Zones', icon: MapPin },
  { path: '/dashboard/efirs', label: 'E-FIRs', icon: FileText },
  { path: '/dashboard/broadcast', label: 'Broadcast', icon: Radio },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingAlerts, setPendingAlerts] = useState(0);

  const location = useLocation();

  useEffect(() => {
    API.get('/alerts/stats')
      .then(({ data }) => setPendingAlerts(data.pending || 0))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Shield size={22} /></div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-title">STSMS</div>
          <div className="sidebar-logo-sub">Authority Control Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Operations</div>
        {navItems.map(({ path, label, icon: Icon, end, badge }) => (
          <NavLink key={path} to={path} end={end} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={18} />
            {label}
            {badge && pendingAlerts > 0 && <span className="sidebar-badge">{pendingAlerts}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="sidebar-section">Administration</div>
            <NavLink to="/dashboard/users" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <UserCog size={18} />
              Officer Management
            </NavLink>
          </>
        )}

        <div className="sidebar-section">Account</div>
        <NavLink to="/dashboard/profile" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <User size={18} />
          Profile & Settings
        </NavLink>
        <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none' }}>
          <LogOut size={18} />
          Sign Out
        </button>
      </nav>

      <div className="sidebar-footer">
        <Link to="/dashboard/profile" className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.charAt(0) || 'O'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{isAdmin ? 'Administrator' : 'Police Authority'}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
