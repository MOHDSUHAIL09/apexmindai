    import React, { useState, useEffect } from "react";
    import { useUser } from "../../context/UserContext";
    import apiClient from "../../api/apiClient";
    import CustomTable from "../../Componenets/ui/customtable/CustomTable";
    import Pagination from "../../Componenets/ui/pagination/Pagination";

    const DepositWalletHistory = () => {
        const { userData } = useUser();
        const [records, setRecords] = useState([]);
        const [loading, setLoading] = useState(true);
        const [searchTerm, setSearchTerm] = useState("");
        const [totalBalance, setTotalBalance] = useState(0);

        // Pagination state
        const [pageIndex, setPageIndex] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(10);

        const regno = Number(userData?.regno || localStorage.getItem("regno"));
        const token = localStorage.getItem("token");

        // Format amount function
        const formatAmount = (amount) => {
            return `$${parseFloat(amount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        };

        // Fetch Deposit Wallet Data
        useEffect(() => {
            const fetchDepositHistory = async () => {
                try {
                    setLoading(true);
                    const res = await apiClient.get(
                        `http://api.apexmindai.in/api/DepositReport/WalletReport`,
                        {
                            params: { 
                                regno: regno, 
                                type: "ALL", 
                                pageIndex: 1, 
                                pageSize: 10000 
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (res.data.success) {
                        const data = res.data.data?.data || [];
                        setRecords(data);
                        
                        // Calculate total balance
                        const balance = data.reduce((sum, item) => {
                            const credit = parseFloat(item.credit) || 0;
                            const debit = parseFloat(item.debit) || 0;
                            return sum + credit - debit;
                        }, 0);
                        setTotalBalance(balance);
                    } else {
                        setRecords([]);
                    }
                } catch (error) {
                    console.error("API Error:", error.response || error);
                    setRecords([]);
                } finally {
                    setLoading(false);
                }
            };
            if (regno && token) {
                fetchDepositHistory();
            }
        }, [regno, token]);

        // Filter records based on search term
        const filteredRecords = records.filter((row) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (row.dt?.toLowerCase().includes(searchLower)) ||
                (row.date?.toLowerCase().includes(searchLower)) ||
                (row.credit?.toString().toLowerCase().includes(searchLower)) ||
                (row.debit?.toString().toLowerCase().includes(searchLower)) ||
                (row.remark?.toLowerCase().includes(searchLower)) ||
                (row.Remark?.toLowerCase().includes(searchLower))
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
            "Credit",
            "Debit",
            "Remark",
        ];
        return (
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0">Deposit Wallet History</h3>
                    <div className="total-balance-box" style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "#4b5563" }}>Total Balance:</span>
                        <span style={{ fontSize: "18px", fontWeight: "700", color: "#dc2626" }}>{formatAmount(totalBalance)}</span>
                    </div>
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
                            currentRecords.map((row, index) => (
                                <tr key={row.id || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>{row.dt || row.date || "-"}</td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {formatAmount(row.credit || 0)}
                                    </td>
                                    <td style={{ color: "#ef4444", fontWeight: "600" }}>
                                        {formatAmount(row.debit || 0)}
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px",textAlign: "center" }} title={row.remark || row.Remark || "-"}>
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
        );
    };

    export default DepositWalletHistory;