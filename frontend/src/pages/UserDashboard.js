import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import {
  FileText, CheckCircle, Clock, Download, RefreshCw,
  CreditCard, User, Calendar, MapPin, Ticket, Wallet,
  AlertTriangle, ArrowRight, TrendingUp
} from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import PageTransition from '../components/PageTransition';

const UserDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

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
      const response = await fetch(`http://localhost:5001/api/applications/${passId}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
      toast.success('Pass downloaded!');
    } catch { toast.error('Error downloading pass'); }
  };

  const activePasses = passes.filter(p => new Date(p.endDate) > new Date());
  const pendingApps = applications.filter(a => a.status === 'pending');

  const getStatusStyle = (status) => {
    const styles = {
      approved: { bg: 'var(--success-50)', color: 'var(--success)', border: 'var(--success-100)' },
      pending: { bg: 'var(--warning-50)', color: 'var(--warning)', border: 'var(--warning-100)' },
      rejected: { bg: 'var(--danger-50)', color: 'var(--danger)', border: 'var(--danger-100)' },
    };
    return styles[status] || { bg: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', border: 'var(--border)' };
  };

  if (loading) return (
    <div className="container-fluid">
      <LoadingSkeleton type="profile" />
      <div className="mt-4"><LoadingSkeleton type="stat" count={3} /></div>
    </div>
  );

  return (
    <PageTransition>
      <div className="container-fluid">
        {/* Welcome Header */}
        <div className="profile-header animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
          <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <h2 style={{ marginBottom: '0.25rem', fontSize: '1.375rem' }}>Welcome back, {user?.name}</h2>
          <p style={{ marginBottom: '0.75rem', opacity: 0.8, fontSize: '0.875rem' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
              {user?.phone}
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats stagger-enter" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon"><FileText size={22} /></div>
              <div>
                <h2 className="stat-number">{applications.length}</h2>
                <p className="stat-label">Applications</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--success), var(--success-light))' }}>
                <CheckCircle size={22} />
              </div>
              <div>
                <h2 className="stat-number">{activePasses.length}</h2>
                <p className="stat-label">Active Passes</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--warning), var(--warning-light))' }}>
                <Clock size={22} />
              </div>
              <div>
                <h2 className="stat-number">{pendingApps.length}</h2>
                <p className="stat-label">Pending</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Main Content */}
          <div className="col-lg-8 animate-fade-in-up">
            {/* Active Passes */}
            {activePasses.length > 0 && (
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <CreditCard size={18} /> Active Passes
                  </h5>
                  <Link to="/my-passes" className="btn btn-sm btn-outline-primary">View All</Link>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {activePasses.slice(0, 2).map(pass => {
                      const daysLeft = Math.ceil((new Date(pass.endDate) - new Date()) / (1000*60*60*24));
                      return (
                        <div key={pass._id} className="col-md-6">
                          <div style={{
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                            padding: '1.25rem', borderLeft: '3px solid var(--success)',
                            background: 'var(--bg-primary)', transition: 'all 0.2s',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                                  {pass.passNumber}
                                </div>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                  <span className="badge bg-primary">{pass.passType}</span>
                                  <span className="badge bg-info">{pass.duration}</span>
                                  {daysLeft <= 30 && (
                                    <span className="badge bg-warning">{daysLeft}d left</span>
                                  )}
                                </div>
                              </div>
                              {pass.qrCode && (
                                <img src={pass.qrCode} alt="QR"
                                  style={{ width: 48, height: 48, borderRadius: 6, border: '1px solid var(--border)' }} />
                              )}
                            </div>

                            <div style={{ marginBottom: '0.75rem' }}>
                              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 4px', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                                <MapPin size={13} /> {pass.routeId?.source} → {pass.routeId?.destination}
                              </p>
                              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                                <Calendar size={13} /> {new Date(pass.startDate).toLocaleDateString()} - {new Date(pass.endDate).toLocaleDateString()}
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleDownload(pass._id)}>
                                <Download size={13} /> Download
                              </button>
                              <Link to={`/apply-pass?renew=${pass._id}`} className="btn btn-secondary btn-sm">
                                <RefreshCw size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Applications */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <FileText size={18} /> Recent Applications
                </h5>
                <Link to="/my-applications" className="btn btn-sm btn-primary">View All</Link>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {applications.length === 0 ? (
                  <EmptyState
                    icon="file" title="No Applications Yet"
                    description="Start by applying for your first bus pass"
                    action={() => {}} actionLabel="Apply Now" actionLink="/apply-pass"
                  />
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>Application ID</th>
                          <th>Type</th>
                          <th>Duration</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 5).map(app => {
                          const s = getStatusStyle(app.status);
                          return (
                            <tr key={app._id}>
                              <td>
                                <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                  {app.applicationId}
                                </span>
                              </td>
                              <td><span className="badge bg-primary">{app.passType?.toUpperCase()}</span></td>
                              <td style={{ whiteSpace: 'nowrap' }}>{app.duration}</td>
                              <td style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>
                                {new Date(app.createdAt).toLocaleDateString()}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{
                                  padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                                  background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                                }}>
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4 animate-fade-in-up animate-delay-2">
            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-header">
                <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <TrendingUp size={18} /> Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to="/apply-pass" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                    <FileText size={16} /> Apply for New Pass <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                  <Link to="/book-ticket" className="btn btn-warning" style={{ justifyContent: 'flex-start' }}>
                    <Ticket size={16} /> Book Ticket <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                  <Link to="/apply-smart-card" className="btn" style={{
                    justifyContent: 'flex-start', background: 'var(--info)', color: 'white', border: 'none',
                  }}>
                    <Wallet size={16} /> Apply Smart Card <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                  <Link to="/my-card" className="btn btn-success" style={{ justifyContent: 'flex-start' }}>
                    <CreditCard size={16} /> My Smart Card <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                  <Link to="/report-incident" className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
                    <AlertTriangle size={16} /> Report Incident <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                  <Link to="/profile" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                    <User size={16} /> Edit Profile <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            {user && (
              <div className="card">
                <div className="card-header">
                  <h5 style={{ margin: 0 }}>Profile Info</h5>
                </div>
                <div className="card-body">
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', margin: '0 auto',
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '1.5rem',
                    }}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      ['Name', user.name],
                      ['Email', user.email],
                      ['Phone', user.phone],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 500 }}>{label}</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {value}
                        </span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 500 }}>Role</span>
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
