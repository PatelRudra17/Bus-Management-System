import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Bus, User, Mail, Phone, Lock, ArrowRight, ArrowLeft,
  Shield, CreditCard, FileText, CheckCircle, Eye, EyeOff
} from 'lucide-react';

const userSteps = [
  { id: 1, title: 'Personal Info', icon: User, desc: 'Basic details' },
  { id: 2, title: 'Identity', icon: CreditCard, desc: 'KYC documents' },
  { id: 3, title: 'Security', icon: Lock, desc: 'Set password' },
];

const adminSteps = [
  { id: 1, title: 'Personal Info', icon: User, desc: 'Basic details' },
  { id: 2, title: 'Security', icon: Lock, desc: 'Set password' },
];

const Register = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(location.state?.adminMode || false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    aadhaarNumber: '', panNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const steps = isAdmin ? adminSteps : userSteps;
  const totalSteps = steps.length;
  const accentColor = isAdmin ? '#4338ca' : '#059669';
  const accentGradient = isAdmin
    ? 'linear-gradient(135deg, #4338ca, #6366f1)'
    : 'linear-gradient(135deg, #059669, #10b981)';

  // What content does the current step show?
  // Admin: step 1 = personal, step 2 = password
  // User:  step 1 = personal, step 2 = identity, step 3 = password
  const getStepContent = () => {
    if (isAdmin) {
      return step === 1 ? 'personal' : 'password';
    }
    if (step === 1) return 'personal';
    if (step === 2) return 'identity';
    return 'password';
  };

  const currentContent = getStepContent();

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'aadhaarNumber') {
      value = value.replace(/\D/g, '').slice(0, 12);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }
    if (name === 'panNumber') {
      value = value.toUpperCase().slice(0, 10);
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleRole = (admin) => {
    setIsAdmin(admin);
    setStep(1); // reset to step 1 on role change
  };

  const validateCurrentStep = () => {
    if (currentContent === 'personal') {
      if (!formData.name.trim()) { toast.error('Name is required'); return false; }
      if (!formData.email.trim()) { toast.error('Email is required'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.error('Enter a valid email'); return false; }
      if (!formData.phone.trim()) { toast.error('Phone is required'); return false; }
      if (!/^[+]?[0-9]{7,15}$/.test(formData.phone)) { toast.error('Phone must be digits only, 7-15 characters'); return false; }
    }
    if (currentContent === 'identity') {
      const cleanAadhaar = formData.aadhaarNumber.replace(/\s/g, '');
      if (cleanAadhaar && cleanAadhaar.length !== 12) { toast.error('Aadhaar must be exactly 12 digits'); return false; }
      if (cleanAadhaar && (cleanAadhaar[0] === '0' || cleanAadhaar[0] === '1')) { toast.error('Aadhaar cannot start with 0 or 1'); return false; }
      const pan = formData.panNumber.trim();
      if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) { toast.error('Invalid PAN format (e.g. ABCDE1234F)'); return false; }
    }
    if (currentContent === 'password') {
      if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setLoading(true);
    try {
      const { confirmPassword, aadhaarNumber, panNumber, ...registerData } = formData;
      // Only include KYC data for user registration
      if (!isAdmin) {
        const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
        const pan = panNumber.trim();
        if (cleanAadhaar) registerData.aadhaarNumber = cleanAadhaar;
        if (pan) registerData.panNumber = pan;
      }
      if (isAdmin) registerData.role = 'admin';
      await register(registerData);
      toast.success(`${isAdmin ? 'Admin' : 'User'} account created successfully!`);
      navigate(isAdmin ? '/admin/analytics' : '/user-dashboard');
    } catch (error) {
      if (!error.response) {
        toast.error('Cannot connect to server. Make sure backend is running on port 5001.');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = step === totalSteps;

  return (
    <div className="login-container">
      <div className="login-split-layout animate-fade-in-up" style={{ minHeight: '520px' }}>
        {/* Left - Branding + Steps */}
        <div className="login-left" style={{
          background: isAdmin
            ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)'
            : 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-80px', left: '-40px',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />

          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {isAdmin ? <Shield size={36} color="white" /> : <Bus size={36} color="white" />}
          </div>

          <h1 style={{
            color: 'white', fontWeight: 800, fontSize: '1.625rem',
            marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.03em',
          }}>
            {isAdmin ? 'Admin Registration' : 'Create Account'}
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem',
            textAlign: 'center', maxWidth: '260px', lineHeight: '1.5', marginBottom: '2rem',
          }}>
            {isAdmin
              ? `Set up your admin account in ${totalSteps} easy steps`
              : `Join us in ${totalSteps} easy steps`}
          </p>

          {/* Step Indicators */}
          <div style={{ width: '100%', maxWidth: 220 }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: isDone ? 'rgba(255,255,255,0.3)' : isActive ? 'white' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    }}>
                      {isDone ? (
                        <CheckCircle size={20} color="white" />
                      ) : (
                        <Icon size={18} color={isActive ? accentColor : 'rgba(255,255,255,0.7)'} />
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{
                        width: 2, height: 28,
                        background: isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                        transition: 'background 0.3s',
                      }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < steps.length - 1 ? 28 : 0 }}>
                    <div style={{
                      color: 'white', fontWeight: isActive ? 700 : 500,
                      fontSize: '0.875rem', opacity: isActive || isDone ? 1 : 0.6,
                      transition: 'all 0.3s',
                    }}>
                      {s.title}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right - Form Steps */}
        <div className="login-right" style={{
          padding: '2rem 2.5rem', display: 'flex',
          flexDirection: 'column', justifyContent: 'center',
          overflowY: 'auto', maxHeight: '90vh',
        }}>
          {/* Toggle */}
          <div style={{
            display: 'flex', padding: '3px', borderRadius: '10px',
            background: 'var(--bg-tertiary)', marginBottom: '1.5rem', border: '1px solid var(--border)',
          }}>
            <button type="button" onClick={() => handleToggleRole(false)} style={{
              flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem',
              transition: 'all 0.2s', fontFamily: 'inherit',
              background: !isAdmin ? 'white' : 'transparent',
              color: !isAdmin ? '#059669' : 'var(--text-tertiary)',
              boxShadow: !isAdmin ? 'var(--shadow-sm)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <User size={14} /> User
            </button>
            <button type="button" onClick={() => handleToggleRole(true)} style={{
              flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem',
              transition: 'all 0.2s', fontFamily: 'inherit',
              background: isAdmin ? 'white' : 'transparent',
              color: isAdmin ? '#4338ca' : 'var(--text-tertiary)',
              boxShadow: isAdmin ? 'var(--shadow-sm)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <Shield size={14} /> Admin
            </button>
          </div>

          {/* Step Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
              fontSize: '0.75rem', color: accentColor, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Step {step} of {totalSteps}
            </div>
            <h2 style={{ fontWeight: 800, margin: 0, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              {currentContent === 'personal' && 'Personal Information'}
              {currentContent === 'identity' && 'Identity Documents'}
              {currentContent === 'password' && 'Set Your Password'}
            </h2>
            <p style={{ color: 'var(--text-tertiary)', marginTop: '0.35rem', marginBottom: 0, fontSize: '0.85rem' }}>
              {currentContent === 'personal' && 'Tell us about yourself to get started'}
              {currentContent === 'identity' && 'Aadhaar & PAN for identity verification (optional)'}
              {currentContent === 'password' && 'Choose a strong password to secure your account'}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: 4, borderRadius: 2, background: 'var(--bg-tertiary)',
            marginBottom: '1.5rem', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', borderRadius: 2, background: accentGradient,
              width: `${(step / totalSteps) * 100}%`, transition: 'width 0.4s ease'
            }} />
          </div>

          {/* ===== Personal Info ===== */}
          {currentContent === 'personal' && (
            <div className="animate-fade-in-up">
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  <User size={14} style={{ marginRight: 6 }} /> Full Name
                </label>
                <input type="text" className="form-control" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder="Enter your full name" autoFocus />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  <Mail size={14} style={{ marginRight: 6 }} /> Email Address
                </label>
                <input type="email" className="form-control" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  <Phone size={14} style={{ marginRight: 6 }} /> Phone Number
                </label>
                <input type="tel" className="form-control" name="phone"
                  value={formData.phone} onChange={handleChange}
                  placeholder="9876543210" />
              </div>
            </div>
          )}

          {/* ===== Identity Documents (User Only) ===== */}
          {currentContent === 'identity' && (
            <div className="animate-fade-in-up">
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  <CreditCard size={14} style={{ marginRight: 6 }} /> Aadhaar Card Number
                </label>
                <input type="text" className="form-control" name="aadhaarNumber"
                  value={formData.aadhaarNumber} onChange={handleChange}
                  placeholder="XXXX XXXX XXXX" autoFocus
                  style={{ letterSpacing: '2px', fontFamily: 'monospace', fontSize: '1.05rem' }} />
                <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  12-digit Aadhaar number issued by UIDAI
                </small>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  <FileText size={14} style={{ marginRight: 6 }} /> PAN Card Number
                </label>
                <input type="text" className="form-control" name="panNumber"
                  value={formData.panNumber} onChange={handleChange}
                  placeholder="ABCDE1234F"
                  style={{ letterSpacing: '2px', fontFamily: 'monospace', fontSize: '1.05rem', textTransform: 'uppercase' }} />
                <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Format: 5 letters + 4 digits + 1 letter
                </small>
              </div>

              <div style={{
                background: '#eff6ff', borderRadius: 10, padding: '12px 16px',
                border: '1px solid #bfdbfe', display: 'flex', alignItems: 'flex-start', gap: 10,
                fontSize: '0.8rem', color: '#1e40af'
              }}>
                <Shield size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>These fields are optional.</strong> You can skip this step and verify them later
                  from the KYC Verification page after login. Verification requires OTP for Aadhaar.
                </div>
              </div>
            </div>
          )}

          {/* ===== Password ===== */}
          {currentContent === 'password' && (
            <div className="animate-fade-in-up">
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  <Lock size={14} style={{ marginRight: 6 }} /> Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} className="form-control" name="password"
                    value={formData.password} onChange={handleChange} autoFocus
                    placeholder="Min 6 characters" minLength="6"
                    style={{ paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'var(--text-muted)', display: 'flex',
                  }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  <Lock size={14} style={{ marginRight: 6 }} /> Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} className="form-control" name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password"
                    style={{ paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'var(--text-muted)', display: 'flex',
                  }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && (
                  <small style={{
                    color: formData.password === formData.confirmPassword ? '#059669' : '#dc2626',
                    marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600
                  }}>
                    {formData.password === formData.confirmPassword
                      ? <><CheckCircle size={13} /> Passwords match</>
                      : 'Passwords do not match'}
                  </small>
                )}
              </div>

              {/* Password Strength Tips */}
              <div style={{
                background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 16px',
                border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Password Tips:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ color: formData.password.length >= 6 ? '#059669' : 'inherit' }}>
                    {formData.password.length >= 6 ? <CheckCircle size={12} style={{ marginRight: 4 }} /> : '- '}
                    At least 6 characters
                  </span>
                  <span style={{ color: /[0-9]/.test(formData.password) ? '#059669' : 'inherit' }}>
                    {/[0-9]/.test(formData.password) ? <CheckCircle size={12} style={{ marginRight: 4 }} /> : '- '}
                    Include a number
                  </span>
                  <span style={{ color: /[A-Z]/.test(formData.password) ? '#059669' : 'inherit' }}>
                    {/[A-Z]/.test(formData.password) ? <CheckCircle size={12} style={{ marginRight: 4 }} /> : '- '}
                    Include an uppercase letter
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex', gap: 12, marginTop: '1.5rem',
            justifyContent: step === 1 ? 'flex-end' : 'space-between'
          }}>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn btn-outline-secondary d-flex align-items-center gap-2"
                style={{ padding: '10px 24px', borderRadius: 10, fontWeight: 600 }}>
                <ArrowLeft size={16} /> Back
              </button>
            )}

            {!isLastStep ? (
              <button type="button" onClick={nextStep} className="btn d-flex align-items-center gap-2"
                style={{
                  padding: '10px 28px', borderRadius: 10, fontWeight: 700,
                  background: accentGradient, color: 'white', border: 'none',
                  boxShadow: `0 4px 14px ${isAdmin ? 'rgba(67,56,202,0.3)' : 'rgba(5,150,105,0.3)'}`,
                }}>
                {currentContent === 'identity' && !(formData.aadhaarNumber || formData.panNumber)
                  ? 'Skip & Continue' : 'Next'}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="btn d-flex align-items-center gap-2"
                style={{
                  padding: '10px 28px', borderRadius: 10, fontWeight: 700,
                  background: accentGradient, color: 'white', border: 'none',
                  boxShadow: `0 4px 14px ${isAdmin ? 'rgba(67,56,202,0.3)' : 'rgba(5,150,105,0.3)'}`,
                }}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm" /> Creating...</>
                  : <><CheckCircle size={16} /> Create Account</>
                }
              </button>
            )}
          </div>

          {/* Sign In link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 700, color: accentColor }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
