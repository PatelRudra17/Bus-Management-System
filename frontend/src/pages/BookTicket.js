import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, User, CreditCard, CheckCircle, ArrowLeft, ArrowRight, MapPin, Users as UsersIcon, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import RouteSelector from '../components/RouteSelector';

const STEPS = ['Select Route', 'Passenger Details', 'Payment', 'Confirmation'];

const BookTicket = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'male' }]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [booked, setBooked] = useState(false);
  const [bookingRef] = useState('BT' + Math.random().toString(36).substr(2, 8).toUpperCase());

  const totalFare = selectedRoute ? selectedRoute.fare * passengers.length : 0;

  const addPassenger = () => {
    if (passengers.length < 5) setPassengers([...passengers, { name: '', age: '', gender: 'male' }]);
  };

  const removePassenger = (i) => {
    if (passengers.length > 1) setPassengers(passengers.filter((_, idx) => idx !== i));
  };

  const updatePassenger = (i, field, value) => {
    const updated = [...passengers];
    updated[i][field] = value;
    setPassengers(updated);
  };

  const canNext = () => {
    if (step === 0) return !!selectedRoute;
    if (step === 1) return passengers.every(p => p.name.trim() && p.age);
    return true;
  };

  const handleNext = () => {
    if (!canNext()) { toast.error('Please complete all required fields'); return; }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handlePayment = () => {
    toast.success('Ticket booked successfully!');
    setBooked(true);
    setStep(3);
  };

  const stepIcon = [Ticket, User, CreditCard, CheckCircle];

  return (
    <div className="container-fluid" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-sm" onClick={() => navigate('/user-dashboard')}
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: 8 }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h4 style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>Book Ticket</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>Quick one-way ticket booking</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="d-flex align-items-center mb-4 gap-1" style={{ maxWidth: 800 }}>
        {STEPS.map((label, i) => {
          const Icon = stepIcon[i];
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={i}>
              <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: done ? '#10b981' : active ? '#0c4a6e' : '#f8fafc',
                  border: active ? '2px solid #22d3ee' : '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                }}>
                  <Icon size={18} color={done || active ? 'white' : '#94a3b8'} />
                </div>
                <span style={{ fontSize: '0.75rem', color: active ? '#0c4a6e' : done ? '#10b981' : '#64748b', marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? '#10b981' : '#e2e8f0', borderRadius: 2, marginBottom: 32 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="row g-4">
        {/* Left Column - Main Content */}
        <div className="col-lg-8">
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {step === 0 && (
              <div>
                <h5 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Choose Your Route</h5>
                <RouteSelector selectedRoute={selectedRoute} onRouteSelect={setSelectedRoute} />
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h5 style={{ color: '#0f172a', fontWeight: 700, margin: 0, fontSize: '1.25rem' }}>Passenger Details</h5>
                  {passengers.length < 5 && (
                    <button className="btn btn-sm" onClick={addPassenger}
                      style={{ background: '#0c4a6e', border: 'none', color: 'white', borderRadius: 8, fontSize: '0.875rem', padding: '0.5rem 1rem', fontWeight: 600 }}>
                      + Add Passenger
                    </button>
                  )}
                </div>
                {passengers.map((p, i) => (
                  <div key={i} className="mb-3 p-3 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 700 }}>Passenger {i + 1}</span>
                      {passengers.length > 1 && (
                        <button className="btn btn-sm" onClick={() => removePassenger(i)}
                          style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, fontSize: '0.75rem', padding: '0.25rem 0.75rem', fontWeight: 600 }}>
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="row g-3">
                      <div className="col-md-5">
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name *</label>
                        <input className="form-control" placeholder="Enter full name" value={p.name}
                          onChange={e => updatePassenger(i, 'name', e.target.value)}
                          style={{ fontSize: '0.875rem' }} />
                      </div>
                      <div className="col-md-3">
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Age *</label>
                        <input className="form-control" type="number" placeholder="Age" value={p.age} min={1} max={120}
                          onChange={e => updatePassenger(i, 'age', e.target.value)}
                          style={{ fontSize: '0.875rem' }} />
                      </div>
                      <div className="col-md-4">
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Gender</label>
                        <select className="form-select" value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}
                          style={{ fontSize: '0.875rem' }}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div>
                <h5 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Payment Method</h5>
                <div className="row g-3 mb-4">
                  {[
                    { id: 'upi', label: 'UPI', icon: '📱' },
                    { id: 'card', label: 'Card', icon: '💳' },
                    { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                    { id: 'wallet', label: 'Wallet', icon: '👛' }
                  ].map(m => (
                    <div className="col-6 col-md-3" key={m.id}>
                      <button onClick={() => setPaymentMethod(m.id)}
                        style={{
                          width: '100%', padding: '1.25rem', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                          background: paymentMethod === m.id ? '#0c4a6e' : '#f8fafc',
                          border: paymentMethod === m.id ? '2px solid #22d3ee' : '1px solid #e2e8f0',
                          color: paymentMethod === m.id ? 'white' : '#475569',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                        <span style={{ fontSize: '1.75rem' }}>{m.icon}</span>
                        {m.label}
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn w-100" onClick={handlePayment}
                  style={{
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8
                  }}>
                  Pay Rs.{totalFare} and Confirm Booking
                </button>
              </div>
            )}

            {step === 3 && booked && (
              <div className="text-center py-4">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckCircle size={40} style={{ color: '#10b981' }} />
                </div>
                <h4 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Booking Confirmed!</h4>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Your ticket has been booked successfully.</p>

                <div className="p-4 rounded mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', maxWidth: 400, margin: '0 auto' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>Booking Reference</div>
                  <div style={{ color: '#0c4a6e', fontWeight: 800, fontSize: '1.75rem', letterSpacing: 2, marginBottom: '1rem' }}>{bookingRef}</div>
                  <hr style={{ borderColor: '#e2e8f0', margin: '1rem 0' }} />
                  <div className="text-start">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Route</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>{selectedRoute?.source} → {selectedRoute?.destination}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Passengers</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>{passengers.length}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Payment</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>{paymentMethod.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <button className="btn" onClick={() => navigate('/user-dashboard')}
                    style={{ padding: '0.75rem 1.5rem', fontWeight: 700, background: '#0c4a6e', color: 'white', border: 'none', borderRadius: 8 }}>
                    Go to Dashboard
                  </button>
                  <button className="btn" onClick={() => { setStep(0); setSelectedRoute(null); setPassengers([{ name: '', age: '', gender: 'male' }]); setBooked(false); }}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                    Book Another
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {step < 3 && (
            <div className="d-flex justify-content-between mt-4">
              <button className="btn" onClick={() => step === 0 ? navigate('/user-dashboard') : setStep(step - 1)}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: 8, padding: '0.75rem 1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
              </button>
              {step < 2 && (
                <button className="btn" onClick={handleNext} disabled={!canNext()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: 700,
                    opacity: canNext() ? 1 : 0.5,
                    background: '#0c4a6e',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                  Next <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Summary Sidebar */}
        <div className="col-lg-4">
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 90 }}>
            <h6 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Booking Summary</h6>

            {selectedRoute ? (
              <>
                {/* Route Info */}
                <div className="mb-4 p-3 rounded" style={{ background: '#ecfeff', border: '1px solid #22d3ee' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <MapPin size={16} color="#0c4a6e" />
                    <span style={{ color: '#0c4a6e', fontWeight: 700, fontSize: '0.875rem' }}>Route</span>
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {selectedRoute.source}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>↓</div>
                  <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>
                    {selectedRoute.destination}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {selectedRoute.distance} km • {selectedRoute.duration}
                  </div>
                </div>

                {/* Passengers */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <UsersIcon size={16} color="#64748b" />
                      <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Passengers</span>
                    </div>
                    <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.875rem' }}>{passengers.length}</span>
                  </div>
                  {step >= 1 && passengers.some(p => p.name) && (
                    <div className="mt-2">
                      {passengers.filter(p => p.name).map((p, i) => (
                        <div key={i} style={{
                          padding: '0.5rem 0.75rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          marginBottom: '0.5rem',
                          fontSize: '0.8125rem',
                          color: '#475569'
                        }}>
                          <div className="d-flex justify-content-between">
                            <span>{p.name}</span>
                            <span>{p.age} yrs, {p.gender}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fare Breakdown */}
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <DollarSign size={16} color="#64748b" />
                    <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Fare Breakdown</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Base Fare (per person)</span>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>Rs.{selectedRoute.fare}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Number of Passengers</span>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>× {passengers.length}</span>
                  </div>
                  <hr style={{ borderColor: '#e2e8f0', margin: '0.75rem 0' }} />
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>Total Amount</span>
                    <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.5rem' }}>Rs.{totalFare}</span>
                  </div>
                </div>

                {step === 2 && (
                  <div className="p-3 rounded" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <div style={{ color: '#15803d', fontSize: '0.8125rem', fontWeight: 600 }}>
                      Payment Method: {paymentMethod.toUpperCase()}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <Ticket size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                  Select a route to view booking summary
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicket;
