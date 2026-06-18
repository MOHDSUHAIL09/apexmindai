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

  // State for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ========== UPDATE PASSWORD ==========
  const handleUpdatePassword = async () => {
    if (loading) return;
    
    if (!currentPassword) {
      toast.error('Please enter current password');
      return;
    }
    if (!newPassword) {
      toast.error('Please enter new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('New password cannot be same as current password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/User/update-password', {
        regno: Number(regno),
        current_password: currentPassword,
        new_password: newPassword
      });
      
      if (response.data.success) {
        toast.success('Password updated successfully!');
        
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
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
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast('Password change cancelled');
  };

  // Button disable conditions
  const isUpdateDisabled = loading || !currentPassword || !newPassword || !confirmPassword || 
                           newPassword !== confirmPassword || newPassword.length < 8;

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="card shadow-none border">
          <div className="card-body">
            <h4 className="mb-4">Change Password</h4>

            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="form-control"
              />
              {newPassword && newPassword.length < 8 && (
                <small className="text-danger">Password must be at least 8 characters</small>
              )}
              {newPassword && newPassword.length >= 8 && (
                <small className="text-success">✅ Password strength: Good</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="form-control"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <small className="text-danger">Passwords do not match</small>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                <small className="text-success">✅ Passwords match</small>
              )}
            </div>

            <div className="d-flex gap-2">
              <button 
                onClick={handleUpdatePassword} 
                disabled={isUpdateDisabled}
                className="btn btn-primary flex-grow-1"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
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