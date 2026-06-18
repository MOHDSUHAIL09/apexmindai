import { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";
import apiClient from '../../api/apiClient';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';

const BotTreading = () => {
    // -------------------- BOT STATE --------------------
    const [botStatus, setBotStatus] = useState({
        isRunning: false,
        progress: 0,
    });
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [setBalance] = useState(12500.75);
    const [setHistory] = useState([]);
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(12);
    const { userData } = useUser();
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
     const [countdown, setCountdown] = useState(" ");

    // ✅ API Status State
    const [apiBotStatus, setApiBotStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const regno = localStorage.getItem('Regno') || 1;

    // ✅ Dropdown State
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // ✅ Timer Effect
    useEffect(() => {
        const seconds = parseInt(userData?.status, 10);
        console.log("status =", userData?.status);
        if (!isNaN(seconds)) {
            setTimeLeft(seconds);
        }
    }, [userData?.status]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

useEffect(() => {
  if (!userData?.status) return;

  // "2026-06-19 05:00:56" -> "2026-06-19T05:00:56+04:00"
  const targetTime = new Date(
    userData.status.replace(" ", "T") + "+04:00"
  ).getTime();

  const timer = setInterval(() => {
    const diff = targetTime - Date.now();

    if (diff <= 0) {
      setCountdown("00H : 00M : 00S");
      clearInterval(timer);
      return;
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    setCountdown(
      `${String(hours).padStart(2, "0")}H : ${String(minutes).padStart(2, "0")}M : ${String(seconds).padStart(2, "0")}S`
    );
  }, 1000);

  return () => clearInterval(timer);
}, [userData?.status]);
    // -------------------- FETCH BOT STATUS --------------------
    const fetchBotStatus = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/Trading/BotStatus?regno=${regno}`);
            console.log("Bot Status API Response:", response.data);

            if (response.data?.result === "true") {
                const status = response.data?.response?.status;
                setApiBotStatus(status);
                console.log("✅ Bot Status:", status === 0 ? "Running" : "Stopped");
                
                if (status === 0) {
                    setBotStatus(prev => ({ ...prev, isRunning: true }));
                } else {
                    setBotStatus(prev => ({ ...prev, isRunning: false }));
                }
            } else {
                setApiBotStatus(1);
            }
        } catch (error) {
            console.error("Error fetching bot status:", error);
            setApiBotStatus(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBotStatus();
    }, []);

    // Add to history function
    const addToHistory = (action, amount, profit) => {
        const newHistory = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            action: action,
            amount: amount,
            profit: profit,
            status: profit > 0 ? 'Profit' : profit < 0 ? 'Loss' : 'Neutral'
        };
        setHistory(prev => [newHistory, ...prev].slice(0, 20));
    };

    // -------------------- TRADE CHART STATE --------------------
    const containerRef = useRef(null);
    const [chartSize, setChartSize] = useState({ w: 800, h: 400 });
    const [chartData, setChartData] = useState([]);
    const [tooltip, setTooltip] = useState({ x: 0, y: 0, value: 0 });
    const [, setBgSplit] = useState(50);
    const [roundStartIndex, setRoundStartIndex] = useState(null);
    const [roundStartPrice, setRoundStartPrice] = useState(null);

    const INTERVAL_MS = 400;
    const GAME_DURATION_SEC = 30;
    const POINTS_IN_ROUND = Math.ceil((GAME_DURATION_SEC * 1000) / INTERVAL_MS);

    // Currency symbols
    const getCurrencySymbol = () => {
        switch (selectedCurrency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'INR': return '₹';
            default: return '$';
        }
    };

    // ✅ Handle Slot Select
    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setShowDropdown(false);
        toast.info(`⏱️ ${slot} Hours selected!`);
    };

    // ✅ Handle Start Bot - API Call
    const handleStartBot = async () => {
        // ✅ Status 0 = Running, 1 = Stopped
        if (apiBotStatus === 0) {
            toast.warning('⚠️ Bot is already running!');
            return;
        }
        
        if (!selectedSlot) {
            toast.warning('⚠️ Please select a slot first!');
            return;
        }

        if (botStatus.isRunning) {
            toast.warning('⚠️ Bot is already running!');
            return;
        }

        // ✅ Get betAmount from userData
        const betAmount = parseFloat(userData?.Invest) || 100;
        
        // ✅ Currency mapping
        const currencyMap = {
            'USD': 'usdt',
            'EUR': 'eur',
            'GBP': 'gbp',
            'INR': 'inr'
        };
        const currency = currencyMap[selectedCurrency] || 'usdt';
        
        // ✅ Currency Rate (default 96 for USDT)
        const currencyRate = 96;

        // ✅ Prepare payload
        const payload = {
            regno: parseInt(regno),
            betAmount: betAmount,
            currency: currency,
            currencyRate: currencyRate,
            slot: selectedSlot
        };

        console.log("🚀 Starting bot with payload:", payload);
        setIsSubmitting(true);

        try {
            const response = await apiClient.post('/Trading/BotTrading', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("📦 API Response:", response.data);

            if (response.data?.result === "true") {
                toast.success(`✅ Bot started successfully for ${selectedSlot} hours!`);
                setBotStatus({ isRunning: true, progress: 0 });
                setApiBotStatus(0);
                // Refresh bot status after starting
                fetchBotStatus();
            } else {
                toast.error(response.data?.message || '❌ Failed to start bot');
                if (response.data?.message === "Bot Exits") {
                    toast.warning('⚠️ Bot already exists!');
                }
            }
        } catch (error) {
            console.error("❌ API Error:", error.response || error);
            toast.error(error.response?.data?.message || '❌ Failed to start bot');
            if (error.response?.data?.message === "Bot Exits") {
                toast.warning('⚠️ Bot already exists!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // -------------------- RESIZE OBSERVER --------------------
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setChartSize({ w: width, h: height });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // -------------------- INITIAL CHART DATA --------------------
    useEffect(() => {
        if (chartData.length === 0) {
            const initialData = Array.from({ length: 50 }, () => 68000 + Math.random() * 10);
            setChartData(initialData);
        }
    }, []);

    // -------------------- LIVE DATA GENERATION --------------------
    useEffect(() => {
        const interval = setInterval(() => {
            setChartData((prev) => {
                const lastVal = prev.length > 0 ? prev[prev.length - 1] : 68000;
                const next = lastVal + (Math.random() * 4 - 2);
                const newData = [...prev, next];

                if (isRoundActive && roundStartIndex !== null) {
                    const finishIndex = roundStartIndex + POINTS_IN_ROUND;
                    const currentIndex = newData.length - 1;

                    if (currentIndex >= finishIndex) {
                        setIsRoundActive(false);
                        toast.success('🎉 Round completed!');
                        const profit = (Math.random() * 200) - 100;
                        setBalance(prev => prev + profit);
                        addToHistory('Round Complete', Math.abs(profit), profit);
                        setBotStatus({
                            isRunning: false,
                            progress: 100,
                            message: 'Round completed!'
                        });
                    }
                }

                if (newData.length > 500) return newData.slice(newData.length - 500);
                return newData;
            });
        }, INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isRoundActive, roundStartIndex, POINTS_IN_ROUND]);

    // -------------------- CHART SCALES --------------------
    const currentDataIndex = chartData.length - 1;
    const xMin = currentDataIndex - 60;
    const xMax = currentDataIndex + 25;

    const minPrice = Math.min(...chartData.slice(Math.max(0, chartData.length - 100)));
    const maxPrice = Math.max(...chartData.slice(Math.max(0, chartData.length - 100)));
    const pricePadding = (maxPrice - minPrice) * 0.2;

    const xScale = scaleLinear({
        domain: [xMin, xMax],
        range: [0, chartSize.w],
    });

    const yScale = scaleLinear({
        domain: [minPrice - pricePadding, maxPrice + pricePadding],
        range: [chartSize.h - 40, 20],
    });

    // -------------------- TOOLTIP --------------------
    useEffect(() => {
        if (chartData.length === 0) return;

        const lastValue = chartData[chartData.length - 1];
        const yPos = yScale(lastValue);

        setTooltip({
            x: chartSize.w,
            y: yPos,
            value: lastValue.toFixed(4),
        });

        let percentage = 50;
        const chartHeight = chartSize.h - 40;

        if (isRoundActive && roundStartPrice !== null) {
            const startY = yScale(roundStartPrice);
            percentage = ((startY - 20) / chartHeight) * 100;
        } else {
            percentage = ((yPos - 20) / chartHeight) * 100;
        }

        percentage = Math.max(0, Math.min(100, percentage));
        setBgSplit(percentage);
    }, [chartData, chartSize.h, chartSize.w, isRoundActive, roundStartPrice]);

    const startFlagX = roundStartIndex !== null ? xScale(roundStartIndex) : -999;
    const finishFlagX = roundStartIndex !== null ? xScale(roundStartIndex + POINTS_IN_ROUND) : -999;
    const startPriceY = roundStartPrice !== null ? yScale(roundStartPrice) : 0;

    // ✅ Format time function
    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return '00:00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // -------------------- RENDER --------------------
    return (
        <>
            <ToastContainer position="top-right" />
            <div className="container-fluid py-4">

                {/* ======================== */}
                {/* 1️⃣ CHART - TOP PE */}
                {/* ======================== */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="card-body p-0">
                                <div
                                    ref={containerRef}
                                    style={{
                                        width: "100%",
                                        height: "420px",
                                        position: "relative",
                                        overflow: "hidden",
                                        background: "#0f111a",
                                    }}
                                >
                                    <svg width={chartSize.w} height={chartSize.h} style={{ position: "absolute", top: 0, left: 0 }}>
                                        <Group top={0} left={0}>
                                            <GridRows
                                                scale={yScale}
                                                width={chartSize.w}
                                                stroke="#fff"
                                                strokeOpacity={0.05}
                                                numTicks={6}
                                            />
                                            {yScale.ticks(6).map((tick, i) => (
                                                <text
                                                    key={i}
                                                    x={chartSize.w - 12}
                                                    y={yScale(tick) - 5}
                                                    fill="#6b7280"
                                                    fontSize="11"
                                                    textAnchor="end"
                                                >
                                                    {tick.toFixed(3)}
                                                </text>
                                            ))}
                                            {isRoundActive && roundStartIndex !== null && (
                                                <>
                                                    <line
                                                        x1={0} x2={chartSize.w}
                                                        y1={startPriceY} y2={startPriceY}
                                                        stroke="#fbbf24"
                                                        strokeWidth={1}
                                                        strokeDasharray="6 4"
                                                        opacity={0.6}
                                                    />
                                                    <Group left={startFlagX} top={0}>
                                                        <line
                                                            x1={0} x2={0}
                                                            y1={20} y2={chartSize.h - 20}
                                                            stroke="#fbbf24"
                                                            strokeWidth={1}
                                                            strokeDasharray="4 4"
                                                            opacity={0.4}
                                                        />
                                                        <text x={-8} y={24} style={{ fontSize: "1.4em" }}>🏁</text>
                                                        <circle cx={0} cy={startPriceY} r={4} fill="#fbbf24" />
                                                    </Group>
                                                    <Group left={finishFlagX} top={0}>
                                                        <line
                                                            x1={0} x2={0}
                                                            y1={20} y2={chartSize.h - 20}
                                                            stroke="#ef4444"
                                                            strokeWidth={1}
                                                            strokeDasharray="4 4"
                                                            opacity={0.4}
                                                        />
                                                        <text x={-8} y={24} style={{ fontSize: "1.4em" }}>🏁</text>
                                                    </Group>
                                                </>
                                            )}
                                            {chartData.length > 0 && (
                                                <LinePath
                                                    data={chartData}
                                                    x={(d, i) => xScale(i)}
                                                    y={(d) => yScale(d)}
                                                    stroke="#60a5fa"
                                                    strokeWidth={2.5}
                                                    curve={curveMonotoneX}
                                                />
                                            )}
                                            {chartData.length > 0 && (
                                                <circle
                                                    cx={xScale(chartData.length - 1)}
                                                    cy={yScale(chartData[chartData.length - 1])}
                                                    r={5}
                                                    fill="#60a5fa"
                                                    filter="drop-shadow(0 0 12px rgba(96,165,250,0.8))"
                                                />
                                            )}
                                        </Group>
                                    </svg>

                                    {/* Tooltip Line */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: tooltip.y,
                                            left: 0,
                                            height: "1.5px",
                                            width: "85%",
                                            background: "linear-gradient(to right, transparent, #60a5fa, transparent)",
                                            opacity: 0.8,
                                            zIndex: 1,
                                            transition: "top 0.2s linear",
                                        }}
                                    />
                                    {/* Live Price */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: tooltip.y,
                                            right: 12,
                                            padding: "6px 14px",
                                            background: "#1a1d29",
                                            color: "#fbbf24",
                                            borderRadius: "8px",
                                            border: "1px solid #fbbf24",
                                            fontSize: "1.1em",
                                            fontWeight: "600",
                                            transform: "translateY(-50%)",
                                            zIndex: 20,
                                            pointerEvents: "none",
                                            fontFamily: "monospace"
                                        }}
                                    >
                                        {tooltip.value}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ======================== */}
                {/* 2️⃣ BALANCE + SLOTS + CONTROLS */}
                {/* ======================== */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
                            <div className="card-body" style={{
                                background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
                                borderRadius: '16px'
                            }}>

                                {/* Balance & Status */}
                                <div className="d-flex justify-content-between align-items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <h4>Total Balance</h4>
                                        <Link to="/dashboard/BotTradingHistory">
                                            <h3 className="mb-0 fw-bold text-success amount-report" style={{ fontSize: 'clamp(1rem, 4vw, 1.75rem)' }}>
                                                ${userData?.Invest || "0.00"}
                                            </h3>
                                        </Link>
                                    </div>
                                    <div className="d-flex align-items-center gap-1" >
                                        <select
                                            className="form-select"
                                            value={selectedCurrency}
                                            onChange={(e) => setSelectedCurrency(e.target.value)}
                                            style={{
                                                width: 'clamp(80px, 15vw, 110px)',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: 'clamp(11px, 1.5vw, 14px)',
                                                padding: '6px 10px',
                                                flexShrink: 0
                                            }}
                                        >
                                            <option value="USD">$ USD</option>
                                            <option value="EUR">€ EUR</option>
                                            <option value="GBP">£ GBP</option>
                                            <option value="INR">₹ INR</option>
                                        </select>

                                        {/* Slot Dropdown - Always Enabled */}
                                        <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
                                            <button
                                                onClick={() => setShowDropdown(!showDropdown)}
                                                style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '12px',
                                                    border: '2px solid #e2e8f0',
                                                    background: '#ffffff',
                                                    color: '#475569',
                                                    fontWeight: '600',
                                                    fontSize: 'clamp(11px, 1.5vw, 14px)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <span>{selectedSlot ? `${selectedSlot} Hrs` : 'Slot'}</span>
                                                <FaChevronDown size={12} style={{
                                                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s ease'
                                                }} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {showDropdown && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '110%',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: '#ffffff',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                                    border: '1px solid #e2e8f0',
                                                    padding: '8px',
                                                    minWidth: '100px',
                                                    zIndex: 1000,
                                                    animation: 'slideDown 0.2s ease'
                                                }}>
                                                    {[12].map((slot) => (
                                                        <button
                                                            key={slot}
                                                            onClick={() => handleSlotSelect(slot)}
                                                            style={{
                                                                display: 'block',
                                                                width: '100%',
                                                                padding: '8px 14px',
                                                                border: 'none',
                                                                background: selectedSlot === slot ? '#10b981' : 'transparent',
                                                                color: selectedSlot === slot ? '#ffffff' : '#475569',
                                                                borderRadius: '8px',
                                                                fontWeight: '600',
                                                                fontSize: 'clamp(11px, 1.5vw, 14px)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                textAlign: 'center',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (selectedSlot !== slot) {
                                                                    e.target.style.background = '#f1f5f9';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (selectedSlot !== slot) {
                                                                    e.target.style.background = 'transparent';
                                                                }
                                                            }}
                                                        >
                                                            {slot} Hrs
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ✅ Start Bot Button - Status ke hisaab se */}
                                {!loading && (
                                    <div className="d-flex justify-content-center my-3">
                                        {apiBotStatus === 0 ? (
                                            // ✅ Status 0 = Bot Running
                                            <button
                                                className="btn px-5 py-3 rounded-pill border-0"
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    color: '#ffffff',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    cursor: 'not-allowed',
                                                    minWidth: '140px',
                                                    letterSpacing: '0.5px',
                                                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                                                    opacity: 0.8
                                                }}
                                                disabled
                                            >
                                                <div> Bot Running</div>
                                                <small style={{ fontSize: '12px', opacity: 0.8 }}>
                                                    {countdown}
                                                </small>
                                            </button>
                                        ) : (
                                            // ✅ Status 1 = Start Bot (Green)
                                            <button
                                                className="btn px-5 py-3 rounded-pill border-0"
                                                style={{
                                                    backgroundColor: isSubmitting ? '#94a3b8' : '#10b981',
                                                    color: '#ffffff',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                    minWidth: '140px',
                                                    letterSpacing: '0.5px',
                                                    boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                                                    transition: 'all 0.3s ease',
                                                    opacity: isSubmitting ? 0.7 : 1
                                                }}
                                                onClick={handleStartBot}
                                                disabled={isSubmitting}
                                                onMouseEnter={(e) => {
                                                    if (!isSubmitting) {
                                                        e.target.style.backgroundColor = '#059669';
                                                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSubmitting) {
                                                        e.target.style.backgroundColor = '#10b981';
                                                        e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                                    }
                                                }}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Starting...
                                                    </>
                                                ) : (
                                                    ' Start Bot'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BotTreading;