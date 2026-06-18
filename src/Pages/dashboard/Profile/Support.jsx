import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import apiClient from '../../../api/apiClient';
import CustomTable from '../../../Componenets/ui/customtable/CustomTable';
import Pagination from '../../../Componenets/ui/pagination/Pagination';
import toast from 'react-hot-toast';

const Support = () => {
  const navigate = useNavigate();
  const { user, userData, refreshData } = useUser();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', ticketType: '', messege: '' });
  const [submitting, setSubmitting] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('widthdraw');
  const pageSize = 10;

  const getRegNo = () => userData?.regno || user?.Regno || user?.regno || localStorage.getItem('regno') || '1';
  
  const getLoginId = () => {
    if (userData?.me) return userData.me;
    if (user?.loginid) return user.loginid;
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.me) return parsed.me;
        if (parsed.loginid) return parsed.loginid;
      } catch {}
    }
    return 'india';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      });
    } catch { return dateString; }
  };

  const fetchTickets = async (page = 1) => {
    const regNo = getRegNo();
    setLoading(true);
    try {
      const response = await apiClient.get('/Dashboard/TicketList', {
        params: { 
          PageIndex: page, 
          PageSize: pageSize, 
          RegNo: regNo,
          PaymentMode: activeFilter
        }
      });
      
      const data = response.data;
      if (data?.success && data?.data?.data) {
        const formatted = data.data.data.map(item => {
          const typeMap = {
            'withdraw': 'Withdrawal',
            'income': 'Income',
            'deposit': 'Deposit',
            'purchase_bot': 'Purchase BOT',
            'profile': 'Profile',
            'other': 'Other'
          };
          return {
            id: item.MsgId,
            ticketId: `FX${item.MsgId}`,
            date: formatDate(item.MsgDate),
            type: typeMap[item.MsgType] || item.MsgType || 'N/A',
            subject: item.MsgSubject || 'VIEW',
            message: item.Message || item.Msg || 'No message provided'
          };
        });
        setTickets(formatted);
        setTotalRecords(data.data.recordCount || 0);
      } else {
        setTickets([]);
        setTotalRecords(0);
        if (!data?.success) {
          toast.error(data?.message || 'Failed to fetch tickets');
        }
      }
    } catch (err) {
      console.error('API Error:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch tickets');
      setTickets([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(pageIndex);
  }, [pageIndex, activeFilter]);

  useEffect(() => {
    fetchTickets(1);
  }, []);

  const createTicket = async (ticketData) => {
    const loginId = getLoginId();
    const regNo = getRegNo();
    setSubmitting(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('From', regNo);
      formDataPayload.append('Subject', ticketData.subject);
      
      let messageType = ticketData.ticketType;
      if (messageType === 'withdrawal') messageType = 'withdraw';
      formDataPayload.append('MessageType', messageType);
      formDataPayload.append('LoginId', loginId);
      formDataPayload.append('Message', ticketData.messege || '');
      if (selectedImage) formDataPayload.append('TicketImgage', selectedImage);

      const response = await apiClient.post('/Dashboard/CreateTicket', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data?.success || response.data?.data?.success) {
        await fetchTickets(pageIndex);
        if (refreshData) refreshData();
        setShowModal(false);
        setFormData({ subject: '', ticketType: '', messege: '' });
        setSelectedImage(null);
        toast.success('Ticket created successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to create ticket');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ticketType) return toast.error('Please select ticket type');
    if (!formData.subject.trim()) return toast.error('Please enter subject');
    createTicket(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      toast.success(`Image selected: ${e.target.files[0].name}`);
    }
  };

  const handleViewTicket = (ticket) => {
    navigate(`/dashboard/supporthelp/${ticket.id}`, { state: { ticket } });
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const getSerialNo = (index) => {
    return (pageIndex - 1) * pageSize + index + 1;
  };

  const getTicketTypeClass = (type) => {
    switch(type?.toLowerCase()) {
      case 'withdrawal': return 'bg-danger';
      case 'income': return 'bg-success';
      case 'deposit': return 'bg-primary';
      case 'purchase bot': return 'bg-warning';
      case 'profile': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  return (
    <div style={{ 
      background: '#ffffff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
      borderRadius: '10px',    
    }}>
      <div className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 px-2">
          <div>
            <h1 className="h3 mb-1" style={{ fontWeight: '600', color: '#1a1a2e' }}> Ticket List</h1>
            {totalRecords > 0 && (
              <p className="text-muted mb-0">Total Tickets: {totalRecords}</p>
            )}
          </div>
          <button 
            className="btn btn-primary rounded-pill px-4 py-2"
            onClick={() => setShowModal(true)}          
          >
            <i className="ti ti-plus me-2"></i>Create New Ticket
          </button>
        </div>

        {/* Custom Table Component */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <CustomTable 
              columns={["S.NO.", "DATE", "TICKET ID", "TICKET TYPE", "SUBJECT", "ACTION"]}
              loading={loading}
              emptyMessage="No tickets found. Create your first ticket!"
            >
              {tickets.map((ticket, index) => (
                <tr key={ticket.id}>
                  <td className="text-center">
                    <span className="badge bg-light text-dark rounded-circle px-2 py-1">
                      {String(getSerialNo(index)).padStart(2, '0')}
                    </span>
                   </td>
                  <td className="text-nowrap">{ticket.date}</td>
                  <td>
                    <span className="fw-semibold text-primary">{ticket.ticketId}</span>
                  </td>
                  <td>
                    <span className={`badge ${getTicketTypeClass(ticket.type)} px-3 py-2 rounded-pill`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td>
                    <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                      {ticket.subject}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      VIEW ALL
                    </button>
                  </td>
                </tr>
              ))}
            </CustomTable>
          </div>
        </div>

        {/* Pagination Component */}
        <Pagination 
          currentPage={pageIndex}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setPageIndex}
        />

        {/* ✅ FIXED MODAL - Inline CSS */}
        {showModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1050,
              padding: '20px'
            }}
            onClick={() => setShowModal(false)}
          >
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #5D87FF 0%, #696cff 100%)',
                padding: '20px 24px',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <h4 style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    margin: 0,
                    fontSize: '20px'
                  }}>
                    <i className="ti ti-ticket me-2"></i>
                    Create New Ticket
                  </h4>
                  <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    margin: '4px 0 0 0',
                    fontSize: '14px'
                  }}>
                    Submit your query and we'll get back to you
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0 4px',
                    opacity: 0.8,
                    transition: 'opacity 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit}>
                <div style={{ padding: '24px', background: '#f8fafc' }}>
                  
                  {/* Ticket Type */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a2e',
                      fontSize: '14px'
                    }}>
                      <i className="ti ti-category me-1" style={{ color: '#5D87FF' }}></i>
                      Ticket Type <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <select 
                      name="ticketType" 
                      value={formData.ticketType} 
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#5D87FF'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      required
                    >
                      <option value="">-- Select Message Type --</option>
                      <option value="income">💰 Income</option>
                      <option value="withdrawal">💸 Withdrawal</option>
                      <option value="deposit">💳 Deposit</option>
                      <option value="purchase_bot">🤖 Purchase BOT</option>
                      <option value="profile">👤 Profile</option>
                      <option value="other">📝 Other</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a2e',
                      fontSize: '14px'
                    }}>
                      <i className="ti ti-edit me-1" style={{ color: '#5D87FF' }}></i>
                      Subject <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter ticket subject"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#5D87FF'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a2e',
                      fontSize: '14px'
                    }}>
                      <i className="ti ti-message me-1" style={{ color: '#5D87FF' }}></i>
                      Message <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <textarea
                      name="messege"
                      value={formData.messege}
                      onChange={handleInputChange}
                      placeholder="Enter detailed message..."
                      rows="5"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#5D87FF'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      required
                    />
                  </div>

                  {/* Attachment */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a2e',
                      fontSize: '14px'
                    }}>
                      <i className="ti ti-paperclip me-1" style={{ color: '#5D87FF' }}></i>
                      Attachment (Optional)
                    </label>
                    <div 
                      style={{
                        border: '2px dashed #cbd5e0',
                        borderRadius: '12px',
                        padding: '32px 20px',
                        textAlign: 'center',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => document.getElementById('file-upload-support').click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#5D87FF';
                        e.currentTarget.style.backgroundColor = '#f0f4ff';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        id="file-upload-support"
                        style={{ display: 'none' }}
                      />
                      <i className="ti ti-cloud-upload" style={{ fontSize: '48px', color: '#5D87FF' }}></i>
                      <p style={{ margin: '8px 0 4px 0', fontWeight: '500', color: '#1a1a2e' }}>
                        Click or drag to upload
                      </p>
                      <small style={{ color: '#9ea5b3' }}>
                        Supported: JPG, PNG, GIF (Max 5MB)
                      </small>
                    </div>
                    
                    {selectedImage && (
                      <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f1f5f9',
                        padding: '12px 16px',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="ti ti-file" style={{ color: '#5D87FF', fontSize: '20px' }}></i>
                          <span style={{ fontSize: '14px', color: '#1a1a2e' }}>{selectedImage.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '4px 8px'
                          }}
                        >
                          <i className="ti ti-trash me-1"></i> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '50px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: 'transparent',
                      color: '#475569',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '10px 28px',
                      borderRadius: '50px',
                      border: 'none',
                      backgroundColor: submitting ? '#94a3b8' : '#5D87FF',
                      color: '#ffffff',
                      fontWeight: '500',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) e.target.style.backgroundColor = '#4a6fe0';
                    }}
                    onMouseLeave={(e) => {
                      if (!submitting) e.target.style.backgroundColor = '#5D87FF';
                    }}
                  >
                    {submitting ? (
                      <>
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid #ffffff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }}></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-send"></i>
                        Create Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Spinner Animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Support;