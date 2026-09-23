import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-floating active:bg-primary-dark",
  secondary: "bg-primary-soft text-primary-deeper active:bg-primary-light/60",
  ghost: "bg-transparent text-ink hover:bg-slate-100",
  danger: "bg-danger text-white active:bg-red-600",
  outline: "border border-slate-200 bg-white text-ink active:bg-slate-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  full?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  full = true,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-5 h-14 text-[15px] font-semibold
        transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100
        ${full ? "w-full" : "w-auto"} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-card bg-surface shadow-card px-5 py-5 ${onClick ? "cursor-pointer active:scale-[0.99] transition-transform" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pt-safe mb-0 animate-fade-up ${className}`}>{children}</div>;
}

export function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-[28px] font-extrabold leading-tight text-ink ${className}`}>{children}</h1>;
}

export function Subtitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[15px] text-muted leading-relaxed ${className}`}>{children}</p>;
}

export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-[15px] font-bold text-ink mb-3 ${className}`}>{children}</h2>
  );
}

export function Avatar({
  src,
  name,
  size = 40,
}: {
  src: string | null | undefined;
  name: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full bg-primary-soft grid place-items-center overflow-hidden shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-primary-deeper" style={{ fontSize: size * 0.4 }}>
          {(name || "?").trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
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

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-16 h-16 rounded-full bg-primary-soft grid place-items-center text-primary-dark mb-4">
        {icon}
      </div>
      <p className="font-bold text-ink">{title}</p>
      {text && <p className="text-muted text-sm mt-1">{text}</p>}
    </div>
  );
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

export function TextArea({ label, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-semibold text-ink mb-2">{label}</span>}
      <textarea className={`${inputBase} h-auto pt-4`} {...rest} />
    </label>
  );
}