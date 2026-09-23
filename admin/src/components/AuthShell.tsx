import type { ReactNode } from "react";
import { Leaf } from "lucide-react";

export function AuthShell({ children, subtitle = "" }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-bg grid place-items-center px-6">
      <div className="w-full max-w-[430px]">
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-primary shadow-floating grid place-items-center mb-3">
            <Leaf className="h-8 w-8 text-white" fill="currentColor" strokeWidth={0} />
          </div>
          <h1 className="text-[26px] font-extrabold text-ink">Eco Qadam</h1>
          {subtitle && <p className="text-muted text-sm mt-1 text-center">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}