import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Download, RefreshCw, CreditCard, Clock, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

const MyPasses = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchPasses(); }, []);

  const fetchPasses = async () => {
    try {
      const res = await userAPI.getMyPasses();
      setPasses(res.data.passes);
    } catch { toast.error('Error fetching passes'); }
    finally { setLoading(false); }
  };

  const handleDownload = async (passId, passNumber) => {
    try {
      const response = await fetch(`http://localhost:5001/api/applications/${passId}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BusPass_${passNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Pass downloaded successfully!');
    } catch { toast.error('Error downloading pass'); }
  };

  const isExpired = (endDate) => new Date(endDate) < new Date();
  const daysRemaining = (endDate) => Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));

  const filteredPasses = passes.filter(pass => {
    if (filter === 'all') return true;
    if (filter === 'active') return !isExpired(pass.endDate);
    if (filter === 'expired') return isExpired(pass.endDate);
    return true;
  });

  const activeCount = passes.filter(p => !isExpired(p.endDate)).length;
  const expiringSoonCount = passes.filter(p => !isExpired(p.endDate) && daysRemaining(p.endDate) <= 30).length;

  if (loading) return (
    <div className="loading-spinner"><div className="spinner-border text-primary" role="status" /></div>
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon" style={{ width: 42, height: 42 }}><CreditCard size={20} /></div>
            My Bus Passes
          </h1>
          <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.875rem' }}>
            Manage and download your active passes
          </p>
        </div>
        <Link to="/apply-pass" className="btn btn-primary">Apply New Pass</Link>
      </div>

      {/* Stats */}
      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
        {[
          { label: 'Active Passes', value: activeCount, icon: CheckCircle, bg: 'linear-gradient(135deg, var(--success), var(--success-light))' },
          { label: 'Expiring Soon', value: expiringSoonCount, icon: AlertTriangle, bg: 'linear-gradient(135deg, var(--warning), var(--warning-light))' },
          { label: 'Total Passes', value: passes.length, icon: CreditCard },
        ].map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={bg ? { background: bg } : {}}><Icon size={22} /></div>
              <div>
                <h2 className="stat-number">{value}</h2>
                <p className="stat-label">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'all', label: `All (${passes.length})` },
          { key: 'active', label: `Active (${activeCount})`, icon: CheckCircle },
          { key: 'expired', label: `Expired (${passes.length - activeCount})`, icon: Clock },
        ].map(f => (
          <button key={f.key} className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.key)}>
            {f.icon && <f.icon size={13} />} {f.label}
          </button>
        ))}
      </div>

      {filteredPasses.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <CreditCard size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--text-tertiary)' }}>No passes found</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              You don't have any {filter !== 'all' ? filter : ''} passes yet.
            </p>
            <Link to="/apply-pass" className="btn btn-primary">Apply for Pass</Link>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredPasses.map((pass, index) => {
            const expired = isExpired(pass.endDate);
            const days = daysRemaining(pass.endDate);
            const expiringSoon = !expired && days <= 30;

            return (
              <div key={pass._id} className={`col-lg-6 animate-fade-in-up animate-delay-${Math.min(index + 1, 5)}`}>
                <div className="card" style={{ height: '100%', opacity: expired ? 0.7 : 1 }}>
                  {/* Card Header with gradient */}
                  <div style={{
                    padding: '1rem 1.5rem',
                    background: expired ? 'var(--bg-tertiary)' : expiringSoon ? 'var(--warning-50)' : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: expired || expiringSoon ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CreditCard size={20} style={{ color: expired ? 'var(--text-tertiary)' : expiringSoon ? 'var(--warning)' : 'white' }} />
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: expired ? 'var(--text-tertiary) !important' : expiringSoon ? 'var(--text-primary) !important' : 'white !important' }}>
                          {pass.passNumber}
                        </h5>
                        <small style={{ color: expired ? 'var(--text-muted)' : expiringSoon ? 'var(--text-tertiary)' : 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          {pass.passType} - {pass.duration}
                        </small>
                      </div>
                    </div>
                    {expired ? (
                      <span className="badge" style={{ background: 'var(--bg-body)', color: 'var(--text-muted)' }}>Expired</span>
                    ) : expiringSoon ? (
                      <span className="badge bg-warning"><Clock size={11} /> {days}d left</span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Active</span>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="row g-3">
                      <div className={pass.qrCode ? 'col-8' : 'col-12'}>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                            <MapPin size={12} /> Route: {pass.routeId?.routeNumber}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {pass.routeId?.source} → {pass.routeId?.destination}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 600 }}>Valid From</small>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{new Date(pass.startDate).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 600 }}>Valid Till</small>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: expiringSoon ? 'var(--warning)' : 'inherit' }}>
                              {new Date(pass.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <span className="badge bg-primary">{pass.passType}</span>
                          <span className="badge bg-info">{pass.duration}</span>
                          <span className="badge bg-success">₹{pass.totalAmount}</span>
                        </div>
                      </div>

                      {pass.qrCode && (
                        <div className="col-4" style={{ textAlign: 'center' }}>
                          <img src={pass.qrCode} alt="QR Code"
                            style={{ width: '100%', maxWidth: 100, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.375rem', fontSize: '0.6875rem' }}>
                            Scan to verify
                          </small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem 1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {!expired && (
                      <button className="btn btn-primary w-100" onClick={() => handleDownload(pass._id, pass.passNumber)}>
                        <Download size={16} /> Download Pass (PDF)
                      </button>
                    )}
                    <Link to={`/apply-pass?renew=${pass._id}`} className={`btn w-100 ${expired ? 'btn-primary' : 'btn-outline-primary'}`}>
                      <RefreshCw size={16} /> {expired ? 'Reapply' : 'Renew Pass'}
                    </Link>
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

export default MyPasses;
