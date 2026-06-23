import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, MapPin, FileText, AlertTriangle, Shield, Radio, ArrowUpRight } from 'lucide-react';
import API from '../services/api';
import PageHeader from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { StatCard, Badge, Loading, formatDate } from '../components/common/UI';
import LiveMap from '../components/map/LiveMap';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [liveTourists, setLiveTourists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchLive = () => {
      API.get('/tourists/live').then(({ data }) => setLiveTourists(data)).catch(() => {});
    };
    fetchLive();
    const interval = setInterval(fetchLive, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loading text="Loading dashboard..." />;

  const { overview, recentAlerts } = data || {};
  const mapSource = liveTourists.length ? liveTourists : (data?.recentTourists || []);
  const mapMarkers = mapSource.map((t) => ({
    id: t._id, lat: t.currentLocation.latitude, lng: t.currentLocation.longitude,
    name: t.user?.name, info: `${t.safetyStatus} · ${formatDate(t.currentLocation.lastUpdated)}`,
  }));

  return (
    <div>
      <PageHeader
        title="Command Center"
        subtitle="Real-time overview of tourist safety operations"
        breadcrumb="Dashboard / Overview"
      />

      <div className="grid-stats">
        <StatCard icon={Users} value={overview?.totalTourists || 0} label="Total Tourists" color="blue" trend="Active monitoring" />
        <StatCard icon={Bell} value={overview?.pendingAlerts || 0} label="Pending Alerts" color="orange" />
        <StatCard icon={AlertTriangle} value={overview?.criticalAlerts || 0} label="Critical SOS" color="red" />
        <StatCard icon={Shield} value={overview?.safeTourists || 0} label="Safe Tourists" color="green" />
      </div>

      <div className="grid-stats" style={{ marginTop: 0 }}>
        <StatCard icon={MapPin} value={overview?.activeZones || 0} label="Active Zones" color="cyan" />
        <StatCard icon={FileText} value={overview?.totalEFIRs || 0} label="E-FIR Reports" color="purple" />
        <StatCard icon={Radio} value={overview?.broadcastsSent || 0} label="Broadcasts Sent" color="blue" />
        <StatCard icon={AlertTriangle} value={overview?.criticalAlerts || 0} label="Requires Action" color="red" />
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <Panel
          title="Recent Alerts"
          subtitle="Latest pending and resolved alerts"
          actions={<Link to="/dashboard/alerts" className="btn btn-sm btn-outline">View All <ArrowUpRight size={14} /></Link>}
        >
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Tourist</th><th>Type</th><th>Severity</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {(recentAlerts || []).map((a) => (
                  <tr key={a._id}>
                    <td className="cell-primary">{a.tourist?.user?.name || 'Unknown'}</td>
                    <td>{a.alertType}</td>
                    <td><Badge type="severity" value={a.severity} /></td>
                    <td><Badge type="status" value={a.status} /></td>
                    <td className="cell-muted">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
                {(!recentAlerts || recentAlerts.length === 0) && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>No recent alerts</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          title="Live Tourist Map"
          subtitle="Auto-refreshes every 15 seconds"
          actions={<span className="live-badge">Live</span>}
        >
          <div style={{ padding: 16 }}>
            <LiveMap center={mapMarkers.length ? [mapMarkers[0].lat, mapMarkers[0].lng] : [28.6139, 77.209]} zoom={5} markers={mapMarkers} height="280px" />
          </div>
        </Panel>
      </div>

      <Panel title="Recently Active Tourists" subtitle="Live positions · refreshes every 15s" actions={<Link to="/dashboard/tourists" className="btn btn-sm btn-primary">Manage Tourists</Link>}>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Location</th><th>Score</th><th>Status</th><th>Last Seen</th><th></th></tr></thead>
            <tbody>
              {(mapSource).map((t) => (
                <tr key={t._id}>
                  <td className="cell-primary">{t.user?.name}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.currentLocation?.address}</td>
                  <td>{t.safetyScore}/100</td>
                  <td><Badge type="safety" value={t.safetyStatus} /></td>
                  <td className="cell-muted">{formatDate(t.currentLocation?.lastUpdated)}</td>
                  <td><Link to={`/dashboard/tourists/${t._id}`} className="btn btn-sm btn-outline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default Dashboard;
