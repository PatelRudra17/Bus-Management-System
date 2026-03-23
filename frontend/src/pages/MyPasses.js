import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Download, Calendar, RefreshCw, CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const MyPasses = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const res = await userAPI.getMyPasses();
      setPasses(res.data.passes);
    } catch (error) {
      toast.error('Error fetching passes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (passId, passNumber) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${passId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      toast.success('Pass downloaded successfully! 📄');
    } catch (error) {
      toast.error('Error downloading pass');
    }
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

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4 animate-fade-in-up">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="h2 mb-1 d-flex align-items-center gap-3">
                <div className="stat-icon">
                  <CreditCard size={24} />
                </div>
                My Bus Passes
              </h1>
              <p className="text-muted mb-0">Manage and download your active passes</p>
            </div>
            <Link to="/apply-pass" className="btn btn-primary btn-lg">
              <RefreshCw size={20} className="me-2" />
              Apply New Pass
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-stats mb-4">
        <div className="stat-card animate-fade-in-up animate-delay-1">
          <div className="d-flex align-items-center gap-3">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <h2 className="stat-number mb-0">{activeCount}</h2>
              <p className="stat-label mb-0">Active Passes</p>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up animate-delay-2">
          <div className="d-flex align-items-center gap-3">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--warning), #d97706)' }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h2 className="stat-number mb-0">{expiringSoonCount}</h2>
              <p className="stat-label mb-0">Expiring Soon</p>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up animate-delay-3">
          <div className="d-flex align-items-center gap-3">
            <div className="stat-icon">
              <CreditCard size={28} />
            </div>
            <div>
              <h2 className="stat-number mb-0">{passes.length}</h2>
              <p className="stat-label mb-0">Total Passes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card animate-fade-in-up mb-4">
        <div className="card-body p-3">
          <div className="btn-group w-100">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All ({passes.length})
            </button>
            <button 
              className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('active')}
            >
              <CheckCircle size={16} className="me-1" />
              Active ({activeCount})
            </button>
            <button 
              className={`btn ${filter === 'expired' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('expired')}
            >
              <Clock size={16} className="me-1" />
              Expired ({passes.length - activeCount})
            </button>
          </div>
        </div>
      </div>

      {filteredPasses.length === 0 ? (
        <div className="card animate-fade-in-up">
          <div className="card-body text-center py-5">
            <CreditCard size={64} className="text-muted mb-3" />
            <h4 className="text-muted">No passes found</h4>
            <p className="text-muted mb-4">You don't have any {filter !== 'all' ? filter : ''} passes yet.</p>
            <Link to="/apply-pass" className="btn btn-primary btn-lg">
              <RefreshCw size={20} className="me-2" />
              Apply for Pass
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredPasses.map((pass, index) => {
            const expired = isExpired(pass.endDate);
            const days = daysRemaining(pass.endDate);
            const expiringSoon = !expired && days <= 30;

            return (
              <div key={pass._id} className={`col-lg-6 animate-fade-in-up animate-delay-${Math.min(index + 1, 5)}`}>
                <div className={`card h-100 ${expired ? 'opacity-75' : ''}`}>
                  <div className={`card-header d-flex justify-content-between align-items-center ${expired ? 'bg-secondary' : expiringSoon ? 'bg-warning text-dark' : 'bg-gradient'}`}
                       style={!expired && !expiringSoon ? { background: 'linear-gradient(135deg, var(--primary), var(--accent))' } : {}}>
                    <div className="d-flex align-items-center gap-3">
                      <CreditCard size={24} className="text-white" />
                      <div>
                        <h5 className="mb-0 text-white">{pass.passNumber}</h5>
                        <small className="text-white-50">{pass.passType.toUpperCase()} • {pass.duration}</small>
                      </div>
                    </div>
                    <div className="text-end">
                      {expired ? (
                        <span className="badge bg-secondary fs-6">Expired</span>
                      ) : expiringSoon ? (
                        <span className="badge bg-dark fs-6">
                          <Clock size={14} className="me-1" />
                          {days} days left
                        </span>
                      ) : (
                        <span className="badge bg-light text-success fs-6">Active</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-8">
                        <div className="mb-3">
                          <small className="text-muted d-flex align-items-center gap-2">
                            <span className="fw-bold">Route:</span> {pass.routeId?.routeNumber}
                          </small>
                          <p className="mb-0 fw-bold">{pass.routeId?.source} → {pass.routeId?.destination}</p>
                        </div>

                        <div className="d-flex gap-4 mb-3">
                          <div>
                            <small className="text-muted">Valid From</small>
                            <p className="mb-0 fw-semibold">{new Date(pass.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <small className="text-muted">Valid Till</small>
                            <p className={`mb-0 fw-semibold ${expiringSoon ? 'text-warning' : ''}`}>
                              {new Date(pass.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="d-flex gap-3 flex-wrap">
                          <span className="badge bg-primary">{pass.passType}</span>
                          <span className="badge bg-info">{pass.duration}</span>
                          <span className="badge bg-success">₹{pass.totalAmount}</span>
                        </div>
                      </div>
                      
                      <div className="col-4 text-center">
                        {pass.qrCode && (
                          <div className="qr-container p-2">
                            <img 
                              src={pass.qrCode} 
                              alt="QR Code" 
                              style={{ width: '120px', height: '120px', borderRadius: '8px' }}
                              className="mb-2"
                            />
                            <small className="text-muted d-block">Scan to verify</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer border-0">
                    <div className="d-grid gap-2">
                      {!expired && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleDownload(pass._id, pass.passNumber)}
                        >
                          <Download size={18} className="me-2" />
                          Download Pass (PDF)
                        </button>
                      )}
                      <Link 
                        to={`/apply-pass?renew=${pass._id}`} 
                        className={`btn ${expired ? 'btn-primary' : 'btn-outline-primary'}`}
                      >
                        <RefreshCw size={18} className="me-2" />
                        {expired ? 'Reapply' : 'Renew Pass'}
                      </Link>
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

export default MyPasses;
