import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { kycAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Shield, CheckCircle, AlertCircle, CreditCard, FileText, ArrowRight, RefreshCw, Lock } from 'lucide-react';

const KYCVerification = () => {
  const { updateUser } = useAuth();
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Aadhaar state
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarStep, setAadhaarStep] = useState('input'); // input | otp | done
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef([]);

  // PAN state
  const [panNumber, setPanNumber] = useState('');
  const [panLoading, setPanLoading] = useState(false);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  const fetchKycStatus = async () => {
    try {
      const res = await kycAPI.getStatus();
      setKycData(res.data.kyc);
      if (res.data.kyc.aadhaarVerified) setAadhaarStep('done');
    } catch (error) {
      toast.error('Error fetching KYC status');
    } finally {
      setLoading(false);
    }
  };

  // --- Aadhaar ---

  const formatAadhaar = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const handleAadhaarChange = (e) => {
    setAadhaarNumber(formatAadhaar(e.target.value));
  };

  const handleSendOtp = async () => {
    const clean = aadhaarNumber.replace(/\s/g, '');
    if (clean.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    setAadhaarLoading(true);
    try {
      const res = await kycAPI.sendAadhaarOtp(clean);
      toast.success(res.data.message);
      if (res.data.demoOtp) {
        setDemoOtp(res.data.demoOtp);
      }
      setAadhaarStep('otp');
      setOtpTimer(600); // 10 minutes
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending OTP');
    } finally {
      setAadhaarLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setAadhaarLoading(true);
    try {
      const res = await kycAPI.verifyAadhaarOtp(otpStr);
      toast.success(res.data.message);
      setAadhaarStep('done');
      setDemoOtp('');
      updateUser({ kycStatus: res.data.kycStatus });
      fetchKycStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setAadhaarLoading(false);
    }
  };

  // --- PAN ---

  const handlePanChange = (e) => {
    setPanNumber(e.target.value.toUpperCase().slice(0, 10));
  };

  const handleVerifyPan = async () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      toast.error('Invalid PAN format. Expected: ABCDE1234F');
      return;
    }
    setPanLoading(true);
    try {
      const res = await kycAPI.verifyPan(panNumber);
      toast.success(res.data.message);
      updateUser({ kycStatus: res.data.kycStatus });
      fetchKycStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'PAN verification failed');
    } finally {
      setPanLoading(false);
    }
  };

  // --- KYC Status Badge ---
  const getStatusBadge = (status) => {
    const map = {
      verified: { color: '#059669', bg: '#d1fae5', label: 'Fully Verified', icon: CheckCircle },
      partial: { color: '#d97706', bg: '#fef3c7', label: 'Partially Verified', icon: AlertCircle },
      none: { color: '#6b7280', bg: '#f3f4f6', label: 'Not Verified', icon: Shield },
    };
    const s = map[status] || map.none;
    const Icon = s.icon;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
        borderRadius: 20, background: s.bg, color: s.color, fontWeight: 700, fontSize: '0.8125rem'
      }}>
        <Icon size={16} /> {s.label}
      </span>
    );
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="card animate-fade-in-up mb-4" style={{
            background: 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)',
            color: 'white', border: 'none'
          }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                  <h3 style={{ fontWeight: 800, margin: 0 }}>
                    <Shield size={28} className="me-2" style={{ verticalAlign: 'middle' }} />
                    KYC Verification
                  </h3>
                  <p className="mb-0 mt-2" style={{ opacity: 0.85, fontSize: '0.9rem' }}>
                    Verify your identity with Aadhaar & PAN to apply for bus passes
                  </p>
                </div>
                <div>{getStatusBadge(kycData?.kycStatus)}</div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.75rem', opacity: 0.9
                }}>
                  <span>Progress</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {(kycData?.aadhaarVerified ? 1 : 0) + (kycData?.panVerified ? 1 : 0)} / 2
                  </span>
                </div>
                <div style={{
                  height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)', marginTop: 6
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3, background: 'white',
                    width: `${((kycData?.aadhaarVerified ? 1 : 0) + (kycData?.panVerified ? 1 : 0)) * 50}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="alert animate-fade-in-up animate-delay-1" style={{
            background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 12,
            color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: 12
          }}>
            <AlertCircle size={20} className="flex-shrink-0 mt-1" />
            <div>
              <strong>Demo Mode:</strong> This is a simulated verification. Aadhaar OTP will be sent to your email.
              PAN is validated by format only. In production, these would connect to UIDAI and NSDL APIs.
            </div>
          </div>

          {/* Aadhaar Card */}
          <div className="card animate-fade-in-up animate-delay-1 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: kycData?.aadhaarVerified
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : 'linear-gradient(135deg, #0e7490, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Aadhaar Card</h5>
                    <small style={{ color: 'var(--text-muted)' }}>12-digit unique identity number</small>
                  </div>
                </div>
                {kycData?.aadhaarVerified && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 700, fontSize: '0.875rem'
                  }}>
                    <CheckCircle size={18} /> Verified
                  </span>
                )}
              </div>

              {/* Aadhaar Verified State */}
              {kycData?.aadhaarVerified ? (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px',
                  textAlign: 'center'
                }}>
                  <CheckCircle size={40} color="#059669" />
                  <p style={{ margin: '12px 0 0', fontWeight: 600, color: '#059669' }}>
                    Aadhaar Verified Successfully
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    Aadhaar: {kycData.aadhaarNumber}
                  </p>
                </div>
              ) : aadhaarStep === 'input' ? (
                /* Aadhaar Input Step */
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Enter Aadhaar Number
                  </label>
                  <div className="d-flex gap-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="XXXX XXXX XXXX"
                      value={aadhaarNumber}
                      onChange={handleAadhaarChange}
                      maxLength={14}
                      style={{
                        fontSize: '1.125rem', letterSpacing: '2px', fontWeight: 600, fontFamily: 'monospace'
                      }}
                    />
                    <button
                      className="btn btn-primary d-flex align-items-center gap-2 flex-shrink-0"
                      onClick={handleSendOtp}
                      disabled={aadhaarLoading || aadhaarNumber.replace(/\s/g, '').length !== 12}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {aadhaarLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>Send OTP <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>
                  <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                    An OTP will be sent to your registered email for demo verification
                  </small>
                </div>
              ) : (
                /* OTP Verification Step */
                <div>
                  <div className="text-center mb-3">
                    <Lock size={32} color="#0e7490" />
                    <p style={{ fontWeight: 600, margin: '8px 0 4px' }}>Enter Verification OTP</p>
                    <small style={{ color: 'var(--text-muted)' }}>
                      OTP sent to your email. Expires in{' '}
                      <span style={{ fontWeight: 700, color: otpTimer < 60 ? '#dc2626' : '#0e7490' }}>
                        {formatTimer(otpTimer)}
                      </span>
                    </small>
                  </div>

                  {/* Demo OTP hint */}
                  {demoOtp && (
                    <div style={{
                      background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
                      padding: '10px 16px', textAlign: 'center', marginBottom: 16, fontSize: '0.8125rem'
                    }}>
                      <strong>Demo OTP:</strong>{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 4, fontSize: '1rem' }}>
                        {demoOtp}
                      </span>
                    </div>
                  )}

                  {/* OTP Input Boxes */}
                  <div className="d-flex justify-content-center gap-2 mb-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        style={{
                          width: 48, height: 56, textAlign: 'center', fontSize: '1.25rem',
                          fontWeight: 700, borderRadius: 10, border: '2px solid var(--border)',
                          fontFamily: 'monospace', outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#0e7490')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                      />
                    ))}
                  </div>

                  <div className="d-flex gap-3 justify-content-center">
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      onClick={() => { setAadhaarStep('input'); setOtp(['','','','','','']); setDemoOtp(''); }}
                    >
                      <RefreshCw size={16} /> Change Aadhaar
                    </button>
                    <button
                      className="btn btn-primary d-flex align-items-center gap-2"
                      onClick={handleVerifyOtp}
                      disabled={aadhaarLoading || otp.join('').length !== 6}
                    >
                      {aadhaarLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>Verify OTP <CheckCircle size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PAN Card */}
          <div className="card animate-fade-in-up animate-delay-2 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: kycData?.panVerified
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 700, margin: 0 }}>PAN Card</h5>
                    <small style={{ color: 'var(--text-muted)' }}>Permanent Account Number</small>
                  </div>
                </div>
                {kycData?.panVerified && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 700, fontSize: '0.875rem'
                  }}>
                    <CheckCircle size={18} /> Verified
                  </span>
                )}
              </div>

              {kycData?.panVerified ? (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px',
                  textAlign: 'center'
                }}>
                  <CheckCircle size={40} color="#059669" />
                  <p style={{ margin: '12px 0 0', fontWeight: 600, color: '#059669' }}>
                    PAN Verified Successfully
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    PAN: {kycData.panNumber}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Enter PAN Number
                  </label>
                  <div className="d-flex gap-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={handlePanChange}
                      maxLength={10}
                      style={{
                        fontSize: '1.125rem', letterSpacing: '2px', fontWeight: 600,
                        fontFamily: 'monospace', textTransform: 'uppercase'
                      }}
                    />
                    <button
                      className="btn d-flex align-items-center gap-2 flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                        color: 'white', border: 'none', whiteSpace: 'nowrap'
                      }}
                      onClick={handleVerifyPan}
                      disabled={panLoading || panNumber.length !== 10}
                    >
                      {panLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>Verify PAN <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>
                  <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                    Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Fully verified message */}
          {kycData?.kycStatus === 'verified' && (
            <div className="card animate-fade-in-up" style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white', border: 'none', textAlign: 'center'
            }}>
              <div className="card-body p-4">
                <CheckCircle size={48} />
                <h4 style={{ fontWeight: 800, margin: '12px 0 8px' }}>KYC Fully Verified</h4>
                <p style={{ opacity: 0.9, margin: 0 }}>
                  Your identity has been verified. You can now apply for bus passes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;
