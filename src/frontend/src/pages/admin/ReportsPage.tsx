import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Fuel,
  IndianRupee,
  Loader2,
  Route,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Trip, Vehicle } from "../../backend.d";
import { AdminHeader } from "../../components/AdminHeader";
import { useGetAllTrips, useListVehicles } from "../../hooks/useQueries";

const COMPANY_HEADER =
  "Fleetyfy | United Mission Corporation | Vedanta Road, Jharsuguda 768201";
const PHONE = "7735665622";
const EMAIL = "unitedmissioncorporation.jsg@gmail.com";

export default function ReportsPage() {
  const { data: vehicles = [], isLoading: vLoading } = useListVehicles();
  const { data: trips = [], isLoading: tLoading } = useGetAllTrips();

  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const filteredTrips = useMemo(() => {
    return trips
      .filter((t: Trip) => {
        if (filterVehicle !== "all" && t.vehicleId !== filterVehicle)
          return false;
        if (filterFrom && t.date < filterFrom) return false;
        if (filterTo && t.date > filterTo) return false;
        return true;
      })
      .sort((a: Trip, b: Trip) => b.date.localeCompare(a.date));
  }, [trips, filterVehicle, filterFrom, filterTo]);

  const stats = useMemo(() => {
    const totalDiesel = filteredTrips.reduce(
      (s: number, t: Trip) => s + (t.dieselLiters || 0),
      0,
    );
    const totalDef = filteredTrips.reduce(
      (s: number, t: Trip) => s + (t.defLiters || 0),
      0,
    );
    const totalIncome = filteredTrips.reduce(
      (s: number, t: Trip) => s + (t.incomeCalculated || 0),
      0,
    );
    const totalWeight = filteredTrips.reduce(
      (s: number, t: Trip) => s + (t.weightTons || 0),
      0,
    );
    return {
      totalDiesel,
      totalDef,
      totalIncome,
      totalWeight,
      tripCount: filteredTrips.length,
    };
  }, [filteredTrips]);

  const getVehicleNumber = (vehicleId: string) =>
    vehicles.find((v: Vehicle) => v.id === vehicleId)?.vehicleNumber ||
    vehicleId;

  const getVehicleLabel = () => {
    if (filterVehicle === "all") return "All Vehicles";
    const v = vehicles.find((v: Vehicle) => v.id === filterVehicle);
    return v ? `${v.vehicleNumber} — ${v.ownerName}` : filterVehicle;
  };

  const exportToExcel = async () => {
    if (filteredTrips.length === 0) {
      toast.error("No trips to export");
      return;
    }
    setExcelLoading(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        [COMPANY_HEADER],
        [`Phone: ${PHONE}  |  Email: ${EMAIL}`],
        [],
        ["TRIP REPORT SUMMARY"],
        [`Vehicle: ${getVehicleLabel()}`],
        [`Period: ${filterFrom || "All"} to ${filterTo || "All"}`],
        [`Generated: ${new Date().toLocaleString("en-IN")}`],
        [],
        ["Total Trips", stats.tripCount],
        ["Total Weight (Tons)", stats.totalWeight.toFixed(2)],
        ["Total Diesel (L)", stats.totalDiesel.toFixed(2)],
        ["Total DEF (L)", stats.totalDef.toFixed(2)],
        ["Total Income (₹)", stats.totalIncome.toFixed(2)],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // Trips sheet
      const headers = [
        "#",
        "Date",
        "Vehicle No.",
        "Side/Route",
        "Direction",
        "Weight (T)",
        "Diesel (L)",
        "DEF (L)",
        "Income (₹)",
      ];
      const rows = filteredTrips.map((t: Trip, idx: number) => [
        idx + 1,
        t.date,
        getVehicleNumber(t.vehicleId),
        t.sideName,
        t.direction,
        t.weightTons,
        t.dieselLiters,
        t.defLiters,
        (t.incomeCalculated || 0).toFixed(2),
      ]);
      const wsTrips = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, wsTrips, "Trips");

      XLSX.writeFile(
        wb,
        `Fleetyfy_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Excel report downloaded!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate Excel report");
    }
    setExcelLoading(false);
  };

  const exportToPDF = async () => {
    if (filteredTrips.length === 0) {
      toast.error("No trips to export");
      return;
    }
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Header
      doc.setFillColor(18, 22, 40);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("FLEETYFY", 15, 16);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("United Mission Corporation", 15, 23);
      doc.text("Vedanta Road, Jharsuguda 768201", 15, 29);
      doc.text(`Phone: ${PHONE}  |  Email: ${EMAIL}`, 15, 35);

      // Report title
      doc.setTextColor(30, 30, 60);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TRIP REPORT", 15, 52);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 120);
      doc.text(`Vehicle: ${getVehicleLabel()}`, 15, 60);
      doc.text(
        `Period: ${filterFrom || "All"} to ${filterTo || "All"}`,
        15,
        66,
      );
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 15, 72);

      // Summary boxes
      const summaryY = 80;
      const summaryBoxWidth = 42;
      const summaryData = [
        { label: "Trips", value: String(stats.tripCount) },
        { label: "Diesel", value: `${stats.totalDiesel.toFixed(1)}L` },
        { label: "DEF", value: `${stats.totalDef.toFixed(1)}L` },
        { label: "Income", value: `Rs.${stats.totalIncome.toFixed(0)}` },
      ];
      summaryData.forEach((item, i) => {
        const x = 15 + i * (summaryBoxWidth + 3);
        doc.setFillColor(240, 245, 255);
        doc.roundedRect(x, summaryY, summaryBoxWidth, 18, 2, 2, "F");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 140);
        doc.text(item.label.toUpperCase(), x + 3, summaryY + 6);
        doc.setFontSize(11);
        doc.setTextColor(20, 60, 160);
        doc.setFont("helvetica", "bold");
        doc.text(item.value, x + 3, summaryY + 14);
      });

      // Table
      autoTable(doc, {
        startY: summaryY + 26,
        head: [
          [
            "#",
            "Date",
            "Vehicle",
            "Side/Route",
            "Dir.",
            "Weight(T)",
            "Diesel(L)",
            "DEF(L)",
            "Income(₹)",
          ],
        ],
        body: filteredTrips.map((t: Trip, idx: number) => [
          idx + 1,
          t.date,
          getVehicleNumber(t.vehicleId),
          t.sideName,
          t.direction,
          t.weightTons,
          t.dieselLiters,
          t.defLiters,
          (t.incomeCalculated || 0).toFixed(2),
        ]),
        headStyles: {
          fillColor: [20, 40, 100],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [245, 248, 255] },
        footStyles: {
          fillColor: [230, 235, 255],
          fontSize: 8,
          fontStyle: "bold",
        },
        foot: [
          [
            "",
            "",
            "",
            "",
            "TOTAL",
            stats.totalWeight.toFixed(2),
            stats.totalDiesel.toFixed(2),
            stats.totalDef.toFixed(2),
            stats.totalIncome.toFixed(2),
          ],
        ],
        margin: { left: 15, right: 15 },
      });

      doc.save(`Fleetyfy_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF report downloaded!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report");
    }
    setPdfLoading(false);
  };

  const isLoading = vLoading || tLoading;

  return (
    <div className="pb-20">
      <AdminHeader title="Reports" subtitle="Export & Analytics" />

      <div className="px-4 pt-4 space-y-4">
        {/* Filters */}
        <div className="card-gradient rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Filter className="w-3 h-3" />
            Filter Report
          </div>
          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger className="input-dark h-10">
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent className="bg-fleet-dark-2">
              <SelectItem value="all">All Vehicles</SelectItem>
              {vehicles.map((v: Vehicle) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.vehicleNumber} — {v.ownerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                From Date
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
                To Date
              </Label>
              <Input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="input-dark h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <div className="card-gradient-blue rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Route className="w-4 h-4 text-fleet-blue" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Trips
                </span>
              </div>
              <p className="font-display font-black text-2xl">
                {stats.tripCount}
              </p>
            </div>
            <div className="card-gradient-amber rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <IndianRupee className="w-4 h-4 text-fleet-amber" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Income
                </span>
              </div>
              <p className="font-display font-black text-xl text-fleet-amber">
                ₹
                {stats.totalIncome.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="card-gradient rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Fuel className="w-4 h-4 text-fleet-green" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Diesel
                </span>
              </div>
              <p className="font-display font-black text-2xl">
                {stats.totalDiesel.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  L
                </span>
              </p>
            </div>
            <div className="card-gradient rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Fuel className="w-4 h-4 text-fleet-blue-light" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  DEF
                </span>
              </div>
              <p className="font-display font-black text-2xl">
                {stats.totalDef.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  L
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest">
            Export Report
          </h2>
          <Button
            onClick={exportToExcel}
            disabled={excelLoading || filteredTrips.length === 0}
            className="w-full h-12 gap-2 font-semibold text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.5 0.2 160), oklch(0.42 0.22 150))",
            }}
            data-ocid="reports.export_excel_button"
          >
            {excelLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-5 h-5" />
            )}
            {excelLoading
              ? "Generating Excel..."
              : `Export to Excel (${filteredTrips.length} trips)`}
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={pdfLoading || filteredTrips.length === 0}
            className="w-full h-12 gap-2 font-semibold text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.24 25), oklch(0.55 0.26 15))",
            }}
            data-ocid="reports.export_pdf_button"
          >
            {pdfLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            {pdfLoading
              ? "Generating PDF..."
              : `Export to PDF (${filteredTrips.length} trips)`}
          </Button>
        </div>

        {/* Trips preview */}
        {filteredTrips.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-display font-bold text-xs text-muted-foreground uppercase tracking-widest">
              Preview ({filteredTrips.length} trips)
            </h2>
            <div className="space-y-2">
              {filteredTrips.slice(0, 5).map((trip: Trip, idx: number) => (
                <div
                  key={trip.id}
                  className="card-gradient rounded-xl p-3 flex items-center gap-3"
                  data-ocid={`reports.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs">{trip.sideName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {trip.date} · {getVehicleNumber(trip.vehicleId)} ·{" "}
                      {trip.direction}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-fleet-amber text-sm">
                      ₹{(trip.incomeCalculated || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {trip.weightTons}T · {trip.dieselLiters}L
                    </p>
                  </div>
                </div>
              ))}
              {filteredTrips.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{filteredTrips.length - 5} more trips in export
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
