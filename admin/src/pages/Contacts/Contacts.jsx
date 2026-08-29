import React, { useEffect, useState } from 'react';
import './Contacts.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { Plus, Eye, Edit3, Trash2, Mail, Phone, CheckCircle2, BookOpen, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleContacts } from '../../config/api';
import { toast } from 'react-toastify';

const Contacts = () => {
  const [contacts, setContacts] = useState(sampleContacts);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isTrashView, setIsTrashView] = useState(false);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);

  const [selectedContact, setSelectedContact] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    status: 'New'
  });

  useEffect(() => {
    fetchContacts();
  }, [isTrashView]);

  const fetchContacts = async () => {
    try {
      const url = isTrashView 
        ? `${API_URL}/api/contacts?deletedOnly=true`
        : `${API_URL}/api/contacts`;

      const res = await axios.get(url);
      if (res.data.success && Array.isArray(res.data.data)) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.log("Using fallback contacts list");
    }
  };

  const handleOpenDetail = (cnt) => {
    setSelectedContact(cnt);
    setIsDetailOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      status: 'New'
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cnt) => {
    setSelectedContact(cnt);
    setFormData({
      name: cnt.name || '',
      email: cnt.email || '',
      phone: cnt.phone || '',
      subject: cnt.subject || '',
      message: cnt.message || '',
      status: cnt.status || 'New'
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/contacts`, formData);
      if (res.data.success) {
        toast.success("Contact message created!");
        fetchContacts();
      } else {
        const newRecord = { ...formData, _id: `cnt-${Date.now()}`, createdAt: new Date().toISOString() };
        setContacts([newRecord, ...contacts]);
        toast.success("Contact message created locally");
      }
    } catch (err) {
      const newRecord = { ...formData, _id: `cnt-${Date.now()}`, createdAt: new Date().toISOString() };
      setContacts([newRecord, ...contacts]);
      toast.success("Contact message created locally");
    }
    setIsAddOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    try {
      const res = await axios.put(`${API_URL}/api/contacts/${selectedContact._id}`, formData);
      if (res.data.success) {
        toast.success("Contact updated!");
        fetchContacts();
      } else {
        setContacts(contacts.map(c => c._id === selectedContact._id ? { ...c, ...formData } : c));
        toast.info("Contact updated");
      }
    } catch (err) {
      setContacts(contacts.map(c => c._id === selectedContact._id ? { ...c, ...formData } : c));
      toast.info("Contact updated");
    }
    setIsEditOpen(false);
    setIsDetailOpen(false);
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/contacts/${contactId}`, { status: newStatus });
      setContacts(contacts.map(c => c._id === contactId ? { ...c, status: newStatus } : c));
      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      setContacts(contacts.map(c => c._id === contactId ? { ...c, status: newStatus } : c));
      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
      toast.success(`Status updated to ${newStatus}`);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    try {
      await axios.delete(`${API_URL}/api/contacts/${selectedContact._id}`);
      setContacts(contacts.filter(c => c._id !== selectedContact._id));
      toast.info(`Message from "${selectedContact.name}" moved to trash (soft deleted)`);
    } catch (err) {
      setContacts(contacts.filter(c => c._id !== selectedContact._id));
    }
    setIsDeleteOpen(false);
    setIsDetailOpen(false);
  };

  const handleRestoreContact = async (cnt) => {
    try {
      await axios.post(`${API_URL}/api/contacts/restore`, { id: cnt._id });
      setContacts(contacts.filter(c => c._id !== cnt._id));
      toast.success(`Contact message from "${cnt.name}" restored successfully!`);
    } catch (err) {
      toast.error("Failed to restore contact message");
    }
  };

  const handlePurgeContact = async () => {
    if (!selectedContact) return;
    try {
      await axios.post(`${API_URL}/api/contacts/purge`, { id: selectedContact._id });
      setContacts(contacts.filter(c => c._id !== selectedContact._id));
      toast.error(`Contact inquiry from "${selectedContact.name}" permanently deleted`);
    } catch (err) {
      setContacts(contacts.filter(c => c._id !== selectedContact._id));
    }
    setIsPurgeOpen(false);
    setIsDetailOpen(false);
  };

  const columns = [
    {
      header: 'ID',
      accessor: '_id',
      render: (row) => <span className="id-badge">#{row._id ? row._id.toString().slice(-6) : 'N/A'}</span>
    },
    {
      header: 'Customer',
      accessor: 'name',
      render: (row) => (
        <div className="contact-name-cell">
          <span className="contact-name-text">{row.name}</span>
          <span className="contact-email-text">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => <span>{row.phone}</span>
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (row) => <span className="subject-text">{row.subject}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'New'} />
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="date-text">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          {isTrashView ? (
            <>
              <button 
                className="action-btn edit" 
                title="Restore Contact Message" 
                onClick={() => handleRestoreContact(row)}
                style={{ color: '#10b981', background: '#ecfdf5' }}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                className="action-btn delete" 
                title="Permanently Delete (Hard Delete)" 
                onClick={() => { setSelectedContact(row); setIsPurgeOpen(true); }}
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="action-btn view" title="View Message" onClick={() => handleOpenDetail(row)}>
                <Eye size={16} />
              </button>
              <button className="action-btn edit" title="Edit Contact" onClick={() => handleOpenEdit(row)}>
                <Edit3 size={16} />
              </button>
              <button className="action-btn delete" title="Move to Trash (Soft Delete)" onClick={() => { setSelectedContact(row); setIsDeleteOpen(true); }}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="contacts-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">
            {isTrashView ? "Trash / Soft-Deleted Inquiries" : "Contact Management"}
          </h2>
          <p className="page-sub-title">
            {isTrashView ? "Restore soft-deleted customer inquiries or permanently delete them" : "View and manage customer inquiries and messages"}
          </p>
        </div>
        {!isTrashView && (
          <button className="btn-primary flex-btn" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Contact Record
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={contacts}
        searchPlaceholder="Search by name, email, or subject..."
        filterOptions={['New', 'Read', 'Resolved']}
        activeFilter={activeFilter}
        onFilterChange={(val) => setActiveFilter(val)}
        showTrashToggle={true}
        isTrashView={isTrashView}
        onToggleTrash={() => setIsTrashView(!isTrashView)}
      />

      {/* View Contact Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Contact Message Details"
        maxWidth="580px"
      >
        {selectedContact && (
          <div className="modal-body contact-detail-wrapper">
            <div className="detail-header-card">
              <div className="detail-user-info">
                <h3>{selectedContact.name}</h3>
                <div className="detail-user-meta">
                  <span className="meta-item"><Mail size={14} color="#64748b" /> {selectedContact.email}</span>
                  <span className="meta-item"><Phone size={14} color="#64748b" /> {selectedContact.phone}</span>
                </div>
              </div>
              <StatusBadge status={selectedContact.status || 'New'} />
            </div>

            <div className="detail-message-box">
              <span className="msg-sec-label">SUBJECT</span>
              <div className="message-subject-tag">{selectedContact.subject}</div>
              
              <span className="msg-sec-label mt-sec">MESSAGE CONTENT</span>
              <p className="message-body-text">{selectedContact.message}</p>
            </div>

            <div className="detail-actions-row">
              <div className="status-change-group">
                <label>Change Status:</label>
                <div className="select-wrapper">
                  <select
                    value={selectedContact.status || 'New'}
                    onChange={(e) => handleStatusChange(selectedContact._id, e.target.value)}
                    className="status-select-pill"
                  >
                    <option value="New">New</option>
                    <option value="Read">Read</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="quick-action-btns">
                {selectedContact.status !== 'Read' && (
                  <button className="btn-status-read flex-btn" onClick={() => handleStatusChange(selectedContact._id, 'Read')}>
                    <BookOpen size={15} /> Mark Read
                  </button>
                )}
                {selectedContact.status !== 'Resolved' && (
                  <button className="btn-status-resolved flex-btn" onClick={() => handleStatusChange(selectedContact._id, 'Resolved')}>
                    <CheckCircle2 size={15} /> Mark Resolved
                  </button>
                )}
                <button className="icon-action-btn edit" title="Edit Contact" onClick={() => handleOpenEdit(selectedContact)}>
                  <Edit3 size={16} />
                </button>
                <button className="icon-action-btn delete" title="Move to Trash" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Contact Message"
        maxWidth="560px"
      >
        <form onSubmit={handleAddSubmit} className="modal-body admin-form contact-form-body">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Customer Name <span className="req-asterisk">*</span></label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address <span className="req-asterisk">*</span></label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Phone Number <span className="req-asterisk">*</span></label>
              <input
                type="text"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  <option value="New">New</option>
                  <option value="Read">Read</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Subject <span className="req-asterisk">*</span></label>
            <input
              type="text"
              placeholder="Inquiry / Order Issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Message Content <span className="req-asterisk">*</span></label>
            <textarea
              rows="4"
              placeholder="Customer's message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary modal-cancel-btn" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary modal-save-btn">Save Contact</button>
          </div>
        </form>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Contact Record"
        maxWidth="560px"
      >
        <form onSubmit={handleEditSubmit} className="modal-body admin-form contact-form-body">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Customer Name <span className="req-asterisk">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address <span className="req-asterisk">*</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Phone Number <span className="req-asterisk">*</span></label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  <option value="New">New</option>
                  <option value="Read">Read</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Subject <span className="req-asterisk">*</span></label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Message Content <span className="req-asterisk">*</span></label>
            <textarea
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary modal-cancel-btn" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary modal-save-btn">Update Contact</button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteContact}
        title="Move Contact Record to Trash"
        message={`Are you sure you want to move message from "${selectedContact?.name}" to trash? You can restore it anytime.`}
      />

      {/* Permanent Hard Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isPurgeOpen}
        onClose={() => setIsPurgeOpen(false)}
        onConfirm={handlePurgeContact}
        title="Permanently Delete Contact (Hard Delete)"
        message={`⚠️ CAUTION: Are you sure you want to PERMANENTLY delete contact inquiry from "${selectedContact?.name}"? This cannot be undone.`}
      />
    </div>
  );
};

export default Contacts;
