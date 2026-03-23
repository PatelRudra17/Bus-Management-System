import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { 
  Users, FileText, CreditCard, TrendingUp, Clock, CheckCircle, XCircle,
  RefreshCw, Activity, DollarSign, Route, BarChart3, Eye, Calendar
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
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await adminAPI.getDashboardStats();
      setStats(res.data.stats);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = stats?.charts?.revenueByMonth?.reduce((acc, item) => {
    acc[item._id - 1] = item.revenue;
    return acc;
  }, new Array(12).fill(0)) || new Array(12).fill(0);

  const applicationsData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Approved',
        data: stats?.charts?.monthlyStats?.filter(s => s._id.status === 'approved').map(s => s.count) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8
      },
      {
        label: 'Pending',
        data: stats?.charts?.monthlyStats?.filter(s => s._id.status === 'pending').map(s => s.count) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        borderRadius: 8
      },
      {
        label: 'Rejected',
        data: stats?.charts?.monthlyStats?.filter(s => s._id.status === 'rejected').map(s => s.count) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const revenueChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
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
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0,
      hoverOffset: 10
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
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 20,
          font: { size: 12, weight: '500' },
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
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4 animate-fade-in-up">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="h2 mb-1 d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>
                  <BarChart3 size={24} />
                </div>
                Analytics Dashboard
              </h1>
              <p className="text-muted mb-0">Welcome back, {user?.name}!</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <select 
                className="form-select form-control"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="daily">Today</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
              </select>
              <button 
                className="btn btn-icon btn-secondary"
                onClick={fetchDashboardData}
                disabled={refreshing}
              >
                <RefreshCw size={20} className={refreshing ? 'spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card animate-fade-in-up animate-delay-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Total Users</p>
              <h2 className="stat-number mb-2">{stats?.users?.total || 0}</h2>
              <span className="stat-trend up">
                <TrendingUp size={14} />
                +12% this month
              </span>
            </div>
            <div className="stat-icon">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up animate-delay-2" style={{ '--accent-color': 'var(--warning)' }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Pending</p>
              <h2 className="stat-number mb-2">{stats?.applications?.pending || 0}</h2>
              <span className="stat-trend down">
                <Clock size={14} />
                Needs attention
              </span>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--warning), #d97706)' }}>
              <Clock size={28} />
            </div>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up animate-delay-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Approved</p>
              <h2 className="stat-number mb-2">{stats?.applications?.approved || 0}</h2>
              <span className="stat-trend up">
                <TrendingUp size={14} />
                +8% this month
              </span>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}>
              <CheckCircle size={28} />
            </div>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up animate-delay-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label mb-2">Total Revenue</p>
              <h2 className="stat-number mb-2">₹{(stats?.revenue?.total || 0).toLocaleString()}</h2>
              <span className="stat-trend up">
                <TrendingUp size={14} />
                ₹{(stats?.revenue?.thisMonth || 0).toLocaleString()} this month
              </span>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--accent), #0891b2)' }}>
              <DollarSign size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8 animate-fade-in-up animate-delay-2">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <TrendingUp size={20} />
                Revenue Trend
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Line data={revenueChartData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 animate-fade-in-up animate-delay-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <FileText size={20} />
                Application Status
              </h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <div style={{ height: '280px', width: '100%' }}>
                <Doughnut data={statusChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6 animate-fade-in-up animate-delay-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <Calendar size={20} />
                Applications Over Time
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Bar data={applicationsData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 animate-fade-in-up animate-delay-5">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <Users size={20} />
                Pass Type Distribution
              </h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <div style={{ height: '280px', width: '100%' }}>
                <Pie data={passTypeData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row animate-fade-in-up">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <Clock size={20} />
                Recent Applications
              </h5>
              <Link to="/admin/applications" className="btn btn-sm btn-primary">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
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
                    {stats?.recentApplications?.slice(0, 8).map(app => (
                      <tr key={app._id}>
                        <td><strong>{app.applicationId}</strong></td>
                        <td>{app.userId?.name}</td>
                        <td>{app.routeId?.routeNumber}</td>
                        <td>
                          <span className={`badge status-${app.status}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>₹{app.totalAmount}</td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to="/admin/applications" className="btn btn-sm btn-icon btn-secondary">
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
