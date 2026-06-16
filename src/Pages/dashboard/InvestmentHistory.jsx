import React, { useEffect, useState } from "react";
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

    const regno = localStorage.getItem("regno");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBonus = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await apiClient.get(
                    `/Dashboard/self-trading-history/${regno}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log("selfhistory", res);

                if (res.data && res.data.data) {
                    const tradingData = res.data.data.tradingHistory;
                    const dataArray = Array.isArray(tradingData) ? tradingData : [];
                    setRecords(dataArray);
                } else {
                    setRecords([]);
                    if (res.data && !res.data.success) {
                        setError(res.data.message || "Failed to fetch data");
                    }
                }
            } catch (error) {
                console.error("API Error:", error.response || error);
                setError(error.response?.data?.message || "An error occurred while fetching data");
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };

        if (regno && token) {
            fetchBonus();
        }
    }, [regno, token]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.Rdate && row.Rdate.toLowerCase().includes(searchLower)) ||
            (row.paymode && row.paymode.toLowerCase().includes(searchLower)) ||
            (row.Rkprice && row.Rkprice.toString().toLowerCase().includes(searchLower)) ||
            (row.Rkid && row.Rkid.toString().toLowerCase().includes(searchLower))
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
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    };

    // Columns for the table
    const columns = [
        "Sl.No.",
        "Investment Date",
        "Amount",
        "For Locking",
        "Invest Mode",
    ];

    // Show error state
    if (error) {
        return (
            <div className="report-container p-2 p-md-4 mb-5">
                <div className="mb-3">
                    <h2>Investment Statement</h2>
                </div>
                <hr style={{ border: "1px solid #282727" }} />
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
            {/* Heading */}
            <div className="mb-3">
                <h2>Investment Statement</h2>
            </div>
            <hr style={{ border: "1px solid #9c9898" }} />

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
                        <tr key={row.Rid || index}>
                            <td className="text-center">
                                <div className="sr-no-circle">
                                    {startIndex + index + 1}
                                </div>
                            </td>
                            <td>{formatDate(row.Rdate)}</td>
                            <td>
                                <span className="badge bg-success px-3 py-2 rounded-pill">
                                    ${row.Rkprice || 0}
                                </span>
                            </td>
                            <td>{row.expDate || "Standard"}</td>
                            <td>
                                <span className={row.paymode?.toLowerCase().includes('bot') ? "badge bg-secondary px-3 py-2 rounded-pill" : "badge bg-success px-3 py-2 rounded-pill"}>
                                    {row.paymode || "N/A"}
                                </span>
                            </td>        </tr>
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