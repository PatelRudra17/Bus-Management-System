import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { toast } from 'react-toastify';
import {
  Users, FileText, TrendingUp, Clock, CheckCircle,
  RefreshCw, DollarSign, BarChart3, Eye, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
  PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
  PointElement, LineElement, Filler
);

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchDashboardData(); }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await adminAPI.getDashboardStats();
      setStats(res.data.stats);
    } catch { toast.error('Error fetching dashboard data'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );

  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const revenueData = stats?.charts?.revenueByMonth?.reduce((acc, item) => {
    acc[item._id - 1] = item.revenue;
    return acc;
  }, new Array(12).fill(0)) || new Array(12).fill(0);

  const applicationsData = {
    labels: monthlyLabels,
    datasets: [
      { label: 'Approved', data: stats?.charts?.monthlyStats?.filter(s => s._id.status === 'approved').map(s => s.count) || [], backgroundColor: '#10b981', borderColor: '#059669', borderWidth: 1, borderRadius: 6 },
      { label: 'Pending', data: stats?.charts?.monthlyStats?.filter(s => s._id.status === 'pending').map(s => s.count) || [], backgroundColor: '#f59e0b', borderColor: '#d97706', borderWidth: 1, borderRadius: 6 },
      { label: 'Rejected', data: stats?.charts?.monthlyStats?.filter(s => s._id.status === 'rejected').map(s => s.count) || [], backgroundColor: '#ef4444', borderColor: '#dc2626', borderWidth: 1, borderRadius: 6 },
    ]
  };

  const revenueChartData = {
    labels: monthlyLabels,
    datasets: [{
      label: 'Revenue',
      data: revenueData,
      fill: true,
      backgroundColor: 'rgba(12, 74, 110, 0.08)',
      borderColor: '#0c4a6e',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: '#0c4a6e',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const passTypeData = {
    labels: ['Student', 'Senior', 'General', 'Disabled'],
    datasets: [{
      data: [
        stats?.charts?.passTypeStats?.find(s => s._id === 'student')?.count || 0,
        stats?.charts?.passTypeStats?.find(s => s._id === 'senior')?.count || 0,
        stats?.charts?.passTypeStats?.find(s => s._id === 'general')?.count || 0,
        stats?.charts?.passTypeStats?.find(s => s._id === 'disabled')?.count || 0
      ],
      backgroundColor: ['#0c4a6e', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 6
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
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b',
          padding: 16,
          font: { size: 11, weight: '500', family: 'Inter' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  const getStatusStyle = (status) => {
    const m = {
      approved: { bg: 'var(--success-50)', color: 'var(--success)', border: 'var(--success-100)' },
      pending: { bg: 'var(--warning-50)', color: 'var(--warning)', border: 'var(--warning-100)' },
      rejected: { bg: 'var(--danger-50)', color: 'var(--danger)', border: 'var(--danger-100)' },
      expired: { bg: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', border: 'var(--border)' },
    };
    return m[status] || m.expired;
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="stat-icon" style={{ width: 42, height: 42 }}>
                <BarChart3 size={20} />
              </div>
              Analytics Dashboard
            </h1>
            <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.875rem' }}>
              Welcome back, {user?.name}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select className="form-select" value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ width: 'auto', padding: '6px 32px 6px 12px', fontSize: '0.8125rem' }}>
              <option value="daily">Today</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
            <button className="btn btn-secondary btn-icon" onClick={fetchDashboardData} disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats stagger-enter">
        {[
          { label: 'Total Users', value: stats?.users?.total || 0, icon: Users, trend: '+12% this month', trendDir: 'up' },
          { label: 'Pending', value: stats?.applications?.pending || 0, icon: Clock, trend: 'Needs attention', trendDir: 'down', iconBg: 'linear-gradient(135deg, var(--warning), var(--warning-light))' },
          { label: 'Approved', value: stats?.applications?.approved || 0, icon: CheckCircle, trend: '+8% this month', trendDir: 'up', iconBg: 'linear-gradient(135deg, var(--success), var(--success-light))' },
          { label: 'Revenue', value: `₹${(stats?.revenue?.total || 0).toLocaleString()}`, icon: DollarSign, trend: `₹${(stats?.revenue?.thisMonth || 0).toLocaleString()} this month`, trendDir: 'up', iconBg: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' },
        ].map(({ label, value, icon: Icon, trend, trendDir, iconBg }, i) => (
          <div key={label} className={`stat-card animate-fade-in-up animate-delay-${i + 1}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label" style={{ marginBottom: '0.5rem' }}>{label}</p>
                <h2 className="stat-number" style={{ marginBottom: '0.5rem' }}>{value}</h2>
                <span className={`stat-trend ${trendDir}`}>
                  {trendDir === 'up' ? <TrendingUp size={12} /> : <Clock size={12} />}
                  {trend}
                </span>
              </div>
              <div className="stat-icon" style={iconBg ? { background: iconBg } : {}}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-lg-8 animate-fade-in-up animate-delay-2">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <TrendingUp size={16} /> Revenue Trend
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '280px' }}>
                <Line data={revenueChartData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 animate-fade-in-up animate-delay-3">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FileText size={16} /> Application Status
              </h5>
            </div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ height: '260px', width: '100%' }}>
                <Doughnut data={statusChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-3 mb-3">
        <div className="col-lg-6 animate-fade-in-up animate-delay-4">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Calendar size={16} /> Applications Over Time
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '280px' }}>
                <Bar data={applicationsData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 animate-fade-in-up animate-delay-5">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Users size={16} /> Pass Type Distribution
              </h5>
            </div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ height: '260px', width: '100%' }}>
                <Pie data={passTypeData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="card animate-fade-in-up">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Clock size={16} /> Recent Applications
          </h5>
          <Link to="/admin/applications" className="btn btn-sm btn-primary">View All</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>User</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentApplications?.slice(0, 8).map(app => {
                  const s = getStatusStyle(app.status);
                  return (
                    <tr key={app._id}>
                      <td><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{app.applicationId}</span></td>
                      <td>{app.userId?.name}</td>
                      <td>{app.routeId?.routeNumber}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 'var(--radius-full)',
                          fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                          background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                        }}>{app.status}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{app.totalAmount}</td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to="/admin/applications" className="btn btn-sm btn-secondary btn-icon">
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
