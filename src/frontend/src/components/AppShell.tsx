import type React from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="mobile-container w-full shadow-mobile-outer bg-background relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
