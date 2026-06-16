import React, { useState, useEffect } from "react";
import CustomTable from "../../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SeftradingHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [recordCount, setRecordCount] = useState(0);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get regno from localStorage
    const regno = localStorage.getItem('Regno');



    // Format Amount
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Fetch Self Trading Payout History
    const fetchSelfTradingHistory = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `http://api.apexmindai.in/api/Trading/SelfTradingPayoutHistory?regno=${regno}&pageNumber=${pageIndex}&pageSize=${itemsPerPage}`,
                {
                    method: 'POST',
                    headers: {
                        'accept': '*/*',
                    }
                }
            );

            const data = await response.json();
            console.log("API Response:", data);

            if (data.result === "true") {
                const historyData = data.response || [];
                setRecords(historyData);
                setRecordCount(historyData.length);
                
                // Calculate total amount
                const total = historyData.reduce((sum, item) => {
                    return sum + (parseFloat(item.payoutAmount) || parseFloat(item.amount) || 0);
                }, 0);
                setTotalAmount(total);
            } else {
                toast.error(data.message || 'Failed to fetch history');
                setRecords([]);
                setTotalAmount(0);
                setRecordCount(0);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            toast.error(err.message || 'Something went wrong');
            setRecords([]);
            setTotalAmount(0);
            setRecordCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSelfTradingHistory();
    }, [pageIndex, itemsPerPage]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.date?.toLowerCase().includes(searchLower)) ||
            (row.payoutDate?.toLowerCase().includes(searchLower)) ||
            (row.payoutAmount?.toString().toLowerCase().includes(searchLower)) ||
            (row.amount?.toString().toLowerCase().includes(searchLower)) ||
            (row.remark?.toLowerCase().includes(searchLower)) ||
            (row.status?.toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when search term changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm]);

    const columns = [
        "Sl.No.",
        "Date",
        "Payout Amount",
        "Remaining Amount",
        "Remark",
    ];

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">Self Trading Payout History</h3>
                </div>

                {/* Filters Row */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3 entries-search-bar">
                    <div className="entries-control d-flex align-items-center gap-2">
                        <label className="text-dark mb-0">Show entries:</label>
                        <select 
                            className="form-select" 
                            value={itemsPerPage} 
                            onChange={e => {
                                setItemsPerPage(Number(e.target.value));
                                setPageIndex(1);
                            }}
                            style={{ width: '80px' }}
                        >
                            {[10, 25, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    <div className="search-wrapper">
                        <input
                            className="form-control search-input"
                            placeholder="🔍 Search records..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '250px' }}
                        />
                    </div>
                </div>

                <div className="report-card">
                    <CustomTable columns={columns} loading={loading}>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((row, index) => (
                                <tr key={row.id || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>
                                       {row.EntryDate}
                                    </td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {formatAmount( row.Amount) || "0.00" }
                                    </td>
                                      <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {formatAmount( row.lcount) || "0.00" }
                                    </td>                       
                                    <td style={{ color: "#6b7280", fontSize: "13px", maxWidth: "300px" }} title={row.remark || "-"}>
                                        {row.remark?.length > 50 ? row.remark.substring(0, 50) + '...' : row.remark || "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">
                                    {loading ? "Loading..." : "No records found"}
                                </td>
                            </tr>
                        )}
                    </CustomTable>

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
        </>
    );
};

export default SeftradingHistory;