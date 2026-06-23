const getBadgeClass = (type, value) => {
  const map = {
    severity: { Critical: 'badge-critical', High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' },
    status: { Pending: 'badge-pending', Resolved: 'badge-resolved', Verified: 'badge-verified', Closed: 'badge-verified', Active: 'badge-active', Inactive: 'badge-inactive', Sent: 'badge-verified', Failed: 'badge-critical' },
    safety: { Safe: 'badge-safe', 'At Risk': 'badge-risk', Unsafe: 'badge-unsafe', Critical: 'badge-critical' },
    zone: { Restricted: 'badge-restricted', Risky: 'badge-risky', Safe: 'badge-safe' },
    role: { admin: 'badge-verified', authority: 'badge-medium', tourist: 'badge-low' },
  };
  return map[type]?.[value] || 'badge-low';
};

export const Badge = ({ type, value }) => (
  <span className={`badge ${getBadgeClass(type, value)}`}>{value}</span>
);

export const StatCard = ({ icon: Icon, value, label, color = 'blue', trend }) => (
  <div className="stat-card-pro">
    <div className={`stat-icon ${color}`}><Icon size={22} /></div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  </div>
);

export const Loading = ({ text = 'Loading data...' }) => (
  <div className="loading-spinner">
    <div className="spinner" />
    <span>{text}</span>
  </div>
);

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const getScoreClass = (status) => {
  if (status === 'Critical') return 'critical';
  if (status === 'Unsafe') return 'unsafe';
  if (status === 'At Risk') return 'at-risk';
  return '';
};
