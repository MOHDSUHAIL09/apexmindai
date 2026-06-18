import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const BotTradingHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalBalance, setTotalBalance] = useState(0);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const regno = localStorage.getItem("Regno");

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateString;
        }
    };

    // Format amount function
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Get status badge class
    const getStatusBadge = (status) => {
        switch(status) {
            case 1:
                return "bg-success"; // Active/Running
            case 0:
                return "bg-secondary"; // Inactive
            case 2:
                return "bg-danger"; // Failed
            default:
                return "bg-secondary";
        }
    };

    // Get status text
    const getStatusText = (status) => {
        switch(status) {
            case 1:
                return "Active";
            case 0:
                return "Inactive";
            case 2:
                return "Failed";
            default:
                return "Unknown";
        }
    };

    // Fetch Deposit Wallet Data
    useEffect(() => {
        const fetchDepositHistory = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(
                    `/Trading/BotReport`,
                    {
                        params: {
                            regno: regno,
                            PageIndex: 1,
                            PageSize: 10000
                        },
                    }
                );
                
                // 🔍 DEBUG
                console.log("Full API Response:", res);
                console.log("Response Data:", res.data);
                console.log("Result:", res.data?.result);
                console.log("Response Object:", res.data?.response);
                console.log("Data Array:", res.data?.response?.data);
                
                // Extract data from response
                if (res.data?.result === "true") {
                    const data = res.data.response?.data || [];
                    console.log("✅ Extracted Data:", data);
                    console.log("📊 Number of records:", data.length);
                    
                    setRecords(data);
                    
                    // Calculate total balance (betAmount + earnings)
                    const balance = data.reduce((sum, item) => {
                        const betAmount = parseFloat(item.betAmount) || 0;
                        const earnings = parseFloat(item.TotalEarnings) || 0;
                        return sum + betAmount + earnings;
                    }, 0);
                    setTotalBalance(balance);
                    console.log("💰 Total Balance:", balance);
                } else {
                    console.warn("⚠️ API result is not true");
                    setRecords([]);
                }
            } catch (error) {
                console.error("❌ API Error:", error.response || error);
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (regno) {
            fetchDepositHistory();
        } else {
            console.warn("⚠️ No Regno found");
            setLoading(false);
        }
    }, [regno]);

    // Filter records
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.betAmount?.toString().toLowerCase().includes(searchLower)) ||
            (row.currency?.toLowerCase().includes(searchLower)) ||
            (row.entryDate?.toLowerCase().includes(searchLower)) ||
            (row.endtime?.toLowerCase().includes(searchLower)) ||
            (row.slot?.toString().toLowerCase().includes(searchLower)) ||
            (row.currencyRate?.toString().toLowerCase().includes(searchLower)) ||
            (row.status?.toString().toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when search term or items per page changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm, itemsPerPage]);

    // ✅ Updated columns
    const columns = [
        "Sl.No.",
        "BotStart Date",
        "BotEnd Date",
        "Amount",
        "Currency",
        "Currency Rate",
        "Slot",
        "Type",
        "Status",
    ];

    return (
        <div className="Table-container royalty-main-wrapper mb-5 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                <h3 className="mb-0">Bot Trading History</h3>

            </div>

            <div className="d-flex justify-content-between entries-search-bar entries-control mb-3">
                <div className="entries-control">
                    <label>Show entries:</label>
                    <select 
                        className="form-select" 
                        value={itemsPerPage} 
                        onChange={e => setItemsPerPage(Number(e.target.value))}
                    >
                        {[10, 25, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="search-wrapper mt-3">
                    <input
                        className="form-control search-input"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>



            <div className="report-card">
                <CustomTable columns={columns} loading={loading}>
                    {currentRecords.length > 0 ? (
                        currentRecords.map((row, index) => {
                            return (
                                <tr key={index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    {/* ✅ BotStart Date */}
                                    <td>{formatDate(row.entryDate)}</td>
                                    {/* ✅ BotEnd Date */}
                                    <td>{formatDate(row.endtime)}</td>
                                    {/* ✅ Amount (Bet Amount) */}
                                    <td style={{ color: "#3b82f6", fontWeight: "600" }}>
                                        {formatAmount(row.betAmount || 0)}
                                    </td>
                                    {/* ✅ Currency */}
                                    <td>{row.currency?.toUpperCase() || "-"}</td>
                                    {/* ✅ Currency Rate */}
                                    <td>{row.currencyRate || "-"}</td>
                                    {/* ✅ Slot */}
                                    <td>{row.slot || "-"}</td>
                                    {/* ✅ Status */}
                                           <td>                                     
                                        {row.predict}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(row.status)}`}>
                                            {getStatusText(row.status)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-4">
                                {loading ? "Loading..." : "No records found"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* Pagination Component */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={pageIndex}
                        totalPages={totalPages}
                        totalRecords={totalItems}
                        onPageChange={setPageIndex}
                    />
                )}
            </div>
        </div>
    );
};

export default BotTradingHistory;