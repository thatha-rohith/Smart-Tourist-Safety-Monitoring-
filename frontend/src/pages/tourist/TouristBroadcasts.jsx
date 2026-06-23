import { useEffect, useState } from 'react';
import { Radio, AlertTriangle } from 'lucide-react';
import API from '../../services/api';
import { formatDate } from '../../components/common/UI';
import { Panel, EmptyState } from '../../components/common/Panel';
import { Loading } from '../../components/common/UI';

const TouristBroadcasts = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/tourists/me/broadcasts')
      .then(({ data }) => setBroadcasts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Safety Broadcasts</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Emergency warnings and safety notices from police authorities.</p>

      {loading ? <Loading /> : broadcasts.length === 0 ? (
        <EmptyState icon={Radio} title="No broadcasts" description="Safety announcements from authorities will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {broadcasts.map((b) => (
            <div key={b._id} className="tracking-card" style={{ borderLeft: b.isEmergency ? '4px solid var(--danger)' : '4px solid var(--primary-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{b.title}</h3>
                {b.isEmergency && <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><AlertTriangle size={14} /> Emergency</span>}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{b.message}</p>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {b.broadcastType} · {formatDate(b.createdAt)} · From {b.sentBy?.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TouristBroadcasts;
