  import React, { useState, useEffect } from 'react';
  import CustomTable from '../../Componenets/ui/customtable/CustomTable';
  import Pagination from '../../Componenets/ui/pagination/Pagination';
  import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

  const WithdrawReport = () => {
      const [reportData, setReportData] = useState([]);
      const [loading, setLoading] = useState(false);
      const [totalRecords, setTotalRecords] = useState(0);
      const [currentPage, setCurrentPage] = useState(1);
      const [pageSize, setPageSize] = useState(10);

      // Table Columns
      const columns = ['Date', 'PayOut Amount', 'Service charge', 'Recivice Amount', 'Remark', "Status"];

      // Fetch Withdraw Report
      const fetchWithdrawReport = async () => {
          setLoading(true);
          const regno = localStorage.getItem('Regno');

          if (!regno) {
              toast.error('Registration number not found');
              setLoading(false);
              return;
          }

          try {
              const response = await fetch(
                  `http://api.apexmindai.in/api/IncomePayout/PayoutReport/${regno}`,
              );  

              const data = await response.json();

              if (data.result === "true") {
                  setReportData(data.response.data || []);
                  setTotalRecords(data.response.data?.length || 0);
              } else {
                  toast.error(data.message || 'Failed to fetch report');
                  setReportData([]);
                  setTotalRecords(0);
              }
          } catch (err) {
              console.error('Error fetching report:', err);
              toast.error(err.message || 'Something went wrong');
              setReportData([]);
              setTotalRecords(0);
          } finally {
              setLoading(false);
          }
      };

      useEffect(() => {
          fetchWithdrawReport();
      }, []);

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
          if (!amount && amount !== 0) return '-';
          return `$${Number(amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
          })}`;
      };

      // Get Transaction Type Badge
      const getTransactionBadge = (type) => {
          switch (type?.toLowerCase()) {
              case 'payoutamount':
              case 'servicecharget':
              case 'reciviceamount':
              case 'Remark':
                
          }
      };

      // Pagination
      const totalPages = Math.ceil(totalRecords / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentData = reportData.slice(startIndex, endIndex);

      return (
          <>
              <ToastContainer 
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
              />

              <div className="container-fluid py-4">
                  <div className="card shadow-sm">
                      {/* Header */}
                      <div className="card-header bg-primary text-white">
                          <div className="d-flex justify-content-between align-items-center">
                              <div>
                                  <h4 className="mb-0">💰 Withdrawal Report</h4>
                                  <small>View your transaction history</small>
                              </div>
                          </div>
                      </div>

                      <div className="card-body">
                          {/* Stats */}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                              {/* <div>
                                  <span className="text-muted">Total Transactions: </span>
                                  <strong className="text-primary">{totalRecords}</strong>
                              </div> */}
                              <div>
                                  <select 
                                      className="form-select form-select-sm"
                                      style={{ width: '120px' }}
                                      value={pageSize}
                                      onChange={(e) => {
                                          setPageSize(parseInt(e.target.value));
                                          setCurrentPage(1);
                                      }}
                                  >
                                      <option value={5}>5 per page</option>
                                      <option value={10}>10 per page</option>
                                      <option value={20}>20 per page</option>
                                      <option value={50}>50 per page</option>
                                  </select>
                              </div>
                          </div>

                          {/* Custom Table */}
                          <CustomTable 
                              columns={columns} 
                              loading={loading} 
                              emptyMessage="No withdrawal transactions found"
                          >
                              {currentData.map((item, index) => (
                                  <tr key={index}>
                                      <td className="px-4 py-3">
                                          {formatDate(item.entryDate || item.date || item.createdDate)}
                                      </td>
                                      <td className="px-4 py-3 text-success">
                                          {item.debit > 0 ? formatAmount(item.debit) : '-'}
                                      </td>
                                      <td className="px-4 py-3 text-danger">
                                          {item.handlingcharge > 0 ? formatAmount(item.handlingcharge) : 
                                          (item.type === 'debit' ? formatAmount(item.amount) : '-')}
                                      </td>
                                      <td className="px-4 py-3">
                                          {getTransactionBadge(item.netPayable || item.netPayable)}
                                      </td>
                                      <td className="px-4 py-3">
                                          {item.remark}
                                      </td>
                                      <td className="px-4 py-3">
                                          {item.status}
                                      </td>
                                  </tr>
                              ))}
                          </CustomTable>

                          {/* Pagination */}
                          {totalRecords > 0 && (
                              <Pagination
                                  currentPage={currentPage}
                                  totalPages={totalPages}
                                  totalRecords={totalRecords}
                                  onPageChange={setCurrentPage}
                              />
                          )}
                      </div>
                  </div>
              </div>
          </>
      );
  };  

  export default WithdrawReport;