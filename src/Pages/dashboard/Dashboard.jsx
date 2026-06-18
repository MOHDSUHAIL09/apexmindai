
import { useEffect, useState } from 'react';
import { FaArrowTurnDown, FaMintbit, FaCreditCard } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import { GiProfit } from "react-icons/gi";
import { IoSend } from 'react-icons/io5';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import apexcoin from "../../assets/images/coins/apexcoin.png"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData, refreshData } = useUser();

    // Withdraw Modal States
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAmount, setSuccessAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawOtp, setWithdrawOtp] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('BANK CARD');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpIntervalId, setOtpIntervalId] = useState(null);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [minimumWithdraw] = useState(20);


    // const [showdepositModal, setShowdepositModal] = useState(false);
    // const [investAmount, setInvestAmount] = useState('');
    // const [investLoading, setInvestLoading] = useState(false);

    const [showSelfPayoutModal, setShowSelfPayoutModal] = useState(false);
    const [selfPayoutAmount, setSelfPayoutAmount] = useState('');
    const [selfPayoutLoading, setSelfPayoutLoading] = useState(false);
    const [countdown, setCountdown] = useState("");
    // const [showButton, setShowButton] = useState(false);
    // const [botExpireTime, setBotExpireTime] = useState(null);

    // const [showBotModal, setShowBotModal] = useState(false);
    // const [botLoading, setBotLoading] = useState(false);

    // const [botForm, setBotForm] = useState({
    //     betAmount: "",
    //     currency: "",
    //     currencyRate: "",
    //     slot: ""
    // });

    // const regNo = localStorage.getItem('Regno')


    const displayBalance = userData?.WorkingWallet || 0;
    const walletAddress = localStorage.getItem('bep20Wallet') || "0x1234567890abcdef1234567890abcdef12345678";

    console.log(walletAddress); // '0x1234567890abcdef1234567890abcdef12345678'




// Timer effect - sirf timer ke liye
// useEffect(() => {
//     if (!userData?.status) return;

//     const timer = setInterval(() => {
//         const targetDate = new Date(userData.status).getTime();
//         const now = new Date().getTime();
//         const difference = targetDate - now;

//         if (difference <= 0) {
//             setCountdown("00H : 00M : 00S");
//             clearInterval(timer);
//             return;
//         }

//         const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//         const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
//         const seconds = Math.floor((difference % (1000 * 60)) / 1000);

//         setCountdown(
//             `${hours.toString().padStart(2, "0")}H : ${minutes
//                 .toString()
//                 .padStart(2, "0")}M : ${seconds
//                     .toString()
//                     .padStart(2, "0")}S`
//         );
//     }, 1000);

//     return () => clearInterval(timer);
// }, [userData?.status]);





useEffect(() => {
    // ✅ Wait for userData to load
    if (!userData) {
        setCountdown("Loading...");
        return;
    }

    // ✅ Agar status nahi hai toh default timer chalao
    let targetTime;
    
    if (userData?.status && userData.status !== "1900-01-01T00:00:00") {
        // Agar valid date hai toh use karo
        targetTime = new Date(userData.status).getTime();
        console.log("🎯 Using status date:", new Date(targetTime));
    } else {
        // Nahi toh 30 days ka default timer
        targetTime = new Date().getTime() + ( 24 * 60 * 60 * 1000);
        console.log("🎯 Using default 30 days timer");
    }

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetTime - now;

        console.log("📊 Remaining:", difference, "ms");

        if (difference <= 0) {
            setCountdown("00H : 00M : 00S");
            clearInterval(timer);
            return;
        }

        // ✅ Sirf Hours, Minutes, Seconds
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown(
            `${hours.toString().padStart(2, "0")}H : ${minutes
                .toString()
                .padStart(2, "0")}M : ${seconds
                    .toString()
                    .padStart(2, "0")}S`
        );
    }, 1000);

    return () => clearInterval(timer);
}, [userData]); // ✅ userData ko dependency mein add karo
    // const handleBotTrading = async () => {
    //     try {
    //         setBotLoading(true);

    //         const payload = {
    //             regno: Number(regNo),
    //             betAmount: Number(botForm.betAmount),
    //             currency: botForm.currency,
    //             currencyRate: Number(botForm.currencyRate),
    //             slot: Number(botForm.slot),
    //         };

    //         const response = await apiClient.post(
    //             "/Trading/BotTrading",
    //             payload
    //         );

    //         const data = response.data;

    //         if (data?.result || response.status === 200) {

    //             alert(data?.message || "Bot Trading Started Successfully");


    //             setShowButton(false);

    //             setBotExpireTime(
    //                 new Date(userData?.status).getTime()
    //             );


    //             setShowBotModal(false);

    //             setShowBotModal(false);
    //             setBotForm({
    //                 betAmount: "",
    //                 currency: "",
    //                 currencyRate: "",
    //                 slot: "",
    //             });

    //             console.log("Before getBotStatus");

    //             await getBotStatus();

    //             console.log("After getBotStatus");

    //         } else {
    //             alert(data?.message || "Something went wrong");
    //         }

    //     } catch (error) {

    //         console.log("BotTrading Error:", error);

    //         alert(
    //             error?.response?.data?.message ||
    //             error?.message ||
    //             "API Error"
    //         );

    //     } finally {
    //         setBotLoading(false);
    //     }
    // };


    // Helper to get loginid
    const getLoginId = () => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsed = JSON.parse(storedUserData);
                if (parsed.loginid) return parsed.loginid;
                if (parsed.me) return parsed.me;
            } catch (e) {
                console.log("catch Error : ", e)
            }
        }
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.loginid) return user.loginid;
        if (user?.me) return user.me;
        return 'india';
    };

    const loginid = getLoginId();
    const regno = userData?.introregno || localStorage.getItem('regno');

    const goToStatement = (type) => {
        navigate(`/dashboard/IncomeReport?type=${type}`);
    };

    // Clean API message
    const cleanApiMessage = (message, defaultMsg) => {
        if (!message) return defaultMsg;
        const hasEmail = message.includes('@') && (message.includes('.com') || message.includes('.in') || message.includes('.net'));
        if (hasEmail) return defaultMsg;
        return message;
    };

    // Send OTP
    const sendOtp = async () => {
        if (otpTimer > 0 || sendingOtp || verifyingOtp) return;

        if (!regno) {
            toast.error('Registration number not found');
            return;
        }

        setSendingOtp(true);
        try {
            const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});

            if (response.data.success || response.data.status === 'success') {
                const cleanMessage = cleanApiMessage(response.data.message, 'OTP sent successfully!');
                toast.success(cleanMessage);
                setOtpSent(true);
                setOtpTimer(300);

                const interval = setInterval(() => {
                    setOtpTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setOtpIntervalId(null);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                setOtpIntervalId(interval);
            } else {
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error sending OTP');
        } finally {
            setSendingOtp(false);
        }
    };




    // Handle Withdraw
    const handleWithdraw = async () => {
        const amountNum = parseFloat(withdrawAmount);

        if (!withdrawAmount || isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (amountNum < minimumWithdraw) {
            toast.error(`Minimum withdrawal amount is $${minimumWithdraw.toFixed(2)}`);
            return;
        }
        if (amountNum > displayBalance) {
            toast.error(`Amount exceeds available balance $${displayBalance.toFixed(2)}`);
            return;
        }
        if (!withdrawOtp || withdrawOtp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifyingOtp(true);
        try {
            const verifyRes = await apiClient.post('/User/verify-otp', null, {
                params: {
                    loginid: loginid,
                    regno: regno,
                    otp: String(withdrawOtp)
                }
            });

            if (!verifyRes.data?.success) {
                toast.error(verifyRes.data?.message || 'Invalid OTP');
                setVerifyingOtp(false);
                return;
            }

            const payload = {
                regNo: parseInt(regno),
                amount: amountNum,
                payMode: selectedMethod === 'BANK CARD' ? 'inr' : 'usdt',
                walletAddress: selectedMethod === 'BANK CARD' ? localStorage.getItem('accountNumber') || '' : localStorage.getItem('bep20Wallet') || ''
            };

            const withdrawalRes = await apiClient.post('/IncomePayout/withdraw-request', payload);

            if (withdrawalRes.data?.success) {
                setSuccessAmount(amountNum);
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);
                await refreshData();

                setTimeout(() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setWithdrawOtp('');
                    setPayoutAmount('');
                    setOtpSent(false);
                    setOtpTimer(0);
                    if (otpIntervalId) clearInterval(otpIntervalId);
                }, 500);
                toast.success('Withdrawal request submitted successfully!');
            } else {
                toast.error(withdrawalRes.data?.message || 'Withdrawal failed');
            }
        } catch (err) {
            console.error('Withdrawal error:', err);
            toast.error(err.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    // 🔥 Self Trading Payout Function
    const handleSelfTradingPayout = async () => {
        const amountNum = parseFloat(selfPayoutAmount);

        // Validation
        if (!selfPayoutAmount || isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amountNum < 10) {
            toast.error('Minimum payout amount is $10');
            return;
        }

        if (amountNum > displayBalance) {
            toast.error(`Amount exceeds available balance $${displayBalance.toFixed(2)}`);
            return;
        }

        setSelfPayoutLoading(true);

        try {
            // ✅ API Call - Self Trading Payout
            const response = await apiClient.post('/Trading/TradingPayout', {
                regNo: parseInt(regno),
                amount: amountNum
            });

            console.log('Self Payout Response:', response.data);

            if (response.data?.result === 'true') {
                toast.success(response.data?.message || 'Payout request submitted successfully!');
                setSelfPayoutAmount('');
                setShowSelfPayoutModal(false);
                await refreshData(); // Refresh user data
            } else {
                toast.error(response.data?.message || 'Payout failed');
            }
        } catch (error) {
            console.error('Payout error:', error);
            toast.error(error.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setSelfPayoutLoading(false);
        }
    };


    const isOtpButtonDisabled = () => otpTimer > 0 || sendingOtp || verifyingOtp;
    const isWithdrawDisabled = () => {
        const amountNum = parseFloat(withdrawAmount);
        return (
            verifyingOtp ||
            !otpSent ||
            !withdrawAmount ||
            isNaN(amountNum) ||
            amountNum <= 0 ||
            amountNum < minimumWithdraw ||
            amountNum > displayBalance ||
            !withdrawOtp ||
            withdrawOtp.length !== 6
        );
    };

    // Payout button click
    const handlePayoutClick = () => {
        if (payoutAmount && parseFloat(payoutAmount) > 0) {
            setWithdrawAmount(payoutAmount);
        }
        setShowWithdrawModal(true);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Welcome Card */}
                <div className="col-12 col-lg-8 d-flex align-items-stretch">
                    <div className="card w-100 bg-primary-subtle overflow-hidden shadow-none">
                        <div className="card-body position-relative">
                            <div className="row">
                                <div className="col-12 col-sm-7">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex">
                                            <div className="rounded-circle overflow-hidden me-6 flex-shrink-0">
                                                <img
                                                    src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/profile/user-1.jpg"
                                                    alt="profile"
                                                    width="40"
                                                    height="40"
                                                />
                                            </div>
                                            <h5 className="fw-semibold mt-0 mt-md-2 fs-5 fs-sm-3">
                                                Welcome back <span style={{ color: "#04832f" }}>{userData?.fname}</span>
                                            </h5>
                                        </div>
                                        <button
                                            className="invite-btn btn d-block d-sm-none"
                                            style={{
                                                backgroundColor: Number(userData?.kid) > 0 ? "#04832f" : "#dc3545",
                                                color: "#fff",
                                                border: "none",
                                                padding: "6px 16px",
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {Number(userData?.kid) > 0 ? "Active" : "Inactive"}
                                        </button>
                                    </div>

                                    <div className='mt-4'>
                                        <div className="row g-2">
                                            <div className="col-4">
                                                <div className="card01 border-0 shadow-sm">
                                                    <Link to='/dashboard/DepositHistory' className="text-decoration-none">
                                                        <div className="card-body01 p-2 text-center">
                                                            <p className="income-text text-muted mb-1 small">Deposit Fund</p>
                                                            <h6 className="income-balance mb-0 fw-bold text-dark">
                                                                ${userData?.Depositfund || "0.00"}
                                                            </h6>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="col-4">
                                                <div className="card01 border-0 shadow-sm">
                                                    <Link to='/dashboard/InvestmentHistory' className="text-decoration-none">
                                                        <div className="card-body01 p-2 text-center">
                                                            <p className="income-text text-muted mb-1 small">Invest</p>
                                                            <h6 className="income-balance mb-0 fw-bold text-dark">
                                                                ${userData?.Invest?.toFixed(2) || '0.00'}
                                                            </h6>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="col-4">
                                                <div className="card01 border-0 shadow-sm">
                                                    <Link to='/dashboard/IncomeReport' className="text-decoration-none">
                                                        <div className="card-body01 p-2 text-center">
                                                            <p className="income-text text-muted mb-1 small">Total Income</p>
                                                            <h6 className="income-balance mb-0 fw-bold">
                                                                ${userData?.TotalIncome?.toFixed(2) || '0.00'}
                                                            </h6>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remaining Days Countdown Timer */}
                                        <div className="row g-2 mt-1">
                                            <div className="col-6">
                                                <div className="countdown-box text-center p-1">
                                                    <div className="small fw-semibold text-muted">
                                                        BOT EXPIRE
                                                    </div>

                                            <div className="left-timer">
    {countdown || "Loading..."}
</div>
                                                </div>
                                            </div>

                                            <div className="col-6">
                                                <div className="countdown-box text-center p-1">
                                                    <div className="small fw-semibold text-muted">
                                                        RANK
                                                    </div>
                                                    <div className="left-timer">
                                                        {userData?.Ranks || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-5 mt-4 mt-sm-0">
                                    <div className="welcome-bg-img text-center text-sm-end position-relative">
                                        <button
                                            className="btn d-none d-sm-inline-block position-absolute"
                                            style={{
                                                backgroundColor: Number(userData?.kid) === 1 ? "#04832f" : "#dc3545",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 24px",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                cursor: "pointer",
                                                top: "-5px",
                                                right: "0",
                                                zIndex: 1,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#ffffff",
                                                    textShadow: "0 0 5px rgba(179, 62, 62, 0.8)",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {Number(userData?.kid) === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </button>
                                        <img
                                            src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/backgrounds/welcome-bg.svg"
                                            alt="welcome"
                                            className="img-fluid"
                                            style={{ maxWidth: "100%", height: "auto", marginTop: "5px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income Wallet */}
                <div className="col-md-6 col-lg-4 d-flex align-items-stretch">
                    <div className="card w-100">
                        <div className="card-body01 px-3 mt-3">
                            <div style={{ fontWeight: "900", fontSize: "20px" }}>Income Wallet</div>
                            <div style={{ height: "130px", position: "relative", marginTop: "40px" }}>
                                <Doughnut
                                    data={{ labels: ["Profit", "Expense"], datasets: [{ data: [65, 35], backgroundColor: ["#5D87FF", "#ECF2FF"], borderWidth: 0, cutout: "78%" }] }}
                                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } } }}
                                />
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", }}>
                                    <h5 style={{ fontWeight: "700", color: "#5A6A85" }}>${userData?.WorkingWallet || "0.00"}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-12 col-lg-8">
                    <div className="row g-2">

                        {/* Card 1 - BOT INCOME */}
                        <div className="col-6 col-lg-4 d-flex align-items-stretch">
                            <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("Level Incom")}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted mb-1">Bot Income</p>
                                            <h5 className="fw-bold mb-0 amount-report">
                                                ${userData?.LevelIncome?.toLocaleString() || '0.00'}
                                            </h5>
                                        </div>
                                        <div className="p-2 bg-primary-subtle rounded-2">
                                            <i className="ti ti-users fs-5 text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 - Trading Level Bonus */}
                        <div className="col-6 col-lg-4 d-flex align-items-stretch">
                            <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("COMPOUNDING INCOME")}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted mb-1">Trading Level Bonus</p>
                                            <h5 className="fw-bold mb-0 amount-report">
                                                ${userData?.CompoundingIncome?.toLocaleString() || '0.00'}
                                            </h5>
                                        </div>
                                        <div className="p-2 bg-success-subtle rounded-2">
                                            <i className="ti ti-gift fs-5 text-success"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 - Direct Income */}
                        <div className="col-12 col-lg-4 col-md-12 d-flex align-items-stretch">
                            <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("SELF TRADE")}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted mb-1">Direct Income</p>
                                            <h5 className="fw-bold mb-0 amount-report">
                                                ${userData?.SocialBonus?.toLocaleString() || '0.00'}
                                            </h5>
                                        </div>
                                        <div className="p-2 bg-info-subtle rounded-2">
                                            <i className="ti ti-building fs-5 text-info"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Row 2 - 3 Cards (Salary, Reward, APEX Mining) */}
                    <div className="row g-2 mt-2">

                        {/* Card 4 - Salary */}
                        <div className="col-6 col-lg-4 d-flex align-items-stretch">
                            <div className="card w-100 border-0 shadow-sm" style={{ cursor: "pointer" }}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Link to="/dashboard/CompoundingHistory" className="text-decoration-none w-100">
                                            <div>
                                                <p className="text-muted mb-1">Salary</p>
                                                <h5 className="fw-bold mb-0 amount-report">
                                                    ${userData?.DirectIncome?.toLocaleString() || '0.00'}
                                                </h5>
                                            </div>
                                        </Link>
                                        <div className="p-2 bg-primary-subtle rounded-2">
                                            <i className="ti ti-user fs-5 text-primary"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 5 - Reward */}
                        <div className="col-6 col-lg-4 d-flex align-items-stretch">
                            <div className="card w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("SPONSOR INCOME")}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted mb-1">Reward</p>
                                            <h5 className="fw-bold mb-0 amount-report">
                                                ${userData?.SponsorIncome?.toLocaleString() || '0.00'}
                                            </h5>
                                        </div>
                                        <div className="p-2 bg-warning-subtle rounded-2">
                                            <i className="ti ti-crown fs-5 text-warning"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 6 - APEX Mining */}
                        <div className="col-12 col-lg-4 col-md-12 d-flex align-items-stretch">
                            <div className="card w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("SPONSOR INCOME")}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <p className="text-muted mb-1">Apex Mining</p>
                                            <h5 className="fw-bold mb-0 amount-report">
                                                ${userData?.SponsorIncome?.toLocaleString() || '0.00'}
                                            </h5>
                                        </div>
                                        <div className="p-2 bg-warning-subtle rounded-2">
                                            <i className="ti ti-crown fs-5 text-warning"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>



                {/* Apex mind Token */}
                <div className="col-lg-4">
                    <div className="row">
                        <div className="col-sm-12 d-flex align-items-stretch">
                            <div className="card w-100">
                                <div className="card-body">
                                    <div className='d-flex'>
                                        <div className="p-2 bg-primary-subtle d-inline-block mb-3"><FaArrowTurnDown fontSize={18} /></div>
                                        <div className='ms-3' style={{ fontSize: "18px", fontWeight: '800' }}>Apexmind</div>
                                    </div>

                                    <div style={{ height: "65px" }}>
                                        <Line
                                            data={{
                                                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                                                datasets: [{ data: [8, 18, 12, 28, 20, 34, 26], borderColor: "#5D87FF", backgroundColor: "rgba(93,135,255,0.10)", fill: true, tension: 0.45, borderWidth: 4, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: "#ffffff", pointBorderColor: "#5D87FF", pointBorderWidth: 3 }],
                                            }}
                                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "#111827", padding: 10, displayColors: false, cornerRadius: 10 } }, scales: { x: { display: false, grid: { display: false }, border: { display: false } }, y: { display: false, grid: { display: false }, border: { display: false }, suggestedMin: 0, suggestedMax: 40 } } }}
                                        />
                                    </div>
                                    <Link to="/dashboard/SelfTradingHistory">
                                        <div style={{ cursor: "pointer" }}>
                                            <h4 className="mt-3 fw-semibold d-flex align-content-center amount-report">
                                                ${userData?.SelfTrade00?.toFixed(2) || "2.00"}
                                                <i className="ti ti-arrow-up-right fs-5 text-success"></i>
                                            </h4>
                                            <div className="mb-0">Token Rate</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* <div className="col-sm-6 d-flex align-items-stretch">
                            <div className="card w-100 border-0 shadow-sm ">
                                <div className="card-body p-4">
                                    <div className="p-2 bg-primary-subtle rounded-2 d-inline-block mb-3"><ImSortAmountDesc fontSize={18} /></div>
                                    <div style={{ height: "65px" }}>
                                        <Line
                                            data={{
                                                labels: ["", "", "", "", "", "", ""],
                                                datasets: [{ data: [12, 18, 15, 25, 20, 30, 28], borderColor: "#5D87FF", backgroundColor: "rgba(93,135,255,0.12)", tension: 0.5, fill: true, borderWidth: 3, pointRadius: 0 }],
                                            }}
                                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false, grid: { display: false }, border: { display: false } }, y: { display: false, grid: { display: false }, border: { display: false } } } }}
                                        />
                                    </div>
                                    <div style={{ cursor: "pointer" }} onClick={() => goToStatement("FUND WITHDRAWAL")}>
                                        <h3 className="mt-3 fw-bold d-flex align-items-center amount-report">
                                            ${userData?.Salary || 0}
                                            <i className="ti ti-arrow-up-right fs-5 text-success ms-1"></i>
                                        </h3>
                                        <div className="mb-3 ">Salary</div>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>



                <hr className='mb-2' style={{ backgroundColor: "black", height: "1px" }} />
                <div className='text-dark'>
                    <h3 className='mb-3'>Apex Mind Program</h3>
                </div>
                {/* Team/Business Details Section */}
                <div className="container-fluid">
                    <div className="row g-3">

                        {/* Left Side - col-8 */}
                        <div className="col-12 col-lg-8">
                            <div className="row g-2">

                                {/* Row 1 - 3 Cards */}
                                <div className="col-12">
                                    <div className="row g-2">

                                        {/* Card 1 - Invest Token */}
                                        <div className="col-6 col-md-4 col-lg-4 d-flex align-items-stretch">
                                            <div
                                                className="card02 w-100 border-0 shadow-sm h-100"
                                                style={{
                                                    cursor: "pointer",
                                                    borderRadius: "12px",
                                                    transition: "all 0.3s ease"
                                                }}
                                                onClick={() => goToStatement("Level Incom")}
                                            >
                                                <div className="card-body02 p-3 d-flex flex-column">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="flex-grow-1 ">
                                                            <p style={{
                                                                fontSize: "15px",
                                                                fontWeight: "600",
                                                                color: "#6c757d",
                                                                marginBottom: "2px"
                                                            }}>
                                                                Invest Amount
                                                            </p>
                                                            <h3 style={{
                                                                color: "green",
                                                                fontWeight: "700",
                                                                fontSize: "24px",
                                                                marginBottom: "6px"
                                                            }}>
                                                                ${userData?.TotalAmountBuyToken || '0'}
                                                            </h3>






                                                            <div className='mt-1'>
                                                                <p style={{
                                                                    fontSize: "16px",
                                                                    fontWeight: "600",
                                                                    color: "#6c757d",
                                                                    marginBottom: "0"
                                                                }}>
                                                                    Invest Token
                                                                </p>
                                                                <div className='mt-1' style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    color: "green",
                                                                    fontWeight: "700",
                                                                    fontSize: "23px"
                                                                }}>
                                                                    <img
                                                                        src={apexcoin}
                                                                        alt="Apex Coin"
                                                                        style={{
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            borderRadius: "50%"
                                                                        }}
                                                                    />
                                                                    {userData?.TotalTokenInWallet || '0'}
                                                                </div>
                                                            </div>
                                                          </div>
                                                        <div className="p-2 bg-primary-subtle rounded-2 ms-2" style={{
                                                            backgroundColor: "rgba(13, 110, 253, 0.1)",
                                                            borderRadius: "8px",
                                                            padding: "8px"
                                                        }}>
                                                            <i className="ti ti-users fs-5 text-primary" style={{ fontSize: "20px", color: "#0d6efd" }}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2 - Overall Token */}
                                        <div className="col-6 col-md-4 col-lg-4 d-flex align-items-stretch">
                                            <div
                                                className="card02 w-100 border-0 shadow-sm h-100"
                                                style={{
                                                    cursor: "pointer",
                                                    borderRadius: "12px",
                                                    transition: "all 0.3s ease"
                                                }}
                                                onClick={() => goToStatement("COMPOUNDING INCOME")}
                                            >
                                                <div className="card-body02 p-3 d-flex flex-column">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="flex-grow-1 p-">
                                                            <div className='' style={{
                                                                fontSize: "15px",
                                                                fontWeight: "600",
                                                                color: "#6c757d",
                                                                marginBottom: "2px"
                                                            }}>
                                                                Total Amount
                                                            </div>
                                                            <div style={{
                                                                color: "green",
                                                                fontWeight: "700",
                                                                fontSize: "23px",
                                                                marginBottom: "6px"
                                                            }}>
                                                                ${((userData?.TotalTokenInWallet || 0) * (userData?.CoinRate || 0)).toFixed(2)}
                                                            </div>

                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                               
                                                                <div className='mt-2'>
                                                                    <p style={{
                                                                        fontSize: "16x",
                                                                        fontWeight: "600",
                                                                        color: "#6c757d",
                                                                        marginBottom: "0"
                                                                    }}>
                                                                        Overall Token
                                                                    </p>
                                                                  
                                                                           <div className='mt-1' style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    color: "green",
                                                                    fontWeight: "700",
                                                                    fontSize: "22px"
                                                                }}>
                                                                         <img
                                                                    src={apexcoin}
                                                                    alt="Apex Coin"
                                                                    style={{
                                                                        width: "24px",
                                                                        height: "24px",
                                                                        borderRadius: "50%"
                                                                    }}
                                                                />
                                                                        {userData?.TotalTokenInWallet || '0'}
                                                                    </div></div>
                                                                </div></div>
                                                            </div>

                                                            <p style={{
                                                                fontSize: "15px",
                                                                fontWeight: "500",
                                                                color: "#6c757d",
                                                                marginBottom: "0",
                                                                marginTop: "4px"
                                                            }}>
                                                                Token Live Price:
                                                                <span style={{
                                                                    color: "green",
                                                                    fontWeight: "700",
                                                                    marginLeft: "4px",
                                                                    fontSize: "15px"
                                                                }}>
                                                                    ${userData?.CoinRate || '0.00'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-success-subtle rounded-2 ms-2" style={{
                                                            backgroundColor: "rgba(40, 167, 69, 0.1)",
                                                            borderRadius: "8px",
                                                            padding: "8px"
                                                        }}>
                                                            <i className="ti ti-gift fs-5 text-success" style={{ fontSize: "20px", color: "green" }}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            
                                  

                                        {/* Card 3 - Mining(ROI) */}
                                        <div className="col-12 col-md-4 col-lg-4 d-flex align-items-stretch">
                                            <div
                                                className="card02 w-100 border-0 shadow-sm h-100"
                                                style={{
                                                    cursor: "pointer",
                                                    borderRadius: "12px",
                                                    transition: "all 0.3s ease"
                                                }}
                                                onClick={() => goToStatement("SELF TRADE")}
                                            >
                                                <div className="card-body02 p-3 d-flex flex-column">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="flex-grow-1">
                                                            <p style={{
                                                                fontSize: "16px",
                                                                fontWeight: "600",
                                                                color: "#6c757d",
                                                                marginBottom: "4px"
                                                            }}>
                                                                Mining (ROI)
                                                            </p>

                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                                <img
                                                                    src={apexcoin}
                                                                    alt="Apex Coin"
                                                                    style={{
                                                                        width: "20px",
                                                                        height: "20px",
                                                                        borderRadius: "50%"
                                                                    }}
                                                                />

                                                                <h5 style={{
                                                                    color: "green",
                                                                    fontWeight: "700",
                                                                    fontSize: "23px",
                                                                }}>
                                                                    {userData?.TokenStakeBonus?.toLocaleString() || '0'}
                                                                </h5>
                                                             </div>
                                                            <div className='mt-2' style={{
                                                                fontSize: "16px",
                                                                fontWeight: "600",
                                                                color: "#6c757d",
                                                                marginBottom: "2px"
                                                            }}>
                                                                Level Income
                                                            </div>
                                                            <h5 style={ {
                                                                color: "green",
                                                                fontWeight: "700",
                                                                fontSize: "23px",
                                                                
                                                            }}>
                                                                {userData?.LevelIncome?.toLocaleString() || '0'}
                                                            </h5>
                                                        </div>
                                                        <div className="p-2 bg-info-subtle rounded-2 ms-2" style={{
                                                            backgroundColor: "rgba(23, 162, 184, 0.1)",
                                                            borderRadius: "8px",
                                                            padding: "8px"
                                                        }}>
                                                            <i className="ti ti-building fs-5 text-info" style={{ fontSize: "20px", color: "#17a2b8" }}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>



                                {/* Row 2 - 2 Cards (Social Media, Sponsor) */}
                                <div className="col-12 mt-2">
                                    <div className="row g-2">

                                        {/* Card 4 - Social Media Bonus */}
                                        <div className="col-12 col-md-6 d-flex align-items-stretch">
                                            <div className="card02 w-100 border-0 shadow-sm h-100" style={{ cursor: "pointer" }}>
                                                <div className="card-body p-3 d-flex flex-column">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <Link to="/dashboard/CompoundingHistory" className="text-decoration-none flex-grow-1">
                                                            <div>
                                                                <div className="" style={{fontWeight: "600"}}>Social Media Bonus</div>

                                                                <div className='mt-3' style={{ display: "flex", alignItems: "center", gap: "8px", }}>
                                                                    <img
                                                                        src={apexcoin}
                                                                        alt="Apex Coin"
                                                                        style={{
                                                                            width: "20px",
                                                                            height: "20px",
                                                                            borderRadius: "50%"
                                                                        }}
                                                                    />
                                                                    <h5 style={{fontWeight: "800", color: "green"}}>
                                                                        {userData?.SocialBonus?.toLocaleString() || '0'}
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                        <div className="p-2 bg-primary-subtle rounded-2 ms-2">
                                                            <i className="ti ti-user fs-5 text-primary"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 5 - Air drop */}
                                        <div className="col-12 col-md-6 d-flex align-items-stretch">
                                            <div className="card02 w-100 border-0 shadow-sm h-100" style={{ cursor: "pointer" }} onClick={() => goToStatement("SPONSOR INCOME")}>
                                                <div className="card-body p-3 d-flex flex-column">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="flex-grow-1">
                                                            <div style={{fontWeight: "600"}}>Air Drop</div>
                                                            <div className='mt-3' style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                                <img
                                                                    src={apexcoin}
                                                                    alt="Apex Coin"
                                                                    style={{
                                                                        width: "20px",
                                                                        height: "20px",
                                                                        borderRadius: "50%"
                                                                    }}
                                                                />
                                                                <h5 style={{fontWeight: "800", color: "green"}}>
                                                                    {userData?.tokenBonusOnUpgrade?.toLocaleString() || '0'}
                                                                </h5>
                                                            </div>
                                                        </div>
                                                        <div className="p-2 bg-warning-subtle rounded-2 ms-2">
                                                            <i className="ti ti-crown fs-5 text-warning"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Right Side - Team/Business Details Card (col-4) */}
                        <div className="col-12 col-lg-4 d-flex align-items-stretch">
                            <div className="card02 w-100 border-0 shadow-sm h-100">
                                <div className="card-body02 p-3">
                                    <h5 className="card-title fw-semibold mb-3">Team/Business Details</h5>

                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="p-2 bg-primary-subtle rounded-2">
                                                <i className="ti ti-user fs-5 text-primary"></i>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">Total Team</h6>
                                        </div>
                                        <h6 className="mb-0 fw-semibold">{userData?.TeamCount || '0'}</h6>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="p-2" >
                                                <i className="ti ti-chart-line fs-5" style={{ color: '#1976D2' }}></i>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">Active Team</h6>
                                        </div>
                                        <h6 className="mb-0 fw-semibold">{userData?.ActiveTeam || '0'}</h6>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="p-2">
                                                <i className="ti ti-arrows-exchange fs-5" style={{ color: '#1976D2' }}></i>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">Inactive Team</h6>
                                        </div>
                                        <h6 className="mb-0 fw-semibold">{userData?.InactiveTeam || '0'}</h6>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="p-2" >
                                                <i className="ti ti-repeat fs-5" style={{ color: '#1976D2' }}></i>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">Active Direct</h6>
                                        </div>
                                        <h6 className="mb-0 fw-semibold">{userData?.directId || '0'}</h6>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="p-2" >
                                                <i className="ti ti-calendar-stats fs-5" style={{ color: '#1976D2' }}></i>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">Level Open</h6>
                                        </div>
                                        <h6 className="mb-0 fw-semibold">{userData?.OpenLevel || '0'}</h6>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>








            {/* payout */}
            <div className='row mt-4'>

                {/* PayOut Card */}
                <div className="col-12 col-lg-4 d-flex align-items-stretch">
                    <div className="card w-100 border-0">
                        <div className="d-flex justify-content-between p-2 mt-2 px-3">
                            <div style={{ fontWeight: "900", fontSize: "20px" }}>Income Payout</div>
                            <div className='mint-box'><GiProfit /></div>
                        </div>
                        <div className="c-box">
                            <div className="payout-input-box p-3">
                                <input
                                    type="number"
                                    className="custom-pay-form form-control mb-2"
                                    placeholder='Enter Amount'
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    style={{ padding: "10px", fontWeight: "800", color: "green" }}
                                />
                                <div className="d-flex align-items-center justify-content-between mt-4">
                                    <Link to="/dashboard/PayOutHistory">
                                        <h5 className='amount-report'>
                                            ${userData?.withdrawal?.toLocaleString() || '0.00'}
                                        </h5>
                                        <p className="mb-2">
                                            Payout Amt
                                        </p>
                                    </Link>
                                    <button
                                        type="button"
                                        className="custtom-button"
                                        onClick={handlePayoutClick}
                                    >
                                        PayOut
                                    </button>
                                </div>
                                <div className='d-flex align-items-center gap-2'>
                                    <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                    <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>Min Withdrawal $20</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>






                {/* Self Trading Payout */}

                <div className="col-12 col-lg-4 d-flex align-items-stretch">
                    <div className="card w-100 border-0">
                        <div className="d-flex justify-content-between p-2 mt-2 px-3">
                            <div style={{ fontWeight: "900", fontSize: "20px" }}>Self Trading Payout</div>
                            <div className='mint-box'><GiProfit /></div>
                        </div>
                        <div className="c-box">
                            <div className="payout-input-box p-3">
                                <input
                                    type="number"
                                    className="custom-pay-form form-control mb-2"
                                    placeholder='Enter Amount'
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    style={{ padding: "10px", fontWeight: "800", color: "green" }}
                                />
                                <div className="d-flex align-items-center justify-content-between mt-4">
                                    <Link to="/dashboard/SelfTradingHistory">
                                        <h5 className='amount-report'>
                                            ${userData?.SelfTrade || "0.00"}
                                        </h5>
                                        <p className="mb-2">
                                            Payout Amt
                                        </p>
                                    </Link>
                                    <button
                                        type="button"
                                        className="custtom-button"
                                        onClick={() => setShowSelfPayoutModal(true)}
                                    >
                                        PayOut
                                    </button>
                                </div>
                                <div className='d-flex align-items-center gap-2'>
                                    <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                    <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>Min Withdrawal $20</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Token Payout */}
                <div className="col-12 col-lg-4 d-flex align-items-stretch">
                    <div className="card w-100 border-0">
                        <div className="d-flex justify-content-between p-2 mt-2 px-3">
                            <div style={{ fontWeight: "900", fontSize: "20px" }}>Token Payout</div>
                            <div className='mint-box'><GiProfit /></div>
                        </div>
                        <div className="c-box">
                            <div className="payout-input-box p-3">
                                <input
                                    type="number"
                                    className="custom-pay-form form-control mb-2"
                                    placeholder='Enter Amount'
                                    // value={payoutAmount}
                                    // onChange={(e) => setPayoutAmount(e.target.value)}
                                    style={{ padding: "10px", fontWeight: "800", color: "green" }}
                                />
                                <div className="d-flex align-items-center justify-content-between mt-4">
                                    <Link to="/dashboard/PayOutHistory">
                                        <h5 className='amount-report'>
                                            ${userData?.withdrawal?.toLocaleString() || '0.00'}
                                        </h5>
                                        <p className="mb-2">
                                            Payout Token
                                        </p>
                                    </Link>
                                    <button
                                        type="button"
                                        className="custtom-button"
                                    // onClick={handlePayoutClick}
                                    >
                                        PayOut
                                    </button>
                                </div>
                                <div className='d-flex align-items-center gap-2'>
                                    <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                    <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>Min Withdrawal Tokens 10</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>









                {/* 
// ============================================
// 🔥 SELF TRADING PAYOUT MODAL
// ============================================ */}
                {showSelfPayoutModal && (
                    <div className="modal-overlay" onClick={() => setShowSelfPayoutModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4> Self Trading Payout</h4>
                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setShowSelfPayoutModal(false);
                                        setSelfPayoutAmount('');
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Balance Info */}
                                <div style={{
                                    background: '#e8f5e9',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '14px', color: '#2e7d32' }}>
                                        Available Balance
                                    </span>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#1b5e20'
                                    }}>
                                        ${userData?.s?.toFixed(2) || '0.00'}
                                    </span>
                                </div>

                                {/* Amount Input */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '8px'
                                    }}>
                                        Enter Amount
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#f5f5f5',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0',
                                        overflow: 'hidden'
                                    }}>
                                        <span style={{
                                            padding: '12px 16px',
                                            background: '#e0e0e0',
                                            fontWeight: '700',
                                            color: '#333'
                                        }}>
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter amount"
                                            value={selfPayoutAmount}
                                            onChange={(e) => setSelfPayoutAmount(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '12px 16px',
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: '16px',
                                                background: 'transparent'
                                            }}
                                        />
                                    </div>



                                </div>

                                {/* Wallet Addresh */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#333',
                                        marginBottom: '8px'
                                    }}>
                                        Withdraw Addresh
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#f5f5f5',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0',
                                        overflow: 'hidden'
                                    }}>

                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="0x6cd8fd916C21E9d124e2EF61640a70A70c3E50"
                                            value={selfPayoutAmount}
                                            onChange={(e) => setSelfPayoutAmount(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '12px 16px',
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: '16px',
                                                background: 'transparent'
                                            }}
                                        />
                                    </div>
                                </div>


                                {/* Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginTop: '10px'
                                }}>
                                    {/* Payout Button */}
                                    <button
                                        onClick={handleSelfTradingPayout}
                                        disabled={selfPayoutLoading}
                                        style={{
                                            flex: 2,
                                            padding: '12px',
                                            background: selfPayoutLoading
                                                ? '#999'
                                                : ' #667eea',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            cursor: selfPayoutLoading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            opacity: selfPayoutLoading ? 0.7 : 1,
                                        }}
                                    >
                                        {selfPayoutLoading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                Processing...
                                            </span>
                                        ) : (
                                            'Payout Now'
                                        )}
                                    </button>
                                </div>

                                {/* Note */}
                                <div className='mt-2 ms-1' >
                                    <span style={{
                                        fontSize: '12px',
                                        color: 'red',
                                    }}>
                                        Note: Minimum Withdraw Limit $10
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}




                {/* DepositT MODAL - Wallet Icon Click Par Khulega */}
                {/* {showdepositModal && (

                <div className="modal-overlay" onClick={() => setShowdepositModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Deposit Fund</h4>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowdepositModal(false);
                                    setInvestAmount('');
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                width: '100%'
                            }}>
                                <img
                                    className=''
                                    src='https://i.pinimg.com/736x/25/49/9b/25499bcc4bff599bf0d2f00886f0b3cd.jpg'
                                    alt='deposit'
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto'
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    background: "#f8f9fa",
                                    border: "1px solid #dee2e6",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    marginTop: "10px",
                                    lineHeight: "1.8",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#0d6efd",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        marginBottom: "8px",
                                        textAlign: "center",
                                    }}
                                >
                                    Scan QR Code or copy the wallet address below to make payment
                                </div>

                                <div className='text-center'>
                                    <span
                                        style={{
                                            fontWeight: "700",
                                            color: "#212529",
                                            marginRight: "8px",
                                            textAlign: "center",
                                        }}
                                    >
                                        Wallet Address:
                                    </span>

                                    <span
                                        style={{
                                            color: "#198754",
                                            fontFamily: "monospace",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            background: "#e8f5e9",
                                            padding: "4px 8px",
                                            borderRadius: "5px",
                                            wordBreak: "break-all",
                                            textAlign: "center",
                                        }}
                                    >
                                        {walletAddress || "0x1234567890abcdef1234567890abcdef12345678"}
                                    </span>
                                </div>
                            </div>
                  
                            <div className='d-flex gap-3 justify-content-center mt-3'>
                                <button
                                    className="btn btn-success px-4 py-2"

                                    style={{
                                        fontWeight: '600',
                                        borderRadius: '8px'
                                    }}
                                >
                                    📤 Share
                                </button>
                                <button
                                    className="btn btn-primary px-4 py-2"

                                    style={{
                                        fontWeight: '600',
                                        borderRadius: '8px'
                                    }}
                                >
                                    📋 Copy
                                </button>
                            </div>
                            <span
                                style={{
                                    display: "block",
                                    marginTop: "10px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    textAlign: "center",
                                    color: "red"
                                }}
                            >
                                Note: If your wallet balance is not updated immediately, please wait a few minutes and try again.
                            </span>
                        </div>
                    </div>
                </div>


)} */}

                {/* BotTrading model start  */}

                {/* {showBotModal && (
                    <div className="bot-modal-overlay">
                        <div className="bot-modal">

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Bot Trading</h5>

                                <button
                                    className="btn-close"
                                    onClick={() => setShowBotModal(false)}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Bet Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="betAmount"
                                    value={botForm.betAmount}
                                    onChange={handleBotInput}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Currency</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="currency"
                                    value={botForm.currency}
                                    onChange={handleBotInput}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Currency Rate</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="currencyRate"
                                    value={botForm.currencyRate}
                                    onChange={handleBotInput}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Slot</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="slot"
                                    value={botForm.slot}
                                    onChange={handleBotInput}
                                />
                            </div>

                            <button
                                className="btn btn-primary w-100"
                                onClick={handleBotTrading}
                                disabled={botLoading}
                            >
                                {botLoading ? "Processing..." : "Submit"}
                            </button>

                        </div>
                    </div>
                )} */}
                {/* BotTrading model  end  */}



                {/* Withdraw Modal */}
                {showWithdrawModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>Withdraw</h4>
                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setShowWithdrawModal(false);
                                        setWithdrawAmount('');
                                        setWithdrawOtp('');
                                        setOtpSent(false);
                                        setOtpTimer(0);
                                        if (otpIntervalId) clearInterval(otpIntervalId);
                                        setOtpIntervalId(null);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="balance-info">
                                    <span>Available balance</span>
                                    <strong>${displayBalance?.toLocaleString() || '0.00'}</strong>
                                </div>

                                <div className='meddle'>
                                    <div className="methods-grid mt-3">
                                        <div className={`method-chip ${selectedMethod === 'BANK CARD' ? 'active' : ''}`} onClick={() => !verifyingOtp && setSelectedMethod('BANK CARD')}>
                                            <FaCreditCard />
                                            <span>BANK CARD</span>
                                        </div>
                                        <div className={`method-chip ${selectedMethod === 'USDT TRC20' ? 'active' : ''}`} onClick={() => !verifyingOtp && setSelectedMethod('USDT TRC20')}>
                                            <span>₿</span>
                                            <span>USDT TRC20</span>
                                        </div>
                                    </div>

                                    {selectedMethod === 'BANK CARD' && (
                                        <div className="saved-details-box mt-3">
                                            <div className="details-content">
                                                <div className="detail-row">
                                                    <span className="detail-value">{localStorage.getItem('accountNumber') || 'No bank details added'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedMethod === 'USDT TRC20' && (
                                        <div className="saved-details-box mt-3">
                                            <div className="details-content">
                                                <div className="detail-row">
                                                    <span className="detail-value wallet-address">{localStorage.getItem('bep20Wallet') || 'No wallet address added'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="amount-area mb-3 mt-3">
                                        <div className="amount-label">Enter Amount</div>
                                        <div className="amount-input-wrapper">
                                            <span className="currency-symbol">$</span>
                                            <input type="number" className="amount-input" placeholder="Enter amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} disabled={verifyingOtp} />
                                        </div>
                                    </div>

                                    <div className="input-container01 mt-3">
                                        <span className="currency-symbol1">OTP</span>
                                        <span className="divider">|</span>
                                        <input type="text" className="amount-input" placeholder="Enter 6-digit OTP" maxLength="6" value={withdrawOtp} onChange={(e) => setWithdrawOtp(e.target.value.replace(/\D/g, ''))} disabled={verifyingOtp} />
                                        <button className="clear-btn" onClick={sendOtp} disabled={isOtpButtonDisabled()}>
                                            {sendingOtp ? <span className="otp-spinner-small"></span> : otpTimer > 0 ? `${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : <IoSend />}
                                        </button>
                                    </div>

                                    <button className="modal-button mt-3" onClick={handleWithdraw} disabled={isWithdrawDisabled()}>
                                        {verifyingOtp ? 'Verifying OTP...' : 'Withdraw Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="success-modal-overlay">
                        <div className="success-modal">
                            <div className="checkmark-circle">
                                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="success-title">Withdrawal Request Submitted</div>
                            <div className="success-amount">${successAmount?.toLocaleString() || '0.00'}</div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default Dashboard;