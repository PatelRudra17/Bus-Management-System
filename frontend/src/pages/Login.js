import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Bus, Mail, Lock, ArrowRight, Shield, User } from 'lucide-react';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      const role = data.user?.role;
      if (isAdmin && role !== 'admin') {
        toast.error('This account does not have admin privileges. Register a new admin account or use admin@buspass.com / admin123');
        setLoading(false);
        return;
      }
      if (!isAdmin && role === 'admin') {
        toast.error('Please use the Admin tab to sign in as admin');
        setLoading(false);
        return;
      }
      toast.success(`Welcome back!`);
      navigate(role === 'admin' ? '/admin/analytics' : '/user-dashboard');
    } catch (error) {
      if (!error.response) {
        toast.error('Cannot connect to server. Make sure backend is running on port 5000.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const adminGrad = 'linear-gradient(135deg,#7c3aed,#4f46e5)';
  const userGrad  = 'linear-gradient(135deg,var(--primary),var(--accent))';

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in-up" style={{ maxWidth: 480 }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{
            width: 76, height: 76, borderRadius: 22,
            background: isAdmin ? adminGrad : userGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: isAdmin ? '0 10px 30px rgba(124,58,237,0.45)' : '0 10px 30px rgba(99,102,241,0.4)',
            transition: 'all 0.4s ease',
          }}>
            {isAdmin ? <Shield size={38} color="white" /> : <Bus size={38} color="white" />}
          </div>
          <h2 style={{ fontWeight: 800, margin: 0 }}>
            {isAdmin ? 'Admin Portal' : 'Welcome Back'}
          </h2>
          <p className="text-muted mt-1 mb-0">
            {isAdmin ? 'Sign in to manage the system' : 'Sign in to continue your journey'}
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-4 p-1 rounded-pill d-flex"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button type="button" onClick={() => setIsAdmin(false)}
            style={{
              flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s',
              background: !isAdmin ? 'linear-gradient(135deg,var(--primary),var(--accent))' : 'transparent',
              color: !isAdmin ? '#fff' : 'var(--text3)',
              boxShadow: !isAdmin ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
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
          <div className="mb-3">
            <label className="form-label d-flex align-items-center gap-2">
              <Mail size={16} /> Email Address
            </label>
            <input type="email" className="form-control" name="email"
              value={formData.email} onChange={handleChange} required
              placeholder={isAdmin ? 'admin@buspass.com' : 'Enter your email'} />
          </div>

          <div className="mb-4">
            <label className="form-label d-flex align-items-center gap-2">
              <Lock size={16} /> Password
            </label>
            <div className="position-relative">
              <input type={showPassword ? 'text' : 'password'} className="form-control pe-5"
                name="password" value={formData.password} onChange={handleChange}
                required placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent"
                style={{ color: 'var(--text3)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
            style={{
              padding: '0.9rem', fontWeight: 700, fontSize: '1rem', borderRadius: 12,
              background: isAdmin ? adminGrad : 'linear-gradient(135deg,var(--primary),var(--accent))',
              color: '#fff', border: 'none',
              boxShadow: isAdmin ? '0 6px 20px rgba(124,58,237,0.4)' : '0 6px 20px rgba(99,102,241,0.4)',
            }}>
            {loading
              ? <><span className="spinner-border spinner-border-sm" /> Signing in...</>
              : <>{isAdmin ? 'Sign In as Admin' : 'Sign In'} <ArrowRight size={18} /></>}
          </button>
        </form>

        {!isAdmin && (
          <div className="text-center mt-3">
            <p className="mb-0 text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-decoration-none fw-bold" style={{ color: 'var(--primary)' }}>
                Create Account
              </Link>
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="text-center mt-3">
            <p className="mb-0 text-muted">
              Need an admin account?{' '}
              <Link to="/register" state={{ adminMode: true }} className="text-decoration-none fw-bold" style={{ color: '#a78bfa' }}>
                Register Admin
              </Link>
            </p>
          </div>
        )}

        {/* Demo credentials */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-muted text-center mb-2" style={{ fontSize: '0.78rem' }}>Demo Credentials</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <span className="badge" style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)', fontSize: '0.72rem' }}>
              Admin: admin@buspass.com / admin123
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
