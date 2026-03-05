import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Fuel,
  IndianRupee,
  Route,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useMemo } from "react";
import type { Trip } from "../../backend.d";
import { AdminHeader } from "../../components/AdminHeader";
import { useGetAllTrips, useListVehicles } from "../../hooks/useQueries";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  variant = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  variant?: "blue" | "amber" | "green" | "default";
}) {
  const variantClass = {
    blue: "card-gradient-blue",
    amber: "card-gradient-amber",
    green: "card-gradient-green",
    default: "card-gradient",
  }[variant];

  const iconColor = {
    blue: "text-fleet-blue",
    amber: "text-fleet-amber",
    green: "text-fleet-green",
    default: "text-muted-foreground",
  }[variant];

  return (
    <div
      className={`${variantClass} rounded-2xl p-4 shadow-card-elevated animate-fade-in-up`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="font-display font-black text-3xl text-foreground leading-none">
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: vehicles = [], isLoading: vLoading } = useListVehicles();
  const { data: trips = [], isLoading: tLoading } = useGetAllTrips();
  const isLoading = vLoading || tLoading;

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayTrips = trips.filter((t: Trip) => t.date === today);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTrips = trips.filter((t: Trip) => t.date.startsWith(thisMonth));
    const monthIncome = monthTrips.reduce(
      (sum: number, t: Trip) => sum + (t.incomeCalculated || 0),
      0,
    );
    const totalDiesel = trips.reduce(
      (sum: number, t: Trip) => sum + (t.dieselLiters || 0),
      0,
    );
    const totalDef = trips.reduce(
      (sum: number, t: Trip) => sum + (t.defLiters || 0),
      0,
    );

    return {
      totalVehicles: vehicles.length,
      todayTrips: todayTrips.length,
      monthIncome,
      totalDiesel,
      totalDef,
      totalTrips: trips.length,
    };
  }, [vehicles, trips, today]);

  const recentTrips = useMemo(
    () => [...trips].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [trips],
  );

  return (
    <div className="pb-20">
      <AdminHeader title="Dashboard" subtitle="Overview & Statistics" />

      <div className="px-4 pt-4 space-y-4">
        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Truck}
                label="Total Vehicles"
                value={stats.totalVehicles}
                variant="blue"
              />
              <StatCard
                icon={Route}
                label="Today's Trips"
                value={stats.todayTrips}
                variant="amber"
              />
              <StatCard
                icon={IndianRupee}
                label="Month Income"
                value={`₹${stats.monthIncome.toLocaleString("en-IN")}`}
                variant="green"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Trips"
                value={stats.totalTrips}
                variant="default"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Fuel}
                label="Total Diesel"
                value={`${stats.totalDiesel.toFixed(0)}L`}
                sub="All time"
                variant="default"
              />
              <StatCard
                icon={Fuel}
                label="Total DEF"
                value={`${stats.totalDef.toFixed(0)}L`}
                sub="All time"
                variant="default"
              />
            </div>
          </>
        )}

        {/* Recent Trips */}
        <div className="mt-2">
          <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-widest mb-3">
            Recent Trips
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : recentTrips.length === 0 ? (
            <div
              className="card-gradient rounded-2xl p-6 text-center"
              data-ocid="trips.empty_state"
            >
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No trips recorded yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTrips.map((trip: Trip, idx: number) => (
                <div
                  key={trip.id}
                  className="card-gradient rounded-xl p-3 flex items-center gap-3"
                  data-ocid={`trips.item.${idx + 1}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-fleet-blue/10 flex items-center justify-center flex-shrink-0">
                    <Route className="w-4 h-4 text-fleet-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {trip.sideName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trip.date} · {trip.direction} · {trip.weightTons}T
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-fleet-amber text-sm">
                      ₹{(trip.incomeCalculated || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trip.dieselLiters}L
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
