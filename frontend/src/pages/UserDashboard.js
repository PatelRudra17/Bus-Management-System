import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FileText, CheckCircle, Clock, Download, RefreshCw, CreditCard, User, Calendar, MapPin, Ticket } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import PageTransition from '../components/PageTransition';

const UserDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, passesRes] = await Promise.all([
        userAPI.getMyApplications(),
        userAPI.getMyPasses()
      ]);
      setApplications(appsRes.data.applications);
      setPasses(passesRes.data.passes);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (passId) => {
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
      a.download = `BusPass_${passId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Pass downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading pass');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-success" size={20} />;
      case 'pending': return <Clock className="text-warning" size={20} />;
      case 'rejected': return <span className="text-danger" style={{ fontSize: '20px' }}>✕</span>;
      default: return <Clock className="text-muted" size={20} />;
    }
  };

  const activePasses = passes.filter(p => new Date(p.endDate) > new Date());
  const pendingApps = applications.filter(a => a.status === 'pending');

  if (loading) {
    return (
      <div className="container-fluid">
        <LoadingSkeleton type="profile" />
        <div className="mt-4">
          <LoadingSkeleton type="stat" count={3} />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container-fluid">
        <div className="profile-header animate-fade-in-up">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="mb-2">{user?.name}</h2>
          <p className="mb-2 opacity-75">{user?.email}</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>{user?.phone}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="dashboard-stats stagger-enter">
          <div className="stat-card">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon">
                <FileText size={28} />
              </div>
              <div>
                <h2 className="stat-number mb-0">{applications.length}</h2>
                <p className="stat-label mb-0">Total Applications</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}>
                <CheckCircle size={28} />
              </div>
              <div>
                <h2 className="stat-number mb-0">{activePasses.length}</h2>
                <p className="stat-label mb-0">Active Passes</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--warning), #d97706)' }}>
                <Clock size={28} />
              </div>
              <div>
                <h2 className="stat-number mb-0">{pendingApps.length}</h2>
                <p className="stat-label mb-0">Pending</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
        <div className="col-lg-8 animate-fade-in-up">
          {activePasses.length > 0 && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <CreditCard size={20} />
                  Your Active Passes
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {activePasses.map(pass => (
                    <div key={pass._id} className="col-md-6">
                      <div className="application-card mb-0" style={{ borderLeftColor: 'var(--success)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="mb-1 d-flex align-items-center gap-2">
                              <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                              <strong>{pass.passNumber}</strong>
                            </h5>
                            <div className="d-flex gap-2 flex-wrap">
                              <span className="badge bg-primary">{pass.passType}</span>
                              <span className="badge bg-info">{pass.duration}</span>
                              {new Date(pass.endDate) < new Date(Date.now() + 30*24*60*60*1000) && (
                                <span className="badge bg-warning text-dark">
                                  {Math.ceil((new Date(pass.endDate) - new Date()) / (1000*60*60*24))} days left
                                </span>
                              )}
                            </div>
                          </div>
                          {pass.qrCode && (
                            <img 
                              src={pass.qrCode} 
                              alt="QR" 
                              style={{ width: '60px', height: '60px', borderRadius: '8px' }}
                            />
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <p className="mb-1 d-flex align-items-center gap-2 text-muted">
                            <MapPin size={14} />
                            {pass.routeId?.source} → {pass.routeId?.destination}
                          </p>
                          <p className="mb-0 d-flex align-items-center gap-2 text-muted">
                            <Calendar size={14} />
                            {new Date(pass.startDate).toLocaleDateString()} - {new Date(pass.endDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-primary btn-sm flex-grow-1"
                            onClick={() => handleDownload(pass._id)}
                          >
                            <Download size={14} className="me-1" />
                            Download
                          </button>
                          <Link 
                            to={`/apply-pass?renew=${pass._id}`} 
                            className="btn btn-outline-primary btn-sm"
                          >
                            <RefreshCw size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FileText size={20} />
                Recent Applications
              </h5>
              <Link to="/my-applications" className="btn btn-sm btn-primary">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              {applications.length === 0 ? (
                <EmptyState 
                  icon="file"
                  title="No Applications Yet"
                  description="Start by applying for your first bus pass"
                  action={() => {}}
                  actionLabel="Apply Now"
                  actionLink="/apply-pass"
                />
              ) : (
                <div className="px-3 pb-3">
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                    <thead>
                      <tr>
                        <th style={{ color: 'var(--text3)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application ID</th>
                        <th style={{ color: 'var(--text3)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                        <th style={{ color: 'var(--text3)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
                        <th style={{ color: 'var(--text3)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                        <th style={{ color: 'var(--text3)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map(app => (
                        <tr key={app._id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                          <td style={{ padding: '10px', borderRadius: '10px 0 0 10px', border: '1px solid rgba(255,255,255,0.07)', borderRight: 'none' }}>
                            <div className="d-flex align-items-center gap-2">
                              {getStatusIcon(app.status)}
                              <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                                {app.applicationId}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.07)', borderLeft: 'none', borderRight: 'none' }}>
                            <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.7rem' }}>
                              {app.passType?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.07)', borderLeft: 'none', borderRight: 'none', color: 'var(--text2)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            {app.duration}
                          </td>
                          <td style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.07)', borderLeft: 'none', borderRight: 'none', color: 'var(--text3)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px', borderRadius: '0 10px 10px 0', border: '1px solid rgba(255,255,255,0.07)', borderLeft: 'none', textAlign: 'right' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                              background: app.status === 'approved' ? 'rgba(16,185,129,0.15)' : app.status === 'pending' ? 'rgba(245,158,11,0.15)' : app.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)',
                              color: app.status === 'approved' ? '#34d399' : app.status === 'pending' ? '#fbbf24' : app.status === 'rejected' ? '#f87171' : '#9ca3af',
                              border: `1px solid ${app.status === 'approved' ? 'rgba(16,185,129,0.3)' : app.status === 'pending' ? 'rgba(245,158,11,0.3)' : app.status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(107,114,128,0.3)'}`,
                            }}>
                              {app.status?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 animate-fade-in-up animate-delay-2">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <User size={20} />
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                <Link to="/apply-pass" className="btn btn-primary btn-lg">
                  <FileText size={20} className="me-2" />
                  Apply for New Pass
                </Link>
                <Link to="/book-ticket" className="btn btn-warning">
                  <Ticket size={18} className="me-2" />
                  Book Ticket
                </Link>
                <Link to="/my-applications" className="btn btn-secondary">
                  <Clock size={18} className="me-2" />
                  View Applications
                </Link>
                <Link to="/my-passes" className="btn btn-secondary">
                  <CreditCard size={18} className="me-2" />
                  My Passes
                </Link>
                <Link to="/profile" className="btn btn-outline-primary">
                  <User size={18} className="me-2" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {user && (
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">Profile Info</h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <div className="profile-avatar mx-auto" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between">
                    <span style={{ color: '#94a3b8' }}>Name</span>
                    <strong style={{ color: '#f8fafc' }}>{user.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: '#94a3b8' }}>Email</span>
                    <strong className="text-truncate" style={{ maxWidth: '150px', color: '#f8fafc' }}>{user.email}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: '#94a3b8' }}>Phone</span>
                    <strong style={{ color: '#f8fafc' }}>{user.phone}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: '#94a3b8' }}>Role</span>
                    <span className="badge bg-primary">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default UserDashboard;
