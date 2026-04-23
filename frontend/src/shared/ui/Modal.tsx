import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  children: ReactNode;
}

function Modal({ open, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#111827",
          padding: "24px",
          borderRadius: "12px",
          minWidth: "320px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;