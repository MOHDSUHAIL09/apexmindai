// src/components/ChangePassword.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '../../../api/apiClient';

const ChangePassword = () => {
  // ✅ Get loginid and regno from localStorage
  const getLoginId = () => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        if (parsed.loginid) return parsed.loginid;
        if (parsed.me) return parsed.me;
      } catch (e) {}
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.loginid) return user.loginid;
    if (user?.me) return user.me;
    return 'india';
  };

  const loginid = getLoginId();
  const regno = JSON.parse(localStorage.getItem('user'))?.Regno || 
                JSON.parse(localStorage.getItem('user'))?.regno || 
                localStorage.getItem('regno');

  // State for Login Password Change
  const [loginOtp, setLoginOtp] = useState('');
  const [loginCurrentPassword, setLoginCurrentPassword] = useState('');
  const [loginNewPassword, setLoginNewPassword] = useState('');
  const [loginConfirmPassword, setLoginConfirmPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpVerified, setLoginOtpVerified] = useState(false);
  const [loginSendingOtp, setLoginSendingOtp] = useState(false);
  const [loginVerifyingOtp, setLoginVerifyingOtp] = useState(false);

  // State for Master Password Change
  const [masterOtp, setMasterOtp] = useState('');
  const [masterNewPassword, setMasterNewPassword] = useState('');
  const [masterConfirmPassword, setMasterConfirmPassword] = useState('');
  const [masterLoginPassword, setMasterLoginPassword] = useState('');
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterOtpSent, setMasterOtpSent] = useState(false);
  const [masterOtpVerified, setMasterOtpVerified] = useState(false);
  const [masterSendingOtp, setMasterSendingOtp] = useState(false);
  const [masterVerifyingOtp, setMasterVerifyingOtp] = useState(false);

  // Helper function to clean API message
  const cleanApiMessage = (message, defaultMsg) => {
    if (!message) return defaultMsg;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(message.trim());
    const hasEmail = message.includes('@') && (message.includes('.com') || message.includes('.in') || message.includes('.net'));
    if (isEmail || hasEmail) {
      return defaultMsg;
    }
    return message;
  };

  // ========== SEND OTP (Login) ==========
  const handleLoginSendOtp = async () => {
    if (loginSendingOtp || loginOtpSent) return;
    
    if (!regno) {
      toast.error('Registration number not found. Please login again.');
      return;
    }
    
    setLoginSendingOtp(true);
    try {
      const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});
      
      if (response.data.success || response.data.status === 'success') {
        const cleanMessage = cleanApiMessage(response.data.message, 'OTP sent successfully!');
        toast.success(cleanMessage);
        setLoginOtpSent(true);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      toast.error(msg);
    } finally {
      setLoginSendingOtp(false);
    }
  };

  // ========== VERIFY OTP (Login) ==========
  const handleLoginVerifyOtp = async () => {
    if (loginVerifyingOtp || loginOtpVerified) return;
    
    if (!loginOtp) {
      toast.error('Please enter OTP');
      return;
    }
    
    setLoginVerifyingOtp(true);
    try {
      const response = await apiClient.post('/User/verify-otp', null, {
        params: { loginid, regno, otp: loginOtp }
      });
      
      if (response.data.success) {
        setLoginOtpVerified(true);
        const cleanMessage = cleanApiMessage(response.data.message, 'OTP verified successfully!');
        toast.success(cleanMessage);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      toast.error(msg);
    } finally {
      setLoginVerifyingOtp(false);
    }
  };

  // ========== UPDATE LOGIN PASSWORD ==========
  const handleLoginUpdatePassword = async () => {
    if (loginLoading) return;
    
    if (!loginOtpVerified) {
      toast.error('Please verify OTP first');
      return;
    }
    if (!loginCurrentPassword) {
      toast.error('Please enter current password');
      return;
    }
    if (loginNewPassword !== loginConfirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (loginNewPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await apiClient.post('/User/update-password', {
        regno: Number(regno),
        current_password: loginCurrentPassword,
        new_password: loginNewPassword
      });
      
      if (response.data.success) {
        const cleanMessage = cleanApiMessage(response.data.message, 'Login password updated successfully!');
        toast.success(cleanMessage);
        
        // Reset form
        setLoginOtp('');
        setLoginCurrentPassword('');
        setLoginNewPassword('');
        setLoginConfirmPassword('');
        setLoginOtpSent(false);
        setLoginOtpVerified(false);
      } else {
        toast.error(response.data.message || 'Password update failed');
      }
    } catch (error) {
      let errorMsg = 'Failed to update password';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginCancel = () => {
    setLoginOtp('');
    setLoginCurrentPassword('');
    setLoginNewPassword('');
    setLoginConfirmPassword('');
    setLoginOtpSent(false);
    setLoginOtpVerified(false);
    toast('Login password change cancelled');
  };

  // ========== SEND OTP (Master) ==========
  const handleMasterSendOtp = async () => {
    if (masterSendingOtp || masterOtpSent) return;
    
    if (!regno) {
      toast.error('Registration number not found.');
      return;
    }
    
    setMasterSendingOtp(true);
    try {
      const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});
      
      if (response.data.success || response.data.status === 'success') {
        const cleanMessage = cleanApiMessage(response.data.message, 'OTP sent successfully!');
        toast.success(cleanMessage);
        setMasterOtpSent(true);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      toast.error(msg);
    } finally {
      setMasterSendingOtp(false);
    }
  };

  // ========== VERIFY OTP (Master) ==========
  const handleMasterVerifyOtp = async () => {
    if (masterVerifyingOtp || masterOtpVerified) return;
    
    if (!masterOtp) {
      toast.error('Please enter OTP');
      return;
    }
    
    setMasterVerifyingOtp(true);
    try {
      const response = await apiClient.post('/User/verify-otp', null, {
        params: { loginid, regno, otp: masterOtp }
      });
      
      if (response.data.success) {
        setMasterOtpVerified(true);
        const cleanMessage = cleanApiMessage(response.data.message, 'OTP verified successfully!');
        toast.success(cleanMessage);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      toast.error(msg);
    } finally {
      setMasterVerifyingOtp(false);
    }
  };

  // ========== UPDATE MASTER PASSWORD ==========
  const handleMasterUpdatePassword = async () => {
    if (masterLoading) return;
    
    if (!masterOtpVerified) {
      toast.error('Please verify OTP first');
      return;
    }
    if (masterNewPassword !== masterConfirmPassword) {
      toast.error('New master password and confirm password do not match');
      return;
    }
    if (masterNewPassword.length < 8) {
      toast.error('Master password must be at least 8 characters');
      return;
    }
    if (!masterLoginPassword) {
      toast.error('Please enter login password for verification');
      return;
    }

    setMasterLoading(true);
    try {
      const response = await apiClient.post('/User/update-master-password', {
        regno: Number(regno),
        current_password: masterLoginPassword,
        new_password: masterNewPassword,
        otp: masterOtp
      });
      
      if (response.data.success) {
        const cleanMessage = cleanApiMessage(response.data.message, 'Master password updated successfully!');
        toast.success(cleanMessage);
        
        // Update localStorage
        localStorage.setItem('masterPassword', masterNewPassword);
        
        // Reset form
        setMasterOtp('');
        setMasterNewPassword('');
        setMasterConfirmPassword('');
        setMasterLoginPassword('');
        setMasterOtpSent(false);
        setMasterOtpVerified(false);
      } else {
        toast.error(response.data.message || 'Master password update failed');
      }
    } catch (error) {
      let errorMsg = 'Failed to update master password';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setMasterLoading(false);
    }
  };

  const handleMasterCancel = () => {
    setMasterOtp('');
    setMasterNewPassword('');
    setMasterConfirmPassword('');
    setMasterLoginPassword('');
    setMasterOtpSent(false);
    setMasterOtpVerified(false);
    toast('Master password change cancelled');
  };

  // Button disable conditions
  const isLoginSendOtpDisabled = loginSendingOtp || loginOtpSent;
  const isLoginVerifyOtpDisabled = loginVerifyingOtp || loginOtpVerified || !loginOtp;
  const isLoginUpdateDisabled = loginLoading || !loginOtpVerified || !loginCurrentPassword || !loginNewPassword || !loginConfirmPassword || loginNewPassword !== loginConfirmPassword || loginNewPassword.length < 8;
  
  const isMasterSendOtpDisabled = masterSendingOtp || masterOtpSent;
  const isMasterVerifyOtpDisabled = masterVerifyingOtp || masterOtpVerified || !masterOtp;
  const isMasterUpdateDisabled = masterLoading || !masterOtpVerified || !masterNewPassword || !masterConfirmPassword || !masterLoginPassword || masterNewPassword !== masterConfirmPassword || masterNewPassword.length < 8;

  return (
    <div className="row">
      {/* Change Login Password Card */}
      <div className="col-lg-6 mb-4">
        <div className="card shadow-none border h-100">
          <div className="card-body">
            <h4 className="mb-4">Change Login Password</h4>

            <div className="mb-3">
              <label className="form-label">OTP</label>
              <div className="input-group">
                <input
                  type="text"
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="form-control"
                  disabled={loginOtpVerified}
                />
                {!loginOtpSent ? (
                  <button 
                    onClick={handleLoginSendOtp} 
                    disabled={isLoginSendOtpDisabled}
                    className="btn btn-primary"
                  >
                    {loginSendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : (
                  <button 
                    onClick={handleLoginVerifyOtp} 
                    disabled={isLoginVerifyOtpDisabled}
                    className="btn btn-success"
                  >
                    {loginVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={loginCurrentPassword}
                onChange={(e) => setLoginCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={loginNewPassword}
                onChange={(e) => setLoginNewPassword(e.target.value)}
                placeholder="New Password (min 8 characters)"
                className="form-control"
              />
              {loginNewPassword && loginNewPassword.length < 8 && (
                <small className="text-danger">Password must be at least 8 characters</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={loginConfirmPassword}
                onChange={(e) => setLoginConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="form-control"
              />
              {loginConfirmPassword && loginNewPassword !== loginConfirmPassword && (
                <small className="text-danger">Passwords do not match</small>
              )}
            </div>

            <div className="d-flex gap-2">
              <button 
                onClick={handleLoginUpdatePassword} 
                disabled={isLoginUpdateDisabled}
                className="btn btn-primary flex-grow-1"
              >
                {loginLoading ? 'Updating...' : 'Update Login Password'}
              </button>
              <button onClick={handleLoginCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Master Password Card */}
      <div className="col-lg-6 mb-4">
        <div className="card shadow-none border h-100">
          <div className="card-body">
            <h4 className="mb-4">Change Master Password</h4>

            <div className="mb-3">
              <label className="form-label">OTP</label>
              <div className="input-group">
                <input
                  type="text"
                  value={masterOtp}
                  onChange={(e) => setMasterOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="form-control"
                  disabled={masterOtpVerified}
                />
                {!masterOtpSent ? (
                  <button 
                    onClick={handleMasterSendOtp} 
                    disabled={isMasterSendOtpDisabled}
                    className="btn btn-primary"
                  >
                    {masterSendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : (
                  <button 
                    onClick={handleMasterVerifyOtp} 
                    disabled={isMasterVerifyOtpDisabled}
                    className="btn btn-success"
                  >
                    {masterVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">New Master Password</label>
              <input
                type="password"
                value={masterNewPassword}
                onChange={(e) => setMasterNewPassword(e.target.value)}
                placeholder="New Master Password (min 8 characters)"
                className="form-control"
              />
              {masterNewPassword && masterNewPassword.length < 8 && (
                <small className="text-danger">Password must be at least 8 characters</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Master Password</label>
              <input
                type="password"
                value={masterConfirmPassword}
                onChange={(e) => setMasterConfirmPassword(e.target.value)}
                placeholder="Confirm New Master Password"
                className="form-control"
              />
              {masterConfirmPassword && masterNewPassword !== masterConfirmPassword && (
                <small className="text-danger">Passwords do not match</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Login Password (For Verification)</label>
              <input
                type="password"
                value={masterLoginPassword}
                onChange={(e) => setMasterLoginPassword(e.target.value)}
                placeholder="Enter your login password"
                className="form-control"
              />
            </div>

            <div className="d-flex gap-2">
              <button 
                onClick={handleMasterUpdatePassword} 
                disabled={isMasterUpdateDisabled}
                className="btn btn-warning flex-grow-1"
              >
                {masterLoading ? 'Updating...' : 'Update Master Password'}
              </button>
              <button onClick={handleMasterCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;