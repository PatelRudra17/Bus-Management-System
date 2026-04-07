import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FileText, Search, Eye, CheckCircle, XCircle, Download, RefreshCw, User, Calendar } from 'lucide-react';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filter.status]);

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...filter };
      const res = await adminAPI.getApplications(params);
      setApplications(res.data.applications);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      await adminAPI.approveApplication(selectedApp._id, { remarks });
      toast.success('Application approved! ✨');
      setSelectedApp(null);
      setRemarks('');
      fetchApplications(pagination.page);
    } catch (error) {
      toast.error('Error approving application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      await adminAPI.rejectApplication(selectedApp._id, { remarks });
      toast.success('Application rejected');
      setSelectedApp(null);
      setRemarks('');
      fetchApplications(pagination.page);
    } catch (error) {
      toast.error('Error rejecting application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await adminAPI.exportApplications({ ...filter, format });
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('CSV exported! 📊');
      }
    } catch (error) {
      toast.error('Error exporting data');
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4 animate-fade-in-up">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="h2 mb-1 d-flex align-items-center gap-3">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                Application Management
              </h1>
              <p className="text-muted mb-0">Review and manage bus pass applications</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
                <Download size={18} className="me-2" />
                Export
              </button>
              <button className="btn btn-primary" onClick={() => fetchApplications()}>
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4 animate-fade-in-up animate-delay-1">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by ID or pass number..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && fetchApplications()}
                />
                <button className="btn btn-primary" onClick={() => fetchApplications()}>
                  <Search size={18} />
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {applications.map((app, index) => (
              <div key={app._id} className={`col-lg-6 col-xl-4 animate-fade-in-up animate-delay-${Math.min(index + 1, 5)}`}>
                <div className="card h-100">
                  <div className="card-header py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-1">{app.applicationId}</h5>
                        {app.passNumber && (
                          <small className="text-muted">{app.passNumber}</small>
                        )}
                      </div>
                      <span className={`badge status-${app.status}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <User size={16} className="text-muted" />
                        <strong>{app.userId?.name}</strong>
                      </div>
                      <p className="mb-1 text-muted small">{app.userId?.email}</p>
                      <p className="mb-0 text-muted small">{app.userId?.phone}</p>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted">Route</small>
                        <p className="mb-0 fw-semibold">{app.routeId?.routeNumber}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Amount</small>
                        <p className="mb-0 fw-semibold text-success">₹{app.totalAmount}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Type</small>
                        <p className="mb-0 fw-semibold">{app.passType}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Duration</small>
                        <p className="mb-0 fw-semibold">{app.duration}</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <Calendar size={14} />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="card-footer border-0">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye size={14} className="me-1" />
                        Review
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => { setSelectedApp(app); setFilter({ ...filter, status: 'approved' }); }}
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => { setSelectedApp(app); setFilter({ ...filter, status: 'rejected' }); }}
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => fetchApplications(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}

      {selectedApp && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FileText size={24} />
                  Application Details
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setSelectedApp(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <h6 className="text-muted mb-3">Application Info</h6>
                      <p className="mb-2"><strong>ID:</strong> {selectedApp.applicationId}</p>
                      <p className="mb-2"><strong>Pass:</strong> {selectedApp.passNumber || 'Pending'}</p>
                      <p className="mb-2"><strong>Status:</strong> <span className={`badge status-${selectedApp.status}`}>{selectedApp.status}</span></p>
                      <p className="mb-0"><strong>Amount:</strong> ₹{selectedApp.totalAmount}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <h6 className="text-muted mb-3">User Info</h6>
                      <p className="mb-2"><strong>Name:</strong> {selectedApp.userId?.name}</p>
                      <p className="mb-2"><strong>Email:</strong> {selectedApp.userId?.email}</p>
                      <p className="mb-0"><strong>Phone:</strong> {selectedApp.userId?.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-md-4">
                    <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <small className="text-muted">Route</small>
                      <p className="mb-0 fw-bold">{selectedApp.routeId?.routeNumber}</p>
                      <small className="text-muted">{selectedApp.routeId?.source} → {selectedApp.routeId?.destination}</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <small className="text-muted">Type</small>
                      <p className="mb-0 fw-bold">{selectedApp.passType}</p>
                      <small className="text-muted">{selectedApp.duration}</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <small className="text-muted">Applied</small>
                      <p className="mb-0 fw-bold">{new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedApp.documents && (
                  <div className="mt-4">
                    <h6 className="text-muted mb-3">Documents</h6>
                    <div className="row g-3">
                      {selectedApp.documents.idProof && (
                        <div className="col-md-6">
                          <p className="mb-2 fw-semibold">ID Proof</p>
                          <img 
                            src={selectedApp.documents.idProof} 
                            alt="ID" 
                            className="img-thumbnail"
                            style={{ maxWidth: '200px', borderRadius: '12px' }}
                          />
                        </div>
                      )}
                      {selectedApp.documents.photo && (
                        <div className="col-md-6">
                          <p className="mb-2 fw-semibold">Photo</p>
                          <img
                            src={selectedApp.documents.photo}
                            alt="User"
                            style={{ maxWidth: '150px', borderRadius: '12px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedApp.status === 'pending' && (
                  <div className="mt-4">
                    <label className="form-label">Remarks (optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add remarks for approval/rejection..."
                    />
                  </div>
                )}

                {selectedApp.remarks && (
                  <div className="alert alert-info mt-4">
                    <strong>Admin Remarks:</strong> {selectedApp.remarks}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                  Close
                </button>
                {selectedApp.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-danger" 
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <XCircle size={18} className="me-2" />
                      Reject
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" />
                      ) : (
                        <CheckCircle size={18} className="me-2" />
                      )}
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
