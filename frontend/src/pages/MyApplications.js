import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Eye, Download, X, RefreshCw } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const res = await userAPI.getMyApplications();
      setApplications(res.data.applications);
    } catch (error) {
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return;
    
    try {
      await userAPI.getApplicationById(id);
      await fetchApplications();
      toast.success('Application cancelled');
    } catch (error) {
      toast.error('Error cancelling application');
    }
  };

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      expired: 'status-expired'
    };
    return classes[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Applications</h2>
        <Link to="/apply-pass" className="btn btn-primary">
          Apply New Pass
        </Link>
      </div>

      <div className="mb-4">
        <div className="btn-group">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button 
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button 
            className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="alert alert-info">No applications found</div>
      ) : (
        <div className="row">
          {filteredApps.map(app => (
            <div key={app._id} className="col-lg-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">{app.applicationId}</h5>
                      <small className="text-muted">
                        Applied on: {new Date(app.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <span className={`status-badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>Route:</strong> {app.routeId?.routeNumber}
                    </p>
                    <p className="mb-1">
                      {app.routeId?.source} → {app.routeId?.destination}
                    </p>
                    <p className="mb-1">
                      <strong>Type:</strong> {app.passType} | <strong>Duration:</strong> {app.duration}
                    </p>
                    <p className="mb-0">
                      <strong>Amount:</strong> ₹{app.totalAmount}
                    </p>
                  </div>

                  {app.remarks && (
                    <div className="alert alert-secondary mb-3">
                      <small><strong>Remarks:</strong> {app.remarks}</small>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    {app.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-outline-danger">
                          <X size={14} className="me-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    {app.status === 'approved' && (
                      <>
                        <Link to={`/my-passes`} className="btn btn-sm btn-primary">
                          <Download size={14} className="me-1" />
                          Download Pass
                        </Link>
                        <Link to={`/apply-pass?renew=${app._id}`} className="btn btn-sm btn-outline-primary">
                          <RefreshCw size={14} className="me-1" />
                          Renew
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
