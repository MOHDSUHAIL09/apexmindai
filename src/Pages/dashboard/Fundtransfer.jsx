import  { useState, useEffect, useMemo } from "react";
import { RiP2pFill } from "react-icons/ri";
import { FaHistory } from "react-icons/fa";
import {  IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import apiClient from "../../api/apiClient";
import { toast, ToastContainer } from "react-toastify";


const DepositToDeposit = () => {
    const { userData, investNow, refreshData } = useUser();
    const navigate = useNavigate();

    // State
    const [amount1, setAmount1] = useState(100);
    const [investUserId1, setInvestUserId1] = useState("");
    const [checkingUser1, setCheckingUser1] = useState(false);
    const [validUser1, setValidUser1] = useState(false);
    const [userName1, setUserName1] = useState("");
    const [loading1, setLoading1] = useState(false);
    const [otpIntervalId] = useState(null);


    const depositOptions = [100, 300, 500, 1000, 10000, 50000];
    const isLoading = !userData;

    // Format amount - direct $ without currency conversion
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return `$0.00`;
        return `$${Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return `$0.00`;
        const num = Number(amount);
        if (isNaN(num)) return `$0.00`;
        return formatAmount(num);
    };

    const isP2PButtonDisabled = useMemo(() => {
        return !validUser1 || loading1 || amount1 <= 0 || !investUserId1 || investUserId1.trim() === "";
    }, [validUser1, loading1, amount1, investUserId1]);


 const checkUser1 = async (id) => {
    if (!id?.trim()) {
        setValidUser1(false);
        setUserName1("");
        return;
    }
    
    setCheckingUser1(true);
    try {
        const res = await apiClient.get(`/Auth/UserDetailsById?loingId=${id}`);
        const data = res.data;
        
        // ✅ API returns "result": "true" and "user" object
        if (data?.result === "true" && data?.user) {
            const name = data.user.Name || data.user.fName || "";
            setValidUser1(true);
            setUserName1(name);
            toast.success(`User found: ${name}`);
        } else {
            setValidUser1(false);
            setUserName1("");
            toast.error("User ID not found");
        }
    } catch (err) {
        console.error("Error checking user:", err);
        setValidUser1(false);
        setUserName1("");
        toast.error("Error checking user");
    } finally {
        setCheckingUser1(false);
    }
};
    const handleInvest1 = async () => {
        if (!investUserId1 || investUserId1.trim() === "") {
            toast.error("Please enter User ID");
            return;
        }
        if (!amount1 || amount1 <= 0) {
            toast.error("Please enter valid amount");
            return;
        }
        if (!validUser1) {
            toast.error("Please enter a valid User ID");
            return;
        }
        if (amount1 > userData.Depositfund) {
            toast.error(`Insufficient Deposit Wallet balance. Available: ${formatBalance(userData.Depositfund)}`);
            return;
        }
        setLoading1(true);
        try {
            const res = await investNow(investUserId1, amount1);
            if (res.success) {
                toast.success(res.message || "Transfer successful!");
                setAmount1(100);
                setInvestUserId1("");
                setUserName1("");
                setValidUser1(false);
                await refreshData();
            } else {
                toast.error(res.message || "Transfer failed");
            }
        } catch (err) {
            console.error("Transfer error:", err);
            toast.error(err.response?.data?.message || err.message || "Error processing transfer");
        } finally {
            setLoading1(false);
        }
    };

    useEffect(() => {
        return () => {
            if (otpIntervalId) clearInterval(otpIntervalId);
        };
    }, [otpIntervalId]);

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="deposit-to-deposit-container">
                <div className="container-fluid py-4">
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading Wallet...</p>
                        </div>
                    ) : (
                        <div className="row g-4">   
                            {/* P2P TRANSFER CARD */}
                            <div className="col-12 col-lg-8">
                                <div className="transfer-card">
                                    <div className="transfer-card-header">
                                        <div className="transfer-title">
                                            <RiP2pFill size={24} className="transfer-icon" />
                                            <h5 className="mb-0">Fund Transfer</h5>
                                        </div>
                                        <FaHistory
                                            size={20}
                                            className="history-icon"
                                            onClick={() => navigate("/dashboard/FundtransferHistory", { state: { type: "P2P", tab: "deposit" } })}
                                            title="Deposit To Deposit History"
                                        />
                                    </div>
                                    <div className="transfer-card-body">
                                        {/* Wallet Balance */}
                                        <div className="wallet-info deposit-wallet">
                                            <span className="wallet-label">Deposit Wallet</span>
                                            <span className="wallet-amount text-primary">
                                                {formatBalance(userData.WorkingWallet)}
                                            </span>
                                        </div>

                                        <div className="transfer-form">

                                            <div className="form-group">
                                                <div className="form-label">USER ID</div>
                                                <input
                                                    type="text"
                                                    className="form-control-field"
                                                    value={investUserId1}
                                                    onChange={(e) => {
                                                        setInvestUserId1(e.target.value);
                                                        if (validUser1) {
                                                            setValidUser1(false);
                                                            setUserName1("");
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (investUserId1 && investUserId1.trim() !== "") {
                                                            checkUser1(investUserId1);
                                                        } else {
                                                            setValidUser1(false);
                                                            setUserName1("");
                                                        }
                                                    }}
                                                    placeholder="Enter User ID"
                                                />
                                                {checkingUser1 && <small className="status-msg info">Checking user...</small>}
                                                {validUser1 && <small className="status-msg success">✓ {userName1}</small>}
                                                {investUserId1 && !validUser1 && !checkingUser1 && (
                                                    <small className="status-msg error">✗ Please enter a valid User ID</small>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label mt-3">QUICK AMOUNT</label>
                                                <div className="quick-amount-grid">
                                                    {depositOptions.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            className={`quick-amount-btn ${amount1 === opt ? "active" : ""}`}
                                                            onClick={() => setAmount1(opt)}
                                                        >
                                                            $ {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label mt-3">AMOUNT</label>
                                                <div className="amount-input-wrapper">
                                                    <span className="currency-sign">$</span>
                                                    <input
                                                        type="number"
                                                        className="amount-input-field"
                                                        value={amount1}
                                                        onChange={(e) => setAmount1(Number(e.target.value))}
                                                    />
                                                    <button className="clear-input-btn" onClick={() => setAmount1(0)}>
                                                        <IoClose />
                                                    </button>
                                                </div>
                                            </div>

                                           <button
                                                className="submit-transfer-btn"
                                                onClick={handleInvest1}
                                                disabled={isP2PButtonDisabled}
                                            >
                                                {loading1 ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Processing...
                                                    </>
                                                ) : "Deposit"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DepositToDeposit;