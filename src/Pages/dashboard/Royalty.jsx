import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";






const Royalty = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const regno = localStorage.getItem("regno");
    const token = localStorage.getItem("token");

    // Fetch Royalty Data
    useEffect(() => {
        const fetchRoyalStatus = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(
                    `/Dashboard/member-royalty/${regno}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (res.data.success) {
                    setRecords(res.data.data);
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
            fetchRoyalStatus();
        }
    }, [regno, token]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.RANK?.toLowerCase().includes(searchLower)) ||
            (row.Designation?.toLowerCase().includes(searchLower)) ||
            (row.BUSINESS?.toString().toLowerCase().includes(searchLower)) ||
            (row.BusinessTarget?.toString().toLowerCase().includes(searchLower)) ||
            (row.STATUS?.toLowerCase().includes(searchLower)) ||
            (row.rStatus?.toLowerCase().includes(searchLower))
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
        "RANK",
        "BUSINESS",
        "OTHER LEG",
        "ROYALTY",
        "STATUS",
    ];

    return (
        <div className="Table-container royalty-main-wrapper mb-5 p-4">
            <h3 className="mb-3">Royal Status</h3>

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
                            <tr key={row.rid || index}>
                                <td className="text-center">
                                    <div className="sr-no-circle">
                                        {startIndex + index + 1}
                                    </div>
                                </td>
                                <td>{row.RANK || row.Designation}</td>
                                <td>{row.BUSINESS || row.BusinessTarget || 0}</td>
                                <td>
                                    {row["OTHER LEG"] || row.PowerLeg || 0}
                                    {" / "}
                                    {row.Rem_powerLeg || 0}
                                </td>
                                <td>{row.ROYALTY || row.gift || "Get 1% royalty monthly from level 1 to unlimited level on total team fund"}</td>
                                <td
                                    style={{
                                        border: "2px double #e5e5e5",
                                        padding: "10px",
                                        fontWeight: "600",
                                        color: (row.STATUS || row.rStatus) === "Achieved" ? "green" : "red",
                                    }}
                                >
                                    {row.STATUS || row.rStatus || "UnQualified"}
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

export default Royalty;