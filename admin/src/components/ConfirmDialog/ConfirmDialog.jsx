import React from 'react';
import Modal from '../Modal/Modal';
import './ConfirmDialog.css';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div className="confirm-dialog-body">
        <div className="confirm-icon-wrapper">
          <AlertTriangle size={32} color="#ef4444" />
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
