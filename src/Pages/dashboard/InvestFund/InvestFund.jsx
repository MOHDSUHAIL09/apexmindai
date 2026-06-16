// InvestFund.jsx
import './Invest.css';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <h1 className="main-title">🤖 Invest Bot</h1>

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

      <div className="d-flex card-container">
        {/* ==================== BOT 1 ==================== */}
        <div className="invest-card">
          <div className="card-header">
            <span className="bot-name">🤖 Bot 1</span>
          </div>
          
          <div className="image-wrapper">
            <img
              src="https://i.pinimg.com/1200x/18/39/fe/1839fe826cbbda43160f5aa76031d9a3.jpg"
              alt="Bot 1"
              className="bot-image"
            />
          </div>
          
          <div className="c-box">
            <div className="card-body01 p-2">
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
                <span className="note-label"> Note:</span>
                <p>A member will get 2.5% profit on equity deposit weekly.</p>
              </div>
              
              <div className="limit-section">
                <span className="limit-label"> Limit:</span>
                <span className="limit-text">Min deposit $100 | Max $999</span>
              </div>
              
              <button
                className="invest-btn"
                onClick={() => investInBot(1, bot1Amount)}
                disabled={loadingBot1}
              >
                {loadingBot1 ? ' Processing...' : ' Invest Now'}
              </button>
            </div>
          </div>
        </div>

        {/* ==================== BOT 2 ==================== */}
        <div className="invest-card">
          <div className="card-header">
            <span className="bot-name">🤖 Bot 2</span>
          </div>         
          <div className="image-wrapper">
            <img
              src="https://i.pinimg.com/736x/2f/a9/af/2fa9afe7803e88bf73727ba5d83d25a9.jpg"
              alt="Bot 2"
              className="bot-image"
            />
          </div>
          
          <div className="c-box">
            <div className="card-body02 p-2">
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
                <p>A member will get 3% profit on equity deposit weekly.</p>
              </div>
              
              <div className="limit-section">
                <span className="limit-label">Limit:</span>
                <span className="limit-text">Min deposit $1000 | Max $5000</span>
              </div>
              
              <button
                className="invest-btn"
                onClick={() => investInBot(2, bot2Amount)}
                disabled={loadingBot2}
              >
                {loadingBot2 ? ' Processing...' : ' Invest Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvestFund;