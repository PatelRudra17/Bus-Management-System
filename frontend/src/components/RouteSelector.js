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
  }, [selectedCity, routes, onRouteSelect]);

  const fetchRoutes = async () => {
    try {
      const res = await routeAPI.getAll({ isActive: true });
      setRoutes(res.data.routes);
    } catch { toast.error('Error fetching routes'); }
    finally { setLoading(false); }
  };

  const busGrad = (type) => {
    if (type === 'ac')     return 'linear-gradient(135deg, var(--info), var(--info-light))';
    if (type === 'luxury') return 'linear-gradient(135deg, #7c3aed, #a855f7)';
    return 'linear-gradient(135deg, var(--primary), var(--primary-light))';
  };

  const busTypeBadge = (type) => {
    if (type === 'ac') return { bg: 'var(--info-50)', color: 'var(--info)', border: 'var(--info-100)' };
    if (type === 'luxury') return { bg: '#f5f3ff', color: '#7c3aed', border: '#ede9fe' };
    return { bg: 'var(--primary-50)', color: 'var(--primary)', border: 'var(--primary-100)' };
  };

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label"><MapPin size={14} /> State</label>
          <select className="form-select" value={selectedState}
            onChange={e => {
              setSelectedState(e.target.value);
              setSelectedCity(LOCATION_DATA[e.target.value]?.[0] || '');
            }}>
            {Object.keys(LOCATION_DATA).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label"><MapPin size={14} /> City</label>
          <select className="form-select" value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}>
            {(LOCATION_DATA[selectedState] || []).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)', background: 'var(--primary-50)',
        border: '1px solid var(--primary-100)', marginBottom: '1.25rem',
      }}>
        <MapPin size={14} style={{ color: 'var(--primary)' }} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
          Routes in: <span style={{ color: 'var(--primary)' }}>{selectedCity}, {selectedState}</span>
        </span>
        <span className="badge bg-primary" style={{ marginLeft: 'auto' }}>{filteredRoutes.length} routes</span>
      </div>

      <div>
        <label className="form-label"><Bus size={14} /> Select Route</label>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span className="spinner-border" style={{ color: 'var(--primary)' }} />
          </div>
        ) : filteredRoutes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
            No routes found for this city.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredRoutes.map(route => {
              const active = selectedRoute?._id === route._id;
              const bt = busTypeBadge(route.busType);
              return (
                <div key={route._id} onClick={() => onRouteSelect(route)}
                  style={{
                    background: active ? 'var(--primary-50)' : 'var(--bg-primary)',
                    border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 'var(--radius-md)',
                        background: busGrad(route.busType),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Bus size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{route.source}</span>
                          <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{route.destination}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{route.routeNumber}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{route.distance} km</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{route.duration || '~60 min'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--success)' }}>Rs.{route.fare}</div>
                      <span className="badge" style={{ fontSize: '0.5625rem', background: bt.bg, color: bt.color, border: `1px solid ${bt.border}` }}>
                        {route.busType?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {active && route.stops?.length > 0 && (
                    <div style={{
                      marginTop: '0.5rem', paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-tertiary)',
                    }}>
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
