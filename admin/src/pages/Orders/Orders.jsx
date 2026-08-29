import React, { useEffect, useState } from 'react';
import './Orders.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import { Eye, Package, MapPin, User, DollarSign, Calendar, CreditCard } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { assets } from '../../assets/assets';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const statusOptions = [
    'Confirmed',
    'Food Processing',
    'Out for Delivery',
    'Delivered'
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/order/list`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.log("Error fetching orders:", err.message);
      setOrders([]);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.post(`${API_URL}/api/order/status`, { orderId, status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      alert(`Order status updated to "${newStatus}"`);
    } catch (err) {
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const columns = [
    {
      header: 'Order Details',
      accessor: '_id',
      render: (row) => (
        <div className="order-id-cell">
          <img src={assets.parcel_icon} alt="Parcel" className="parcel-img" />
          <div>
            <p className="order-id-text">#{row._id?.toString().slice(-6)}</p>
            <p className="order-date-text">
              {row.date ? new Date(row.date).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: 'address',
      render: (row) => (
        <div>
          <p className="cust-name">
            {row.address ? `${row.address.firstName || ''} ${row.address.lastName || ''}`.trim() || 'Customer' : 'Customer'}
          </p>
          <p className="cust-city">{row.address?.city || 'Location'}</p>
        </div>
      )
    },
    {
      header: 'Items & Qty',
      accessor: 'items',
      render: (row) => (
        <div className="items-preview-box">
          <p className="items-list-text">
            {row.items ? row.items.map(item => `${item.name} x ${item.quantity || 1}`).join(', ') : 'Food Items'}
          </p>
          <span className="items-count-pill">{row.items ? row.items.length : 1} Items</span>
        </div>
      )
    },
    {
      header: 'Total Amount',
      accessor: 'amount',
      render: (row) => <span className="order-price-text">₹{row.amount}</span>
    },
    {
      header: 'Payment',
      accessor: 'payment',
      render: (row) => (
        <span className={`payment-pill ${row.payment ? 'paid' : 'pending'}`}>
          {row.payment ? 'Paid' : 'Unpaid'}
        </span>
      )
    },
    {
      header: 'Order Status',
      accessor: 'status',
      render: (row) => (
        <select 
          className="order-status-select"
          value={statusOptions.includes(row.status) ? row.status : (row.status === 'Preparing' ? 'Food Processing' : 'Confirmed')}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
        >
          {statusOptions.map((st, i) => (
            <option key={i} value={st}>{st}</option>
          ))}
        </select>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button 
          className="action-btn view" 
          title="View Order Invoice" 
          onClick={() => { setSelectedOrder(row); setIsViewModalOpen(true); }}
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="orders-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">Order Management</h2>
          <p className="page-sub-title">Monitor live incoming customer food orders and update dispatch status</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder="Search by Order ID, customer, address..."
        filterOptions={statusOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* View Order Invoice Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title={`Order Details #${selectedOrder?._id?.toString().slice(-6)}`}
        maxWidth="600px"
      >
        {selectedOrder && (
          <div className="modal-body order-invoice-content">
            <div className="invoice-header-banner">
              <div>
                <span className="invoice-badge">ORDER INVOICE</span>
                <p className="invoice-date">{new Date(selectedOrder.date || Date.now()).toLocaleString()}</p>
              </div>
              <StatusBadge status={selectedOrder.status || 'Confirmed'} />
            </div>

            <div className="invoice-grid-2">
              <div className="invoice-box">
                <h4><User size={16} /> Customer Information</h4>
                <p className="val-main">
                  {selectedOrder.address ? `${selectedOrder.address.firstName || ''} ${selectedOrder.address.lastName || ''}`.trim() : 'Customer'}
                </p>
                <p className="val-sub">{selectedOrder.address?.email || 'N/A'}</p>
                <p className="val-sub">{selectedOrder.address?.phone || 'N/A'}</p>
              </div>

              <div className="invoice-box">
                <h4><MapPin size={16} /> Delivery Address</h4>
                <p className="val-main">{selectedOrder.address?.street || 'Address'}</p>
                <p className="val-sub">{selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.pinCode || selectedOrder.address?.zipcode || ''}</p>
              </div>
            </div>

            <div className="invoice-items-section">
              <h4><Package size={16} /> Order Food Items</h4>
              <div className="invoice-items-list">
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span className="item-name">{item.name} x {item.quantity || 1}</span>
                    <span className="item-price">₹{(item.price || 10) * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>

              <div className="invoice-summary-box">
                <div className="sum-row">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.amount ? (selectedOrder.amount > 60 ? selectedOrder.amount - 20 : selectedOrder.amount) : 0}</span>
                </div>
                <div className="sum-row">
                  <span>Delivery Charge</span>
                  <span>₹20.00</span>
                </div>
                <div className="sum-row total">
                  <span>Total Amount Paid</span>
                  <span className="total-val">₹{selectedOrder.amount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;