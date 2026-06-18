import { useState } from 'react';
import './SocalMediaTask.css';
import { useNavigate } from 'react-router-dom';

const SocalMediaTask = () => {
  // State management
  const [formData, setFormData] = useState({
    url: '',
    appName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate(); 

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show toast function
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // History button click handler
  const handleHistoryClick = () => {
    navigate('/dashboard/SocalMediaTaskHistory');
  };;

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.url || !formData.appName) {
      showToast('Please fill all fields', 'error');
      setLoading(false);
      return;
    }
    
    const regno = localStorage.getItem('Regno');
    
    if (!regno) {
      showToast('Registration number not found in localStorage', 'error');
      setLoading(false);
      return;
    }
    
    try {
      const apiResponse = await fetch('http://api.apexmindai.in/api/Dashboard/SocialTask', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          regno: parseInt(regno),
          url: formData.url,
          appName: formData.appName
        })
      });

      const data = await apiResponse.json();
      
      if (data.result === "true") {
        showToast(data.message || 'Url saved successfully', 'success');
        setFormData({ url: '', appName: '' });
      } else {
        showToast(data.message || 'Something went wrong', 'error');
      }
      
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="social-task-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✗'}
            </span>
            {toast.message}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="form-card py-3 rounded-3">
        {/* Header with History Button */}
        <div className="d-flex justify-content-between px-3">
          <div className="form-header">
            <h2 className=" text-dark">Social Media Task</h2>
          </div>
          <button className="btn btn-primary" onClick={handleHistoryClick}>
             History             
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="form-body01 px-4">
          {/* URL Field */}
          <div className="form-group">
            <div className="text-dark mt-4">
              🔗 URL Link
            </div>
            <input
              type="url"
              name="url"
              className="form-input"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
          </div>

          {/* App Name Field */}
          <div className="form-group">
            <div className="text-dark mt-3">
              📱 App Name
            </div>
            <input
              type="text"
              name="appName"
              className="form-input"
              value={formData.appName}
              onChange={handleChange}
              placeholder="Enter app name"
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn mb-5 mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                Submitting...
              </span>
            ) : (
              'Submit Task →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocalMediaTask;