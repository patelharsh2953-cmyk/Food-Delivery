import React, { useEffect, useState } from 'react';
import './Users.css';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { Eye, Edit3, Trash2, Phone, Mail, Calendar, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { API_URL, sampleUsers } from '../../config/api';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isTrashView, setIsTrashView] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
  }, [isTrashView]);

  const fetchUsers = async () => {
    try {
      const url = isTrashView 
        ? `${API_URL}/api/user/list?deletedOnly=true`
        : `${API_URL}/api/user/list`;

      const res = await axios.get(url);
      if (res.data.success && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.log("Using fallback users list");
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await axios.post(`${API_URL}/api/user/update`, { id: selectedUser._id, ...editFormData });
        setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...editFormData } : u));
      }
      setIsEditModalOpen(false);
      toast.success("User details updated successfully!");
    } catch (err) {
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...editFormData } : u));
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(`${API_URL}/api/user/remove`, { id: selectedUser._id });
      setUsers(users.filter(u => u._id !== selectedUser._id));
      toast.info(`"${selectedUser.name}" moved to trash (soft deleted)`);
    } catch (err) {
      setUsers(users.filter(u => u._id !== selectedUser._id));
    }
    setIsDeleteOpen(false);
  };

  const handleRestoreUser = async (user) => {
    try {
      await axios.post(`${API_URL}/api/user/restore`, { id: user._id });
      setUsers(users.filter(u => u._id !== user._id));
      toast.success(`Account "${user.name}" restored successfully!`);
    } catch (err) {
      toast.error("Failed to restore user");
    }
  };

  const handlePurgeUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(`${API_URL}/api/user/purge`, { id: selectedUser._id });
      setUsers(users.filter(u => u._id !== selectedUser._id));
      toast.error(`User "${selectedUser.name}" permanently deleted from database`);
    } catch (err) {
      setUsers(users.filter(u => u._id !== selectedUser._id));
    }
    setIsPurgeOpen(false);
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="user-cell">
          <div className="avatar-circle">
            {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="user-name">{row.name}</p>
            <p className="user-email-sub">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone', render: (row) => row.phone || 'N/A' },
    { 
      header: 'Registered', 
      accessor: 'createdAt', 
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent' 
    },
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
                title="Restore User Account" 
                onClick={() => handleRestoreUser(row)}
                style={{ color: '#10b981', background: '#ecfdf5' }}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                className="action-btn delete" 
                title="Permanently Delete (Hard Delete)" 
                onClick={() => { setSelectedUser(row); setIsPurgeOpen(true); }}
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="action-btn view" title="View Profile" onClick={() => { setSelectedUser(row); setIsViewModalOpen(true); }}>
                <Eye size={16} />
              </button>
              <button className="action-btn edit" title="Edit User" onClick={() => handleOpenEdit(row)}>
                <Edit3 size={16} />
              </button>
              <button className="action-btn delete" title="Move to Trash (Soft Delete)" onClick={() => { setSelectedUser(row); setIsDeleteOpen(true); }}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="users-page fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-main-title">
            {isTrashView ? "Trash / Soft-Deleted Customer Accounts" : "User Management"}
          </h2>
          <p className="page-sub-title">
            {isTrashView ? "Restore soft-deleted user accounts or permanently delete them" : "View, edit, filter and manage registered customer accounts"}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search by name, email, phone..."
        filterOptions={['Active', 'Inactive']}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        showTrashToggle={true}
        isTrashView={isTrashView}
        onToggleTrash={() => setIsTrashView(!isTrashView)}
      />

      {/* View User Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Customer Profile Details">
        {selectedUser && (
          <div className="user-modal-profile">
            <div className="profile-header-box">
              <div className="large-avatar">{selectedUser.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h3>{selectedUser.name}</h3>
                <StatusBadge status={selectedUser.status || 'Active'} />
              </div>
            </div>

            <div className="profile-details-list">
              <div className="detail-row">
                <Mail size={18} color="#64748b" />
                <div>
                  <label>Email Address</label>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              <div className="detail-row">
                <Phone size={18} color="#64748b" />
                <div>
                  <label>Phone Number</label>
                  <p>{selectedUser.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="detail-row">
                <Calendar size={18} color="#64748b" />
                <div>
                  <label>Registration Date</label>
                  <p>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User Information">
        <form onSubmit={handleSaveUser} className="admin-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={editFormData.name} 
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={editFormData.email} 
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              value={editFormData.phone} 
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <select 
              value={editFormData.status} 
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteUser}
        title="Move User to Trash"
        message={`Are you sure you want to move user "${selectedUser?.name}" to trash? You can restore this account anytime.`}
      />

      {/* Permanent Hard Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={isPurgeOpen} 
        onClose={() => setIsPurgeOpen(false)} 
        onConfirm={handlePurgeUser}
        title="Permanently Delete User Account (Hard Delete)"
        message={`⚠️ CAUTION: Are you sure you want to PERMANENTLY delete user "${selectedUser?.name}" (${selectedUser?.email}) from the database? This cannot be undone.`}
      />
    </div>
  );
};

export default Users;
