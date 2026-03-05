import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Fuel,
  IndianRupee,
  Loader2,
  Route,
  Weight,
} from "lucide-react";
import { useMemo } from "react";
import type { Trip } from "../../backend.d";
import { DriverHeader } from "../../components/DriverHeader";
import { useGetMyTrips } from "../../hooks/useQueries";
import { getVehicleId } from "../../utils/auth";

export default function TodayPage() {
  const vehicleId = getVehicleId();
  const { data: trips = [], isLoading } = useGetMyTrips(vehicleId);

  const today = new Date().toISOString().split("T")[0];
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const todayTrips = useMemo(
    () => trips.filter((t: Trip) => t.date === today),
    [trips, today],
  );

  const totals = useMemo(
    () => ({
      income: todayTrips.reduce(
        (s: number, t: Trip) => s + (t.incomeCalculated || 0),
        0,
      ),
      diesel: todayTrips.reduce(
        (s: number, t: Trip) => s + (t.dieselLiters || 0),
        0,
      ),
      def: todayTrips.reduce((s: number, t: Trip) => s + (t.defLiters || 0), 0),
      weight: todayTrips.reduce(
        (s: number, t: Trip) => s + (t.weightTons || 0),
        0,
      ),
    }),
    [todayTrips],
  );

  return (
    <div className="pb-20 min-h-screen">
      <DriverHeader title="Today's Trips" />

      <div className="px-4 pt-4 space-y-4">
        {/* Date header */}
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-fleet-blue" />
          <div>
            <p className="font-display font-bold text-sm">{todayLabel}</p>
            <p className="text-xs text-muted-foreground">
              {todayTrips.length} trip{todayTrips.length !== 1 ? "s" : ""} today
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : todayTrips.length === 0 ? (
          <div
            className="card-gradient rounded-2xl p-10 text-center mt-8"
            data-ocid="driver.today.empty_state"
          >
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-sm text-foreground">
              No trips recorded today
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your trips will appear here once the admin adds them.
            </p>
          </div>
        ) : (
          <>
            {/* Today's trip cards */}
            <div className="space-y-3 animate-fade-in">
              {todayTrips.map((trip: Trip, idx: number) => (
                <TripCard key={trip.id} trip={trip} index={idx + 1} />
              ))}
            </div>

            {/* Daily totals */}
            {todayTrips.length > 0 && (
              <div className="card-gradient-amber rounded-2xl p-4 mt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Today's Totals
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Income</p>
                    <p className="font-display font-black text-xl text-fleet-amber">
                      ₹{totals.income.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Weight</p>
                    <p className="font-display font-black text-xl">
                      {totals.weight.toFixed(1)} T
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Diesel</p>
                    <p className="font-bold text-sm text-fleet-green">
                      {totals.diesel.toFixed(1)} L
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">DEF</p>
                    <p className="font-bold text-sm text-fleet-blue-light">
                      {totals.def.toFixed(1)} L
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, index }: { trip: Trip; index: number }) {
  return (
    <div
      className="card-gradient rounded-xl p-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
      data-ocid={`driver.today.item.${index}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-fleet-blue/10 flex items-center justify-center">
            <Route className="w-4 h-4 text-fleet-blue" />
          </div>
          <div>
            <p className="font-display font-bold text-sm">{trip.sideName}</p>
            <span
              className={`stat-pill text-[10px] ${
                trip.direction === "Up"
                  ? "bg-fleet-green/15 text-fleet-green"
                  : "bg-fleet-blue/15 text-fleet-blue"
              }`}
            >
              {trip.direction === "Up" ? "↑" : "↓"} {trip.direction}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-black text-xl text-fleet-amber">
            ₹{(trip.incomeCalculated || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-muted-foreground">income</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <DataPill icon={Weight} label="Weight" value={`${trip.weightTons}T`} />
        <DataPill
          icon={Fuel}
          label="Diesel"
          value={`${trip.dieselLiters}L`}
          color="green"
        />
        <DataPill
          icon={Fuel}
          label="DEF"
          value={`${trip.defLiters}L`}
          color="blue"
        />
      </div>
    </div>
  );
}

function DataPill({
  label,
  value,
  color = "default",
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
  color?: "green" | "blue" | "default";
}) {
  const colorClass = {
    green: "text-fleet-green",
    blue: "text-fleet-blue-light",
    default: "text-foreground",
  }[color];

  return (
    <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={`font-bold text-xs ${colorClass}`}>{value}</p>
    </div>
  );
}
