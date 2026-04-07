import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Download, X, RefreshCw, FileText } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, [filter]);

  const fetchApplications = async () => {
    try {
      const res = await userAPI.getMyApplications();
      setApplications(res.data.applications);
    } catch { toast.error('Error fetching applications'); }
    finally { setLoading(false); }
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const getStatusStyle = (status) => {
    const m = {
      pending: { bg: 'var(--warning-50)', color: 'var(--warning)', border: 'var(--warning-100)' },
      approved: { bg: 'var(--success-50)', color: 'var(--success)', border: 'var(--success-100)' },
      rejected: { bg: 'var(--danger-50)', color: 'var(--danger)', border: 'var(--danger-100)' },
      expired: { bg: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', border: 'var(--border)' },
    };
    return m[status] || m.expired;
  };

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) return (
    <div className="loading-spinner"><div className="spinner-border text-primary" role="status" /></div>
  );

  return (
    <div className="container-fluid">
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon" style={{ width: 42, height: 42 }}><FileText size={20} /></div>
            My Applications
          </h1>
          <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.875rem' }}>
            Track and manage your pass applications
          </p>
        </div>
        <Link to="/apply-pass" className="btn btn-primary">Apply New Pass</Link>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--text-tertiary)' }}>No applications found</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {filter !== 'all' ? `No ${filter} applications` : 'Start by applying for a bus pass'}
            </p>
            <Link to="/apply-pass" className="btn btn-primary">Apply for Pass</Link>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredApps.map((app, i) => {
            const s = getStatusStyle(app.status);
            return (
              <div key={app._id} className={`col-lg-6 animate-fade-in-up animate-delay-${Math.min(i + 1, 5)}`}>
                <div className="card" style={{ height: '100%' }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h5 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem', fontFamily: 'monospace' }}>
                          {app.applicationId}
                        </h5>
                        <small style={{ color: 'var(--text-muted)' }}>
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <span style={{
                        padding: '4px 12px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      }}>
                        {app.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>Route:</span> <strong>{app.routeId?.routeNumber}</strong></div>
                      <div style={{ color: 'var(--text-secondary)' }}>{app.routeId?.source} → {app.routeId?.destination}</div>
                      <div>
                        <span className="badge bg-primary" style={{ marginRight: '0.375rem' }}>{app.passType}</span>
                        <span className="badge bg-info">{app.duration}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>₹{app.totalAmount}</div>
                    </div>

                    {app.remarks && (
                      <div style={{
                        padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        fontSize: '0.8125rem', marginBottom: '1rem',
                      }}>
                        <strong style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Remarks:</strong>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{app.remarks}</div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {app.status === 'pending' && (
                        <button className="btn btn-sm" style={{
                          background: 'var(--danger-50)', color: 'var(--danger)', border: '1px solid var(--danger-100)',
                        }}>
                          <X size={13} /> Cancel
                        </button>
                      )}
                      {app.status === 'approved' && (
                        <>
                          <Link to="/my-passes" className="btn btn-sm btn-primary">
                            <Download size={13} /> Download Pass
                          </Link>
                          <Link to={`/apply-pass?renew=${app._id}`} className="btn btn-sm btn-outline-primary">
                            <RefreshCw size={13} /> Renew
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
