import React, { useState, useEffect } from 'react';
import { verificationAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Activity, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const VerificationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await verificationAPI.getHistory();
      setHistory(res.data.history);
    } catch (error) {
      toast.error('Error fetching verification history');
    } finally {
      setLoading(false);
    }
  };

  const totalVerifications = history.reduce((sum, h) => sum + h.verificationCount, 0);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <Activity size={28} className="me-2" />
            Verification History
          </h2>
        </div>
      </div>

      <div className="dashboard-stats mb-4">
        <div className="stat-card" style={{ borderLeft: '4px solid #3182ce' }}>
          <div className="d-flex align-items-center">
            <CheckCircle size={40} className="me-3" style={{ color: '#3182ce' }} />
            <div>
              <h3 className="mb-0">{totalVerifications}</h3>
              <p className="text-muted mb-0">Total Verifications</p>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #38a169' }}>
          <div className="d-flex align-items-center">
            <TrendingUp size={40} className="me-3" style={{ color: '#38a169' }} />
            <div>
              <h3 className="mb-0">{history.length}</h3>
              <p className="text-muted mb-0">Passes Verified</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Pass Number</th>
                  <th>User Name</th>
                  <th>Total Verifications</th>
                  <th>Last Verified</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.passNumber}</strong></td>
                    <td>{item.userName}</td>
                    <td>
                      <span className="badge bg-primary">{item.verificationCount}</span>
                    </td>
                    <td>
                      {item.lastVerified ? (
                        <span className="text-muted">
                          <Clock size={14} className="me-1" />
                          {new Date(item.lastVerified).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted">Never</span>
                      )}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      No verification history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationHistory;
