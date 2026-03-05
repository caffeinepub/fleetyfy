import { Truck } from "lucide-react";
import { getVehicleNumber } from "../utils/auth";

interface DriverHeaderProps {
  title: string;
}

export function DriverHeader({ title }: DriverHeaderProps) {
  const vehicleNum = getVehicleNumber();

  return (
    <header className="header-bar sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.22 250), oklch(0.55 0.24 260))",
          }}
        >
          <Truck className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-base text-gradient-blue">
            Fleetyfy
          </span>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
      {vehicleNum && (
        <div className="px-2.5 py-1 rounded-lg bg-fleet-blue/10 border border-fleet-blue/20">
          <span className="text-xs font-mono font-bold text-fleet-blue">
            {vehicleNum}
          </span>
        </div>
      )}
    </header>
  );
}
