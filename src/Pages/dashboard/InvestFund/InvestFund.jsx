// InvestFund.jsx
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Invest.css';
import { Link } from 'react-router-dom';

const InvestFund = () => {
  // 🔥 Dono bots ke liye alag states
  const [bot1Amount, setBot1Amount] = useState('');
  const [bot2Amount, setBot2Amount] = useState('');
  const [loadingBot1, setLoadingBot1] = useState(false);
  const [loadingBot2, setLoadingBot2] = useState(false);

  const regno = 1; // replace with actual user regno

  // 🔥 Common function – dono bots ke liye same logic
  const investInBot = async (botId, amount) => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('❌ Please enter a valid amount.');
      return;
    }

    if (botId === 1 && (parseFloat(amount) < 100 || parseFloat(amount) > 999)) {
      toast.error('❌ Bot 1: Amount must be between $100 and $999.');
      return;
    }
    if (botId === 2 && (parseFloat(amount) < 1000 || parseFloat(amount) > 5000)) {
      toast.error('❌ Bot 2: Amount must be between $1000 and $5000.');
      return;
    }

    // 🔥 Sirf usi bot ka loading true
    if (botId === 1) setLoadingBot1(true);
    else setLoadingBot2(true);

    const payload = {
      regno: regno,
      rkprice: parseFloat(amount),
      uRegno: 0,
    };

    try {
      const response = await fetch('http://api.apexmindai.in/api/Dashboard/Investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.result === 'true') {
        toast.success(` ${data.message}`);
        // 🔥 Sirf usi bot ka amount clear
        if (botId === 1) setBot1Amount('');
        else setBot2Amount('');
      } else {
        toast.error(`❌ ${data.message || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error('❌ Network error. Please try again.');
    } finally {
      // 🔥 Sirf usi bot ka loading false
      if (botId === 1) setLoadingBot1(false);
      else setLoadingBot2(false);
    }
  };

  return (
    <>
      <div className='Table-container'>
        {/* Header */}
        <div className="header-container">
          <div className="d-flex justify-content-between align-items-center p-3 p-md-4 bg-white rounded-3 shadow-sm mb-4 border border-light">
            <h2 className="text-dark fw-bold mb-0" style={{ fontSize: "clamp(18px, 3vw, 28px)" }}>
              Invest Bot
            </h2>
            <Link to="/dashboard/InvestmentHistory">
              <button type="button" className="btn btn-primary px-3 px-md-4 py-2">
                History
              </button>
            </Link>
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        {/* Cards Grid - Fully Responsive */}
        <div className="row g-3 g-md-4">
          
          {/* ==================== BOT 1 ==================== */}
          <div className="col-12 col-md-6 col-lg-6 d-flex align-items-stretch">
            <div className="invest-card w-100">
              
              {/* Card Header - INLINE STYLE */}
              <div 
                className="card-header" 
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "14px 20px",
                  textAlign: "center",
                  borderBottom: "none",
                  borderRadius: "16px 16px 0 0"
                }}
              >
                <span 
                  className="bot-name" 
                  style={{
                    color: "#ffffff",
                    fontSize: "20px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    margin: 0
                  }}
                >
                  🤖 Bot 1
                </span>
              </div>
              
              <div className="image-wrapper">
                <img
                  src="https://i.pinimg.com/1200x/18/39/fe/1839fe826cbbda43160f5aa76031d9a3.jpg"
                  alt="Bot 1"
                  className="bot-image"
                />
              </div>
              
              <div className="c-box">
                <div className="card-body01 p-2 p-md-3">
                  <div className="input-group02">
                    <span className="currency-icon">$</span>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      className="amount-input"
                      value={bot1Amount}
                      onChange={(e) => setBot1Amount(e.target.value)}
                      disabled={loadingBot1}
                    />
                  </div>
                  
                  <div className="note-section d-flex">
                    <span className="note-label">Note:</span>
                    <p className="mb-0">A member will get 2.5% profit on equity deposit weekly.</p>
                  </div>
                  
                  <div className="limit-section">
                    <span className="limit-label">Limit:</span>
                    <span className="limit-text">Min deposit $100 | Max $999</span>
                  </div>
                  
                  <button
                    className="invest-btn w-100"
                    onClick={() => investInBot(1, bot1Amount)}
                    disabled={loadingBot1}
                  >
                    {loadingBot1 ? '⏳ Processing...' : '💰 Invest Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== BOT 2 ==================== */}
          <div className="col-12 col-md-6 col-lg-6 d-flex align-items-stretch">
            <div className="invest-card w-100">
              
              {/* Card Header - INLINE STYLE */}
              <div 
                className="card-header" 
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "14px 20px",
                  textAlign: "center",
                  borderBottom: "none",
                  borderRadius: "16px 16px 0 0"
                }}
              >
                <span 
                  className="bot-name" 
                  style={{
                    color: "#ffffff",
                    fontSize: "20px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    margin: 0
                  }}
                >
                  🤖 Bot 2
                </span>
              </div>
              
              <div className="image-wrapper">
                <img
                  src="https://i.pinimg.com/736x/2f/a9/af/2fa9afe7803e88bf73727ba5d83d25a9.jpg"
                  alt="Bot 2"
                  className="bot-image"
                />
              </div>
              
              <div className="c-box">
                <div className="card-body02 p-2 p-md-3">
                  <div className="input-group02">
                    <span className="currency-icon">$</span>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      className="amount-input"
                      value={bot2Amount}
                      onChange={(e) => setBot2Amount(e.target.value)}
                      disabled={loadingBot2}
                    />
                  </div>
                  
                  <div className="note-section d-flex">
                    <span className="note-label">Note:</span>
                    <p className="mb-0">A member will get 3% profit on equity deposit weekly.</p>
                  </div>
                  
                  <div className="limit-section">
                    <span className="limit-label">Limit:</span>
                    <span className="limit-text">Min deposit $1000 | Max $5000</span>
                  </div>
                  
                  <button
                    className="invest-btn w-100"
                    onClick={() => investInBot(2, bot2Amount)}
                    disabled={loadingBot2}
                  >
                    {loadingBot2 ? '⏳ Processing...' : '💰 Invest Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default InvestFund;