import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = (st) => {
    if (!st) return 'status-default';
    const lower = st.toString().toLowerCase();

    if (lower.includes('delivered') || lower.includes('paid') || lower.includes('active') || lower.includes('completed')) {
      return 'status-success';
    }
    if (lower.includes('pending') || lower.includes('preparing') || lower.includes('processing') || lower.includes('assigned')) {
      return 'status-warning';
    }
    if (lower.includes('out for delivery') || lower.includes('confirmed') || lower.includes('shipped')) {
      return 'status-info';
    }
    if (lower.includes('cancelled') || lower.includes('failed') || lower.includes('inactive') || lower.includes('expired') || lower.includes('refunded')) {
      return 'status-danger';
    }
    return 'status-default';
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      <span className="badge-dot"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
