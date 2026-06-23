import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import TouristLayout from './components/layout/TouristLayout';
import Dashboard from './pages/Dashboard';
import Tourists from './pages/Tourists';
import TouristDetail from './pages/TouristDetail';
import Alerts from './pages/Alerts';
import Zones from './pages/Zones';
import EFIRs from './pages/EFIRs';
import EFIRDetail from './pages/EFIRDetail';
import Broadcast from './pages/Broadcast';
import Profile from './pages/Profile';
import Users from './pages/Users';
import TouristLogin from './pages/tourist/TouristLogin';
import TouristRegister from './pages/tourist/TouristRegister';
import TouristHome from './pages/tourist/TouristHome';
import TouristAlerts from './pages/tourist/TouristAlerts';
import TouristBroadcasts from './pages/tourist/TouristBroadcasts';
import TouristProfile from './pages/tourist/TouristProfile';

const AuthorityRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthority, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAuthority) return <Navigate to="/tourist" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const TouristRoute = ({ children }) => {
  const { user, isTourist } = useAuth();
  if (!user) return <Navigate to="/tourist/login" replace />;
  if (!isTourist) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tourist/login" element={<TouristLogin />} />
      <Route path="/tourist/register" element={<TouristRegister />} />

      <Route path="/dashboard" element={<AuthorityRoute><DashboardLayout /></AuthorityRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="tourists" element={<Tourists />} />
        <Route path="tourists/:id" element={<TouristDetail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="zones" element={<Zones />} />
        <Route path="efirs" element={<EFIRs />} />
        <Route path="efirs/:id" element={<EFIRDetail />} />
        <Route path="broadcast" element={<Broadcast />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<AuthorityRoute adminOnly><Users /></AuthorityRoute>} />
      </Route>

      <Route path="/tourist" element={<TouristRoute><TouristLayout /></TouristRoute>}>
        <Route index element={<TouristHome />} />
        <Route path="alerts" element={<TouristAlerts />} />
        <Route path="broadcasts" element={<TouristBroadcasts />} />
        <Route path="profile" element={<TouristProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
