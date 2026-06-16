import React, { useState, useEffect } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SelfTradingHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalIncome, setTotalIncome] = useState(0);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [transtype, setTranstype] = useState('all');

    // Get regno from localStorage
    const regno = localStorage.getItem('Regno');

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

    // Format Amount
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Fetch Compound Fund Report Data
    const fetchCompoundFundReport = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `http://api.apexmindai.in/api/Dashboard/CompoundFundReport?regno=${regno}&transtype=${transtype}&pageIndex=${pageIndex}&pageSize=${itemsPerPage}`,
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
                
                // Calculate total income
                const total = historyData.reduce((sum, item) => {
                    return sum + (parseFloat(item.income) || parseFloat(item.amount) || 0);
                }, 0);
                setTotalIncome(total);
            } else {
                toast.error(data.message || 'Failed to fetch report');
                setRecords([]);
                setTotalIncome(0);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            toast.error(err.message || 'Something went wrong');
            setRecords([]);
            setTotalIncome(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompoundFundReport();
    }, [pageIndex, itemsPerPage, transtype]);

    // Filter records based on search term (local search)
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.date?.toLowerCase().includes(searchLower)) ||
            (row.entryDate?.toLowerCase().includes(searchLower)) ||
            (row.income?.toString().toLowerCase().includes(searchLower)) ||
            (row.amount?.toString().toLowerCase().includes(searchLower)) ||
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
    }, [searchTerm, itemsPerPage, transtype]);

    const columns = [
        "Sl.No.",
        "Date",
        "Income",
        "Remark",
    ];

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">Self Trading History </h3>
                </div>

                {/* Filters Row - Show entries, Transaction Type and Search */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3 entries-search-bar   ">
                    {/* Show Entries */}
                    {/* <div className="entries-control d-flex align-items-center gap-2">
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
                    </div> */}

                    {/* Transaction Type Filter */}
                    <div className="entries-control d-flex align-items-center gap-2">
                        <label className="text-dark mb-0">Transaction Type:</label>
                        <select 
                            className="form-select" 
                            value={transtype} 
                            onChange={e => {
                                setTranstype(e.target.value);
                                setPageIndex(1);
                            }}
                            style={{ width: '140px' }}
                        >
                            <option value="all">All</option>
                            <option value="direct">Direct</option>
                            <option value="indirect">Indirect</option>
                        </select>
                    </div>

                    {/* Search Records */}
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
                                        {formatDate(row.TransDate)}
                                    </td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {formatAmount(row.credit || "00")}
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px" }} title={row.remark || "-"}>
                                        {row.remark || row.Remark || "-"}
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

export default SelfTradingHistory;