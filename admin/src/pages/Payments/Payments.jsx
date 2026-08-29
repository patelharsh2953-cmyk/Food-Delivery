import React, { useEffect, useState } from 'react';
import './Payments.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import { Eye, CreditCard, Receipt, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusOptions = ['Pending', 'Paid', 'Refunded'];

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/payment/list`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setPayments(res.data.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.log("Error fetching payment transactions:", err.message);
      setPayments([]);
    }
  };

  const handleStatusChange = async (targetId, newStatus) => {
    try {
      const res = await axios.post(`${API_URL}/api/payment/status`, {
        id: targetId,
        status: newStatus
      });
      if (res.data && res.data.success) {
        setPayments(prev => prev.map(p => (p._id === targetId || p.rawId === targetId || p.orderId === targetId) ? { ...p, status: newStatus } : p));
      } else {
        fetchPayments();
      }
    } catch (err) {
      console.log("Error updating payment status:", err);
      fetchPayments();
    }
  };

  const columns = [
    {
      header: 'Payment ID',
      accessor: '_id',
      render: (row) => (
        <div className="pay-id-cell">
          <Receipt size={18} color="#ff4c24" />
          <span className="pay-id-text">{row._id}</span>
        </div>
      )
    },
    {
      header: 'Order ID',
      accessor: 'orderId',
      render: (row) => <span className="order-id-sub">#{row.orderId?.toString().slice(-8)}</span>
    },
    { header: 'Customer', accessor: 'customer' },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => <span className="pay-amount-text">₹{row.amount}.00</span>
    },
    {
      header: 'Payment Method',
      accessor: 'method',
      render: (row) => (
        <span className="method-pill">
          <CreditCard size={13} /> {row.method || 'UPI'}
        </span>
      )
    },
    {
      header: 'Payment Status',
      accessor: 'status',
      render: (row) => {
        const currentStatus = statusOptions.includes(row.status) ? row.status : 'Paid';
        return (
          <select 
            className={`payment-status-select status-${currentStatus.toLowerCase()}`}
            value={currentStatus}
            onChange={(e) => handleStatusChange(row.rawId || row.orderId || row._id, e.target.value)}
          >
            {statusOptions.map((st, i) => (
              <option key={i} value={st}>{st}</option>
            ))}
          </select>
        );
      }
    },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Actions',
      render: (row) => (
        <button 
          className="action-btn view" 
          title="View Receipt" 
          onClick={() => { setSelectedPayment(row); setIsModalOpen(true); }}
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="payments-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">Payment Transactions</h2>
          <p className="page-sub-title">Audit customer payments, payment gateways, and refund logs</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search by Payment ID, Order ID, Customer..."
        filterOptions={['UPI', 'Card', 'Online Payment']}
        activeFilter={methodFilter}
        onFilterChange={setMethodFilter}
      />

      {/* Payment Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Transaction Details - ${selectedPayment?._id}`}
        maxWidth="460px"
      >
        {selectedPayment && (
          <div className="modal-body payment-receipt-box">
            <div className="receipt-status-banner">
              <div className="check-icon-circle">
                <CheckCircle size={28} color="#10b981" />
              </div>
              <h3 className="receipt-amount-display">
                ₹{Number(selectedPayment.amount || 0).toFixed(2)}
              </h3>
              <div className={`receipt-pill-badge status-${(selectedPayment.status || 'paid').toLowerCase()}`}>
                <span className="badge-dot-bullet">•</span> {selectedPayment.status || 'Paid'}
              </div>
            </div>

            <div className="receipt-details-card">
              <div className="rec-detail-row">
                <span className="rec-label">Transaction ID</span>
                <span className="rec-val font-mono">{selectedPayment._id}</span>
              </div>
              <div className="rec-detail-row">
                <span className="rec-label">Associated Order</span>
                <span className="rec-val font-mono order-id-highlight">
                  #{selectedPayment.orderId}
                </span>
              </div>
              <div className="rec-detail-row">
                <span className="rec-label">Customer Name</span>
                <span className="rec-val">{selectedPayment.customer}</span>
              </div>
              <div className="rec-detail-row">
                <span className="rec-label">Payment Gateway / Method</span>
                <span className="rec-val">{selectedPayment.method || 'UPI'}</span>
              </div>
              <div className="rec-detail-row last-row">
                <span className="rec-label">Date & Time</span>
                <span className="rec-val">{selectedPayment.date}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
