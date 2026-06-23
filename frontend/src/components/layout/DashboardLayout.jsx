import { Outlet, useLocation, Link } from 'react-router-dom';
import { Moon, Sun, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './layout.css';

const routeTitles = {
  '/dashboard': 'Dashboard Overview',
  '/dashboard/tourists': 'Tourist Management',
  '/dashboard/alerts': 'Alert Management',
  '/dashboard/zones': 'Zone Management',
  '/dashboard/efirs': 'E-FIR Records',
  '/dashboard/broadcast': 'Emergency Broadcast',
  '/dashboard/users': 'Officer Management',
  '/dashboard/profile': 'Profile & Settings',
};

const DashboardLayout = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const basePath = Object.keys(routeTitles).find((p) =>
    p === '/dashboard' ? location.pathname === p : location.pathname.startsWith(p)
  ) || '/dashboard';

  const pageTitle = routeTitles[basePath] || 'Authority Panel';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              STSMS / <strong>{pageTitle}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <Link to="/dashboard/alerts" className="topbar-btn" title="Pending alerts">
              <Bell size={17} />
              <span className="notif-dot" />
            </Link>
            <button className="topbar-btn" onClick={toggleTheme} title="Toggle theme">
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/dashboard/profile" className="topbar-user">
              <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 12, borderRadius: 8 }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="topbar-user-name">{user?.name?.split(' ')[0]}</div>
                <div className="topbar-user-role">{user?.role === 'admin' ? 'Admin' : 'Authority'}</div>
              </div>
            </Link>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
