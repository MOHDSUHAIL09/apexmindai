// InvestToken.jsx - Fixed with Working Modal
import React, { useState } from "react";
import "./InvestToken.css";
import { Link } from "react-router-dom";

const ApexMiningProgram = () => {
  const [tier1Amount, setTier1Amount] = useState("");
  const [tier2Amount, setTier2Amount] = useState("");
  const [tier3Amount, setTier3Amount] = useState("");
  const [loadingTier1, setLoadingTier1] = useState(false);
  const [loadingTier2, setLoadingTier2] = useState(false);
  const [loadingTier3, setLoadingTier3] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show Toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // API Call Function
  const callInvestAPI = async (regno, miningAmt, uregno, slotNum, setLoading) => {
    try {
      setLoading(true);
      const url = `http://api.apexmindai.in/TokenMiningAsync?Regno=${regno}&MiningAmt=${miningAmt}&URegno=${uregno}&SlotNum=${slotNum}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*',
        },
        body: ''
      });

      const data = await response.json();
      
      if (data.result === true) {
        setSuccessData({
          message: data.message,
          amount: miningAmt,
          tier: slotNum === 10 ? "Tier 1" : slotNum === 8 ? "Tier 2" : "Tier 3",
          months: slotNum
        });
        setShowSuccessModal(true); // ✅ Modal open karega
        showToast("✅ Investment Successful!", "success");
        return data;
      } else {
        showToast(`❌ ${data.message || 'Transaction failed'}`, "error");
        return null;
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast(`❌ Error: ${error.message}`, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get Slot Number based on Tier
  const getSlotNumber = (tier) => {
    switch(tier) {
      case "Tier 1": return 10;
      case "Tier 2": return 8;
      case "Tier 3": return 6;
      default: return 0;
    }
  };

  // Get Loading State based on Tier
  const getLoadingState = (tier) => {
    switch(tier) {
      case "Tier 1": return loadingTier1;
      case "Tier 2": return loadingTier2;
      case "Tier 3": return loadingTier3;
      default: return false;
    }
  };

  // Get SetLoading Function based on Tier
  const getSetLoading = (tier) => {
    switch(tier) {
      case "Tier 1": return setLoadingTier1;
      case "Tier 2": return setLoadingTier2;
      case "Tier 3": return setLoadingTier3;
      default: return () => {};
    }
  };

  // Get Amount Setter based on Tier
  const getAmountSetter = (tier) => {
    switch(tier) {
      case "Tier 1": return setTier1Amount;
      case "Tier 2": return setTier2Amount;
      case "Tier 3": return setTier3Amount;
      default: return () => {};
    }
  };

  // Handle Invest
  const handleInvest = async (tier, amount) => {
    const loading = getLoadingState(tier);
    
    // Prevent multiple clicks
    if (loading) return;

    if (!amount || amount <= 0) {
      showToast(`Please enter a valid amount for ${tier}`, "error");
      return;
    }

    const amountNum = parseFloat(amount);
    const slotNum = getSlotNumber(tier);
    
    // Validate amount based on tier
    let isValid = false;
    switch(tier) {
      case "Tier 1": isValid = amountNum >= 100 && amountNum <= 5000; break;
      case "Tier 2": isValid = amountNum >= 5001 && amountNum <= 15000; break;
      case "Tier 3": isValid = amountNum >= 15001 && amountNum <= 25000; break;
      default: isValid = false;
    }

    if (!isValid) {
      showToast(`❌ Amount must be within the tier range for ${tier}`, "error");
      return;
    }

    // Call API with specific tier loading state
    const setLoading = getSetLoading(tier);
    const setAmount = getAmountSetter(tier);
    
    const result = await callInvestAPI(1, amountNum, 0, slotNum, setLoading);

    if (result && result.result === true) {
      setAmount("");
    }
  };

  return (
    <div className="Table-container apex-mining-app"> 
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`apex-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 apex-header">
        <div>
          <h1 className="apex-title mb-0">APEX MINING PROGRAM</h1>
        </div>
        <Link to="/dashboard/InvestTokenHistory">
          <button className="btn btn-primary">History</button>
        </Link>
      </div>

      {/* Tiers */}
      <div className="apex-tiers-row">
        
        {/* Tier 1 */}
        <div className="apex-tier-card">
          <h2>TIER 1</h2>
          <p className="apex-investment-range">$100 – $5,000</p>
          <div className="apex-lockup">LOCK-UP: 10 MONTHS</div>
          <div className="apex-return">2X RETURN IN APEX TOKENS</div>
          <div className="apex-invest-group">
            <input
              type="number"
              placeholder="Enter amount"
              value={tier1Amount}
              onChange={(e) => setTier1Amount(e.target.value)}
              disabled={loadingTier1}
            />
            <button 
              onClick={() => handleInvest("Tier 1", tier1Amount)} 
              disabled={loadingTier1}
            >
              {loadingTier1 ? 'Processing...' : 'Invest'}
            </button>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="apex-tier-card">
          <h2>TIER 2</h2>
          <p className="apex-investment-range">$5,001 – $15,000</p>
          <div className="apex-lockup">LOCK-UP: 8 MONTHS</div>
          <div className="apex-return">2X RETURN IN APEX TOKENS</div>
          <div className="apex-invest-group">
            <input
              type="number"
              placeholder="Enter amount"
              value={tier2Amount}
              onChange={(e) => setTier2Amount(e.target.value)}
              disabled={loadingTier2}
            />
            <button 
              onClick={() => handleInvest("Tier 2", tier2Amount)} 
              disabled={loadingTier2}
            >
              {loadingTier2 ? 'Processing...' : 'Invest'}
            </button>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="apex-tier-card">
          <h2>TIER 3</h2>
          <p className="apex-investment-range">$15,001 – $25,000</p>
          <div className="apex-lockup">LOCK-UP: 6 MONTHS</div>
          <div className="apex-return">2X RETURN IN APEX TOKENS</div>
          <div className="apex-invest-group">
            <input
              type="number"
              placeholder="Enter amount"
              value={tier3Amount}
              onChange={(e) => setTier3Amount(e.target.value)}
              disabled={loadingTier3}
            />
            <button 
              onClick={() => handleInvest("Tier 3", tier3Amount)} 
              disabled={loadingTier3}
            >
              {loadingTier3 ? 'Processing...' : 'Invest'}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Success Modal - Fixed */}
      {showSuccessModal && (
        <div className="apex-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="apex-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="apex-modal-icon">✅</div>
            <h2>Investment Successful!</h2>
            <div className="apex-modal-details">
              <p><strong>Amount:</strong> ${successData.amount}</p>
              <p><strong>Plan:</strong> {successData.tier}</p>
              <p><strong>Lock-up:</strong> {successData.months} Months</p>
              <p><strong>Return:</strong> 2X in APEX Tokens</p>
            </div>
            <p className="apex-modal-message">{successData.message}</p>
            <button className="apex-modal-btn" onClick={() => setShowSuccessModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApexMiningProgram;