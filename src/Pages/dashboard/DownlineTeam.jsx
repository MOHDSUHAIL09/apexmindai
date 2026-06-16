import React, { useState, useEffect } from 'react';
import CustomTable from '../../Componenets/ui/customtable/CustomTable';
import Pagination from '../../Componenets/ui/pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DownlineTeam = () => {
  const [loading, setLoading] = useState(false);
  const [downlineData, setDownlineData] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [totalBusiness, setTotalBusiness] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [findlvl, setFindlvl] = useState(1);
const [levelOptions] = useState([...Array(30).keys()].map(i => i + 1));
  const [pageSize ] = useState(10);

  // Get regno from localStorage
  const regno = localStorage.getItem('Regno');

  // Table Columns
  const columns = [
    "S.No.",
    "Downline Info",
    "Sponsor",
    "Invested Amount",
    "Status",
  ];


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
      case 'active':
        return <span className="badge bg-success">✅ Active</span>;
      case 'inactive':
        return <span className="badge bg-danger">❌ Inactive</span>;
      default:
        return <span className="badge bg-secondary">{status || 'Unknown'}</span>;
    }
  };

  // Fetch Downline Team Data
  const fetchDownlineTeam = async () => {
    if (!regno) {
      toast.error('Registration number not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        'http://api.apexmindai.in/api/Dashboard/DownLineTeam',
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mregno: parseInt(regno),
            findlvl: findlvl,
            pageIndex: currentPage,
            pageSize: pageSize
          })
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (data.result === "true") {
        const teamData = data.response?.data || [];
        setDownlineData(teamData);
        setRecordCount(teamData.length);
        
        // Calculate total business
        const total = teamData.reduce((sum, item) => {
          return sum + (parseFloat(item.kitPrice) || parseFloat(item.Stake) || 0);
        }, 0);
        setTotalBusiness(total);
      } else {
        toast.error(data.message || 'Failed to fetch downline team');
        setDownlineData([]);
        setRecordCount(0);
        setTotalBusiness(0);
      }
    } catch (error) {
      console.error("Error fetching downline team:", error);
      toast.error(error.message || 'Something went wrong');
      setDownlineData([]);
      setRecordCount(0);
      setTotalBusiness(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownlineTeam();
  }, [currentPage, findlvl, pageSize]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle level change
  const handleLevelChange = (e) => {
    setFindlvl(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(recordCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  return (  
    <>
      <ToastContainer position="top-right" />
      <div className="Table-container container-fluid p-3">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h4 className="fw-bold" style={{ color: "#2A3547" }}>Downline Team</h4>
          </div>
          
          {/* Summary Cards */}
          <div className="d-flex gap-3">
            <div className="bg-primary-subtle rounded-3 p-3 text-center" style={{ minWidth: "120px" }}>
              <span className="text-muted">Total Members</span>
              <h5 className="fw-bold mb-0 text-primary">{recordCount}</h5>
            </div>
            <div className="bg-success-subtle rounded-3 p-3 text-center" style={{ minWidth: "150px" }}>
              <span className="text-muted">Team Business</span>
              <h5 className="fw-bold mb-0 text-success">{formatAmount(totalBusiness)}</h5>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-center">
              <div className="col-md-3">
                <label className="form-label fw-semibold mb-1">Select Level</label>
                <select 
                  className="form-select form-select-sm"
                  value={findlvl} 
                  onChange={handleLevelChange}
                >
                  {levelOptions.map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <CustomTable 
          columns={columns} 
          loading={loading}
          emptyMessage="No downline members found"
        >
          {downlineData.map((item, index) => (
            <tr key={item.regno || index}>
              <td className="py-3 px-3 text-center">
                <div className="sr-no-circle">
                  {startIndex + index + 1}
                </div>
              </td>
              <td className="py-3 px-3">
                <div className="d-flex flex-column">
                  <div>
                    <span className="fw-semibold d-block">{item.Name || item.introName || '-'}</span>
                    <span className="text-muted small">{item.loginid || '-'}</span>
                  </div>
  
                </div>
              </td>
              <td className="py-3 px-3">
                <div className="d-flex flex-column">
                  <span className="fw-semibold">{item.Sponsor || '-'}</span>
                  <span className="text-muted small">{item.introName || '-'}</span>
                </div>
              </td>
              <td className="py-3 px-3">
                <div className="d-flex flex-column">
                  <span className="fw-bold text-success">{formatAmount(item.kitPrice || item.Stake)}</span>             
                </div>
              </td>
              <td className="py-3 px-3">
                {getStatusBadge(item.status)}
              </td>
      
            </tr>
          ))}
        </CustomTable>

        {/* Pagination Section */}
        {!loading && recordCount > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={recordCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
};

export default DownlineTeam;