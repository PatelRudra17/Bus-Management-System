import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { routeAPI, applicationAPI } from "../utils/api";
import { toast } from "react-toastify";
import { Calendar, CreditCard, CheckCircle, Image, MapPin, Bus, ArrowLeft, ArrowRight, Upload } from "lucide-react";

const LOCATION_DATA = {
  "Gujarat":       ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Maharashtra":   ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Delhi":         ["New Delhi", "Dwarka", "Rohini", "Noida"],
  "Karnataka":     ["Bengaluru", "Mysuru", "Hubli"],
  "Tamil Nadu":    ["Chennai", "Coimbatore", "Madurai"],
  "Rajasthan":     ["Jaipur", "Jodhpur", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi"],
  "West Bengal":   ["Kolkata", "Howrah", "Durgapur"],
};

const BASE_PRICE = { "1month": 500, "3months": 1400, "6months": 2500, "12months": 4500 };
const TYPE_MULTIPLIER = { general: 1.0, student: 0.5, senior: 0.5, disabled: 0.3 };
const PASS_TYPE_LABELS = { general: "General", student: "Student (50% off)", senior: "Senior Citizen (50% off)", disabled: "Disabled (70% off)" };
const DURATION_LABELS = { "1month": "1 Month", "3months": "3 Months", "6months": "6 Months", "12months": "12 Months" };
const calcFare = (passType, duration) => Math.round(BASE_PRICE[duration] * TYPE_MULTIPLIER[passType]);

const ApplyPass = () => {
  const [searchParams] = useSearchParams();
  const renewId = searchParams.get("renew");
  const navigate = useNavigate();
  const fileInputRef = useRef({});

  const [selectedState, setSelectedState] = useState("Gujarat");
  const [selectedCity, setSelectedCity] = useState("Ahmedabad");
  const [routeId, setRouteId] = useState("");
  const [formData, setFormData] = useState({
    passType: "general", duration: "1month",
    startDate: new Date().toISOString().split("T")[0], idProof: "", photo: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [previewIdProof, setPreviewIdProof] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const fare = calcFare(formData.passType, formData.duration);

  useEffect(() => {
    routeAPI.getAll({ isActive: true }).then(res => {
      const routes = res.data.routes || [];
      if (routes.length > 0) setRouteId(routes[0]._id);
    }).catch(() => {});
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (renewId) loadRenewalData(); }, [renewId]);

  const loadRenewalData = async () => {
    try {
      const res = await applicationAPI.getById(renewId);
      const app = res.data.application;
      setFormData({
        passType: app.passType, duration: app.duration,
        startDate: new Date(app.endDate).toISOString().split("T")[0],
        idProof: app.documents.idProof || "", photo: app.documents.photo || "",
      });
      if (app.documents.idProof) setPreviewIdProof(app.documents.idProof);
      if (app.documents.photo) setPreviewPhoto(app.documents.photo);
    } catch { toast.error("Error loading renewal data"); }
  };

  const handleChange = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File size should be less than 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setFormData(f => ({ ...f, [field]: result }));
      if (field === "idProof") setPreviewIdProof(result);
      else setPreviewPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!routeId) { toast.error("Routes not loaded yet, please wait"); return; }
    if (!formData.idProof) { toast.error("Please upload ID proof"); return; }
    if (!formData.photo) { toast.error("Please upload your photo"); return; }
    setLoading(true);
    try {
      await applicationAPI.create({
        routeId, passType: formData.passType, duration: formData.duration,
        startDate: formData.startDate, idProof: formData.idProof,
        photo: formData.photo, totalAmount: fare,
      });
      toast.success("Application submitted successfully!");
      navigate("/my-applications");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting application");
    } finally { setLoading(false); }
  };

  const steps = [
    { num: 1, label: "Pass Details" },
    { num: 2, label: "Documents" },
    { num: 3, label: "Review" },
  ];

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }} className="animate-fade-in-up">
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-primary)',
            }}>
              <Bus size={26} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {renewId ? "Renew City Bus Pass" : "Apply for City Bus Pass"}
            </h1>
            <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.875rem' }}>
              Valid for unlimited travel across the entire city
            </p>
          </div>

          <div className="card animate-fade-in-up animate-delay-1">
            <div className="card-body" style={{ padding: '2rem' }}>
              {/* Stepper */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                {steps.map(({ num, label }, i) => (
                  <React.Fragment key={num}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      color: step >= num ? 'var(--primary)' : 'var(--text-muted)',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8125rem',
                        background: step > num ? 'var(--success)' : step === num ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: step >= num ? 'white' : 'var(--text-muted)',
                        transition: 'all 0.2s',
                      }}>
                        {step > num ? <CheckCircle size={16} /> : num}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{label}</span>
                    </div>
                    {i < 2 && (
                      <div style={{
                        width: 40, height: 2, alignSelf: 'center',
                        background: step > num ? 'var(--success)' : 'var(--border)',
                        borderRadius: 1, transition: 'all 0.3s',
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1 */}
                {step === 1 && (
                  <div className="animate-fade-in-up">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label"><MapPin size={14} /> State</label>
                        <select className="form-select" value={selectedState}
                          onChange={e => { setSelectedState(e.target.value); setSelectedCity(LOCATION_DATA[e.target.value]?.[0] || ""); }}>
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
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-50)', border: '1px solid var(--primary-100)',
                      marginBottom: '1.25rem',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bus size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          City-Wide Pass — {selectedCity}, {selectedState}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          Travel unlimited on all city bus routes
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Pass Type</label>
                        <select className="form-select" name="passType" value={formData.passType} onChange={handleChange}>
                          {Object.entries(PASS_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Duration</label>
                        <select className="form-select" name="duration" value={formData.duration} onChange={handleChange}>
                          {Object.entries(DURATION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label"><Calendar size={14} /> Start Date</label>
                      <input type="date" className="form-control" name="startDate" value={formData.startDate}
                        onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                      background: 'var(--success-50)', border: '1px solid var(--success-100)',
                      marginBottom: '1.5rem',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <CreditCard size={14} style={{ color: 'var(--success)' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Pass Price</span>
                        </div>
                        <small style={{ color: 'var(--text-tertiary)' }}>
                          {PASS_TYPE_LABELS[formData.passType]} · {DURATION_LABELS[formData.duration]}
                        </small>
                      </div>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>₹{fare}</span>
                    </div>

                    <button type="button" className="btn btn-primary w-100 btn-lg" onClick={() => setStep(2)}>
                      Continue to Documents <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="animate-fade-in-up">
                    <div className="row g-4 mb-4">
                      {[
                        { field: "idProof", label: "ID Proof", hint: "Aadhar, Voter ID, PAN Card", preview: previewIdProof },
                        { field: "photo", label: "Passport Photo", hint: "Recent passport size photo", preview: previewPhoto },
                      ].map(({ field, label, hint, preview }) => (
                        <div className="col-md-6" key={field}>
                          <label className="form-label"><Upload size={14} /> {label}</label>
                          <div style={{
                            border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                            background: 'var(--bg-secondary)', transition: 'all 0.2s',
                          }}
                            onClick={() => fileInputRef.current[field]?.click()}>
                            {preview ? (
                              <img src={preview} alt={label} style={{ maxHeight: 140, borderRadius: 8, marginBottom: '0.5rem' }} />
                            ) : (
                              <div style={{ padding: '1rem 0' }}>
                                <Image size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                  Click to upload
                                </p>
                              </div>
                            )}
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</p>
                          </div>
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => handleFileChange(e, field)}
                            ref={el => (fileInputRef.current[field] = el)} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button type="button" className="btn btn-primary" style={{ flex: 1 }}
                        onClick={() => setStep(3)} disabled={!formData.idProof || !formData.photo}>
                        Review Application <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="animate-fade-in-up">
                    <div style={{
                      padding: '1.5rem', borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      marginBottom: '1.5rem',
                    }}>
                      <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', fontSize: '1rem' }}>
                        <CheckCircle size={18} style={{ color: 'var(--success)' }} /> Review Your Application
                      </h5>
                      <div className="row g-3">
                        {[
                          ["City", `${selectedCity}, ${selectedState}`],
                          ["Pass Type", `${PASS_TYPE_LABELS[formData.passType]} · ${DURATION_LABELS[formData.duration]}`],
                          ["Start Date", new Date(formData.startDate).toLocaleDateString()],
                          ["Coverage", "All City Routes — Unlimited travel"],
                        ].map(([label, value]) => (
                          <div className="col-md-6" key={label}>
                            <div style={{
                              background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
                              padding: '0.875rem 1rem', border: '1px solid var(--border)',
                            }}>
                              <small style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</small>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{value}</p>
                            </div>
                          </div>
                        ))}
                        <div className="col-12">
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--success-50)', border: '1px solid var(--success-100)',
                          }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Amount</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>₹{fare}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={loading}>
                        {loading
                          ? <><span className="spinner-border spinner-border-sm" /> Submitting...</>
                          : <><CheckCircle size={16} /> Submit Application</>}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPass;
