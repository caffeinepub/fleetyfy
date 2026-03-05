import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Filter, Fuel, History, Route } from "lucide-react";
import { useMemo, useState } from "react";
import type { Trip } from "../../backend.d";
import { DriverHeader } from "../../components/DriverHeader";
import { useGetMyTrips } from "../../hooks/useQueries";
import { getVehicleId } from "../../utils/auth";

export default function HistoryPage() {
  const vehicleId = getVehicleId();
  const { data: trips = [], isLoading } = useGetMyTrips(vehicleId);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const filteredTrips = useMemo(() => {
    return trips
      .filter((t: Trip) => {
        if (filterFrom && t.date < filterFrom) return false;
        if (filterTo && t.date > filterTo) return false;
        return true;
      })
      .sort((a: Trip, b: Trip) => b.date.localeCompare(a.date));
  }, [trips, filterFrom, filterTo]);

  return (
    <div className="pb-20 min-h-screen">
      <DriverHeader title="Trip History" />

      <div className="px-4 pt-4 space-y-4">
        {/* Filter toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-sm">All Trips</p>
            <p className="text-xs text-muted-foreground">
              {filteredTrips.length} records
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => setShowFilter((s) => !s)}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showFilter ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        {showFilter && (
          <div className="card-gradient rounded-xl p-3 space-y-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  From
                </Label>
                <Input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  className="input-dark h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  To
                </Label>
                <Input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  className="input-dark h-9 text-sm"
                />
              </div>
            </div>
            {(filterFrom || filterTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs w-full"
                onClick={() => {
                  setFilterFrom("");
                  setFilterTo("");
                }}
              >
                Clear Filter
              </Button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div
            className="card-gradient rounded-2xl p-10 text-center mt-4"
            data-ocid="driver.history.empty_state"
          >
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-sm">No trip history found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filterFrom || filterTo
                ? "No trips in selected date range"
                : "Your trip history will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filteredTrips.map((trip: Trip, idx: number) => (
              <HistoryCard key={trip.id} trip={trip} index={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ trip, index }: { trip: Trip; index: number }) {
  const dateLabel = new Date(`${trip.date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div
      className="card-gradient rounded-xl p-4"
      data-ocid={`driver.history.item.${index}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-fleet-blue/10 flex items-center justify-center flex-shrink-0">
            <Route className="w-4 h-4 text-fleet-blue" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">
              {trip.sideName}
            </p>
            <p className="text-xs text-muted-foreground">{dateLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-black text-lg text-fleet-amber leading-tight">
            ₹{(trip.incomeCalculated || 0).toLocaleString("en-IN")}
          </p>
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
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-foreground uppercase">Weight</p>
          <p className="font-bold text-xs">{trip.weightTons}T</p>
        </div>
        <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-foreground uppercase">Diesel</p>
          <p className="font-bold text-xs text-fleet-green">
            {trip.dieselLiters}L
          </p>
        </div>
        <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-muted-foreground uppercase">DEF</p>
          <p className="font-bold text-xs text-fleet-blue-light">
            {trip.defLiters}L
          </p>
        </div>
      </div>
    </div>
  );
}
