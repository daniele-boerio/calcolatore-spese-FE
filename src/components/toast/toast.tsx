import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  closeToast,
  selectToasts,
  triggerToastAction,
} from "../../features/ui/ui_slice";
import { ToastItem } from "../../features/ui/toast";
import "./toast.scss";

const ICONS: Record<ToastItem["variant"], string> = {
  success: "pi pi-check-circle",
  error: "pi pi-exclamation-triangle",
  offline: "pi pi-wifi",
};

function Toast({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toast.duration) return;

    const timer = window.setTimeout(
      () => dispatch(closeToast(toast.id)),
      toast.duration,
    );

    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  return (
    <div className={`toast toast--${toast.variant}`} role="status">
      <i className={`toast__icon ${ICONS[toast.variant]}`} aria-hidden="true" />

      <div className="toast__text">
        <span className="toast__title">{toast.title}</span>
        {toast.meta && <span className="toast__meta">{toast.meta}</span>}
      </div>

      {toast.actionLabel && (
        <button
          type="button"
          className="toast__action"
          onClick={() => dispatch(triggerToastAction(toast.id))}
        >
          {toast.actionLabel}
        </button>
      )}
    </div>
  );
}

/** Impila i toast sopra la tab bar, dentro la colonna dell'app. */
export default function ToastHost() {
  const toasts = useAppSelector(selectToasts);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-host">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
