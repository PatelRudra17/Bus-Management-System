import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { CreditCard, RefreshCw, RotateCcw, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchData(); }, [statusFilter]);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        paymentAPI.getAll({ page, limit: 15, status: statusFilter }),
        paymentAPI.getStats()
      ]);
      setPayments(pRes.data.payments);
      setPagination(pRes.data.pagination);
      setStats(sRes.data);
    } catch { toast.error('Error fetching payments'); }
    finally { setLoading(false); }
  };

  const handleRefund = async (id) => {
    const reason = window.prompt('Enter refund reason:');
    if (!reason) return;
    try {
      await paymentAPI.refund(id, { reason });
      toast.success('Payment refunded');
      fetchData(pagination.page);
    } catch { toast.error('Error processing refund'); }
  };

  const successStats = stats?.stats?.find(s => s._id === 'success');
  const refundedStats = stats?.stats?.find(s => s._id === 'refunded');

  const statusStyle = {
    success:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', border: 'rgba(16,185,129,0.3)' },
    pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    failed:   { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    refunded: { bg: 'rgba(6,182,212,0.15)',   color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-in-up">
        <div>
          <h2 className="d-flex align-items-center gap-3 mb-1">
            <div className="stat-icon" style={{ width: 46, height: 46 }}><CreditCard size={22} /></div>
            Payment Management
          </h2>
          <p className="text-muted mb-0">Track and manage all transactions</p>
        </div>
        <button className="btn btn-secondary" onClick={() => fetchData()}><RefreshCw size={16} /></button>
      </div>

      {/* Stats */}
      <div className="dashboard-stats mb-4 animate-fade-in-up animate-delay-1">
        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Total Revenue</p>
              <h2 className="stat-number">₹{(successStats?.total || 0).toLocaleString()}</h2>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,var(--success),#059669)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Successful</p>
              <h2 className="stat-number">{successStats?.count || 0}</h2>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))' }}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Refunded</p>
              <h2 className="stat-number">{refundedStats?.count || 0}</h2>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,var(--accent),#0891b2)' }}>
              <RotateCcw size={24} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Refund Amount</p>
              <h2 className="stat-number">₹{(refundedStats?.total || 0).toLocaleString()}</h2>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,var(--danger),#b91c1c)' }}>
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="p-3 mb-4 animate-fade-in-up animate-delay-2"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
        <div className="row g-3">
          <div className="col-md-3">
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          <div className="table-responsive animate-fade-in-up animate-delay-3">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Application</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4" style={{ color: 'var(--text3)' }}>No payments found</td></tr>
                ) : payments.map(p => {
                  const s = statusStyle[p.paymentStatus] || statusStyle.pending;
                  return (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--primary-light)', fontSize: '0.82rem' }}>
                        {p.transactionId?.slice(0, 16)}...
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.userId?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{p.userId?.email}</div>
                      </td>
                      <td style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                        {p.applicationId?.applicationId || <span style={{ color: 'var(--text3)' }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{p.amount}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text2)', border: '1px solid rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {p.paymentStatus === 'success' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleRefund(p._id)}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                            <RotateCcw size={12} className="me-1" />Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4 gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} onClick={() => fetchData(i + 1)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: pagination.page === i + 1 ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                    color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPayments;
