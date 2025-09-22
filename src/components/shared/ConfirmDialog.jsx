import PropTypes from 'prop-types';

const ConfirmDialog = ({
  open,
  title = 'Confirmar',
  message = '¿Estás seguro?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="confirm-dialog" role="dialog" aria-modal="true">
      <div className="confirm-dialog__backdrop" onClick={onCancel}></div>
      <div className="confirm-dialog__content">
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button 
            className="confirm-dialog__btn confirm-dialog__btn--primary" 
            onClick={onConfirm} 
            autoFocus
          >
            {confirmText}
          </button>
          <button 
            className="confirm-dialog__btn confirm-dialog__btn--secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;


