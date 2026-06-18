// InvestmentHistory.jsx - Original style same rakha
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const InvestmentHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ✅ Sirf regno lo
    const regno = localStorage.getItem("Regno");

    useEffect(() => {
        const fetchWalletReport = async () => {
            // ✅ Agar regno nahi hai toh error dikhao
            if (!regno) {
                setLoading(false);
                setError("Please login to view your investment history");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const res = await apiClient.get(
                    `/DepositReport/WalletReport/${regno}`
                );
                console.log("Wallet Report Response:", res);

                // ✅ Correct API response handling
                if (res.data && res.data.result === "true") {
                    const walletData = res.data.response?.walletData || [];
                    setRecords(walletData);
                } else {
                    setRecords([]);
                    setError(res.data?.message || "Failed to fetch data");
                }
            } catch (error) {
                console.error("API Error:", error.response || error);
                setError(error.response?.data?.message || "An error occurred while fetching data");
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletReport();
    }, [regno]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.dt && row.dt.toLowerCase().includes(searchLower)) ||
            (row.transType && row.transType.toLowerCase().includes(searchLower)) ||
            (row.remark && row.remark.toLowerCase().includes(searchLower)) ||
            (row.credit && row.credit.toString().toLowerCase().includes(searchLower)) ||
            (row.debit && row.debit.toString().toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    // Reset to first page when search term or items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return dateString;
    };

    // Format amount with $ sign
    const formatAmount = (amount) => {
        return `$${amount || 0}`;
    };

    // Get badge color based on transaction type
    const getTransTypeBadge = (transType) => {
        if (!transType) return "secondary";
        const type = transType.toLowerCase();
        if (type.includes('trading') || type.includes('profit')) return "success";
        if (type.includes('withdraw')) return "danger";
        if (type.includes('deposit')) return "primary";
        if (type.includes('bonus')) return "warning";
        return "secondary";
    };

    // Columns for the table
    const columns = [
        "Sl.No.",
        "Date",
        "Amount",
        "Transaction Type",
        "Remark"
    ];

    // ✅ Login required error
    if (error === "Please login to view your investment history") {
        return (
            <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
                <div className="mb-3">
                    <h2> Investment Statement</h2>
                </div>
                <div className="alert alert-warning shadow-sm rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
                <div className="text-center mt-4">
                    <Link to="/login">
                        <button className="btn btn-primary px-4 py-2">
                            🔑 Go to Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
                <div className="mb-3">
                    <h2> Investment Statement</h2>
                </div>
                <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>

            </div>
        );
    }

    return (
        <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
            {/* Heading */}
            <div className="mb-3">
                <h2> Investment Statement</h2>
            </div>

            {/* Search and Items per page */}
            <div className="entries-search-bar entries-control mb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <label className="fw-semibold">Show entries:</label>
                        <select
                            className="form-select w-auto"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            style={{
                                borderRadius: "8px",
                                border: "1px solid rgba(102, 126, 234, 0.2)",
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={75}>75</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <input
                            className="form-control"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                minWidth: "250px",
                                borderRadius: "8px",
                                border: "1px solid rgba(102, 126, 234, 0.2)",
                                padding: "8px 12px",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <CustomTable columns={columns} loading={loading}>
                {currentRecords.length > 0 ? (
                    currentRecords.map((row, index) => (
                        <tr key={index}>
                            <td className="text-center">
                                <div className="sr-no-circle">
                                    {startIndex + index + 1}
                                </div>
                            </td>
                            <td>{formatDate(row.dt)}</td>
                            <td>
                                {row.debit > 0 ? (
                                    <span className="badge bg-success px-3 py-2 rounded-pill">
                                        ${row.debit}
                                    </span>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td>
                                <span className={`badge bg-${getTransTypeBadge(row.transType)} px-3 py-2 rounded-pill`}>
                                    {row.transType || "N/A"}
                                </span>
                            </td>
                            <td>
                                <span style={{ fontSize: '0.9rem' }}>
                                    {row.remark || "-"}
                                </span>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalItems}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default InvestmentHistory;