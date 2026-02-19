const ToastStack = ({ toasts, onClose }) => {
  if (!toasts?.length) return null;

  return (
    <div className="fixed right-4 top-4 z-[80] space-y-2">
      {toasts.map((toast) => {
        const colorClass =
          toast.type === "error"
            ? "border-red-300 bg-red-50 text-red-700"
            : toast.type === "success"
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-blue-300 bg-blue-50 text-blue-700";

        return (
          <div
            key={toast.id}
            className={`flex min-w-[240px] max-w-sm items-start justify-between gap-3 rounded border px-4 py-3 shadow ${colorClass}`}
          >
            <p className="text-sm">{toast.message}</p>
            <button type="button" onClick={() => onClose(toast.id)} className="text-xs font-semibold">
              x
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastStack;
