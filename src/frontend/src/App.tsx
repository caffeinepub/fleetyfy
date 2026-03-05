import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { isAdminLoggedIn, isDriverLoggedIn } from "./utils/auth";
import { logout } from "./utils/auth";

import { AdminNav } from "./components/AdminNav";
import { DriverNav } from "./components/DriverNav";
// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SidesPage from "./pages/admin/SidesPage";
import TripsPage from "./pages/admin/TripsPage";
import VehiclesPage from "./pages/admin/VehiclesPage";
import HistoryPage from "./pages/driver/HistoryPage";
import SummaryPage from "./pages/driver/SummaryPage";
import TodayPage from "./pages/driver/TodayPage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  ),
});

// Login Route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    if (isAdminLoggedIn()) return <Navigate to="/admin" />;
    if (isDriverLoggedIn()) return <Navigate to="/driver" />;
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div
          className="mobile-container w-full shadow-mobile-outer bg-background relative overflow-hidden"
          style={{ minHeight: "100dvh" }}
        >
          <LoginPage />
        </div>
      </div>
    );
  },
});

// Admin layout
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => {
    if (!isAdminLoggedIn()) return <Navigate to="/" />;
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div
          className="mobile-container w-full shadow-mobile-outer bg-background relative overflow-hidden"
          style={{ minHeight: "100dvh" }}
        >
          <Outlet />
          <AdminNav />
        </div>
      </div>
    );
  },
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: DashboardPage,
});

const adminVehiclesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/vehicles",
  component: VehiclesPage,
});

const adminSidesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/sides",
  component: SidesPage,
});

const adminTripsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/trips",
  component: TripsPage,
});

const adminReportsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/reports",
  component: ReportsPage,
});

// Driver layout
const driverLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver",
  component: () => {
    if (!isDriverLoggedIn()) return <Navigate to="/" />;
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div
          className="mobile-container w-full shadow-mobile-outer bg-background relative overflow-hidden"
          style={{ minHeight: "100dvh" }}
        >
          <Outlet />
          <DriverNav />
        </div>
      </div>
    );
  },
});

const driverIndexRoute = createRoute({
  getParentRoute: () => driverLayoutRoute,
  path: "/",
  component: TodayPage,
});

const driverHistoryRoute = createRoute({
  getParentRoute: () => driverLayoutRoute,
  path: "/history",
  component: HistoryPage,
});

const driverSummaryRoute = createRoute({
  getParentRoute: () => driverLayoutRoute,
  path: "/summary",
  component: SummaryPage,
});

// Catch-all
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Navigate to="/" />,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminVehiclesRoute,
    adminSidesRoute,
    adminTripsRoute,
    adminReportsRoute,
  ]),
  driverLayoutRoute.addChildren([
    driverIndexRoute,
    driverHistoryRoute,
    driverSummaryRoute,
  ]),
  catchAllRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
