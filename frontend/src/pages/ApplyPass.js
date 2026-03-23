import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { routeAPI, applicationAPI } from "../utils/api";
import { toast } from "react-toastify";
import { FileText, Calendar, CreditCard, CheckCircle, Image, MapPin, Bus } from "lucide-react";

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

// City-wide pass base prices (General) per duration
const BASE_PRICE = {
  "1month":   500,
  "3months":  1400,
  "6months":  2500,
  "12months": 4500,
};

// Discount multipliers per pass type
const TYPE_MULTIPLIER = {
  general:  1.0,
  student:  0.5,
  senior:   0.5,
  disabled: 0.3,
};

const PASS_TYPE_LABELS = {
  general:  "General",
  student:  "Student (50% off)",
  senior:   "Senior Citizen (50% off)",
  disabled: "Disabled (70% off)",
};

const DURATION_LABELS = {
  "1month":   "1 Month",
  "3months":  "3 Months",
  "6months":  "6 Months",
  "12months": "12 Months",
};

const calcFare = (passType, duration) =>
  Math.round(BASE_PRICE[duration] * TYPE_MULTIPLIER[passType]);

const ApplyPass = () => {
  const [searchParams] = useSearchParams();
  const renewId = searchParams.get("renew");
  const navigate = useNavigate();
  const fileInputRef = useRef({});

  const [selectedState, setSelectedState] = useState("Gujarat");
  const [selectedCity, setSelectedCity] = useState("Ahmedabad");
  const [routeId, setRouteId] = useState(""); // silent backend field

  const [formData, setFormData] = useState({
    passType: "general",
    duration: "1month",
    startDate: new Date().toISOString().split("T")[0],
    idProof: "",
    photo: "",
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [previewIdProof, setPreviewIdProof] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const fare = calcFare(formData.passType, formData.duration);

  // Silently fetch first available route for backend requirement
  useEffect(() => {
    routeAPI.getAll({ isActive: true })
      .then(res => {
        const routes = res.data.routes || [];
        if (routes.length > 0) setRouteId(routes[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (renewId) loadRenewalData();
  }, [renewId]);

  const loadRenewalData = async () => {
    try {
      const res = await applicationAPI.getById(renewId);
      const app = res.data.application;
      setFormData({
        passType: app.passType,
        duration: app.duration,
        startDate: new Date(app.endDate).toISOString().split("T")[0],
        idProof: app.documents.idProof || "",
        photo: app.documents.photo || "",
      });
      if (app.documents.idProof) setPreviewIdProof(app.documents.idProof);
      if (app.documents.photo) setPreviewPhoto(app.documents.photo);
    } catch {
      toast.error("Error loading renewal data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

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
        routeId,
        passType: formData.passType,
        duration: formData.duration,
        startDate: formData.startDate,
        idProof: formData.idProof,
        photo: formData.photo,
        totalAmount: fare,
      });
      toast.success("Application submitted successfully!");
      navigate("/my-applications");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  const infoBox = { background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "0.85rem 1rem" };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-8">

          {/* Header */}
          <div className="text-center mb-4 animate-fade-in-up">
            <div className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 70, height: 70, borderRadius: 20, background: "linear-gradient(135deg,var(--primary),var(--accent2))", boxShadow: "0 10px 30px rgba(99,102,241,0.4)" }}>
              <Bus size={32} color="white" />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)" }}>
              {renewId ? "Renew City Bus Pass" : "Apply for City Bus Pass"}
            </h1>
            <p className="text-muted mb-0">Valid for unlimited travel across the entire city</p>
          </div>

          <div className="card animate-fade-in-up animate-delay-1 mb-4">
            <div className="card-body p-4">

              {/* Stepper */}
              <div className="d-flex justify-content-center mb-4">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  {[["1", "Pass"], ["2", "Documents"], ["3", "Confirm"]].map(([n, label], i) => (
                    <React.Fragment key={n}>
                      <div className="d-flex align-items-center gap-2" style={{ color: step >= i + 1 ? "var(--primary-light)" : "var(--text3)" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 36, height: 36, fontSize: "0.9rem",
                            background: step > i + 1 ? "var(--success)" : step === i + 1 ? "var(--primary)" : "rgba(255,255,255,0.1)",
                            color: step >= i + 1 ? "#fff" : "var(--text3)" }}>
                          {step > i + 1 ? <CheckCircle size={18} /> : n}
                        </div>
                        <span style={{ fontWeight: 600 }}>{label}</span>
                      </div>
                      {i < 2 && <span style={{ color: "var(--text3)" }}>&#8594;</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>

                {/* STEP 1 — Pass Details */}
                {step === 1 && (
                  <div className="animate-fade-in-up">

                    {/* State + City */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label d-flex align-items-center gap-2">
                          <MapPin size={15} /> State
                        </label>
                        <select className="form-select" value={selectedState}
                          onChange={e => { setSelectedState(e.target.value); setSelectedCity(LOCATION_DATA[e.target.value]?.[0] || ""); }}>
                          {Object.keys(LOCATION_DATA).map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label d-flex align-items-center gap-2">
                          <MapPin size={15} /> City
                        </label>
                        <select className="form-select" value={selectedCity}
                          onChange={e => setSelectedCity(e.target.value)}>
                          {(LOCATION_DATA[selectedState] || []).map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* City pass info banner */}
                    <div className="mb-4 p-3 rounded d-flex align-items-center gap-3"
                      style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,var(--primary),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Bus size={20} color="white" />
                      </div>
                      <div>
                        <div style={{ color: "var(--text)", fontWeight: 700, fontSize: "0.95rem" }}>
                          City-Wide Pass — {selectedCity}, {selectedState}
                        </div>
                        <div style={{ color: "var(--text3)", fontSize: "0.8rem" }}>
                          Travel unlimited on all city bus routes
                        </div>
                      </div>
                    </div>

                    {/* Pass Type */}
                    <div className="row mb-3 g-3">
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

                    {/* Start Date */}
                    <div className="mb-4">
                      <label className="form-label d-flex align-items-center gap-2">
                        <Calendar size={16} /> Start Date
                      </label>
                      <input type="date" className="form-control" name="startDate" value={formData.startDate}
                        onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
                    </div>

                    {/* Fare display */}
                    <div className="mb-4 p-3 rounded d-flex justify-content-between align-items-center"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <CreditCard size={16} style={{ color: "var(--success)" }} />
                          <span style={{ color: "var(--text)", fontWeight: 600 }}>Pass Price</span>
                        </div>
                        <small className="text-muted">
                          {PASS_TYPE_LABELS[formData.passType]} · {DURATION_LABELS[formData.duration]}
                        </small>
                      </div>
                      <h3 className="mb-0" style={{ color: "var(--success)", fontWeight: 800 }}>Rs.{fare}</h3>
                    </div>

                    <button type="button" className="btn btn-primary w-100" onClick={() => setStep(2)}>
                      Continue to Documents
                    </button>
                  </div>
                )}

                {/* STEP 2 — Documents */}
                {step === 2 && (
                  <div className="animate-fade-in-up">
                    <div className="row mb-4 g-3">
                      <div className="col-md-6">
                        <label className="form-label d-flex align-items-center gap-2"><Image size={16} /> ID Proof</label>
                        <input type="file" className="form-control" accept="image/*"
                          onChange={e => handleFileChange(e, "idProof")}
                          ref={el => (fileInputRef.current["idProof"] = el)} />
                        <small className="text-muted">Aadhar Card, Voter ID, PAN Card etc.</small>
                        {previewIdProof && <img src={previewIdProof} alt="ID" className="img-thumbnail mt-2" style={{ maxHeight: 150, borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)" }} />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label d-flex align-items-center gap-2"><Image size={16} /> Passport Photo</label>
                        <input type="file" className="form-control" accept="image/*"
                          onChange={e => handleFileChange(e, "photo")}
                          ref={el => (fileInputRef.current["photo"] = el)} />
                        <small className="text-muted">Recent passport size photo</small>
                        {previewPhoto && <img src={previewPhoto} alt="Photo" className="img-thumbnail mt-2" style={{ maxHeight: 150, borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)" }} />}
                      </div>
                    </div>
                    <div className="d-flex gap-3">
                      <button type="button" className="btn btn-secondary flex-grow-1" onClick={() => setStep(1)}>Back</button>
                      <button type="button" className="btn btn-primary flex-grow-1"
                        onClick={() => setStep(3)} disabled={!formData.idProof || !formData.photo}>
                        Review Application
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Review */}
                {step === 3 && (
                  <div className="animate-fade-in-up">
                    <div className="mb-4 p-4 rounded" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)" }}>
                      <h5 className="mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text)" }}>
                        <CheckCircle size={22} style={{ color: "var(--success)" }} /> Review Your Application
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div style={infoBox}>
                            <small className="text-muted">City</small>
                            <p className="mb-0 fw-bold" style={{ color: "var(--text)" }}>{selectedCity}, {selectedState}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div style={infoBox}>
                            <small className="text-muted">Pass Type</small>
                            <p className="mb-0 fw-bold text-capitalize" style={{ color: "var(--text)" }}>{PASS_TYPE_LABELS[formData.passType]}</p>
                            <p className="mb-0 text-muted small">{DURATION_LABELS[formData.duration]}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div style={infoBox}>
                            <small className="text-muted">Start Date</small>
                            <p className="mb-0 fw-bold" style={{ color: "var(--text)" }}>{new Date(formData.startDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div style={infoBox}>
                            <small className="text-muted">Coverage</small>
                            <p className="mb-0 fw-bold" style={{ color: "var(--text)" }}>All City Routes</p>
                            <p className="mb-0 text-muted small">Unlimited travel</p>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="p-3 rounded d-flex justify-content-between align-items-center"
                            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                            <span className="text-muted">Total Amount</span>
                            <h3 className="mb-0" style={{ color: "var(--success)", fontWeight: 800 }}>Rs.{fare}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-3">
                      <button type="button" className="btn btn-secondary flex-grow-1" onClick={() => setStep(2)}>Back</button>
                      <button type="submit" className="btn btn-success flex-grow-1" disabled={loading}>
                        {loading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                          : <><CheckCircle size={18} className="me-2" />Submit Application</>}
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
