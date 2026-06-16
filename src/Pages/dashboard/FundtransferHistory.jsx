import React, { useState, useEffect } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DepositWalletHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalBalance, setTotalBalance] = useState(0);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get regno from localStorage
    const regno = localStorage.getItem('Regno');

    // Format amount function
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fetch Transfer Report Data
    const fetchTransferHistory = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `http://api.apexmindai.in/api/IncomePayout/TransferReport/${regno}`,
                {
                    method: 'GET',
                    headers: {
                        'accept': '*/*',
                    }
                }
            );

            const data = await response.json();
            console.log("API Response:", data);

            if (data.result === "true") {
                const historyData = data.response?.data || [];
                setRecords(historyData);
                
                // Calculate total balance
                const balance = historyData.reduce((sum, item) => {
                    const credit = parseFloat(item.credit) || 0;
                    const debit = parseFloat(item.debit) || 0;
                    return sum + credit - debit;
                }, 0);
                setTotalBalance(balance);
            } else {
                toast.error(data.message || 'Failed to fetch history');
                setRecords([]);
                setTotalBalance(0);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            toast.error(err.message || 'Something went wrong');
            setRecords([]);
            setTotalBalance(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransferHistory();
    }, []);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.TransDate?.toLowerCase().includes(searchLower)) ||
            (row.date?.toLowerCase().includes(searchLower)) ||
            (row.credit?.toString().toLowerCase().includes(searchLower)) ||
            (row.debit?.toString().toLowerCase().includes(searchLower)) ||
            (row.Remark?.toLowerCase().includes(searchLower)) ||
            (row.remark?.toLowerCase().includes(searchLower))
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

    const columns = [
        "Sl.No.",
        "Date",
        "Amount",
        "Type",
        "Remark",
    ];

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">Fund Transfer History</h3>
                </div>

                <div className="d-flex justify-content-between entries-search-bar entries-control mb-3">
                    <div className="entries-control">
                        <label className="text-dark">Show entries:</label>
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
                            currentRecords.map((row, index) => (
                                <tr key={row.id || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>{formatDate(row.TransDate || row.date || row.dt || "-")}</td>
                                    <td style={{ color: row.credit > 0 ? "#10b981" : "#ef4444", fontWeight: "600" }}>
                                        {row.credit > 0 ? formatAmount(row.credit) : formatAmount(row.debit)}
                                    </td>
                                    <td>
                                        <span className={`badge ${row.credit > 0 ? 'bg-success' : 'bg-danger'}`}>
                                            {row.credit > 0 ? 'Credit' : 'Debit'}
                                        </span>
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px", textAlign: "center" }} title={row.Remark || row.remark || "-"}>
                                        {row.Remark || row.remark || "-"}
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
        </>
    );
};

export default DepositWalletHistory;