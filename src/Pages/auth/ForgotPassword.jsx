import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedId = loginId.trim();
    if (!trimmedId) {
      toast.error("Please enter your Login ID / Wallet Address");
      return;
    }
    
    setLoading(true);
    
    try {
      // 🔥 FIXED: Correct API endpoint and request format
      const response = await fetch("http://api.apexmindai.in/api/Auth/ForgetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(trimmedId) // 🔥 Send as string directly
      });
      
      const data = await response.json();
      console.log("📥 API Response:", data);
      
      // 🔥 FIXED: Check response structure
      if (data.result === "true") {
        const responseData = data.response;
        
        // Check if password reset was successful
        if (responseData.result === "Failed to send password. Please try again later.") {
          toast.error(responseData.result);
        } else if (responseData.status === 5 || responseData.isCompletedSuccessfully) {
          toast.success("Password recovery instructions sent to your email/phone!");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          toast.error(responseData.result || "Request failed. Please try again.");
        }
      } else {
        toast.error(data.message || "Request failed. Please try again.");
      }
      
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Network Error! Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('loaded');
    return () => document.body.classList.remove('loaded');
  }, []);

  return (
    <>
      <div className="bd-bg">
        <div className="mediic-appoinment">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
                <div className="d-flex justify-content-center align-items-center">
                  <div className="text-center m-auto">
                    <h1 className="text-white mb-0">APEX&nbsp; MIND &nbsp; AI</h1>
                  </div>
                </div>
              </div> 
              

              <div className="col-lg-6">
                <div className="auth-form">
                  <div className="mediic-section-title2">
                    <h4>FORGOT PASSWORD</h4>
                    <h3 className="Sign-text">Recover your account</h3>
                  </div>
                  <div className="contact-form-box">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-lg-12 col-md-12">
                          <div className="form-box">
                            <input
                              type="text"
                              placeholder="Enter Login ID / Wallet Address"
                              value={loginId}
                              onChange={(e) => setLoginId(e.target.value)}
                              required
                            />
                          </div>  
                        </div>
                        
                        <div className="col-lg-12">
                          <p className="text-dark">
                            Remember password?{" "}
                            <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                             <span className="text-primary ms-2"> Back to Login</span>
                            </a>
                          </p>
                        </div>
                        
                        <div className="col-lg-12 col-md-6">
                          <div className="submit-button">
                            <button type="submit" className="laboix-btn" disabled={loading}>
                              {loading ? "Sending..." : "Recover Password"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;