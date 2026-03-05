import { ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="header-bar sticky top-0 z-40 px-4 py-3 flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.22 250), oklch(0.55 0.24 260))",
        }}
      >
        <ShieldCheck className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-base text-gradient-blue">
            Fleetyfy
          </span>
          <span className="text-muted-foreground text-xs">Admin</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          {subtitle || title}
        </p>
      </div>
    </header>
  );
}
