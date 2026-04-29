import React from 'react';

const DeleteModal = ({ open, onClose, onConfirm, loading = false, expenseName }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Expense</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete <strong>{expenseName}</strong>? This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="danger">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;