import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, CalendarDays, History, LogOut } from "lucide-react";
import { toast } from "sonner";
import { logout } from "../utils/auth";

const navItems = [
  {
    to: "/driver",
    label: "Today",
    icon: CalendarDays,
    ocid: "driver.today_tab",
    exact: true,
  },
  {
    to: "/driver/history",
    label: "History",
    icon: History,
    ocid: "driver.history_tab",
    exact: false,
  },
  {
    to: "/driver/summary",
    label: "Summary",
    icon: BarChart3,
    ocid: "driver.summary_tab",
    exact: false,
  },
] as const;

export function DriverNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (to: string, exact: boolean) => {
    if (exact) return currentPath === to;
    return currentPath.startsWith(to);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  return (
    <nav className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, label, icon: Icon, ocid, exact }) => {
          const active = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all min-w-[64px] ${
                active
                  ? "text-fleet-blue bg-fleet-blue/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-fleet-blue" : ""}`} />
              <span
                className={`text-[10px] font-semibold tracking-wide ${active ? "text-fleet-blue" : ""}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all text-muted-foreground hover:text-destructive min-w-[64px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}
