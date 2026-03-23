import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Bus, User, Mail, Phone, Lock, ArrowRight, Shield } from 'lucide-react';

const Register = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(location.state?.adminMode || false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!/^[+]?[0-9]{7,15}$/.test(formData.phone)) { toast.error('Phone must be digits only, 7-15 characters (e.g. 9876543210)'); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      if (isAdmin) registerData.role = 'admin';
      await register(registerData);
      toast.success(`${isAdmin ? 'Admin' : 'User'} account created successfully!`);
      navigate(isAdmin ? '/admin/analytics' : '/user-dashboard');
    } catch (error) {
      if (!error.response) {
        toast.error('Cannot connect to server. Make sure backend is running on port 5000.');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const adminGrad = 'linear-gradient(135deg,#7c3aed,#4f46e5)';
  const userGrad  = 'linear-gradient(135deg,var(--success),var(--accent))';

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in-up" style={{ maxWidth: 560 }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{
            width: 76, height: 76, borderRadius: 22,
            background: isAdmin ? adminGrad : userGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: isAdmin ? '0 10px 30px rgba(124,58,237,0.45)' : '0 10px 30px rgba(16,185,129,0.4)',
            transition: 'all 0.4s ease',
          }}>
            {isAdmin ? <Shield size={38} color="white" /> : <Bus size={38} color="white" />}
          </div>
          <h2 style={{ fontWeight: 800, margin: 0 }}>
            {isAdmin ? 'Create Admin Account' : 'Create Account'}
          </h2>
          <p className="text-muted mt-1 mb-0">
            {isAdmin ? 'Register as a system administrator' : 'Join the Bus Pass community today'}
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-4 p-1 rounded-pill d-flex"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button type="button" onClick={() => setIsAdmin(false)}
            style={{
              flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s',
              background: !isAdmin ? 'linear-gradient(135deg,var(--success),var(--accent))' : 'transparent',
              color: !isAdmin ? '#fff' : 'var(--text3)',
              boxShadow: !isAdmin ? '0 4px 15px rgba(16,185,129,0.4)' : 'none',
            }}>
            <User size={15} className="me-2" />User
          </button>
          <button type="button" onClick={() => setIsAdmin(true)}
            style={{
              flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s',
              background: isAdmin ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent',
              color: isAdmin ? '#fff' : 'var(--text3)',
              boxShadow: isAdmin ? '0 4px 15px rgba(124,58,237,0.4)' : 'none',
            }}>
            <Shield size={15} className="me-2" />Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-2"><User size={15} /> Full Name</label>
              <input type="text" className="form-control" name="name"
                value={formData.name} onChange={handleChange} required placeholder="Full name" />
            </div>
            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-2"><Phone size={15} /> Phone</label>
              <input type="tel" className="form-control" name="phone"
                value={formData.phone} onChange={handleChange} required placeholder="9876543210 (digits only)" />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label d-flex align-items-center gap-2"><Mail size={15} /> Email Address</label>
            <input type="email" className="form-control" name="email"
              value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-2"><Lock size={15} /> Password</label>
              <input type="password" className="form-control" name="password"
                value={formData.password} onChange={handleChange} required
                placeholder="Min 6 characters" minLength="6" />
            </div>
            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-2"><Lock size={15} /> Confirm</label>
              <input type="password" className="form-control" name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm password" />
            </div>
          </div>

          {/* input text color fix */}

          <button type="submit" disabled={loading}
            className="btn w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
            style={{
              padding: '0.9rem', fontWeight: 700, fontSize: '1rem', borderRadius: 12,
              background: isAdmin ? adminGrad : 'linear-gradient(135deg,var(--success),var(--accent))',
              color: '#fff', border: 'none',
              boxShadow: isAdmin ? '0 6px 20px rgba(124,58,237,0.4)' : '0 6px 20px rgba(16,185,129,0.35)',
            }}>
            {loading
              ? <><span className="spinner-border spinner-border-sm" /> Creating Account...</>
              : <>{isAdmin ? 'Create Admin Account' : 'Create Account'} <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="mb-0 text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-bold"
              style={{ color: isAdmin ? '#a78bfa' : 'var(--primary)' }}>
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
