import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ChevronDown,
  Edit2,
  Filter,
  Fuel,
  IndianRupee,
  Loader2,
  Plus,
  Route,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Side, Trip, Vehicle } from "../../backend.d";
import { AdminHeader } from "../../components/AdminHeader";
import {
  useAddTrip,
  useDeleteTrip,
  useGetAllTrips,
  useListSides,
  useListVehicles,
  useUpdateTrip,
} from "../../hooks/useQueries";

const today = new Date().toISOString().split("T")[0];

type TripForm = {
  vehicleId: string;
  date: string;
  sideId: string;
  weightTons: string;
  dieselLiters: string;
  defLiters: string;
  direction: string;
};

const emptyForm: TripForm = {
  vehicleId: "",
  date: today,
  sideId: "",
  weightTons: "",
  dieselLiters: "",
  defLiters: "",
  direction: "Up",
};

function calcIncome(
  sides: Side[],
  sideId: string,
  direction: string,
  weight: number,
): number {
  const side = sides.find((s) => s.id === sideId);
  if (!side) return 0;
  const rate = direction === "Up" ? side.upRate : side.downRate;
  return rate * weight;
}

export default function TripsPage() {
  const { data: vehicles = [], isLoading: vLoading } = useListVehicles();
  const { data: sides = [], isLoading: sLoading } = useListSides();
  const { data: trips = [], isLoading: tLoading } = useGetAllTrips();
  const addMutation = useAddTrip();
  const updateMutation = useUpdateTrip();
  const deleteMutation = useDeleteTrip();

  const [addOpen, setAddOpen] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [deleteTrip, setDeleteTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState<TripForm>(emptyForm);
  const [editForm, setEditForm] = useState<TripForm>(emptyForm);
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const previewIncome = useMemo(
    () =>
      calcIncome(
        sides,
        form.sideId,
        form.direction,
        Number.parseFloat(form.weightTons) || 0,
      ),
    [sides, form.sideId, form.direction, form.weightTons],
  );

  const editPreviewIncome = useMemo(
    () =>
      calcIncome(
        sides,
        editForm.sideId,
        editForm.direction,
        Number.parseFloat(editForm.weightTons) || 0,
      ),
    [sides, editForm.sideId, editForm.direction, editForm.weightTons],
  );

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.sideId || !form.weightTons) {
      toast.error("Vehicle, side, and weight are required");
      return;
    }
    try {
      await addMutation.mutateAsync({
        vehicleId: form.vehicleId,
        date: form.date,
        sideId: form.sideId,
        weightTons: Number.parseFloat(form.weightTons),
        dieselLiters: Number.parseFloat(form.dieselLiters) || 0,
        defLiters: Number.parseFloat(form.defLiters) || 0,
        direction: form.direction,
      });
      toast.success("Trip added successfully");
      setAddOpen(false);
      setForm(emptyForm);
    } catch {
      toast.error("Failed to add trip");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTrip || !editForm.sideId || !editForm.weightTons) {
      toast.error("Side and weight are required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editTrip.id,
        date: editForm.date,
        sideId: editForm.sideId,
        weightTons: Number.parseFloat(editForm.weightTons),
        dieselLiters: Number.parseFloat(editForm.dieselLiters) || 0,
        defLiters: Number.parseFloat(editForm.defLiters) || 0,
        direction: editForm.direction,
      });
      toast.success("Trip updated");
      setEditTrip(null);
    } catch {
      toast.error("Failed to update trip");
    }
  };

  const handleDelete = async () => {
    if (!deleteTrip) return;
    try {
      await deleteMutation.mutateAsync(deleteTrip.id);
      toast.success("Trip deleted");
      setDeleteTrip(null);
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  const openEdit = (trip: Trip) => {
    setEditTrip(trip);
    setEditForm({
      vehicleId: trip.vehicleId,
      date: trip.date,
      sideId: trip.sideId,
      weightTons: trip.weightTons.toString(),
      dieselLiters: trip.dieselLiters.toString(),
      defLiters: trip.defLiters.toString(),
      direction: trip.direction,
    });
  };

  const getVehicleNumber = (vehicleId: string) =>
    vehicles.find((v: Vehicle) => v.id === vehicleId)?.vehicleNumber ||
    vehicleId;

  const isLoading = vLoading || sLoading || tLoading;

  return (
    <div className="pb-20">
      <AdminHeader title="Trips" subtitle="Manage Trip Records" />

      <div className="px-4 pt-4 space-y-4">
        {/* Add Trip Button */}
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-widest">
            {filteredTrips.length} Trip{filteredTrips.length !== 1 ? "s" : ""}
          </h2>
          <Button
            onClick={() => setAddOpen(true)}
            className="btn-primary h-9 px-4 gap-1.5"
            data-ocid="trips.add_button"
          >
            <Plus className="w-4 h-4" />
            Add Trip
          </Button>
        </div>

        {/* Filters */}
        <div className="card-gradient rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Filter className="w-3 h-3" />
            Filters
          </div>
          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger
              className="input-dark h-9"
              data-ocid="trips.vehicle_select"
            >
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
        </div>

        {/* Trip List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div
            className="card-gradient rounded-2xl p-8 text-center"
            data-ocid="trips.empty_state"
          >
            <Route className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No trips found</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filteredTrips.map((trip: Trip, idx: number) => (
              <div
                key={trip.id}
                className="card-gradient rounded-xl p-4"
                data-ocid={`trips.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-display font-bold text-sm">
                      {trip.sideName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {getVehicleNumber(trip.vehicleId)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`stat-pill text-[10px] ${trip.direction === "Up" ? "bg-fleet-green/15 text-fleet-green" : "bg-fleet-blue/15 text-fleet-blue"}`}
                    >
                      {trip.direction}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-fleet-amber"
                      onClick={() => openEdit(trip)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => setDeleteTrip(trip)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{trip.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {trip.weightTons}T
                    </span>
                    <span className="text-muted-foreground">
                      <Fuel className="w-3 h-3 inline mr-0.5" />
                      {trip.dieselLiters}L
                    </span>
                    <span className="font-bold text-fleet-amber">
                      ₹{(trip.incomeCalculated || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Trip Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Add Trip
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Vehicle
              </Label>
              <Select
                value={form.vehicleId}
                onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v }))}
              >
                <SelectTrigger
                  className="input-dark"
                  data-ocid="trips.vehicle_select"
                >
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-fleet-dark-2">
                  {vehicles.map((v: Vehicle) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicleNumber} — {v.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Side (Route)
              </Label>
              <Select
                value={form.sideId}
                onValueChange={(v) => setForm((f) => ({ ...f, sideId: v }))}
              >
                <SelectTrigger
                  className="input-dark"
                  data-ocid="trips.side_select"
                >
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent className="bg-fleet-dark-2">
                  {sides.map((s: Side) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Direction
              </Label>
              <ToggleGroup
                type="single"
                value={form.direction}
                onValueChange={(v) =>
                  v && setForm((f) => ({ ...f, direction: v }))
                }
                className="justify-start gap-2"
                data-ocid="trips.direction_toggle"
              >
                <ToggleGroupItem
                  value="Up"
                  className="flex-1 data-[state=on]:bg-fleet-green/20 data-[state=on]:text-fleet-green data-[state=on]:border-fleet-green/30 border border-border"
                >
                  ↑ Up
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Down"
                  className="flex-1 data-[state=on]:bg-fleet-blue/20 data-[state=on]:text-fleet-blue data-[state=on]:border-fleet-blue/30 border border-border"
                >
                  ↓ Down
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Weight (Tons)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 25.5"
                  value={form.weightTons}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, weightTons: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Diesel (L)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 120"
                  value={form.dieselLiters}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dieselLiters: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                DEF (L)
              </Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 5"
                value={form.defLiters}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defLiters: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            {/* Income Preview */}
            {form.sideId && form.weightTons && (
              <div className="card-gradient-amber rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Calculated Income
                </p>
                <p className="font-display font-black text-2xl text-fleet-amber">
                  ₹
                  {previewIncome.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setAddOpen(false)}
                data-ocid="trips.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={addMutation.isPending}
                data-ocid="trips.submit_button"
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add Trip"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={!!editTrip} onOpenChange={(o) => !o && setEditTrip(null)}>
        <DialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Edit Trip
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, date: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Side (Route)
              </Label>
              <Select
                value={editForm.sideId}
                onValueChange={(v) => setEditForm((f) => ({ ...f, sideId: v }))}
              >
                <SelectTrigger className="input-dark">
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent className="bg-fleet-dark-2">
                  {sides.map((s: Side) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Direction
              </Label>
              <ToggleGroup
                type="single"
                value={editForm.direction}
                onValueChange={(v) =>
                  v && setEditForm((f) => ({ ...f, direction: v }))
                }
                className="justify-start gap-2"
              >
                <ToggleGroupItem
                  value="Up"
                  className="flex-1 data-[state=on]:bg-fleet-green/20 data-[state=on]:text-fleet-green border border-border"
                >
                  ↑ Up
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Down"
                  className="flex-1 data-[state=on]:bg-fleet-blue/20 data-[state=on]:text-fleet-blue border border-border"
                >
                  ↓ Down
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Weight (Tons)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.weightTons}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, weightTons: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Diesel (L)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editForm.dieselLiters}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, dieselLiters: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                DEF (L)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={editForm.defLiters}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, defLiters: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            {editForm.sideId && editForm.weightTons && (
              <div className="card-gradient-amber rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Calculated Income
                </p>
                <p className="font-display font-black text-2xl text-fleet-amber">
                  ₹
                  {editPreviewIncome.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditTrip(null)}
                data-ocid="trips.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={updateMutation.isPending}
                data-ocid="trips.submit_button"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTrip}
        onOpenChange={(o) => !o && setDeleteTrip(null)}
      >
        <AlertDialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete trip for <strong>{deleteTrip?.sideName}</strong> on{" "}
              {deleteTrip?.date}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="trips.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="trips.delete_button.1"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
