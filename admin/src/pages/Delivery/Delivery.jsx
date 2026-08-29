import React, { useEffect, useState } from 'react';
import './Delivery.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import { Truck, UserCheck, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleDeliveries } from '../../config/api';

const Delivery = () => {
  const [deliveries, setDeliveries] = useState(sampleDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedRider, setAssignedRider] = useState('Robert Fox');

  const deliveryRiders = [
    'Robert Fox',
    'John Smith',
    'David Miller',
    'Sarah Connor',
    'Michael Scott'
  ];

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/delivery/list`);
      if (res.data.success && res.data.data.length > 0) {
        setDeliveries(res.data.data);
      }
    } catch (err) {
      console.log("Using fallback delivery data");
    }
  };

  const handleOpenAssign = (del) => {
    setSelectedDelivery(del);
    setAssignedRider(del.deliveryPerson || 'Robert Fox');
    setIsAssignModalOpen(true);
  };

  const handleAssignRiderSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDelivery) {
        await axios.post(`${API_URL}/api/delivery/assign`, {
          orderId: selectedDelivery.orderId || selectedDelivery._id,
          deliveryPerson: assignedRider
        });
        setDeliveries(deliveries.map(d => d._id === selectedDelivery._id ? { ...d, deliveryPerson: assignedRider, deliveryStatus: 'Assigned' } : d));
      }
      setIsAssignModalOpen(false);
      alert(`Delivery person "${assignedRider}" assigned successfully!`);
    } catch (err) {
      setDeliveries(deliveries.map(d => d._id === selectedDelivery._id ? { ...d, deliveryPerson: assignedRider, deliveryStatus: 'Assigned' } : d));
      setIsAssignModalOpen(false);
    }
  };

  const handleStatusChange = async (delId, newStatus) => {
    try {
      await axios.post(`${API_URL}/api/delivery/update`, {
        orderId: delId,
        deliveryStatus: newStatus,
        orderStatus: newStatus === 'Delivered' ? 'Delivered' : undefined
      });
      setDeliveries(deliveries.map(d => d._id === delId ? { ...d, deliveryStatus: newStatus } : d));
    } catch (err) {
      setDeliveries(deliveries.map(d => d._id === delId ? { ...d, deliveryStatus: newStatus } : d));
    }
  };

  const columns = [
    {
      header: 'Delivery ID',
      accessor: '_id',
      render: (row) => (
        <div className="del-id-cell">
          <Truck size={18} color="#ff4c24" />
          <span className="del-id-text">#{row._id?.toString().slice(-6)}</span>
        </div>
      )
    },
    { header: 'Customer', accessor: 'customer' },
    {
      header: 'Delivery Address',
      accessor: 'address',
      render: (row) => (
        <div className="address-cell">
          <MapPin size={14} color="#64748b" />
          <span className="address-text">{row.address}</span>
        </div>
      )
    },
    {
      header: 'Delivery Rider',
      accessor: 'deliveryPerson',
      render: (row) => (
        <div className="rider-cell">
          <span className="rider-name">{row.deliveryPerson || 'Unassigned'}</span>
          <button className="btn-link" onClick={() => handleOpenAssign(row)}>Assign</button>
        </div>
      )
    },
    {
      header: 'Delivery Status',
      accessor: 'deliveryStatus',
      render: (row) => (
        <select 
          className="order-status-select"
          value={row.deliveryStatus || 'Pending'}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
      )
    },
    { 
      header: 'Date', 
      accessor: 'deliveryDate',
      render: (row) => row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : 'Today'
    }
  ];

  return (
    <div className="delivery-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">Delivery Fleet Management</h2>
          <p className="page-sub-title">Assign delivery drivers, track live order dispatches, and manage status</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={deliveries}
        searchPlaceholder="Search delivery ID, customer, driver..."
        filterOptions={['Pending', 'Assigned', 'Out for Delivery', 'Delivered']}
      />

      {/* Assign Rider Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title="Assign Delivery Rider"
        maxWidth="440px"
      >
        <form onSubmit={handleAssignRiderSubmit} className="admin-form">
          <div className="form-group">
            <label>Select Available Rider</label>
            <select 
              value={assignedRider} 
              onChange={(e) => setAssignedRider(e.target.value)}
            >
              {deliveryRiders.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Confirm Driver</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Delivery;
