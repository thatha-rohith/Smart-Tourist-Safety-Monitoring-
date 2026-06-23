import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import API from '../../services/api';
import { Badge, Loading, formatDate } from '../../components/common/UI';
import { Panel, EmptyState } from '../../components/common/Panel';

const TouristAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/tourists/me/alerts')
      .then(({ data }) => setAlerts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>My Alerts</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Alerts generated from your account and location activity.</p>

      <Panel title="Alert History">
        {loading ? <Loading /> : alerts.length === 0 ? (
          <EmptyState icon={Bell} title="No alerts yet" description="Alerts appear here when SOS is triggered or you enter a restricted zone." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Type</th><th>Severity</th><th>Location</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a._id}>
                    <td className="cell-primary">{a.alertType}</td>
                    <td><Badge type="severity" value={a.severity} /></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.location?.address}</td>
                    <td><Badge type="status" value={a.status} /></td>
                    <td className="cell-muted">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default TouristAlerts;
