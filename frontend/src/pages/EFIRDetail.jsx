import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, Pencil, XCircle } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import { Panel } from '../components/common/Panel';
import { Badge, Loading, formatDate } from '../components/common/UI';

const EFIRDetail = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const [efir, setEfir] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});

  const load = () => {
    Promise.all([API.get(`/efirs/${id}`), API.get('/users/officers')])
      .then(([e, o]) => { setEfir(e.data); setOfficers(o.data); setForm({
        incidentType: e.data.incidentType, severity: e.data.severity, description: e.data.description,
        status: e.data.status, responseAction: e.data.responseAction, assignedOfficer: e.data.assignedOfficer?._id || '',
        location: e.data.location || { address: '' },
      }); })
      .catch(() => addToast('Failed to load E-FIR', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleVerify = async () => {
    const { data } = await API.put(`/efirs/${id}/verify`);
    setEfir(data);
    addToast('E-FIR verified');
  };

  const handleClose = async () => {
    const { data } = await API.put(`/efirs/${id}/close`, { responseAction: 'Case closed by officer' });
    setEfir(data);
    addToast('Case closed');
  };

  const handleDownload = async () => {
    const { data } = await API.get(`/efirs/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${efir.efirNumber.replace(/\//g, '-')}.txt`;
    a.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/efirs/${id}`, form);
      setEfir(data);
      setEditOpen(false);
      addToast('E-FIR updated');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <Loading />;
  if (!efir) return <div>E-FIR not found</div>;

  return (
    <div>
      <Link to="/dashboard/efirs" className="btn btn-outline btn-sm" style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to E-FIRs
      </Link>

      <PageHeader
        title={efir.efirNumber}
        subtitle="Electronic First Information Report"
        breadcrumb={`Operations / E-FIRs / ${efir.efirNumber}`}
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setEditOpen(true)}><Pencil size={14} /> Edit</button>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}><Download size={14} /> Download</button>
            {efir.status === 'Pending' && <button className="btn btn-success btn-sm" onClick={handleVerify}><CheckCircle size={14} /> Verify</button>}
            {efir.status !== 'Closed' && <button className="btn btn-outline btn-sm" onClick={handleClose}><XCircle size={14} /> Close Case</button>}
          </>
        }
      />

      <div className="grid-stats grid-stats-3" style={{ marginBottom: 24 }}>
        <div className="stat-card-pro"><div><div className="detail-label">Status</div><Badge type="status" value={efir.status} /></div></div>
        <div className="stat-card-pro"><div><div className="detail-label">Report Date</div><div className="detail-value">{formatDate(efir.createdAt)}</div></div></div>
        <div className="stat-card-pro"><div><div className="detail-label">Response</div><div className="detail-value">{efir.responseAction}</div></div></div>
      </div>

      <div className="grid-2">
        <Panel title="Incident Details">
          <div className="detail-card detail-grid">
            <div className="detail-item"><div className="detail-label">Incident Type</div><div className="detail-value">{efir.incidentType}</div></div>
            <div className="detail-item"><div className="detail-label">Severity</div><Badge type="severity" value={efir.severity} /></div>
            <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{efir.location?.address}</div></div>
            <div className="detail-item"><div className="detail-label">Date & Time</div><div className="detail-value">{formatDate(efir.incidentDate)}</div></div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Description</div><div className="detail-value">{efir.description}</div></div>
          </div>
        </Panel>

        <Panel title="Tourist & Report Info">
          <div className="detail-card detail-grid">
            <div className="detail-item"><div className="detail-label">Tourist Name</div><div className="detail-value">{efir.tourist?.user?.name}</div></div>
            <div className="detail-item"><div className="detail-label">Tourist ID</div><div className="detail-value">{efir.tourist?.touristId}</div></div>
            <div className="detail-item"><div className="detail-label">Email</div><div className="detail-value">{efir.tourist?.user?.email}</div></div>
            <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{efir.tourist?.user?.phone}</div></div>
            <div className="detail-item"><div className="detail-label">Assigned Officer</div><div className="detail-value">{efir.assignedOfficer?.name || 'Unassigned'}</div></div>
            <div className="detail-item"><div className="detail-label">Source</div><div className="detail-value">{efir.source}</div></div>
            {efir.verifiedBy && <div className="detail-item"><div className="detail-label">Verified By</div><div className="detail-value">{efir.verifiedBy.name} — {formatDate(efir.verifiedAt)}</div></div>}
          </div>
        </Panel>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit E-FIR"
        footer={<><button className="btn btn-outline" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save Changes</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Incident Type</label>
              <select className="form-select" value={form.incidentType} onChange={(e) => setForm({ ...form, incidentType: e.target.value })}>
                {['Theft', 'Assault', 'Medical Emergency', 'Accident', 'Other'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Severity</label>
              <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {['Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Assigned Officer</label>
            <select className="form-select" value={form.assignedOfficer} onChange={(e) => setForm({ ...form, assignedOfficer: e.target.value })}>
              <option value="">Unassigned</option>
              {officers.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Pending</option><option>Verified</option><option>Closed</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Response Action</label><input className="form-input" value={form.responseAction || ''} onChange={(e) => setForm({ ...form, responseAction: e.target.value })} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default EFIRDetail;
