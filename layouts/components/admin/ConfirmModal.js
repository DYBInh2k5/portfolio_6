const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded border border-border bg-white p-5 shadow-xl dark:border-darkmode-border dark:bg-darkmode-body">
        <h3 className="h5 mb-2">{title}</h3>
        <p className="mb-5 text-sm text-text-light dark:text-darkmode-text-light">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
