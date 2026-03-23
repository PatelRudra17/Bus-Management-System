import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Users, Search, Trash2, UserPlus, RefreshCw, Shield, User } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ role: '', isActive: '' });

  useEffect(() => { fetchUsers(); }, [filter]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, limit: 12, search, ...filter });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch { toast.error('Error fetching users'); }
    finally { setLoading(false); }
  };

  const toggleActive = async (id, current) => {
    try {
      await adminAPI.updateUser(id, { isActive: !current });
      toast.success(`User ${current ? 'deactivated' : 'activated'}`);
      fetchUsers(pagination.page);
    } catch { toast.error('Error updating user'); }
  };

  const glassCard = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-in-up">
        <div>
          <h2 className="d-flex align-items-center gap-3 mb-1">
            <div className="stat-icon" style={{ width: 46, height: 46 }}><Users size={22} /></div>
            User Management
          </h2>
          <p className="text-muted mb-0">Manage all registered users and admins</p>
        </div>
        <button className="btn btn-secondary" onClick={() => fetchUsers()}>
          <RefreshCw size={16} className="me-2" />Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="p-3 mb-4 animate-fade-in-up animate-delay-1" style={glassCard}>
        <div className="row g-3">
          <div className="col-md-5">
            <div className="d-flex gap-2">
              <input className="form-control" placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchUsers(1)} />
              <button className="btn btn-primary px-3" onClick={() => fetchUsers(1)}>
                <Search size={16} />
              </button>
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filter.role}
              onChange={e => setFilter({ ...filter, role: e.target.value })}>
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filter.isActive}
              onChange={e => setFilter({ ...filter, isActive: e.target.value })}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          <div className="table-responsive animate-fade-in-up animate-delay-2">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--text3)' }}>No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: u.role === 'admin'
                            ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                            : 'linear-gradient(135deg,var(--primary),var(--accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: '#fff', fontSize: '0.9rem'
                        }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{u.phone}</td>
                    <td>
                      <span className="badge" style={{
                        background: u.role === 'admin' ? 'rgba(124,58,237,0.2)' : 'rgba(99,102,241,0.2)',
                        color: u.role === 'admin' ? '#c4b5fd' : '#a5b4fc',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(124,58,237,0.4)' : 'rgba(99,102,241,0.4)'}`,
                        display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        {u.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleActive(u._id, u.isActive)}
                        style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                      >
                        {u.isActive ? <><Trash2 size={13} className="me-1" />Deactivate</> : <><UserPlus size={13} className="me-1" />Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4 gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i}
                  onClick={() => fetchUsers(i + 1)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: pagination.page === i + 1 ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                    color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;
