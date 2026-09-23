import type { InputHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white active:bg-primary-dark",
  secondary: "bg-slate-100 text-ink active:bg-slate-200",
  danger: "bg-danger text-white active:bg-red-600",
};

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: {
  variant?: Variant;
  loading?: boolean;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-5 h-14 text-[15px] font-semibold
        transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100
        ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-warn/10 text-warn",
  APPROVED: "bg-primary/10 text-primary-deeper",
  REJECTED: "bg-danger/10 text-danger",
  PAID: "bg-primary/10 text-primary-deeper",
};

export function StatusChip({ status, label }: { status: string; label: string }) {
  return (
    <span className={`text-[12px] font-semibold px-3 py-1 rounded-pill ${statusStyles[status] ?? "bg-slate-100 text-muted"}`}>
      {label}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} style={{ minHeight: 1 }} />;
}

const inputBase = `w-full h-14 rounded-card bg-surface shadow-card px-4 text-[15px] placeholder:text-muted/70 text-ink transition focus:ring-2 focus:ring-primary/40`;

export function Field({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-semibold text-ink mb-2">{label}</span>}
      <input className={inputBase} {...rest} />
    </label>
  );
}