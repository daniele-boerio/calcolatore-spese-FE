import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./sheet.scss";

// Oltre questa trascinata verso il basso lo sheet si chiude invece di tornare su.
const DISMISS_THRESHOLD = 120;

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Footer fisso in fondo (i bottoni di conferma). */
  footer?: ReactNode;
  /** Altezza in percentuale dello schermo; senza, lo sheet si adatta al contenuto. */
  heightPercent?: number;
  className?: string;
};

/**
 * Bottom sheet ancorato in basso: è la forma di ogni form e di ogni scelta.
 * Si chiude con la X, con un tap sull'overlay, con Esc o trascinandolo giù.
 */
export default function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  heightPercent,
  className,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  // Serve in render per togliere la transizione mentre il dito trascina: deve
  // essere stato, non un ref.
  const [dragging, setDragging] = useState(false);

  // Esc chiude, e il corpo dietro non deve scorrere.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const onPointerDown = (event: React.PointerEvent) => {
    dragStartY.current = event.clientY;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    // Solo verso il basso: tirare su non allunga lo sheet.
    setDragOffset(Math.max(0, event.clientY - dragStartY.current));
  };

  const onPointerUp = () => {
    if (dragStartY.current === null) return;

    if (dragOffset > DISMISS_THRESHOLD) onClose();

    setDragOffset(0);

    dragStartY.current = null;
    setDragging(false);
  };

  return createPortal(
    <div className="sheet">
      <div className="sheet__overlay" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`sheet__panel ${className ?? ""}`}
        style={{
          height: heightPercent ? `${heightPercent}%` : undefined,
          transform: dragOffset
            ? `translateX(-50%) translateY(${dragOffset}px)`
            : undefined,
          transition: dragging ? "none" : undefined,
        }}
      >
        <span
          className="sheet__handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />

        {title && (
          <div className="sheet__header">
            <h2 className="sheet__title">{title}</h2>
            <button
              type="button"
              className="sheet__close"
              onClick={onClose}
              aria-label="close"
            >
              <i className="pi pi-times" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="sheet__body">{children}</div>

        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
