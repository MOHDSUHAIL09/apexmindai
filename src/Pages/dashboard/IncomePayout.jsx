import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './InvestFund/invest.css';
import { Link } from "react-router-dom";

const WithdrawalRequest = () => {
    const [amount, setAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("USDT");
    const [loading, setLoading] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [fetchingBalance, setFetchingBalance] = useState(true);

    // Fetch user balance (adjust this API according to your needs)
    const fetchUserBalance = async () => {
        const regno = localStorage.getItem('Regno');
        if (!regno) return;
        
        try {
            // Replace this with your actual balance API
            const response = await fetch(`http://api.apexmindai.in/api/User/Balance?regno=${regno}`);
            const data = await response.json();
            if (data.result === "true") {
                setUserBalance(data.balance || 0);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        } finally {
            setFetchingBalance(false);
        }
    };

    useEffect(() => {
        fetchUserBalance();
    }, []);

    const formatAmount = (amount) => {
        return `$${Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const handleAmountChange = (e) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) value = "";
        setAmount(value);
    };

    const handleSubmit = async () => {
        if (!amount || amount <= 0) {
            toast.error("Please enter valid amount");
            return;
        }
        
        if (amount > userBalance) {
            toast.error(`Insufficient balance. Available: ${formatAmount(userBalance)}`);
            return;
        }
        
        if (amount < 10) {
            toast.error("Minimum withdrawal amount is $10");
            return;
        }

        setLoading(true);
        
        try {
            const regno = localStorage.getItem('Regno');
            
            if (!regno) {
                toast.error("Registration number not found");
                setLoading(false);
                return;
            }

            const requestBody = {
                regNo: parseInt(regno),
                amount: amount,
                payMode: paymentMode
            };

            const response = await fetch('http://api.apexmindai.in/api/IncomePayout/WithdrawRequest', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.result === "true") {
                toast.success("Withdrawal request submitted successfully!");
                setAmount("");
                // Refresh balance after successful withdrawal
                fetchUserBalance();
            } else {
                toast.error(data.message || "Withdrawal request failed");
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
            toast.error(error.message || "Network error");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingBalance) {
        return (
            <div className="withdrawal-container">
                <div className="withdrawal-card">
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading balance...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <div className="withdrawal-container">
                <div className="withdrawal-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
    <h3 className="withdrawal-title mb-0">Withdrawal Request</h3>
<Link to="/dashboard/PayOutHistory"><button type="button" class="btn btn-primary mb-3">History</button></Link>
</div>
                    
                    <div className="balance-section">
                        <div className="balance-row">
                            <span className="balance-label mt-2" style={{fontSize: '18px', fontWeight: '800'}}>Current Balance:</span>
                            <span className="balance-value">{formatAmount(userBalance)}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Enter Amount:</label>
                        <div className="amount-input-wrapper">
                            <span className="currency-symbol">$</span>
                            <input
                                type="number"
                                className="amount-input"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0.00"
                                min="10"
                                step="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Payment Mode</label>
                        <input
                            className="payment-select"
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                        >
                            
              
                        </input>
                    </div>

                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                            </>
                        ) : (
                            "SUBMIT WITHDRAWAL"
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default WithdrawalRequest;