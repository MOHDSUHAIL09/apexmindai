import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import apiClient from "../../api/apiClient";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    deviceId: "web-browser"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      loginId: formData.loginId,
      password: formData.password,
      deviceId: formData.deviceId     
    };
    
    console.log("📤 Login payload:", payload);
    
    try {
      const response = await apiClient.post("/Auth/Login", payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });
      
        const data = response.data;
    console.log("📥 API Response:", data);
    
    if (data.result === "true" && data.response) {
      const userData = data.response;
        
        // 🔥 CRITICAL: Save regno to localStorage
        const regno = userData.regNo || userData.regno || userData.Regno;
        localStorage.setItem("Regno", regno);     
       
        
        // Save other user data
        localStorage.setItem("loginId", userData.loginid); 
        localStorage.setItem("isLoggedIn", "true");
               
        toast.success("Login Successful!");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        let errorMsg = "Invalid Login Details";
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
      console.error("Login Error:", error);
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
      <div className="mediic-appoinment">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
              <div className="d-flex justify-content-center align-items-center">
                <div className="text-center m-auto">
                  <div className="text-white mb-0" style={{fontSize: "40px",fontWeight: "800"}}>APEX &nbsp; MIND &nbsp; AI</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="auth-form">
                <div className="mediic-section-title2">
                  <h4>LOGIN ACCOUNT</h4>
                  <h3 className="Sign-text">Login to your account</h3>
                </div>
                <div className="contact-form-box">
                  <form onSubmit={handleLogin}>
                    <div className="row">
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="text"
                            name="loginId"
                            placeholder="Login ID"
                            value={formData.loginId}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="password"
                            name="password"
                            placeholder="Password*"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="text-black mb-2">
                          Forgot password?{" "}
                          <Link to="/forgotpassword">
                         <span className="text-primary"> Reset Here</span> 
                          </Link>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <p className="text-black">
                          Don't have an account?{" "}
                          <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>
                            <span className="text-primary">Create Account</span> 
                          </a>
                        </p>
                      </div>
                      <div className="col-lg-12 col-md-6">
                        <div className="submit-button">
                          <button type="submit" className="laboix-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login Now"}                         
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
    </>
  );
};

export default Login;