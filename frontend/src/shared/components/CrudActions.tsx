import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type CrudActionVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "danger-soft";

interface CrudActionsProps {
  children: ReactNode;
  layout?: "inline" | "table" | "card";
  className?: string;
}

interface CrudActionGroupProps {
  children: ReactNode;
  className?: string;
}

interface CrudActionProps {
  label: string;
  icon?: LucideIcon;
  variant?: CrudActionVariant;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  title?: string;
}

export function CrudActions({
  children,
  layout = "inline",
  className = "",
}: CrudActionsProps) {
  return (
    <div className={`crud-actions crud-actions--${layout} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function CrudActionGroup({
  children,
  className = "",
}: CrudActionGroupProps) {
  return (
    <div className={`crud-action-group ${className}`.trim()}>{children}</div>
  );
}

export function CrudAction({
  label,
  icon: Icon,
  variant = "default",
  onClick,
  disabled = false,
  loading = false,
  loadingLabel,
  title,
}: CrudActionProps) {
  return (
    <button
      type="button"
      className={`crud-action crud-action--${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={title ?? label}
      aria-label={label}
    >
      {Icon && (
        <Icon
          className="crud-action__icon"
          size={15}
          strokeWidth={2}
          aria-hidden
        />
      )}
      <span>{loading ? (loadingLabel ?? label) : label}</span>
    </button>
  );
}
