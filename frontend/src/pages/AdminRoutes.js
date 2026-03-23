import React, { useState, useEffect } from 'react';
import { routeAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { MapPin, Plus, Edit, Trash2, RefreshCw, X } from 'lucide-react';

const EMPTY = { routeNumber: '', source: '', destination: '', distance: '', fare: '', busType: 'standard', totalSeats: 40 };

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await routeAPI.getAll({});
      setRoutes(res.data.routes);
    } catch { toast.error('Error fetching routes'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (r) => {
    setForm({ routeNumber: r.routeNumber, source: r.source, destination: r.destination,
      distance: r.distance, fare: r.fare, busType: r.busType, totalSeats: r.totalSeats });
    setEditing(r);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await routeAPI.update(editing._id, form); toast.success('Route updated'); }
      else { await routeAPI.create(form); toast.success('Route created'); }
      setShowModal(false);
      fetchRoutes();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving route'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this route?')) return;
    try { await routeAPI.delete(id); toast.success('Route deactivated'); fetchRoutes(); }
    catch { toast.error('Error deleting route'); }
  };

  const busTypeBadge = { standard: { bg: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: 'rgba(99,102,241,0.4)' },
    ac: { bg: 'rgba(6,182,212,0.2)', color: '#22d3ee', border: 'rgba(6,182,212,0.4)' },
    luxury: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: 'rgba(245,158,11,0.4)' } };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-in-up">
        <div>
          <h2 className="d-flex align-items-center gap-3 mb-1">
            <div className="stat-icon" style={{ width: 46, height: 46 }}><MapPin size={22} /></div>
            Route Management
          </h2>
          <p className="text-muted mb-0">{routes.length} routes configured</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={fetchRoutes}><RefreshCw size={16} /></button>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} className="me-2" />Add Route</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="table-responsive animate-fade-in-up animate-delay-1">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Route No</th>
                <th>Source → Destination</th>
                <th>Distance</th>
                <th>Fare</th>
                <th>Type</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(r => {
                const bt = busTypeBadge[r.busType] || busTypeBadge.standard;
                return (
                  <tr key={r._id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{r.routeNumber}</span></td>
                    <td>
                      <div style={{ color: 'var(--text)', fontWeight: 500 }}>{r.source}</div>
                      <div style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>→ {r.destination}</div>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{r.distance} km</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{r.fare}</td>
                    <td>
                      <span className="badge" style={{ background: bt.bg, color: bt.color, border: `1px solid ${bt.border}` }}>
                        {r.busType.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{r.totalSeats}</td>
                    <td>
                      <span className={`badge ${r.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)} style={{ padding: '4px 10px' }}>
                          <Edit size={13} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r._id)} style={{ padding: '4px 10px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Edit Route' : 'Add New Route'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Route Number</label>
                    <input className="form-control" value={form.routeNumber} required placeholder="e.g. AHM-101"
                      onChange={e => setForm({ ...form, routeNumber: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">Source</label>
                      <input className="form-control" value={form.source} required
                        onChange={e => setForm({ ...form, source: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Destination</label>
                      <input className="form-control" value={form.destination} required
                        onChange={e => setForm({ ...form, destination: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">Distance (km)</label>
                      <input className="form-control" type="number" value={form.distance} required
                        onChange={e => setForm({ ...form, distance: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Fare (₹)</label>
                      <input className="form-control" type="number" value={form.fare} required
                        onChange={e => setForm({ ...form, fare: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">Bus Type</label>
                      <select className="form-select" value={form.busType}
                        onChange={e => setForm({ ...form, busType: e.target.value })}>
                        <option value="standard">Standard</option>
                        <option value="ac">AC</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Total Seats</label>
                      <input className="form-control" type="number" value={form.totalSeats} required
                        onChange={e => setForm({ ...form, totalSeats: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;
