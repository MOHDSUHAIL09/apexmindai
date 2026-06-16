import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRegCopy } from "react-icons/fa";
import apiClient from '../../../api/apiClient';
import { useUser } from '../../../context/UserContext';
import './Invest.css'

const AgreementForm = ({ open, onClose, loginId: propLoginId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, refreshData } = useUser();

  // Check if rendered as page or modal
  const isPage = location.pathname === '/dashboard/AgreementForm';
  const isOpen = isPage ? true : open;

  const passedLoginId = (propLoginId || userData?.loginid || userData?.me || "GUEST").toUpperCase();
  const regno = userData?.regno || userData?.Regno || localStorage.getItem('regno');
  const userReg = localStorage.getItem('userregno');

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreementId, setAgreementId] = useState("");
  const [formData, setFormData] = useState({
    fullName: '',
    emailID: '',
    dob: '',
    phone: '',
    motherMaidenName: '',
    address: '',
    amountUSDT: '',
    wallet: '',
    signature: '',
  });

  // Handle close
  const handleClose = () => {
    if (isPage) {
      navigate('/dashboard/InvestFund');
    } else if (onClose) {
      onClose();
    }
  };

  // Auto-fill when opens
  useEffect(() => {
    if (!isOpen) return;
    if (userData) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || userData.name || '',
        emailID: prev.emailID || userData.email || '',
        phone: prev.phone || userData.MobileNo || '',
        wallet: prev.wallet || userData.walletid || '',
      }));
    } else {
      const stored = localStorage.getItem('userData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || parsed.name || '',
            emailID: prev.emailID || parsed.email || '',
            phone: prev.phone || parsed.MobileNo || '',
            wallet: prev.wallet || parsed.walletid || '',
          }));
        } catch (e) { }
      }
    }
  }, [isOpen, userData]);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setAgreementId("");
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amountUSDT" && value < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    toast.success("Agreement ID copied!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.amountUSDT || !formData.emailID || !formData.phone) {
      alert("Please fill in all required fields.");
      return;
    }
    const amount = Number(formData.amountUSDT);
    if (amount < 1000) {
      alert("Minimum investment of $1000.00 is required.");
      return;
    }

    setLoading(true);

    const agreementPayload = {
      regno: parseInt(regno),
      emailId: formData.emailID,
      fName: formData.fullName.split(' ')[0] || formData.fullName,
      mobile: formData.phone,
      motherName: formData.motherMaidenName,
      dateOfBirth: formData.dob,
      address: formData.address,
      amount: amount,
      usdt: amount,
      fullName: formData.fullName,
      signature: formData.signature || "Digital Signature",
      otherValue: "",
      wallet: formData.wallet,
    };

    try {
      const agreementRes = await apiClient.post('/Dashboard/member-aggrement', agreementPayload);

      if (!agreementRes.data?.success) {
        alert(agreementRes.data?.message || "Agreement submission failed.");
        setLoading(false);
        return;
      }

      const newAgreementId = agreementRes.data.data;
      setAgreementId(newAgreementId);
      localStorage.setItem(`formData`, JSON.stringify(formData));

      const investmentPayload = {
        regno: parseInt(userReg),
        rkprice: amount,
        uRegno: parseInt(regno),
        pkg: "INV",
        aggrement: String(newAgreementId)
      };

      const investmentRes = await apiClient.post('/Dashboard/investment', investmentPayload);

      if (investmentRes.data?.success) {
        setShowSuccess(true);
        refreshData();
      } else {
        console.warn("⚠️ Investment API failed, but agreement saved.");
        alert("Investment registration failed, but agreement saved. Please contact support.");
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert(err.response?.data?.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // For successful submission view
  const SuccessView = () => (
    <div className="success-popup">
      <button onClick={handleClose} className="close-success-btn">✖</button>
      <div className="success-icon">✓</div>
      <h2>Investment Successfully!</h2>
      <p>Your agreement has been submitted</p>
      <div className="success-details">
        <div><span>Investor Name</span><strong>{formData.fullName}</strong></div>
        <div><span>Login ID</span><strong>{passedLoginId}</strong></div>
        <div><span>Invest Amount</span><strong>${formData.amountUSDT}</strong></div>
        <div><span>Agreement ID</span><strong>{agreementId} <FaRegCopy className="copy-icon" onClick={() => handleCopy(agreementId)} /></strong></div>
      </div>
      {isPage && (
        <button 
          onClick={() => navigate('/dashboard/InvestFund')} 
          className="submit-btn" 
          style={{ marginTop: '20px' }}
        >
          Go to Investment
        </button>
      )}
    </div>
  );

  // Don't render if not open
  if (!isOpen) return null;

  const FormContent = (
    <div className="agreement-overlay">
      {!showSuccess ? (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-card-wrapper">
            <button onClick={handleClose} type="button" className="close-modal-btn">✖</button>

            <div className="form-card">
              <div className="form-header">
                <div className="logo-section">
                  <div className="logo-text">
                    <span className="brand-name">ULTRA</span>
                    <span className="brand-sub">AGE BOT</span>
                  </div>
                </div>
                <h2 className="form-title">Customer agreement form</h2>
              </div>

              {/* Personal information section */}
              <section className="form-section">
                <h3 className="section-heading">Personal information</h3>
                <div className="grid-row">
                  <div className="input-group">
                    <label>Full name</label>
                    <input type="text" name="fullName" className="readonly-input" value={formData.fullName} readOnly required />
                  </div>
                  <div className="input-group">
                    <label>User Login ID</label>
                    <input type="text" value={passedLoginId} readOnly className="readonly-input" />
                  </div>
                </div>
                <div className="grid-row">
                  <div className="input-group">
                    <label>Email address</label>
                    <input type="email" name="emailID" className="readonly-input" value={formData.emailID} readOnly required />
                  </div>
                  <div className="input-group">
                    <label>Phone number</label>
                    <input type="text" name="phone" className="readonly-input" value={formData.phone} readOnly required />
                  </div>
                </div>
                <div className="grid-row">
                  <div className="input-group">
                    <label>Date of birth</label>
                    <input className='readonly-input' type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                    <span className="input-hint">Format: YYYY-MM-DD</span>
                  </div>
                  <div className="input-group">
                    <label>Mother's maiden name</label>
                    <input className='readonly-input' type="text" name="motherMaidenName" placeholder="Mother's maiden name" value={formData.motherMaidenName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>Residential Address</label>
                  <input className='readonly-input' type="text" name="address" placeholder="Residential Address" value={formData.address} onChange={handleChange} required />
                </div>
              </section>

              {/* Investment details section */}
              <section className="form-section">
                <h3 className="section-heading">Investment details</h3>
                <div className="grid-row">
                  <div className="input-group">
                    <label>Investment amount (USDT)</label>
                    <input className='readonly-input' type="number" name="amountUSDT" value={formData.amountUSDT} placeholder="Enter USDT" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Amount in INR</label>
                    <input type="text" value={(formData.amountUSDT * 92 || 0).toFixed(2)} readOnly className="readonly-input" />
                  </div>
                  <div className="min-invest-badge">Minimum investment: $1000.00</div>
                </div>
              </section>

              {/* Trading bot subscription */}
              <section className="info-box">
                <div className="info-box-header">Trading bot subscription</div>
                <div className="info-box-content">
                  <div className="checkbox-row">
                    <input type="checkbox" required className="checkbox-input" />
                    <p className="checkbox-label">
                      I agree to purchase the mandatory annual subscription for <strong>INR 9000</strong>, payable in advance, to participate in the investment program.
                    </p>
                  </div>
                  <ul className="info-list">
                    <li>Payment instructions will be provided upon signing the Investment Agreement.</li>
                    <li>The subscription is non-refundable and must be renewed annually.</li>
                  </ul>
                </div>
              </section>

              {/* Investment terms acknowledgment */}
              <section className="info-box">
                <div className="info-box-header">Investment terms acknowledgment</div>
                <div className="info-box-content terms-content">
                  <div className="term-item"><span className="term-icon">✓</span><p><strong>Portfolio Return:</strong> expected annual portfolio return ranging between 72% to 84%, subject to market performance and company policy.</p></div>
                  <div className="term-item"><span className="term-icon">✓</span><p><strong>Lock-In Period:</strong> I acknowledge that the investment has a No Lock-in Period, during which the Investment Amount can be withdrawn except as outlined below.</p></div>
                  <div className="term-item"><span className="term-icon">✓</span><p><strong>Early Withdrawal Terms:</strong> Withdrawals between 1–11 months: 6% to 7% monthly return, subject to a 10% processing charge on the return provided.</p></div>
                  <div className="term-item"><span className="term-icon">✓</span><p><strong>Confidentiality:</strong> I agree to keep the terms of the Investment Agreement and any proprietary information provided by ULTRAAGEBOTFX LIMITED confidential, except as required by law.</p></div>
                </div>
              </section>

              {/* Investment Adjustment Policy */}
              <section className="info-box">
                <div className="info-box-header">Investment Adjustment Policy</div>
                <div className="info-box-content policy-content">
                  <div className="policy-item"><span className="policy-bullet">•</span><p>When the Investor’s total payout becomes equal to or exceeds 100% of the invested principal amount, 25% of the principal amount shall be adjusted towards returns.</p></div>
                  <div className="policy-item"><span className="policy-bullet">•</span><p>When the Investor’s total accumulated returns reach 200% (2X) of the invested principal amount, 50% of the principal amount shall be adjusted towards returns.</p></div>
                  <div className="policy-item"><span className="policy-bullet">•</span><p>When the Investor’s total earnings reach 300% (3X) of the principal amount, the investment term shall be considered completed. Any further participation shall require execution of a new investment agreement.</p></div>
                </div>
              </section>

              {/* Consent and authorization */}
              <section className="info-box">
                <div className="info-box-header">Consent and authorization</div>
                <div className="info-box-content consent-content">
                  <div className="term-item"><span className="term-icon">✓</span><p>I consent to ULTRAAGEFX LIMITED processing my personal information in accordance with its Privacy Policy and applicable data protection laws.</p></div>
                  <div className="term-item"><span className="term-icon">✓</span><p>I authorize ULTRAAGEFX LIMITED to send me the Investment Agreement via DocuSign to the email address provided.</p></div>
                  <div className="term-item"><span className="term-icon">✓</span><p>I confirm that I have read, understood, and agree to be bound by the terms outlined in this form.</p></div>
                </div>
              </section>

              {/* Signature section */}
              <section className="info-box signature-box">
                <div className="info-box-header">Signature</div>
                <div className="signature-grid">
                  <div className="company-signature">
                    <p className="signature-title">For ULTAAGE BOT</p>
                    <p>Name: ULTRA AGE BOT</p>
                    <p>Title: Invest For Multi Asset Trading</p>
                    <p className="signature-label">Digital Signature:</p>
                    <div className="digital-signature">ULTRA AGE BOT</div>
                  </div>
                  <div className="investor-signature">
                    <p className="signature-title">For the Investor</p>
                    <div className="signature-field">
                      <label>Name:</label>
                      <input type="text" value={formData.fullName} readOnly className="signature-readonly" />
                    </div>
                    <div className="signature-field">
                      <label>Investor signature (digital):</label>
                      <input type="text" name="signature" placeholder="signature" value={formData.signature} onChange={handleChange} className="signature-input" />
                    </div>
                  </div>
                </div>
                <div className="signature-date">
                  <p className="signature-title">Date</p>
                  <div>{new Date().toLocaleDateString()}</div>
                </div>
              </section>

              <div className="button-group02">
                <button type="button" onClick={() => window.print()} className="submit-btn">PRINT</button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Submitting..." : "SUBMIT"}
                </button>
              </div>

              {/* Back button for page mode */}
              {isPage && (
                <div className="text-center mt-3">
                  <button type="button" onClick={() => navigate('/dashboard/InvestFund')} className="btn btn-link">
                    ← Back to Investment
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      ) : (
        <SuccessView />
      )}
    </div>
  );

  // Return as portal for modal, direct for page
  return isPage ? FormContent : createPortal(FormContent, document.body);
};

export default AgreementForm;