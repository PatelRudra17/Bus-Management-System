import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Download, FileText } from 'lucide-react';

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
  }, [reportType, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReports({ type: reportType, year });
      setReport(res.data.report);
    } catch (error) {
      toast.error('Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#38a169';
      case 'pending': return '#d69e2e';
      case 'rejected': return '#e53e3e';
      default: return '#718096';
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <BarChart3 size={28} className="me-2" />
          Reports & Analytics
        </h2>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Year</label>
              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : report ? (
        <>
          <div className="dashboard-stats mb-4">
            <div className="stat-card" style={{ borderLeft: '4px solid #3182ce' }}>
              <h3>{report.totalApplications}</h3>
              <p className="text-muted mb-0">Total Applications</p>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #38a169' }}>
              <h3>{report.approved}</h3>
              <p className="text-muted mb-0">Approved</p>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #d69e2e' }}>
              <h3>{report.pending}</h3>
              <p className="text-muted mb-0">Pending</p>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #e53e3e' }}>
              <h3>{report.rejected}</h3>
              <p className="text-muted mb-0">Rejected</p>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #38a169' }}>
              <h3>₹{report.totalRevenue?.toLocaleString() || 0}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #3182ce' }}>
              <h3>₹{report.averageApplicationValue?.toLocaleString() || 0}</h3>
              <p className="text-muted mb-0">Avg. Application Value</p>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Application Status Distribution</h5>
                  <div className="d-flex justify-content-around">
                    <div className="text-center">
                      <div 
                        className="stat-icon mx-auto mb-2"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          background: '#d4edda', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: '#155724'
                        }}
                      >
                        {report.approved}
                      </div>
                      <p className="mb-0">Approved</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="stat-icon mx-auto mb-2"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          background: '#fef3cd', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: '#856404'
                        }}
                      >
                        {report.pending}
                      </div>
                      <p className="mb-0">Pending</p>
                    </div>
                    <div className="text-center">
                      <div 
                        className="stat-icon mx-auto mb-2"
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          background: '#f8d7da', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: '#721c24'
                        }}
                      >
                        {report.rejected}
                      </div>
                      <p className="mb-0">Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Top Routes</h5>
                  {report.topRoutes && report.topRoutes.length > 0 ? (
                    <div className="list-group">
                      {report.topRoutes.map((route, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{route.route}</strong>
                            <br />
                            <small className="text-muted">
                              {route.source} → {route.destination}
                            </small>
                          </div>
                          <span className="badge bg-primary rounded-pill">{route.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Success Rate</h5>
              <div className="progress" style={{ height: '30px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${(report.approved / report.totalApplications) * 100}%` }}
                >
                  {((report.approved / report.totalApplications) * 100).toFixed(1)}%
                </div>
                <div 
                  className="progress-bar bg-warning" 
                  role="progressbar" 
                  style={{ width: `${(report.pending / report.totalApplications) * 100}%` }}
                >
                  {((report.pending / report.totalApplications) * 100).toFixed(1)}%
                </div>
                <div 
                  className="progress-bar bg-danger" 
                  role="progressbar" 
                  style={{ width: `${(report.rejected / report.totalApplications) * 100}%` }}
                >
                  {((report.rejected / report.totalApplications) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="text-success">Approved</span>
                <span className="text-warning">Pending</span>
                <span className="text-danger">Rejected</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info">
          No report data available
        </div>
      )}
    </div>
  );
};

export default AdminReports;
