import Modal from './Modal';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Confirm Action', message, confirmLabel = 'Confirm', danger = false, loading = false }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </>
    }
  >
    <p className="confirm-message">{message}</p>
  </Modal>
);

export default ConfirmDialog;
