import type { ReactNode } from "react";

interface PageModalProps {
  children: ReactNode;
  onClose?: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
}

export function PageModal({
  children,
  onClose,
  title,
  size = "md",
}: PageModalProps) {
  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose ? () => onClose() : undefined}
    >
      <div
        className={`modal-contenido modal-contenido--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="modal-contenido__header">
            <h2>{title}</h2>
            {onClose && (
              <button
                type="button"
                className="modal-contenido__close"
                onClick={onClose}
                aria-label="Cerrar"
              >
                ×
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
