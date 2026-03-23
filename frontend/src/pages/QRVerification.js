import React, { useState, useRef, useCallback, useEffect } from 'react';
import jsQR from 'jsqr';
import { CheckCircle, XCircle, AlertTriangle, Shield, Scan, QrCode } from 'lucide-react';
import { verificationAPI } from '../utils/api';
import { toast } from 'react-toastify';

const QRVerification = () => {
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error('Please enter a pass number');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const res = await verificationAPI.verifyByNumber(manualInput.trim().toUpperCase());
      setVerificationResult(res.data);
      
      if (res.data.valid) {
        toast.success('Pass Verified Successfully! ✅');
      } else {
        toast.error('Invalid Pass ❌');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pass not found');
      setVerificationResult({ valid: false, message: error.response?.data?.message || 'Pass not found' });
    } finally {
      setLoading(false);
    }
  };

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasCtxRef.current || !cameraOpen) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        stopCamera();
        handleQRScanned(code.data);
        return;
      }
    }

    if (cameraOpen) {
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
  }, [cameraOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraOpen(true);

        if (!canvasCtxRef.current && canvasRef.current) {
          canvasCtxRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true });
        }

        setTimeout(() => {
          if (cameraOpen) {
            animationRef.current = requestAnimationFrame(scanQRCode);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setError('Unable to access camera. Please check permissions.');
      toast.error('Unable to access camera');
    }
  };

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const handleQRScanned = async (qrText) => {
    if (!qrText || qrText.length === 0) {
      toast.error('Empty QR code data');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);
    toast.info('Processing QR code...');

    try {
      let dataToSend = qrText;
      
      try {
        const parsed = JSON.parse(qrText);
        if (parsed.passNumber) {
          dataToSend = parsed.passNumber;
        } else if (parsed.PassNumber) {
          dataToSend = parsed.PassNumber;
        }
      } catch (e) {
        // Not JSON, use as-is if it's a pass number
        if (!qrText.startsWith('PASS') && !qrText.startsWith('BP')) {
          dataToSend = qrText;
        }
      }

      const res = await verificationAPI.verify(dataToSend);
      setVerificationResult(res.data);
      
      if (res.data.valid) {
        toast.success('Pass Verified Successfully! ✅');
      } else {
        toast.error(res.data.message || 'Invalid Pass ❌');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not verify QR code');
      setVerificationResult({ 
        valid: false, 
        message: error.response?.data?.message || 'Verification failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const captureAndScan = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current || canvas.getContext('2d', { willReadFrequently: true });
    canvasCtxRef.current = ctx;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Video not ready');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      stopCamera();
      handleQRScanned(code.data);
    } else {
      toast.error('No QR code found in the captured image. Try again.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-4 animate-fade-in-up">
            <div className="stat-icon mx-auto mb-3" style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}>
              <Scan size={35} />
            </div>
            <h1 className="h3 mb-2">QR Code Verification</h1>
            <p className="text-muted">Scan QR code or enter pass number to verify</p>
          </div>

          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          <div className="row g-4">
            <div className="col-lg-7 animate-fade-in-up animate-delay-1">
              <div className="card">
                <div className="card-body p-4">
                  <div className="d-grid gap-3 mb-4">
                    {!cameraOpen ? (
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={startCamera}
                        disabled={loading}
                        style={{ padding: '1.5rem' }}
                      >
                        <Scan size={24} className="me-2" />
                        Open Camera to Scan
                      </button>
                    ) : (
                      <div>
                        <button 
                          className="btn btn-secondary btn-lg w-100 mb-3"
                          onClick={stopCamera}
                          style={{ padding: '1rem' }}
                        >
                          Close Camera
                        </button>
                      </div>
                    )}
                  </div>

                  {cameraOpen && (
                    <div className="mb-4">
                      <div className="position-relative" style={{ borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                        <video 
                          ref={videoRef}
                          playsInline
                          muted
                          autoPlay
                          style={{ 
                            width: '100%', 
                            display: 'block',
                            borderRadius: '16px'
                          }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '180px',
                          height: '180px',
                          border: '3px solid #6366f1',
                          borderRadius: '16px',
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                        }} />
                      </div>
                      <button 
                        className="btn btn-success btn-lg w-100 mt-3"
                        onClick={captureAndScan}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <QrCode size={20} className="me-2" />
                            Capture & Verify QR
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-center my-4">
                    <span className="text-muted">OR</span>
                  </div>

                  <form onSubmit={handleManualVerify}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Enter Pass Number (e.g., PASS1234)"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                        disabled={loading}
                      />
                      <button 
                        className="btn btn-primary btn-lg px-4"
                        type="submit"
                        disabled={loading || !manualInput.trim()}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </div>
                  </form>

                  {verificationResult && (
                    <div className={`alert mt-4 ${verificationResult.valid ? 'alert-success' : 'alert-danger'}`}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="stat-icon me-3" style={{ 
                          width: '50px', 
                          height: '50px', 
                          fontSize: '1.2rem',
                          background: verificationResult.valid 
                            ? 'linear-gradient(135deg, var(--success), #059669)'
                            : 'linear-gradient(135deg, var(--danger), #dc2626)'
                        }}>
                          {verificationResult.valid ? (
                            <CheckCircle size={25} />
                          ) : (
                            <XCircle size={25} />
                          )}
                        </div>
                        <div>
                          <h4 className="mb-1">{verificationResult.valid ? 'Valid Pass' : 'Invalid Pass'}</h4>
                          <p className="mb-0 text-muted">{verificationResult.message || (verificationResult.valid ? 'Pass is authentic' : 'Pass could not be verified')}</p>
                        </div>
                      </div>

                      {verificationResult.details && (
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <small className="text-muted d-block">Pass Number</small>
                              <strong style={{ color: 'var(--primary)' }}>{verificationResult.details.passNumber}</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <small className="text-muted d-block">Holder</small>
                              <strong>{verificationResult.details.holderName || 'N/A'}</strong>
                            </div>
                          </div>
                          {verificationResult.details.route && (
                            <div className="col-12">
                              <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <small className="text-muted d-block">Route</small>
                                <strong>{verificationResult.details.route.number}: {verificationResult.details.route.source} → {verificationResult.details.route.destination}</strong>
                              </div>
                            </div>
                          )}
                          <div className="col-6">
                            <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <small className="text-muted d-block">Type</small>
                              <strong className="text-capitalize">{verificationResult.details.passType}</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <small className="text-muted d-block">Valid Till</small>
                              <strong className={verificationResult.details.isExpired ? 'text-danger' : 'text-success'}>
                                {verificationResult.details.validTill ? new Date(verificationResult.details.validTill).toLocaleDateString() : 'N/A'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <small className="text-muted d-flex align-items-center gap-2">
                          <Shield size={14} />
                          Verified at: {verificationResult.verifiedAt ? new Date(verificationResult.verifiedAt).toLocaleString() : new Date().toLocaleString()}
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5 animate-fade-in-up animate-delay-2">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <AlertTriangle size={20} />
                    How to Verify
                  </h5>
                </div>
                <div className="card-body">
                  <ol className="list-unstyled mb-0">
                    <li className="mb-3 d-flex">
                      <span className="badge bg-primary me-3" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                      <div>
                        <strong>Scan QR Code</strong>
                        <p className="text-muted small mb-0">Click "Open Camera" and point at the QR code on the pass</p>
                      </div>
                    </li>
                    <li className="mb-3 d-flex">
                      <span className="badge bg-primary me-3" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                      <div>
                        <strong>Or Enter Pass Number</strong>
                        <p className="text-muted small mb-0">Type the pass number shown on the card</p>
                      </div>
                    </li>
                    <li className="mb-3 d-flex">
                      <span className="badge bg-primary me-3" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                      <div>
                        <strong>Check Result</strong>
                        <p className="text-muted small mb-0">Green = Valid, Red = Invalid/Expired</p>
                      </div>
                    </li>
                    <li className="d-flex">
                      <span className="badge bg-primary me-3" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                      <div>
                        <strong>Verify Identity</strong>
                        <p className="text-muted small mb-0">Match holder name with their ID proof</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRVerification;
