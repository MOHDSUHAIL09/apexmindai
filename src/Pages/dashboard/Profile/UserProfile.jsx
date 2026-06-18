import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';
import Toast from '../../../Componenets/ui/Toast';

const UserProfile = () => {
  const { userData} = useUser();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    fullName: "",
    emailId: "",
    mobileNumber: "",
    masterPassword: "",
  });

  useEffect(() => {
    if (userData) {


      const regNo = localStorage.getItem("Regno") || localStorage.getItem("regNo");

      console.log("LocalStorage data:", { regNo });

      setFormData({
        loginId: localStorage.getItem("loginId") || userData?.me || "",
        fullName: userData?.fname || "",
        emailId: userData?.email || "",
        mobileNumber: userData?.MobileNo || userData?.mobile || "",

      });
      setLoading(false);
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUpdating) {
      toast.error("Please wait...");
      return;
    }

    if (!formData.fullName) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.emailId) {
      toast.error("Email ID is required");
      return;
    }
    if (!formData.mobileNumber) {
      toast.error("Mobile number is required");
      return;
    }
    if (!formData.masterPassword) {
      toast.error("Login password is required");
      return;
    }

    setIsUpdating(true);

    try {
      // DIRECT LOCALSTORAGE SE REGNO LE
      const regNo = localStorage.getItem("Regno") || localStorage.getItem("regNo");

      console.log("========== UPDATE PROFILE ==========");
      console.log("RegNo from localStorage:", regNo);
      console.log("Full Name:", formData.fullName);
      console.log("Email:", formData.emailId);
      console.log("Mobile:", formData.mobileNumber);

      if (!regNo) {
        toast.error("Registration number not found!");
        setIsUpdating(false);
        return;
      }

      const requestData = {
        regNo: parseInt(regNo),
        emailID: formData.emailId,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' ') || "",
        mobile: formData.mobileNumber,
        address: "",
        stateId: 0,
        cityId: 0,
        pinCode: "",
        alternateContactNo: ""
      };

      console.log("Sending to API:", JSON.stringify(requestData, null, 2));

      const response = await apiClient.put('/Auth/UpdateProfile', requestData);

      console.log("API Response:", response.data);

      if (response.data?.result === "true" || response.data?.response === true) {

        toast.success("✅ Profile updated successfully!");

        // Refresh page after 1 second
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("❌ Update failed: " + (response.data?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "API Error - Check console");
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="body-wrapper">
      <Toast />
      <div className="container">
        <div className="row mt-4">
          <div className="col-lg-8 ">
            <form onSubmit={handleSubmit}>
              <div className="card">
                <div className="card-body">
                  <h4 className="mb-4">Profile Information</h4>

                  <div className="mb-3">
                    <label>Login ID</label>
                    <input
                      type="text"
                      value={formData.loginId}
                      className="form-control bg-light"
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Email ID *</label>
                    <input
                      type="email"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>



                  <div className="mb-3">
                    <label>Login Password *</label>
                    <div className="input-group">
                      <input
                        type={showMasterPassword ? "text" : "password"}
                        name="masterPassword"
                        placeholder='Enter Your Password'
                        value={formData.masterPassword}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowMasterPassword(!showMasterPassword)}
                      >
                        <i className={showMasterPassword ? "ti ti-eye-off" : "ti ti-eye"}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "UPDATING..." : "UPDATE PROFILE"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;