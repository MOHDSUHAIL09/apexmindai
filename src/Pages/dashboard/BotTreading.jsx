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


const BotTreading = () => {
    // -------------------- BOT STATE --------------------
    const [botStatus, setBotStatus] = useState({
        isRunning: false,
        progress: 0,
    });
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [ setBalance] = useState(12500.75);
    const [setHistory] = useState([]);
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const { userData } = useUser();

    // ✅ API Status State
    const [apiBotStatus, setApiBotStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const regno = localStorage.getItem('Regno') || 1;

    // ✅ Dropdown State
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

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

    // -------------------- FETCH BOT STATUS --------------------
    const fetchBotStatus = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/Trading/BotStatus?regno=${regno}`);
            console.log("Bot Status API Response:", response.data);

            if (response.data?.result === "true") {
                const status = response.data?.response?.status;
                setApiBotStatus(status);
                console.log("✅ Bot Status:", status === 0 ? "Blocked" : "Active");
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

    // -------------------- APEX CHART STATE --------------------
    const [apexData, setApexData] = useState({
        series: [{
            name: 'Trading Revenue',
            data: [10, 25, 15, 30, 45, 60, 55, 70, 85, 90, 95, 110]
        }]
    });

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


    const handleSlotSelect = (slot) => {
        if (isBotDisabled) {
            toast.error('Bot is currently blocked!');
            return;
        }
        setSelectedSlot(slot);
        setShowDropdown(false);
        toast.info(`⏱️ ${slot} Hours selected!`);
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



    // -------------------- CHECK IF BOT IS DISABLED --------------------
    const isBotDisabled = loading || apiBotStatus === 0 || botStatus.isRunning;

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
                                        <small className="">Total Balance</small>
                                        <h3 className="mb-0 fw-bold text-success" style={{ fontSize: 'clamp(1rem, 4vw, 1.75rem)' }}>
                                            ${userData?.Invest || "0.00"}
                                        </h3>
                                    </div>
                                    <div className="d-flex align-items-center gap-3" style={{ flexWrap: 'wrap' }}>
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

                                        {/* Dropdown Button */}
                                        <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
                                            <button
                                                onClick={() => !isBotDisabled && setShowDropdown(!showDropdown)}
                                                disabled={isBotDisabled}
                                                style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '12px',
                                                    border: '2px solid #e2e8f0',
                                                    background: '#ffffff',
                                                    color: '#475569',
                                                    fontWeight: '600',
                                                    fontSize: 'clamp(11px, 1.5vw, 14px)',
                                                    cursor: isBotDisabled ? 'not-allowed' : 'pointer',
                                                    opacity: isBotDisabled ? 0.5 : 1,
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <span>Slot</span>
                                                <FaChevronDown size={12} style={{
                                                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s ease'
                                                }} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {showDropdown && !isBotDisabled && (
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
                                                    minWidth: '80px',
                                                    zIndex: 1000,
                                                    animation: 'slideDown 0.2s ease'
                                                }}>
                                                    {[36, 48, 72].map((slot) => (
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
                                {/* Status Badge */}
                              {!loading && (
    <div className="d-flex justify-content-center my-3">
        <button
            className={`badge ${apiBotStatus === 0 ? 'bg-danger' : 'bg-success'} px-5 py-3 rounded-pill border-0`}
            style={{
                fontSize: '16px',
                fontWeight: '600',
                cursor: apiBotStatus === 0 ? 'pointer' : 'not-allowed',
                opacity: apiBotStatus === 0 ? 1 : 0.7,
                transition: 'all 0.3s ease',
                minWidth: '140px',
                letterSpacing: '0.5px'
            }}
            disabled={apiBotStatus !== 0}
            onClick={() => {
                if (apiBotStatus === 0) {
                    // Start bot logic here
                    console.log('Starting bot...');
                }
            }}
        >
            {apiBotStatus === 0 ? ' Start Bot' : ' Bot Running'}
        </button>
    </div>
)}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown Animation CSS */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default BotTreading;