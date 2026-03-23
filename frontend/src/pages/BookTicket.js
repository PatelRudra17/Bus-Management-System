import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, User, CreditCard, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-sm" onClick={() => navigate('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)', borderRadius: 10 }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h4 style={{ color: 'var(--text)', fontWeight: 800, margin: 0 }}>Book Ticket</h4>
          <p style={{ color: 'var(--text3)', margin: 0, fontSize: '0.85rem' }}>Quick one-way ticket booking</p>
        </div>
      </div>

      <div className="d-flex align-items-center mb-4 gap-1">
        {STEPS.map((label, i) => {
          const Icon = stepIcon[i];
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={i}>
              <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: done ? 'var(--success)' : active ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  border: active ? '2px solid var(--primary-light)' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                }}>
                  <Icon size={16} color="white" />
                </div>
                <span style={{ fontSize: '0.65rem', color: active ? 'var(--primary-light)' : done ? 'var(--success)' : 'var(--text3)', marginTop: 4, textAlign: 'center' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--success)' : 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 20 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="glass-card p-4">
        {step === 0 && (
          <div>
            <h6 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '1rem' }}>Choose Your Route</h6>
            <RouteSelector selectedRoute={selectedRoute} onRouteSelect={setSelectedRoute} />
            {selectedRoute && (
              <div className="mt-3 p-3 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
                  Selected: {selectedRoute.source} to {selectedRoute.destination}
                </div>
                <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 2 }}>
                  Fare per person: Rs.{selectedRoute.fare} | {selectedRoute.distance} km
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 style={{ color: 'var(--text)', fontWeight: 700, margin: 0 }}>Passenger Details</h6>
              {passengers.length < 5 && (
                <button className="btn btn-sm" onClick={addPassenger}
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary-light)', borderRadius: 8, fontSize: '0.8rem' }}>
                  + Add Passenger
                </button>
              )}
            </div>
            {passengers.map((p, i) => (
              <div key={i} className="mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ color: 'var(--text3)', fontSize: '0.8rem', fontWeight: 600 }}>Passenger {i + 1}</span>
                  {passengers.length > 1 && (
                    <button className="btn btn-sm" onClick={() => removePassenger(i)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 6, fontSize: '0.75rem', padding: '2px 8px' }}>
                      Remove
                    </button>
                  )}
                </div>
                <div className="row g-2">
                  <div className="col-md-5">
                    <input className="form-control" placeholder="Full Name *" value={p.name}
                      onChange={e => updatePassenger(i, 'name', e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <input className="form-control" type="number" placeholder="Age *" value={p.age} min={1} max={120}
                      onChange={e => updatePassenger(i, 'age', e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <select className="form-select" value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-3 rounded mt-2" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="d-flex justify-content-between">
                <span style={{ color: 'var(--text3)' }}>Route</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{selectedRoute?.source} to {selectedRoute?.destination}</span>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span style={{ color: 'var(--text3)' }}>Passengers</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{passengers.length}</span>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span style={{ color: 'var(--text3)' }}>Total Fare</span>
                <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.05rem' }}>Rs.{totalFare}</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h6 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '1rem' }}>Payment</h6>
            <div className="mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="d-flex justify-content-between mb-1">
                <span style={{ color: 'var(--text3)' }}>Route</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{selectedRoute?.source} to {selectedRoute?.destination}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span style={{ color: 'var(--text3)' }}>Passengers</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{passengers.length} x Rs.{selectedRoute?.fare}</span>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              <div className="d-flex justify-content-between">
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>Total</span>
                <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.2rem' }}>Rs.{totalFare}</span>
              </div>
            </div>
            <label className="form-label" style={{ color: 'var(--text3)' }}>Payment Method</label>
            <div className="d-flex gap-2 flex-wrap mb-4">
              {['upi', 'card', 'netbanking', 'wallet'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    background: paymentMethod === m ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    border: paymentMethod === m ? '2px solid var(--primary-light)' : '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text)', transition: 'all 0.2s',
                  }}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="btn-3d w-100" onClick={handlePayment}
              style={{ padding: '12px', fontSize: '1rem', fontWeight: 700 }}>
              Pay Rs.{totalFare} and Book
            </button>
          </div>
        )}

        {step === 3 && booked && (
          <div className="text-center py-3">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
              <CheckCircle size={36} style={{ color: 'var(--success)' }} />
            </div>
            <h5 style={{ color: 'var(--text)', fontWeight: 800 }}>Ticket Booked!</h5>
            <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Your booking is confirmed.</p>
            <div className="p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block', minWidth: 280 }}>
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>Booking Reference</div>
              <div style={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: 2 }}>{bookingRef}</div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              <div style={{ color: 'var(--text)', fontWeight: 600 }}>{selectedRoute?.source} to {selectedRoute?.destination}</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.82rem', marginTop: 4 }}>
                {passengers.length} passenger{passengers.length > 1 ? 's' : ''} | Rs.{totalFare} paid via {paymentMethod.toUpperCase()}
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-center mt-2">
              <button className="btn-3d" onClick={() => navigate('/dashboard')}
                style={{ padding: '10px 24px', fontWeight: 700 }}>
                Go to Dashboard
              </button>
              <button className="btn" onClick={() => { setStep(0); setSelectedRoute(null); setPassengers([{ name: '', age: '', gender: 'male' }]); setBooked(false); }}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)', borderRadius: 10, padding: '10px 24px', fontWeight: 600 }}>
                Book Another
              </button>
            </div>
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="d-flex justify-content-between mt-3">
          <button className="btn" onClick={() => step === 0 ? navigate('/dashboard') : setStep(step - 1)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)', borderRadius: 10, padding: '10px 20px', fontWeight: 600 }}>
            <ArrowLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 2 && (
            <button className="btn-3d" onClick={handleNext} disabled={!canNext()}
              style={{ padding: '10px 24px', fontWeight: 700, opacity: canNext() ? 1 : 0.5 }}>
              Next <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookTicket;