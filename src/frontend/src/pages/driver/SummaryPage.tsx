import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Fuel,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Route,
  Truck,
  Weight,
} from "lucide-react";
import { useMemo } from "react";
import type { Trip } from "../../backend.d";
import { DriverHeader } from "../../components/DriverHeader";
import { useGetMyTrips, useGetMyVehicle } from "../../hooks/useQueries";
import { getVehicleId, getVehicleNumber } from "../../utils/auth";

export default function SummaryPage() {
  const vehicleId = getVehicleId();
  const { data: trips = [], isLoading } = useGetMyTrips(vehicleId);
  const { data: vehicle } = useGetMyVehicle(vehicleId);

  const stats = useMemo(() => {
    const totalIncome = trips.reduce(
      (s: number, t: Trip) => s + (t.incomeCalculated || 0),
      0,
    );
    const totalDiesel = trips.reduce(
      (s: number, t: Trip) => s + (t.dieselLiters || 0),
      0,
    );
    const totalDef = trips.reduce(
      (s: number, t: Trip) => s + (t.defLiters || 0),
      0,
    );
    const totalWeight = trips.reduce(
      (s: number, t: Trip) => s + (t.weightTons || 0),
      0,
    );

    const upTrips = trips.filter((t: Trip) => t.direction === "Up").length;
    const downTrips = trips.filter((t: Trip) => t.direction === "Down").length;

    // Monthly breakdown for current month
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTrips = trips.filter((t: Trip) => t.date.startsWith(thisMonth));
    const monthIncome = monthTrips.reduce(
      (s: number, t: Trip) => s + (t.incomeCalculated || 0),
      0,
    );
    const monthDiesel = monthTrips.reduce(
      (s: number, t: Trip) => s + (t.dieselLiters || 0),
      0,
    );

    return {
      totalIncome,
      totalDiesel,
      totalDef,
      totalWeight,
      totalTrips: trips.length,
      upTrips,
      downTrips,
      monthIncome,
      monthDiesel,
      monthTripCount: monthTrips.length,
    };
  }, [trips]);

  return (
    <div className="pb-24 min-h-screen">
      <DriverHeader title="Summary" />

      <div className="px-4 pt-4 space-y-4">
        {/* Vehicle info */}
        <div className="card-gradient-blue rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-fleet-blue/20 flex items-center justify-center">
            <Truck className="w-6 h-6 text-fleet-blue" />
          </div>
          <div>
            <p className="font-display font-black text-xl text-fleet-blue font-mono">
              {getVehicleNumber() || "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              {vehicle?.ownerName || "Driver"}
            </p>
          </div>
        </div>

        {/* All-time stats */}
        <div>
          <h2 className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest mb-3">
            All-Time Statistics
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <SummaryCard
                icon={Route}
                label="Total Trips"
                value={String(stats.totalTrips)}
                sub={`${stats.upTrips}↑ ${stats.downTrips}↓`}
                variant="blue"
              />
              <SummaryCard
                icon={IndianRupee}
                label="Total Income"
                value={`₹${stats.totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                variant="amber"
              />
              <SummaryCard
                icon={Fuel}
                label="Total Diesel"
                value={`${stats.totalDiesel.toFixed(1)}L`}
                variant="green"
              />
              <SummaryCard
                icon={Fuel}
                label="Total DEF"
                value={`${stats.totalDef.toFixed(1)}L`}
                variant="default"
              />
            </div>
          )}
        </div>

        {/* This month */}
        {!isLoading && stats.monthTripCount > 0 && (
          <div>
            <h2 className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest mb-3">
              This Month
            </h2>
            <div className="card-gradient rounded-xl p-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Trips
                </p>
                <p className="font-display font-black text-2xl">
                  {stats.monthTripCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Diesel
                </p>
                <p className="font-display font-black text-2xl text-fleet-green">
                  {stats.monthDiesel.toFixed(0)}
                  <span className="text-sm">L</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Income
                </p>
                <p className="font-display font-black text-lg text-fleet-amber">
                  ₹
                  {stats.monthIncome.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Company info */}
        <div className="card-gradient rounded-xl p-4 space-y-3 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-fleet-blue/10 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5 text-fleet-blue" />
            </div>
            <p className="font-display font-bold text-sm">
              United Mission Corporation
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                Vedanta Road, Jharsuguda 768201
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a href="tel:7735665622" className="text-fleet-blue">
                7735665622
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a
                href="mailto:unitedmissioncorporation.jsg@gmail.com"
                className="text-fleet-blue text-xs break-all"
              >
                unitedmissioncorporation.jsg@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 px-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fleet-blue hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
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
    <div className={`${variantClass} rounded-xl p-3 shadow-card-elevated`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
      </div>
      <p className="font-display font-black text-xl leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
