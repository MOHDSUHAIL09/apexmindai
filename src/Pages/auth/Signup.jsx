import  { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCopy, FaCheck, FaUser, FaIdCard,  } from "react-icons/fa";
import './auth.css'

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const [formData, setFormData] = useState({
    introRegNo: "",
    fName: "",
    lName: "",
    mobile: "",
    email: "",
    password: "",
    address: "N/A",
    referrer: "",      
    referrer_Id: "",
    affiliate_Level: 1,
    sponsorName: "",
    walletAddress: "",
  });

  // SPONSOR DETAILS FETCH FUNCTION
  const fetchSponsorDetails = async (sponsorId) => {
    if (!sponsorId || !sponsorId.trim()) return;
    
    try {
      const response = await fetch(`http://api.apexmindai.in/api/Auth/UserDetailsById?loingId=${sponsorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      
      const data = await response.json();
      console.log("Sponsor Data:", data);
      
      if (data?.result === "true" && data.user) {
        const sponsorName = data.user.fName || data.user.LoginID;
        
        setFormData(prev => ({
          ...prev,
          sponsorName: sponsorName,
          referrer: sponsorName,
          introRegNo: data.user.regNo,
        }));
        
        toast.success(`Sponsor: ${sponsorName}`);
      } else {
        setFormData(prev => ({ 
          ...prev, 
          sponsorName: "Invalid Sponsor", 
          referrer: "",
          introRegNo: "" 
        }));
        toast.error("Invalid Sponsor ID!");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setFormData(prev => ({ 
        ...prev, 
        sponsorName: "Network Error", 
        referrer: "",
        introRegNo: "" 
      }));
      toast.error("Cannot connect to server!");
    }
  };

  // URL SE REF PARAM READ KARO
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    if (refCode && !formData.referrer_Id) {
      console.log("✅ Auto-filling sponsor ID with:", refCode);
      setFormData(prev => ({
        ...prev,
        referrer_Id: refCode,
        introRegNo: refCode,
      }));
      fetchSponsorDetails(refCode);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "introRegNo") {
      setFormData((prev) => ({ ...prev, referrer_Id: value }));
      fetchSponsorDetails(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    console.log("🔴 Signup button clicked!");
    
    // Validations
    if (!formData.sponsorName || formData.sponsorName === "Invalid Sponsor") {
      toast.error("Valid Sponsor ID daalein!");
      return;
    }
    
    if (!formData.fName) {
      toast.error("Full name required!");
      return;
    }
    
    if (!formData.mobile || formData.mobile.length !== 10) {
      toast.error("Valid 10-digit mobile number required!");
      return;
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      toast.error("Valid email address required!");
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    
    setLoading(true);
    
    const payload = {
      introRegNo: parseInt(formData.introRegNo) || 0,
      fName: formData.fName.trim(),
      lName: formData.lName.trim() || "",
      mobile: formData.mobile.toString(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      address: formData.address,
      referrer: formData.referrer.trim(),
      referrer_Id: formData.referrer_Id.toString(),
      affiliate_Level: parseInt(formData.affiliate_Level) || 1,
    };

    console.log("📤 Sending payload:", payload);

    try {
      const response = await fetch("http://api.apexmindai.in/api/Auth/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log("📥 API Response:", data);
      
      if (data.result === "true" && data.response) {
        const userResponse = data.response;
        
        // 🔥 FIXED: Save regno properly to localStorage
        // The API returns 'Regno' (capital R), so use that
        const regnoValue = userResponse.Regno || userResponse.regno;
        const loginIdValue = userResponse.LoginID || userResponse.loginid;
        
        console.log("✅ Saving to localStorage - Regno:", regnoValue);
        console.log("✅ Saving to localStorage - LoginID:", loginIdValue);
        
        // Save to localStorage with both formats for compatibility
        localStorage.setItem("regno", regnoValue);           // lowercase for your Dashboard
        localStorage.setItem("Regno", regnoValue);           // original format
        localStorage.setItem("loginId", loginIdValue);
        localStorage.setItem("loginid", loginIdValue);       // lowercase version
        localStorage.setItem("isLoggedIn", "true");
        
        // Save complete user object
        const userObject = {
          regno: regnoValue,
          Regno: regnoValue,
          loginid: loginIdValue,
          LoginID: loginIdValue,
          name: formData.fName + " " + formData.lName,
          fname: formData.fName,
          mobile: formData.mobile,
          email: userResponse.emailID || formData.email,
          introregno: parseInt(formData.introRegNo) || 0,
          directid: 0,
          walletAddress: formData.walletAddress || "",
        };
        
        localStorage.setItem("user", JSON.stringify(userObject));
        
        console.log("✅ User object saved:", userObject);
        console.log("✅ regno in localStorage:", localStorage.getItem("regno"));
        
        setRegisteredUser({
          regno: regnoValue,
          loginId: loginIdValue,
          name: formData.fName + " " + formData.lName,
          email: userResponse.emailID || formData.email,
          mobile: formData.mobile,
          sponsorId: formData.referrer_Id,
          sponsorName: formData.sponsorName,
          password: formData.password,
        });
        
        setShowSuccessModal(true);
        toast.success("Registration Successful!");
        
        // Optional: Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        
      } else {
        let errorMsg = "Registration Failed";
        if (data.message) {
          if (Array.isArray(data.message)) {
            errorMsg = data.message.join(", ");
          } else {
            errorMsg = data.message;
          }
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("Network Error! Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mediic-appoinment">    
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
              <div className="d-flex justify-content-center align-items-center">
                <div className="text-center m-auto">
                  <div className="text-white mb-0" style={{fontSize: "40px", fontWeight: "800"}}>APEX &nbsp; MIND &nbsp; AI</div>
                </div>
              </div>
            </div> 
          
            <div className="col-lg-6">
              <div className="auth-form">            
                <div className="mediic-section-title22">
                  <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                    <div>
                      <h4 className="mb-1">SIGNUP ACCOUNT</h4>
                      <h3 className="Sign-text mb-0">Sign up to your account</h3>
                    </div>
                  </div>

                  <form onSubmit={handleSignup}>  
                    <div className="row">
              
                      {/* Sponsor ID */}
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="text" 
                            name="introRegNo" 
                            placeholder="Sponsor ID*" 
                            value={formData.referrer_Id} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      {/* Sponsor Name */}
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="text" 
                            value={formData.sponsorName} 
                            readOnly 
                            placeholder="Sponsor Name" 
                            className="readonly-input" 
                            style={{ 
                              color: formData.sponsorName === "Invalid Sponsor" ? "#ff0000" : "#008202", 
                              fontWeight: "600" 
                            }} 
                          />
                        </div>
                      </div>
                    
                      {/* Full Name */}
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="text" 
                            name="fName" 
                            placeholder="Full Name*" 
                            value={formData.fName} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      {/* Email */}
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address*" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      {/* Mobile */}
                      <div className="col-lg-12">
                        <div className="form-box d-flex" style={{ gap: "10px" }}>
                          <div className="mt-3">
                            <span style={{ padding: "16px 20px", background: "#dadada", borderRadius: "12px" }}>+91</span>
                          </div>
                          <input 
                            type="text" 
                            name="mobile" 
                            placeholder="Mobile Number*" 
                            maxLength="10" 
                            value={formData.mobile} 
                            onChange={handleChange} 
                            required 
                            style={{ flex: 1 }} 
                          />
                        </div>
                      </div>
                      
                      {/* Password */}
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="password" 
                            name="password" 
                            placeholder="Create Password* (min 6 characters)" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="col-lg-12">
                        <p className="text-black">
                          Already have an account? 
                          <a href="/login" onClick={(e) => { 
                            e.preventDefault(); 
                            navigate("/login"); 
                          }}><span className="text-primary ms-2">Login Here</span></a>
                        </p>
                      </div>
                      
                      <div className="col-lg-12">
                        <button type="submit" className="laboix-btn" disabled={loading}>
                          {loading ? "Creating Account..." : "Signup Now"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && registeredUser && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="success-modal02" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header02">
              <div className="success-icon02">✓</div>
              <div className="Registration-text">Registration Successful</div>
              <button className="modal-close02" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-body02">
              <div className="user-details-card02">
                <div className="Account-text">
                  <FaIdCard /> Your Account Details
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Registration No:</div>
                  <div className="detail-value02">
                    {registeredUser.regno}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.regno, "Registration No")}>
                      {copiedField === "Registration No" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Login ID:</div>
                  <div className="detail-value02">
                    {registeredUser.loginId}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.loginId, "Login ID")}>
                      {copiedField === "Login ID" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Sponsor ID:</div>
                  <div className="detail-value02">
                    {registeredUser.sponsorId}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.sponsorId, "Sponsor ID")}>
                      {copiedField === "Sponsor ID" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Sponsor Name:</div>
                  <div className="detail-value02">{registeredUser.sponsorName}</div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Password:</div>
                  <div className="detail-value02">
                    {"•".repeat(8)}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.password, "Password")}>
                      {copiedField === "Password" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions02">
                <Link to="/login">
                  <button className="btn-dashboard02" onClick={handleModalClose}>
                    GO TO LOGIN
                  </button>  
                </Link>          
              </div>  
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;