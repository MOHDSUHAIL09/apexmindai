import { useState, useEffect, useRef } from 'react';
import { FaHistory } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";

const BotTreading = () => {
    // -------------------- BOT STATE --------------------
    const [botStatus, setBotStatus] = useState({
        isRunning: false,
        progress: 0,
        message: 'Bot is idle'
    });
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [balance, setBalance] = useState(12500.75);
    const [history, setHistory] = useState([]);
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

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

    // Chart data and game state
    const [chartData, setChartData] = useState([]);
    const [tooltip, setTooltip] = useState({ x: 0, y: 0, value: 0 });
    const [bgSplit, setBgSplit] = useState(50);
    const [roundStartIndex, setRoundStartIndex] = useState(null);
    const [roundStartPrice, setRoundStartPrice] = useState(null);

    // Constants
    const INTERVAL_MS = 400;
    const GAME_DURATION_SEC = 30;
    const POINTS_IN_ROUND = Math.ceil((GAME_DURATION_SEC * 1000) / INTERVAL_MS);

    // -------------------- APEX CHART STATE --------------------
    const [apexData, setApexData] = useState({
        series: [{
            name: 'Trading Revenue',
            data: [10, 25, 15, 30, 45, 60, 55, 70, 85, 90, 95, 110]
        }],
        options: {
            chart: {
                type: 'area',
                height: 350,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                }
            },
            title: {
                text: 'Trading Performance',
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333'
                }
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                title: {
                    text: 'Months',
                    style: { fontSize: '12px', fontWeight: 'bold' }
                }
            },
            yaxis: {
                title: {
                    text: 'Revenue',
                    style: { fontSize: '12px', fontWeight: 'bold' }
                },
                labels: {
                    formatter: function (val) {
                        return getCurrencySymbol() + val
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return getCurrencySymbol() + val + 'K'
                    }
                },
                theme: 'dark'
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100]
                }
            },
            colors: ['#667eea'],
            stroke: { curve: 'smooth', width: 3 },
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                }
            },
            markers: {
                size: 5,
                colors: ['#667eea'],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: { size: 7 }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return getCurrencySymbol() + val + 'K'
                },
                style: { fontSize: '11px', fontWeight: 'normal' }
            }
        }
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

    const formatAmount = (amount) => {
        return `${getCurrencySymbol()}${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Slot selection handler
    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        toast.info(`⏱️ Slot ${slot} seconds selected!`);
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
            const initialData = Array.from({ length: 50 }, (_, i) => 68000 + Math.random() * 10);
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

                // Check win condition
                if (isRoundActive && roundStartIndex !== null) {
                    const finishIndex = roundStartIndex + POINTS_IN_ROUND;
                    const currentIndex = newData.length - 1;

                    if (currentIndex >= finishIndex) {
                        setIsRoundActive(false);
                        toast.success('Round completed! Check your profit/loss.');

                        // Random profit/loss
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

                // Keep array size manageable
                if (newData.length > 500) return newData.slice(newData.length - 500);
                return newData;
            });
        }, INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isRoundActive, roundStartIndex, POINTS_IN_ROUND]);

    // -------------------- ROUND START/RESET LOGIC --------------------
    useEffect(() => {
        if (isRoundActive && roundStartIndex === null && chartData.length > 0) {
            const currentIndex = chartData.length - 1;
            setRoundStartIndex(currentIndex);
            setRoundStartPrice(chartData[currentIndex]);
        } else if (!isRoundActive) {
            setRoundStartIndex(null);
            setRoundStartPrice(null);
        }
    }, [isRoundActive, chartData.length, roundStartIndex]);

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

    // -------------------- TOOLTIP & BACKGROUND --------------------
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
    }, [chartData, chartSize.h, chartSize.w, isRoundActive, roundStartPrice, yScale]);

    // Calculate Flag Positions
    const startFlagX = roundStartIndex !== null ? xScale(roundStartIndex) : -999;
    const finishFlagX = roundStartIndex !== null ? xScale(roundStartIndex + POINTS_IN_ROUND) : -999;
    const startPriceY = roundStartPrice !== null ? yScale(roundStartPrice) : 0;

    // -------------------- BOT CONTROLS --------------------
    const startBot = async () => {
        if (!selectedSlot) {
            toast.warning('Please select a slot first!');
            return;
        }

        setIsRoundActive(true);
        setBotStatus({
            isRunning: true,
            progress: 0,
            message: 'Starting bot...'
        });

        let progressValue = 0;
        const interval = setInterval(() => {
            progressValue += 10;

            // Random price change for apex chart
            const randomChange = (Math.random() * 30) - 10;
            const lastValue = apexData.series[0].data[apexData.series[0].data.length - 1];
            const newValue = Math.max(5, lastValue + randomChange);

            setApexData(prev => ({
                ...prev,
                series: [{ name: 'Trading Revenue', data: [...prev.series[0].data.slice(1), Math.round(newValue)] }]
            }));

            const profitAmount = Math.round(randomChange * 10) / 10;
            setBalance(prev => prev + profitAmount);
            addToHistory('Trade', Math.abs(profitAmount), profitAmount);

            setBotStatus(prev => ({
                ...prev,
                progress: progressValue,
                message: `Bot is running... ${progressValue}% | P&L: ${profitAmount > 0 ? '+' : ''}${profitAmount.toFixed(2)}`
            }));

            if (progressValue >= 100) {
                clearInterval(interval);
                setIsRoundActive(false);
                toast.success('Bot completed successfully!');
                setBotStatus({
                    isRunning: false,
                    progress: 100,
                    message: 'Bot completed successfully!'
                });
            }
        }, 800);
    };

    const stopBot = () => {
        setIsRoundActive(false);
        setBotStatus({
            isRunning: false,
            progress: 0,
            message: 'Bot stopped'
        });
        toast.info('Bot stopped manually');
    };

    const resetBot = () => {
        setIsRoundActive(false);
        setBotStatus({
            isRunning: false,
            progress: 0,
            message: 'Bot is idle'
        });
        setSelectedSlot(null);
        setChartData([]);
        setRoundStartIndex(null);
        setRoundStartPrice(null);
        setApexData({
            ...apexData,
            series: [{ name: 'Trading Revenue', data: [10, 25, 15, 30, 45, 60, 55, 70, 85, 90, 95, 110] }]
        });
        toast.info('Bot reset');
    };

    const clearHistory = () => {
        setHistory([]);
        toast.info('History cleared');
    };

    const columns = ['Date', 'Action', 'Amount', 'Profit/Loss', 'Status'];

    // -------------------- RENDER --------------------
    return (
        <>
            <ToastContainer position="top-right" />
            <div className="container-fluid py-4">
                {/* Header with Balance and Currency */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center w-100">
                                    <div>
                                        <small className="text-muted">Current Balance</small>
                                        <h4 className="mb-0 text-success fw-bold">{formatAmount(balance)}</h4>
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        <FaHistory
                                            className="text-primary"
                                            size={35}
                                            style={{
                                                background: "#f1f1f1",
                                                borderRadius: "50%",
                                                padding: "8px",
                                                cursor: "pointer"
                                            }}
                                        />
                                        <select
                                            className="form-select"
                                            value={selectedCurrency}
                                            onChange={(e) => setSelectedCurrency(e.target.value)}
                                            style={{
                                                width: '100px',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '14px',
                                                padding: '6px 12px'
                                            }}
                                        >
                                            <option value="USD">$ USD</option>
                                            <option value="EUR">€ EUR</option>
                                            <option value="GBP">£ GBP</option>
                                            <option value="INR">₹ INR</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRADE CHART - Visx Chart Integrated Here */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm">
                            <div className="card-body" style={{ padding: 0, overflow: 'hidden' }}>
                                <div
                                    ref={containerRef}
                                    style={{
                                        width: "100%",
                                        height: "400px",
                                        position: "relative",
                                        overflow: "hidden",
                                        background: "#1a1d29",
                                        borderRadius: "8px"
                                    }}
                                >
                                    {/* Background Gradient */}
                                    <div />

                                    <svg width={chartSize.w} height={chartSize.h} style={{ position: "absolute", top: 0, left: 0 }}>
                                        <Group top={0} left={0}>
                                            {/* Grid Rows */}
                                            <GridRows
                                                scale={yScale}
                                                width={chartSize.w}
                                                stroke="#fff"
                                                strokeOpacity={0.05}
                                                numTicks={6}
                                            />

                                            {/* Y-Axis Labels */}
                                            {yScale.ticks(6).map((tick, i) => (
                                                <text
                                                    key={i}
                                                    x={chartSize.w - 10}
                                                    y={yScale(tick) - 5}
                                                    fill="#d0d2dc"
                                                    fontSize="12"
                                                    letterSpacing={1}
                                                    textAnchor="end"
                                                >
                                                    {tick.toFixed(3)}
                                                </text>
                                            ))}

                                            {/* GAME ELEMENTS - Flags */}
                                            {isRoundActive && roundStartIndex !== null && (
                                                <>
                                                    {/* Start Price Line */}
                                                    <line
                                                        x1={0} x2={chartSize.w}
                                                        y1={startPriceY} y2={startPriceY}
                                                        stroke="white"
                                                        strokeWidth={1}
                                                        strokeDasharray="4 4"
                                                        opacity={0.5}
                                                    />

                                                    {/* START FLAG */}
                                                    <Group left={startFlagX} top={0}>
                                                        <line
                                                            x1={0} x2={0}
                                                            y1={20} y2={chartSize.h - 20}
                                                            stroke="#fff"
                                                            strokeWidth={1}
                                                            strokeDasharray="2 2"
                                                            opacity={0.4}
                                                        />
                                                        <text x={-5} y={20} style={{ fontSize: "1.1em" }}>🏁</text>
                                                        <circle
                                                            cx={0}
                                                            cy={startPriceY}
                                                            r={2}
                                                            fill="#fff"
                                                        />
                                                    </Group>

                                                    {/* FINISH FLAG */}
                                                    <Group left={finishFlagX} top={0}>
                                                        <line
                                                            x1={0} x2={0}
                                                            y1={20} y2={chartSize.h - 20}
                                                            stroke="#fff"
                                                            strokeWidth={1}
                                                            strokeDasharray="2 2"
                                                            opacity={0.4}
                                                        />
                                                        <text x={-5} y={20} style={{ fontSize: "1.1em" }}>🏁</text>
                                                    </Group>
                                                </>
                                            )}

                                            {/* MAIN CHART LINE */}
                                            {chartData.length > 0 && (
                                                <LinePath
                                                    data={chartData}
                                                    x={(d, i) => xScale(i)}
                                                    y={(d) => yScale(d)}
                                                    stroke="#fff"
                                                    strokeWidth={2}
                                                    curve={curveMonotoneX}
                                                />
                                            )}

                                            {/* Glowing Head Dot */}
                                            {chartData.length > 0 && (
                                                <circle
                                                    cx={xScale(chartData.length - 1)}
                                                    cy={yScale(chartData[chartData.length - 1])}
                                                    r={4}
                                                    fill="white"
                                                    filter="drop-shadow(0 0 6px rgba(255,255,255,0.9))"
                                                />
                                            )}
                                        </Group>
                                    </svg>

                                    {/* TOOLTIP & TRACER */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: tooltip.y,
                                            left: 0,
                                            height: "1.30px",
                                            width: "88%",
                                            background: "#fff",
                                            opacity: 0.8,
                                            zIndex: 1,
                                            transition: "top 0.2s linear",
                                        }}
                                    />

                                    {/* Live Price Box */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: tooltip.y - 0,
                                            right: 0,
                                            padding: ".4em .7em",
                                            width: "4em",
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: "center",
                                            background: "#111",
                                            color: "#f4d56f",
                                            borderRadius: "0.5em",
                                            border: "1px solid #f4d56f",
                                            fontSize: "1.2em",
                                            fontWeight: "500",
                                            letterSpacing: "0.030em",
                                            transform: "translateY(-50%)",
                                            transition: "top 0.2s linear",
                                            zIndex: 20,
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {tooltip.value}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bot Control Buttons */}
                {/* Bot Control Buttons */}
                <div className="row">
                    <div className="col-12">
                        {/* SLOT SECTION - Beautiful Slot Buttons */}
                        <div className="card shadow-sm mt-3 border-0">
                            <div className="card-body" style={{
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                borderRadius: '15px'
                            }}>
                                <div className="slot-container">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h6 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                                                Select Trading Duration
                                            </h6>

                                        </div>
                                        {selectedSlot && (
                                            <span className="badge bg-success px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                                ✅ {selectedSlot} Hours
                                            </span>
                                        )}
                                    </div>

                                    <div className="d-flex gap-2">
                                        {[6, 12, 18, 24].map((slot) => (
                                            <button
                                                key={slot}
                                                className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                                                onClick={() => handleSlotSelect(slot)}
                                                disabled={botStatus.isRunning}
                                            >
                                                <span className="slot-number">{slot}</span>
                                                <span className="slot-label">Hrs</span>
                                            </button>

                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-center gap-3 flex-wrap"style={{marginTop: "-50px"}}>
                                        {!botStatus.isRunning ? (
                                            <button
                                                className="btn btn-success btn-lg px-5 shadow"
                                                onClick={startBot}
                                                style={{
                                                    background: 'linear-gradient(135deg, #00b09b, #96c93d)',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    padding: '12px 40px',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    transition: 'all 0.3s ease',
                                                    minWidth: '200px'
                                                }}
                                            >
                                                Start Bot 
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-danger btn-lg px-5 shadow"
                                                onClick={stopBot}
                                                style={{
                                                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    padding: '12px 40px',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    transition: 'all 0.3s ease',
                                                    minWidth: '200px'
                                                }}
                                            >
                                                Stop Bot
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Start/Stop Buttons - No Reset Button */}
                        <div className="mt-3 text-center">


                            {!selectedSlot && !botStatus.isRunning && (
                                <div className="mt-3">
                                    <div className="alert alert-warning alert-dismissible fade show mb-0" role="alert" style={{ borderRadius: '15px' }}>
                                        <strong>⚠️ Please select a duration first!</strong>
                                        <span className="ms-2">Click on any slot above to continue.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default BotTreading;