import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import apiClient from "../../api/apiClient";


const AccStatement = () => {
    const location = useLocation();
    const columns = ["Sl.No.", "Credit", "Debit", "Date", "Type", "Remark"];

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // Get type from URL
    const queryParams = new URLSearchParams(location.search);
    const urlType = queryParams.get("type") || "ALL";

    const stateType = location.state?.transtype || location.state?.type;

    // Map URL param to correct API value - Fund Transfer hata diya
    let initialSelectedType = urlType;

    if (stateType === "FUND WITHDRAWAL" || stateType === "fundwithdrawal") {
        initialSelectedType = "FUND WITHDRAWAL";
    }

    const [selectedType, setSelectedType] = useState(initialSelectedType);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    const regno = localStorage.getItem("regno");

    // Format amount - direct $ without currency conversion
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return `$0.00`;
        return `$${Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Function to get API param value from display type - Fund Transfer hata diya
    const getApiTypeValue = (displayType) => {
        const typeMap = {
            "ALL": "ALL",
            "FUND WITHDRAWAL": "FUND WITHDRAWAL",
            "INSURANCE FEE": "INSURANCE FEE",
            "LEVEL INCOME": "LEVEL INCOME",
            "IB INCOME": "IB INCOME",
            "MATCHING INCOME": "MATCHING INCOME",
            "TRADING PASSIVE INCOME": "TRADING PASSIVE INCOME"
        };
        return typeMap[displayType] || displayType;
    };


    const getTypeDisplayName = (typeValue) => {
        const typeMap = {
            "ALL": "All Transactions",
            "FUND WITHDRAWAL": "Fund Withdrawal",
            "INSURANCE FEE": "Insurance Fee",
            "LEVEL INCOME": "Level Income",
            "IB INCOME": " IB Income",
            "MATCHING INCOME": "Matching Income",
            "TRADING PASSIVE INCOME": "Trading Passive Income"
        };
        return typeMap[typeValue] || typeValue;
    };

    useEffect(() => {
        fetchStatement();
    }, [pageIndex, selectedType]);

    useEffect(() => {
        const newTypeParam = queryParams.get("type") || "ALL";
        let newType = newTypeParam;

        if (newType !== selectedType && !location.state?.transtype) {
            setSelectedType(newType);
            setPageIndex(1);
        }
    }, [location.search]);

    const fetchStatement = async () => {
        try {
            setLoading(true);
            const apiType = getApiTypeValue(selectedType);

            console.log("📤 API Request:", {
                regno: regno,
                transtype: apiType,
                pageIndex: pageIndex,
                pageSize: pageSize,
            });

            const response = await apiClient.get("/Dashboard/income-report", {
                params: {
                    regno: regno,
                    transtype: apiType,
                    pageIndex: pageIndex,
                    pageSize: pageSize,
                },
            });

            console.log("📥 API Response:", response.data);

            const apiData = response.data?.data?.data || [];
            const total = response.data?.data?.recordCount || 0;
            setTableData(apiData);
            setTotalRecords(total);
        } catch (error) {
            console.error("API Error:", error);
            setTableData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        setSelectedType(newType);
        setPageIndex(1);

        let urlParam = newType;
        const url = new URL(window.location);
        url.searchParams.set("type", urlParam);
        window.history.pushState({}, "", url);
    };

    // Filter data based on search term
    const filteredData = tableData.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.transType?.toLowerCase().includes(searchLower) ||
            item.Remark?.toLowerCase().includes(searchLower) ||
            formatAmount(item.credit).toLowerCase().includes(searchLower) ||
            formatAmount(item.debit).toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (pageIndex - 1) * pageSize;

    return (
        <div className="Table-container royalty-main-wrapper mb-5 p-4">
            <h3 className=" mt-3 mb-4">{getTypeDisplayName(selectedType)} Statement</h3>


            <div className="d-flex justify-content-between entries-search-bar entries-control mb-3 flex-wrap gap-3">
                <div className="entries-control">
                    <select
                        className="form-select"
                        value={selectedType}
                        onChange={handleTypeChange}
                        style={{ width: "auto", minWidth: "180px" }}
                    >
                        <option value="ALL">-- All Transactions --</option>
                        <option value="FUND WITHDRAWAL">Fund Withdrawal</option>
                        <option value="INSURANCE FEE">Insurance Fee</option>
                        <option value="LEVEL INCOME">Level Income</option>
                        <option value="IB INCOME">IB Income</option>
                        <option value="MATCHING INCOME">Matching Income</option>
                        <option value="TRADING PASSIVE INCOME">Trading Passive Income</option>
                    </select>
                </div>
                <div className="search-wrapper">
                    <input
                        className="form-control search-input"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "250px" }}
                    />
                </div>
            </div>

            <div className="report-card">
                <CustomTable columns={columns} loading={loading}>
                    {filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                            <tr key={item.id || index}>
                                <td className="text-center">
                                    <div className="sr-no-circle">
                                        {startIndex + index + 1}
                                    </div>
                                </td>
                                <td className="text-success fw-semibold">
                                    {formatAmount(item.credit || 0)}
                                </td>
                                <td className="text-danger fw-semibold">
                                    {formatAmount(item.debit || 0)}
                                </td>
                                <td style={{ whiteSpace: "nowrap" }}>
                                    {item.TransDate
                                        ? new Date(item.TransDate).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: false,
                                        })
                                        : "-"}
                                </td>
                                <td>
                                    <span className="badge bg-light text-dark">
                                        {item.transType || "-"}
                                    </span>
                                </td>
                                <td className="remark-text" title={item.Remark || ""}>
                                    {item.Remark ? (
                                        item.Remark.length > 50 
                                            ? item.Remark.substring(0, 50) + "..." 
                                            : item.Remark
                                    ) : "-"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-4">
                                {loading ? "Loading..." : "No data available"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* Pagination Component */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={pageIndex}
                        totalPages={totalPages}
                        totalRecords={totalRecords}
                        onPageChange={setPageIndex}
                    />
                )}
            </div>
        </div>
    );
};

export default AccStatement;