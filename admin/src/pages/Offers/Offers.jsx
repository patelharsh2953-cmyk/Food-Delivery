import React, { useEffect, useState } from 'react';
import './Offers.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { Tag, Plus, Edit3, Trash2, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleOffers } from '../../config/api';
import { toast } from 'react-toastify';

const Offers = () => {
  const [offers, setOffers] = useState(sampleOffers);
  const [isTrashView, setIsTrashView] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    minAmount: 0,
    expiryDate: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchOffers();
  }, [isTrashView]);

  const fetchOffers = async () => {
    try {
      const url = isTrashView 
        ? `${API_URL}/api/offer/list?deletedOnly=true`
        : `${API_URL}/api/offer/list`;

      const res = await axios.get(url);
      if (res.data.success && Array.isArray(res.data.data)) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.log("Using fallback offers");
    }
  };

  const handleOpenAdd = () => {
    setFormData({ code: '', discount: '', minAmount: 0, expiryDate: '', status: 'Active' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (off) => {
    setSelectedOffer(off);
    setFormData({
      code: off.code || '',
      discount: off.discount || '',
      minAmount: off.minAmount || 0,
      expiryDate: off.expiryDate || '',
      status: off.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/offer/add`, formData);
      if (res.data.success) {
        toast.success("Coupon Added Successfully!");
        fetchOffers();
      } else {
        setOffers([...offers, { ...formData, _id: Date.now().toString() }]);
      }
    } catch (err) {
      setOffers([...offers, { ...formData, _id: Date.now().toString() }]);
    }
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/offer/update`, { id: selectedOffer._id, ...formData });
      toast.success("Coupon Updated!");
      fetchOffers();
    } catch (err) {
      setOffers(offers.map(o => o._id === selectedOffer._id ? { ...o, ...formData } : o));
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteOffer = async () => {
    if (!selectedOffer) return;
    try {
      await axios.post(`${API_URL}/api/offer/remove`, { id: selectedOffer._id });
      setOffers(offers.filter(o => o._id !== selectedOffer._id));
      toast.info(`Coupon "${selectedOffer.code}" moved to trash (soft deleted)`);
    } catch (err) {
      setOffers(offers.filter(o => o._id !== selectedOffer._id));
    }
    setIsDeleteOpen(false);
  };

  const handleRestoreOffer = async (offer) => {
    try {
      await axios.post(`${API_URL}/api/offer/restore`, { id: offer._id });
      setOffers(offers.filter(o => o._id !== offer._id));
      toast.success(`Coupon "${offer.code}" restored successfully!`);
    } catch (err) {
      toast.error("Failed to restore coupon");
    }
  };

  const handlePurgeOffer = async () => {
    if (!selectedOffer) return;
    try {
      await axios.post(`${API_URL}/api/offer/purge`, { id: selectedOffer._id });
      setOffers(offers.filter(o => o._id !== selectedOffer._id));
      toast.error(`Coupon "${selectedOffer.code}" permanently deleted from database`);
    } catch (err) {
      setOffers(offers.filter(o => o._id !== selectedOffer._id));
    }
    setIsPurgeOpen(false);
  };

  const columns = [
    {
      header: 'Coupon Code',
      accessor: 'code',
      render: (row) => (
        <div className="coupon-code-cell">
          <Tag size={16} color="#ff4c24" />
          <span className="code-text">{row.code}</span>
        </div>
      )
    },
    {
      header: 'Discount',
      accessor: 'discount',
      render: (row) => <span className="discount-val">-{row.discount}% OFF</span>
    },
    {
      header: 'Min Order',
      accessor: 'minAmount',
      render: (row) => <span>₹{row.minAmount || 0}.00</span>
    },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Active'} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          {isTrashView ? (
            <>
              <button 
                className="action-btn edit" 
                title="Restore Coupon" 
                onClick={() => handleRestoreOffer(row)}
                style={{ color: '#10b981', background: '#ecfdf5' }}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                className="action-btn delete" 
                title="Permanently Delete (Hard Delete)" 
                onClick={() => { setSelectedOffer(row); setIsPurgeOpen(true); }}
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="action-btn edit" title="Edit Coupon" onClick={() => handleOpenEdit(row)}>
                <Edit3 size={16} />
              </button>
              <button className="action-btn delete" title="Move to Trash (Soft Delete)" onClick={() => { setSelectedOffer(row); setIsDeleteOpen(true); }}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="offers-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">
            {isTrashView ? "Trash / Soft-Deleted Coupons" : "Promotional Offers & Coupons"}
          </h2>
          <p className="page-sub-title">
            {isTrashView ? "Restore soft-deleted promo coupons or permanently purge them" : "Create discount codes, set minimum cart amounts, and control promo validity"}
          </p>
        </div>
        {!isTrashView && (
          <button className="btn-primary flex-btn" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Coupon
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={offers}
        searchPlaceholder="Search coupon code..."
        filterOptions={['Active', 'Expired']}
        showTrashToggle={true}
        isTrashView={isTrashView}
        onToggleTrash={() => setIsTrashView(!isTrashView)}
      />

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isAddModalOpen || isEditModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} 
        title={isAddModalOpen ? "Create New Coupon Code" : "Edit Coupon Code"}
        maxWidth="520px"
      >
        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="modal-body admin-form coupon-form-body">
          <div className="form-group">
            <label>Coupon Code (Uppercase)</label>
            <input 
              type="text" 
              className="uppercase-input"
              placeholder="e.g. FOOD20" 
              value={formData.code} 
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required 
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Discount Percentage (%)</label>
              <input 
                type="number" 
                placeholder="20" 
                value={formData.discount} 
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label>Min Order Amount (₹)</label>
              <input 
                type="number" 
                placeholder="0" 
                value={formData.minAmount} 
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Expiry Date</label>
              <input 
                type="date" 
                className="date-input-field"
                value={formData.expiryDate} 
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <div className="select-wrapper">
                <select 
                  className="status-select-field"
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary modal-cancel-btn" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</button>
            <button type="submit" className="btn-primary modal-save-btn">Save Coupon</button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteOffer}
        title="Move Coupon to Trash"
        message={`Are you sure you want to move coupon "${selectedOffer?.code}" to trash? You can restore it anytime.`}
      />

      {/* Permanent Hard Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isPurgeOpen} 
        onClose={() => setIsPurgeOpen(false)} 
        onConfirm={handlePurgeOffer}
        title="Permanently Delete Coupon (Hard Delete)"
        message={`⚠️ CAUTION: Are you sure you want to PERMANENTLY delete coupon "${selectedOffer?.code}" from the database? This cannot be undone.`}
      />
    </div>
  );
};

export default Offers;
