import React, { useState, useEffect } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const IncomeReport = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCredit, setTotalCredit] = useState(0);
    const [incomeTypes, setIncomeTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    // Get Status Badge
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return <span className="badge bg-success">✅ Approved</span>;
            case 'pending':
                return <span className="badge bg-warning text-dark">⏳ Pending</span>;
            case 'rejected':
                return <span className="badge bg-danger">❌ Rejected</span>;
            default:
                return <span className="badge bg-secondary">{status || 'Unknown'}</span>;
        }
    };

    // Fetch Income Types
    const fetchIncomeTypes = async () => {
        try {
            const response = await fetch(
                `http://api.apexmindai.in/api/Dashboard/IncomeType/income`,
                {
                    method: 'GET',
                    headers: {
                        'accept': '*/*',
                    }
                }
            );
            const data = await response.json();
            console.log("Income Types Response:", data);

            if (data.result === "true") {
                const typesData = data.response?.data || [];
                if (typesData.length > 0 && typesData[0].TransTypes) {
                    const types = typesData[0].TransTypes.split(',').map(t => t.trim());
                    setIncomeTypes(types);
                    if (types.length > 0) {
                        setSelectedType(types[0]);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching income types:', err);
            const fallbackTypes = ['All', 'Flush Sponsor Bnous'];
            setIncomeTypes(fallbackTypes);
            setSelectedType('All');
        }
    };

    // Fetch Income Report Data
    const fetchIncomeReport = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        if (!selectedType) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `http://api.apexmindai.in/api/Dashboard/IncomeReport?regno=${regno}&transtype=${encodeURIComponent(selectedType)}&pageIndex=${pageIndex}&pageSize=${itemsPerPage}`,
                {
                    method: 'GET',
                    headers: {
                        'accept': '*/*',
                    }
                }
            );

            const data = await response.json();
            console.log("Income Report Response:", data);

            if (data.result === "true") {
                const historyData = data.response?.data || [];
                setRecords(historyData);
                
                const total = historyData.reduce((sum, item) => {
                    return sum + (parseFloat(item.credit) || parseFloat(item.netPayable) || 0);
                }, 0);
                setTotalCredit(total);
            } else {
                toast.error(data.message || 'Failed to fetch report');
                setRecords([]);
                setTotalCredit(0);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            toast.error(err.message || 'Something went wrong');
            setRecords([]);
            setTotalCredit(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomeTypes();
    }, []);

    useEffect(() => {
        if (selectedType) {
            fetchIncomeReport();
        }
    }, [selectedType, pageIndex, itemsPerPage]);

    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.TransDate?.toLowerCase().includes(searchLower)) ||
            (row.credit?.toString().toLowerCase().includes(searchLower)) ||
            (row.debit?.toString().toLowerCase().includes(searchLower)) ||
            (row.transType?.toLowerCase().includes(searchLower)) ||
            (row.Remark?.toLowerCase().includes(searchLower)) ||
            (row.status?.toLowerCase().includes(searchLower))
        );
    });

    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm]);

    const columns = [
        "Sl.No.",
        "Date",
        "Amount",
        "Remark",
    ];

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">Income Report</h3>
                </div>

                {/* Filters Row */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3 entries-search-bar">
    
                    <div className="entries-control d-flex align-items-center gap-2">
                        <label className="text-dark mb-0">Income Type:</label>
                        <select 
                            className="form-select" 
                            value={selectedType} 
                            onChange={e => {
                                setSelectedType(e.target.value);
                                setPageIndex(1);
                            }}
                            style={{ width: '200px' }}
                        >
                            {incomeTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
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
                                <tr key={row.Payid || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        {formatDate(row.TransDate)}
                                    </td>

                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {row.credit > 0 ? formatAmount(row.credit) : '0.00'}
                                    </td>
                      
                                    <td style={{ color: "#6b7280", fontSize: "13px", maxWidth: "300px" }} title={row.Remark || "-"}>
                                        {row.Remark?.length > 50 ? row.Remark.substring(0, 50) + '...' : row.Remark || "-"}
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

export default IncomeReport;