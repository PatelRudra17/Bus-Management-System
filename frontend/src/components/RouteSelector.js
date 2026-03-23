import React, { useState, useEffect } from 'react';
import { routeAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { MapPin, Bus, ArrowRight } from 'lucide-react';

export const LOCATION_DATA = {
  'Gujarat':       ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Maharashtra':   ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Delhi':         ['New Delhi', 'Dwarka', 'Rohini', 'Noida'],
  'Karnataka':     ['Bengaluru', 'Mysuru', 'Hubli'],
  'Tamil Nadu':    ['Chennai', 'Coimbatore', 'Madurai'],
  'Rajasthan':     ['Jaipur', 'Jodhpur', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
  'West Bengal':   ['Kolkata', 'Howrah', 'Durgapur'],
};

// Shared route card picker used by both ApplyPass and BookTicket
const RouteSelector = ({ selectedRoute, onRouteSelect }) => {
  const [selectedState, setSelectedState] = useState('Gujarat');
  const [selectedCity, setSelectedCity]   = useState('Ahmedabad');
  const [routes, setRoutes]               = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchRoutes(); }, []);

  useEffect(() => {
    if (routes.length > 0) {
      const city = selectedCity.toLowerCase();
      const filtered = routes.filter(r =>
        r.source.toLowerCase().includes(city) ||
        r.destination.toLowerCase().includes(city) ||
        (r.stops || []).some(s => s.name.toLowerCase().includes(city))
      );
      setFilteredRoutes(filtered);
      onRouteSelect(null);
    }
  }, [selectedCity, routes]);

  const fetchRoutes = async () => {
    try {
      const res = await routeAPI.getAll({ isActive: true });
      setRoutes(res.data.routes);
    } catch {
      toast.error('Error fetching routes');
    } finally {
      setLoading(false);
    }
  };

  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '0.9rem 1.1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const busGrad = (type) => {
    if (type === 'ac')     return 'linear-gradient(135deg,#06b6d4,#0891b2)';
    if (type === 'luxury') return 'linear-gradient(135deg,#a855f7,#7c3aed)';
    return 'linear-gradient(135deg,#6366f1,#4f46e5)';
  };

  return (
    <div>
      {/* State / City pickers */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label d-flex align-items-center gap-2">
            <MapPin size={15} /> State
          </label>
          <select className="form-select" value={selectedState}
            onChange={e => {
              setSelectedState(e.target.value);
              setSelectedCity(LOCATION_DATA[e.target.value]?.[0] || '');
            }}>
            {Object.keys(LOCATION_DATA).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label d-flex align-items-center gap-2">
            <MapPin size={15} /> City
          </label>
          <select className="form-select" value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}>
            {(LOCATION_DATA[selectedState] || []).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Location badge */}
      <div className="mb-4 d-flex align-items-center gap-2 p-3 rounded"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
        <MapPin size={16} style={{ color: 'var(--primary-light)' }} />
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>
          Routes in: <span style={{ color: 'var(--primary-light)' }}>{selectedCity}, {selectedState}</span>
        </span>
        <span className="badge ms-auto"
          style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.3)' }}>
          {filteredRoutes.length} routes
        </span>
      </div>

      {/* Route cards */}
      <div className="mb-2">
        <label className="form-label d-flex align-items-center gap-2">
          <Bus size={15} /> Select Route
        </label>
        {loading ? (
          <div className="text-center py-4">
            <span className="spinner-border" style={{ color: 'var(--primary)' }} />
          </div>
        ) : filteredRoutes.length === 0 ? (
          <p className="text-muted text-center py-3">No routes found for this city.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {filteredRoutes.map(route => {
              const active = selectedRoute?._id === route._id;
              return (
                <div key={route._id} onClick={() => onRouteSelect(route)}
                  style={{ ...card,
                    border: active ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                  }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 40, height: 40, borderRadius: 10,
                        background: busGrad(route.busType),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bus size={18} color="white" />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{route.source}</span>
                          <ArrowRight size={13} style={{ color: 'var(--text3)' }} />
                          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{route.destination}</span>
                        </div>
                        <div className="d-flex gap-2 mt-1 flex-wrap">
                          <span style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>{route.routeNumber}</span>
                          <span style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>• {route.distance} km</span>
                          <span style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>• {route.duration || '~60 min'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-end ms-2" style={{ flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--success)' }}>
                        Rs.{route.fare}
                      </div>
                      <span className="badge" style={{ fontSize: '0.62rem',
                        background: route.busType === 'ac' ? 'rgba(6,182,212,0.2)' : route.busType === 'luxury' ? 'rgba(168,85,247,0.2)' : 'rgba(99,102,241,0.2)',
                        color: route.busType === 'ac' ? '#22d3ee' : route.busType === 'luxury' ? '#d8b4fe' : '#a5b4fc',
                        border: '1px solid rgba(99,102,241,0.3)' }}>
                        {route.busType?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {active && route.stops?.length > 0 && (
                    <div className="mt-2 pt-2"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.76rem', color: 'var(--text3)' }}>
                      Stops: {route.stops.map(s => s.name).join(' > ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteSelector;
