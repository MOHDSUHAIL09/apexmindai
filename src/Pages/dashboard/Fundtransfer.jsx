import { useState, useEffect, useMemo } from "react";
import { RiP2pFill } from "react-icons/ri";
import { FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import apiClient from "../../api/apiClient";
import { toast, ToastContainer } from "react-toastify";

const Fundtransfer = () => {
    const { userData, refreshData } = useUser();
    const navigate = useNavigate();

    // ✅ STATES
    const [amount1, setAmount1] = useState(100);
    const [investUserId1, setInvestUserId1] = useState("");
    const [checkingUser1, setCheckingUser1] = useState(false);
    const [validUser1, setValidUser1] = useState(false);
    const [userName1, setUserName1] = useState("");
    const [receiverLoginId, setReceiverLoginId] = useState(""); // ✅ Login ID store karne ke liye
    const [loading1, setLoading1] = useState(false);

    const depositOptions = [100, 300, 500, 1000, 10000, 50000];
    const isLoading = !userData;

    // ✅ FORMAT FUNCTIONS
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

    // ✅ BUTTON DISABLE CONDITION
    const isP2PButtonDisabled = useMemo(() => {
        return !validUser1 || loading1 || amount1 <= 0 || !investUserId1 || investUserId1.trim() === "";
    }, [validUser1, loading1, amount1, investUserId1]);

    // ✅ USER CHECK KARNE KA FUNCTION
    const checkUser1 = async (id) => {
        if (!id?.trim()) {
            setValidUser1(false);
            setUserName1("");
            setReceiverLoginId("");
            return;
        }
        
        setCheckingUser1(true);
        try {
            const res = await apiClient.get(`/Auth/UserDetailsById?loingId=${id}`);
            const data = res.data;
            
            if (data?.result === "true" && data?.user) {
                const user = data.user;
                const name = user.Name || user.fName || user.username || "";
                const loginid = user.loginid || user.LoginId || user.id || "";
                
                setValidUser1(true);
                setUserName1(name);
                setReceiverLoginId(loginid); // ✅ Login ID store karo
                
                toast.success(`User found: ${name}`);
                console.log("✅ User Details:", { name, loginid });
            } else {
                setValidUser1(false);
                setUserName1("");
                setReceiverLoginId("");
                toast.error("User ID not found");
            }
        } catch (err) {
            console.error("❌ Error checking user:", err);
            setValidUser1(false);
            setUserName1("");
            setReceiverLoginId("");
            toast.error("Error checking user");
        } finally {
            setCheckingUser1(false);
        }
    };

    // ✅ FUND TRANSFER FUNCTION - DIRECT API CALL
    const handleFundTransfer = async () => {
        // ✅ VALIDATIONS
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

        // ✅ WALLET BALANCE CHECK
        const walletBalance = userData?.Depositfund || userData?.WorkingWallet || 0;
        if (amount1 > walletBalance) {
            toast.error(`Insufficient Wallet Balance. Available: ${formatBalance(walletBalance)}`);
            return;
        }

        setLoading1(true);
        try {
            // ✅ FUND TRANSFER API CALL - receiverLoginId use karo
            const payload = {
                regno: userData?.regno || userData?.id || 1,
                reciveId: receiverLoginId || investUserId1, // ✅ Login ID use karo
                amount: Number(amount1)
            };

            console.log("📤 Sending Fund Transfer Request:", payload);

            const response = await apiClient.post('/IncomePayout/FundTransfer', payload);
            
            console.log("📥 Fund Transfer Response:", response.data);

            // ✅ RESPONSE CHECK
            if (response.data?.result === "true") {
                toast.success(response.data?.message || "Transfer successful!");
                // ✅ FORM RESET
                setAmount1(100);
                setInvestUserId1("");
                setUserName1("");
                setValidUser1(false);
                setReceiverLoginId("");
                await refreshData(); // Refresh user data
            } else {
                toast.error(response.data?.message || "Transfer failed");
            }
        } catch (err) {
            console.error("❌ Transfer error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Error processing transfer";
            toast.error(errorMsg);
        } finally {
            setLoading1(false);
        }
    };

    // ✅ COMPONENT UNMOUNT CLEANUP
    useEffect(() => {
        return () => {
            // Cleanup if any
        };
    }, []);

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
                                                {formatBalance(userData?.Depositfund || userData?.WorkingWallet)}
                                            </span>
                                        </div>

                                        <div className="transfer-form">
                                            {/* USER ID INPUT */}
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
                                                            setReceiverLoginId("");
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (investUserId1 && investUserId1.trim() !== "") {
                                                            checkUser1(investUserId1);
                                                        } else {
                                                            setValidUser1(false);
                                                            setUserName1("");
                                                            setReceiverLoginId("");
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

                                            {/* QUICK AMOUNT BUTTONS */}
                                            <div className="form-group">
                                                <label className="form-label mt-3">QUICK AMOUNT</label>
                                                <div className="quick-amount-grid">
                                                    {depositOptions.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            className={`quick-amount-btn ${amount1 === opt ? "active" : ""}`}
                                                            onClick={() => setAmount1(opt)}
                                                            type="button"
                                                        >
                                                            $ {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AMOUNT INPUT */}
                                            <div className="form-group">
                                                <label className="form-label mt-3">AMOUNT</label>
                                                <div className="amount-input-wrapper">
                                                    <span className="currency-sign">$</span>
                                                    <input
                                                        type="number"
                                                        className="amount-input-field"
                                                        value={amount1}
                                                        onChange={(e) => setAmount1(Number(e.target.value))}
                                                        min="1"
                                                    />
                                                    <button 
                                                        className="clear-input-btn" 
                                                        onClick={() => setAmount1(0)}
                                                        type="button"
                                                    >
                                                        <IoClose />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* SUBMIT BUTTON */}
                                            <button
                                                className="submit-transfer-btn"
                                                onClick={handleFundTransfer}
                                                disabled={isP2PButtonDisabled}
                                                type="button"
                                            >
                                                {loading1 ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Processing...
                                                    </>
                                                ) : "Transfer"}
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

export default Fundtransfer;