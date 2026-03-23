import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Users, FileText, CreditCard, Route, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PageTransition from '../components/PageTransition';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/analytics');
    } else {
      navigate('/user-dashboard');
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await adminAPI.getDashboardStats();
      setStats(res.data.stats);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <LoadingSkeleton type="stat" count={4} />
        <div className="row mt-4">
          <div className="col-lg-8">
            <LoadingSkeleton type="card" />
          </div>
          <div className="col-lg-4">
            <LoadingSkeleton type="card" />
          </div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Revenue (₹)',
      data: stats?.charts?.revenueByMonth?.map(item => item.revenue) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1,
      borderRadius: 8,
      hoverBackgroundColor: 'rgba(99, 102, 241, 1)'
    }]
  };

  const statusChartData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Expired'],
    datasets: [{
      data: [
        stats?.applications?.approved || 0,
        stats?.applications?.pending || 0,
        stats?.applications?.rejected || 0,
        stats?.applications?.expired || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  return (
    <PageTransition>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col">
            <h2 className="animate-fade-in-up">Admin Dashboard</h2>
            <p className="text-muted animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Welcome back, {user?.name}! Here's what's happening.
            </p>
          </div>
        </div>

        <div className="dashboard-stats stagger-enter">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div className="mt-3">
              <h3 className="stat-number">{stats?.users?.total || 0}</h3>
              <p className="stat-label">Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--warning), #d97706)' }}>
              <Clock size={28} />
            </div>
            <div className="mt-3">
              <h3 className="stat-number">{stats?.applications?.pending || 0}</h3>
              <p className="stat-label">Pending Applications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}>
              <CheckCircle size={28} />
            </div>
            <div className="mt-3">
              <h3 className="stat-number">{stats?.applications?.approved || 0}</h3>
              <p className="stat-label">Approved Passes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--accent), #0891b2)' }}>
              <CreditCard size={28} />
            </div>
            <div className="mt-3">
              <h3 className="stat-number">₹{(stats?.revenue?.total || 0).toLocaleString()}</h3>
              <p className="stat-label">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="card-body">
                <h5 className="card-title mb-4 d-flex align-items-center gap-2">
                  <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                  Revenue Overview
                </h5>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="card-body">
                <h5 className="card-title mb-4 d-flex align-items-center gap-2">
                  <FileText size={20} style={{ color: 'var(--accent)' }} />
                  Application Status
                </h5>
                <Doughnut 
                  data={statusChartData} 
                  options={{ 
                    responsive: true,
                    cutout: '65%',
                    plugins: { 
                      legend: { 
                        position: 'bottom',
                        labels: { color: '#9ca3af', padding: 20 }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="card-body">
                <h5 className="card-title mb-4 d-flex align-items-center gap-2">
                  <Clock size={20} style={{ color: 'var(--secondary)' }} />
                  Recent Applications
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Application ID</th>
                        <th>User</th>
                        <th>Route</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentApplications?.length > 0 ? (
                        stats.recentApplications.map(app => (
                          <tr key={app._id}>
                            <td><strong style={{ color: 'var(--primary)' }}>{app.applicationId}</strong></td>
                            <td>{app.userId?.name}</td>
                            <td>{app.routeId?.routeNumber}</td>
                            <td>
                              <span className={`badge ${
                                app.status === 'approved' ? 'bg-success' :
                                app.status === 'pending' ? 'bg-warning' :
                                app.status === 'rejected' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td>₹{app.totalAmount}</td>
                            <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-4">
                            No recent applications
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Link to="/admin/applications" className="btn btn-primary mt-3">
                  View All Applications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
