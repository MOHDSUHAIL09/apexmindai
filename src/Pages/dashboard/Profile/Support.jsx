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
      const response = await apiClient.get('/Dashboard/ticket-list', {
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

      const response = await apiClient.post('/Dashboard/create-ticket', formDataPayload, {
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
            <h1 className="h3 mb-1" style={{ fontWeight: '600', color: '#1a1a2e' }}>🎫 Ticket List</h1>
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

        {/* Premium Create Ticket Modal */}
{/* Bootstrap Modal */}
{showModal && (
  <div 
    className="modal fade show d-block" 
    tabIndex="-1" 
    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
  >
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ 
          background: 'linear-gradient(135deg, #5D87FF 0%, #696cff 100%)',
          borderBottom: 'none',
          padding: '20px 24px'
        }}>
          <div>
            <h4 className="modal-title text-white fw-semibold">
              <i className="ti ti-ticket me-2"></i>
              Create New Ticket
            </h4>
            <p className="text-white-50 mb-0 mt-1" style={{ fontSize: '14px' }}>
              Submit your query and we'll get back to you
            </p>
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '24px', background: '#f8fafc' }}>
            
            {/* Ticket Type */}
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <i className="ti ti-category me-1 text-primary"></i> 
                Ticket Type <span className="text-danger">*</span>
              </label>
              <select 
                name="ticketType" 
                value={formData.ticketType} 
                onChange={handleInputChange}
                className="form-select form-select-lg"
                style={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px'
                }}
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
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <i className="ti ti-edit me-1 text-primary"></i> 
                Subject <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="form-control form-control-lg"
                placeholder="Enter ticket subject"
                style={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px'
                }}
                required
              />
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">
                <i className="ti ti-message me-1 text-primary"></i> 
                Message <span className="text-danger">*</span>
              </label>
              <textarea
                name="messege"
                value={formData.messege}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter detailed message..."
                rows="5"
                style={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            {/* Attachment */}
            <div className="mb-3">
              <label className="form-label fw-semibold mb-2">
                <i className="ti ti-paperclip me-1 text-primary"></i> 
                Attachment (Optional)
              </label>
              <div className="border rounded-3 p-4 text-center bg-white" style={{ 
                border: '2px dashed #cbd5e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => document.getElementById('file-upload').click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#5D87FF';
                e.currentTarget.style.background = '#f0f4ff';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e0';
                e.currentTarget.style.background = '#ffffff';
              }}
              >
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  id="file-upload"
                  style={{ display: 'none' }}
                />
                <i className="ti ti-cloud-upload" style={{ fontSize: '48px', color: '#5D87FF' }}></i>
                <p className="mb-1 mt-2 fw-medium">Click or drag to upload</p>
                <small className="text-muted">Supported: JPG, PNG, GIF (Max 5MB)</small>
              </div>
              
              {selectedImage && (
                <div className="mt-3 d-flex align-items-center justify-content-between bg-light p-3 rounded-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="ti ti-file text-primary fs-5"></i>
                    <span className="small">{selectedImage.name}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={() => setSelectedImage(null)}
                  >
                    <i className="ti ti-trash"></i> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ 
            padding: '16px 24px', 
            background: '#ffffff',
            borderTop: '1px solid #e9ecef'
          }}>
            <button 
              type="button" 
              className="btn btn-light rounded-pill px-4"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary rounded-pill px-4"
              disabled={submitting}
              style={{ background: '#5D87FF', border: 'none' }}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className="ti ti-send me-2"></i>
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default Support;