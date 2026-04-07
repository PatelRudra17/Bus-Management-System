import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Bus, Mail, Lock, ArrowRight, Shield, User, Eye, EyeOff } from 'lucide-react';

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
        toast.error('This account does not have admin privileges.');
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
        toast.error('Cannot connect to server. Make sure backend is running on port 5001.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-split-layout animate-fade-in-up">
        {/* Left - Branding */}
        <div className="login-left" style={{
          background: isAdmin
            ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)'
            : 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden',
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
            width: 88, height: 88, borderRadius: 22,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.75rem', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {isAdmin ? <Shield size={42} color="white" /> : <Bus size={42} color="white" />}
          </div>

          <h1 style={{
            color: 'white', fontWeight: 800, fontSize: '2rem',
            marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '-0.03em',
          }}>
            {isAdmin ? 'Admin Portal' : 'Bus Pass System'}
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem',
            textAlign: 'center', maxWidth: '280px', lineHeight: '1.6',
          }}>
            {isAdmin
              ? 'Manage routes, users, and oversee system operations'
              : 'Your journey starts here. Travel smarter with digital passes'}
          </p>
        </div>

        {/* Right - Form */}
        <div className="login-right" style={{
          padding: '2.5rem 2.5rem', display: 'flex',
          flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 800, margin: 0, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              {isAdmin ? 'Admin Sign In' : 'Welcome Back'}
            </h2>
            <p style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem' }}>
              {isAdmin ? 'Sign in to manage the system' : 'Sign in to continue your journey'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', padding: '3px', borderRadius: '10px',
            background: 'var(--bg-tertiary)', marginBottom: '1.5rem', border: '1px solid var(--border)',
          }}>
            <button type="button" onClick={() => setIsAdmin(false)} style={{
              flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem',
              transition: 'all 0.2s', fontFamily: 'inherit',
              background: !isAdmin ? 'white' : 'transparent',
              color: !isAdmin ? 'var(--primary)' : 'var(--text-tertiary)',
              boxShadow: !isAdmin ? 'var(--shadow-sm)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <User size={14} /> User
            </button>
            <button type="button" onClick={() => setIsAdmin(true)} style={{
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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <Mail size={14} /> Email Address
              </label>
              <input type="email" className="form-control" name="email"
                value={formData.email} onChange={handleChange} required
                placeholder={isAdmin ? 'admin@buspass.com' : 'Enter your email'} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">
                <Lock size={14} /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} className="form-control"
                  name="password" value={formData.password} onChange={handleChange}
                  required placeholder="Enter your password"
                  style={{ paddingRight: '42px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    color: 'var(--text-muted)', display: 'flex',
                  }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-lg w-100" style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #4338ca, #6366f1)'
                : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9375rem',
              padding: '12px', borderRadius: '10px',
              boxShadow: isAdmin ? '0 4px 14px rgba(67, 56, 202, 0.3)' : 'var(--shadow-primary)',
            }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm" /> Signing in...</>
                : <>{isAdmin ? 'Sign In as Admin' : 'Sign In'} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              {isAdmin ? "Need an admin account? " : "Don't have an account? "}
              <Link to="/register" state={isAdmin ? { adminMode: true } : undefined}
                style={{ fontWeight: 700, color: isAdmin ? '#4338ca' : 'var(--primary)' }}>
                {isAdmin ? 'Register Admin' : 'Create Account'}
              </Link>
            </p>
          </div>

          <div style={{
            marginTop: '1.5rem', paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginBottom: '0.5rem' }}>
              Demo Credentials
            </p>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '6px',
              background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)',
              fontSize: '0.6875rem', fontWeight: 600, border: '1px solid var(--border)',
              fontFamily: 'monospace',
            }}>
              admin@buspass.com / admin123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
