import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

function Boton({ children, ...props }: BotonProps) {
  return (
    <button
      {...props}
      style={{
        padding: "12px 16px",
        borderRadius: "8px",
        border: "none",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default Boton;