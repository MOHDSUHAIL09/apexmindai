import React, { useState, useEffect } from 'react';
import CustomTable from '../../Componenets/ui/customtable/CustomTable';
import Pagination from '../../Componenets/ui/pagination/Pagination';
import apiClient from '../../api/apiClient';
import { useUser } from '../../context/UserContext';

const Reward = () => {
  const { userData, user } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Changed to state
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Get regno from context
  const getRegNo = () => userData?.regno || user?.Regno || user?.regno || localStorage.getItem('regno') || '1';

  // Columns for the table
  const columns = [
    'Sl.No.',
    'RANK',
    'MATCHING (P/O) TARGET',
    'REMAINING (P/O) TARGET',
    'REWARDS',
    'STATUS'
  ];

  // Format numbers with commas
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  // Format target display (PowerLeg / OtherLeg)
  const formatTarget = (powerLeg, otherLeg) => {
    return `${formatNumber(powerLeg)} / ${formatNumber(otherLeg)}`;
  };

  // Format remaining target display
  const formatRemaining = (remainingPower, remainingOther) => {
    const powerNum = parseFloat(remainingPower) || 0;
    const otherNum = parseFloat(remainingOther) || 0;
    return `${formatNumber(powerNum)} / ${formatNumber(otherNum)}`;
  };

  // Format rewards (Bot100_amt / Bot50_amt)
  const formatRewards = (bot100, bot50) => {
    return `₹${formatNumber(bot100)} / ₹${formatNumber(bot50)}`;
  };

  // Filter data based on search - Royalty jaisa hi filter
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.Ranks?.toLowerCase().includes(searchLower) ||
      item.rStatus?.toLowerCase().includes(searchLower) ||
      formatTarget(item.PowerLeg, item.OtherLeg).includes(searchLower)
    );
  });

  // Fetch data from API
  useEffect(() => {
    const fetchRewardData = async () => {
      setLoading(true);
      try {
        const regNo = getRegNo();
        const response = await apiClient.get(`/Dashboard/member-reward/${regNo}`);
        
        const result = response.data;
        
        if (result.success && result.data) {
          setData(result.data);
          setTotalRecords(result.data.length);
        } else {
          console.error('Failed to fetch data:', result.message);
          setData([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error('Error fetching reward data:', error);
        setData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRewardData();
  }, []);

  // Pagination logic - Royalty jaisa hi
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search term or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  return (
    <div className="Table-container royalty-main-wrapper mb-5 p-4">
      <h3 className="mb-3">🏆 Rank & Reward</h3>

      {/* Royalty jaisa hi entries and search section */}
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
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={item.rid || index}>
                <td className="text-center">
                  <div className="sr-no-circle">
                    {startIndex + index + 1}
                  </div>
                </td>
                <td>{item.Ranks}</td>
                <td>{formatTarget(item.PowerLeg, item.OtherLeg)}</td>
                <td>{formatRemaining(item.Remaining_PowerLeg, item.Remaining_OtherLeg)}</td>
                <td>{formatRewards(item.Bot100_amt, item.Bot50_amt)}</td>
                <td
                  style={{
                    border: "2px double #e5e5e5",
                    padding: "10px",
                    fontWeight: "600",
                    color: item.rStatus?.toLowerCase() === "running" ? "green" : 
                           item.rStatus?.toLowerCase() === "completed" ? "blue" : "red",
                  }}
                >
                  {item.rStatus || "Pending"}
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

        {/* Pagination Component - Royalty jaisa hi */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalItems}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Reward;