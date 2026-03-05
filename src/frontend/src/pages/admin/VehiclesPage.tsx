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
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Edit2,
  KeyRound,
  Loader2,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Vehicle } from "../../backend.d";
import { AdminHeader } from "../../components/AdminHeader";
import {
  useCreateVehicle,
  useDeleteVehicle,
  useListVehicles,
  useResetVehiclePassword,
  useUpdateVehicle,
} from "../../hooks/useQueries";
import { hashPassword } from "../../utils/crypto";

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useListVehicles();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();
  const resetPwMutation = useResetVehiclePassword();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const [resetVehicle, setResetVehicle] = useState<Vehicle | null>(null);

  const [form, setForm] = useState({
    vehicleNumber: "",
    ownerName: "",
    password: "",
  });
  const [editForm, setEditForm] = useState({
    vehicleNumber: "",
    ownerName: "",
  });
  const [newPassword, setNewPassword] = useState("");

  const filtered = vehicles.filter(
    (v: Vehicle) =>
      v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleNumber || !form.ownerName || !form.password) {
      toast.error("All fields required");
      return;
    }
    try {
      const hash = await hashPassword(form.password);
      await createMutation.mutateAsync({
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        passwordHash: hash,
        ownerName: form.ownerName,
      });
      toast.success("Vehicle added successfully");
      setAddOpen(false);
      setForm({ vehicleNumber: "", ownerName: "", password: "" });
    } catch {
      toast.error("Failed to add vehicle");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVehicle) return;
    if (!editForm.vehicleNumber || !editForm.ownerName) {
      toast.error("All fields required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editVehicle.id,
        vehicleNumber: editForm.vehicleNumber.toUpperCase(),
        ownerName: editForm.ownerName,
      });
      toast.success("Vehicle updated");
      setEditVehicle(null);
    } catch {
      toast.error("Failed to update vehicle");
    }
  };

  const handleDelete = async () => {
    if (!deleteVehicle) return;
    try {
      await deleteMutation.mutateAsync(deleteVehicle.id);
      toast.success("Vehicle deleted");
      setDeleteVehicle(null);
    } catch {
      toast.error("Failed to delete vehicle");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetVehicle || !newPassword) {
      toast.error("New password is required");
      return;
    }
    try {
      const hash = await hashPassword(newPassword);
      await resetPwMutation.mutateAsync({
        id: resetVehicle.id,
        newPasswordHash: hash,
      });
      toast.success("Password reset successfully");
      setResetVehicle(null);
      setNewPassword("");
    } catch {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="pb-20">
      <AdminHeader title="Vehicles" subtitle="Manage Fleet Vehicles" />

      <div className="px-4 pt-4 space-y-4">
        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-9 h-10"
              data-ocid="vehicles.search_input"
            />
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="btn-primary h-10 px-4 gap-1.5"
            data-ocid="vehicles.add_button"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Vehicles list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="card-gradient rounded-2xl p-8 text-center"
            data-ocid="vehicles.empty_state"
          >
            <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search
                ? "No vehicles match your search"
                : "No vehicles added yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filtered.map((vehicle: Vehicle, idx: number) => (
              <div
                key={vehicle.id}
                className="card-gradient rounded-xl p-4 flex items-center gap-3"
                data-ocid={`vehicles.item.${idx + 1}`}
              >
                <div className="w-11 h-11 rounded-xl bg-fleet-blue/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-fleet-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm text-foreground font-mono uppercase">
                    {vehicle.vehicleNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle.ownerName}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    Added{" "}
                    {new Date(
                      Number(vehicle.createdAt) / 1_000_000,
                    ).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-fleet-blue"
                    onClick={() => {
                      setResetVehicle(vehicle);
                      setNewPassword("");
                    }}
                    title="Reset Password"
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-fleet-amber"
                    onClick={() => {
                      setEditVehicle(vehicle);
                      setEditForm({
                        vehicleNumber: vehicle.vehicleNumber,
                        ownerName: vehicle.ownerName,
                      });
                    }}
                    data-ocid={`vehicles.edit_button.${idx + 1}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteVehicle(vehicle)}
                    data-ocid={`vehicles.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Add New Vehicle
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Vehicle Number
              </Label>
              <Input
                placeholder="e.g. OD02AB1234"
                value={form.vehicleNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vehicleNumber: e.target.value }))
                }
                className="input-dark font-mono uppercase"
                data-ocid="vehicles.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Owner Name
              </Label>
              <Input
                placeholder="Owner full name"
                value={form.ownerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ownerName: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                type="password"
                placeholder="Set login password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setAddOpen(false)}
                data-ocid="vehicles.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={createMutation.isPending}
                data-ocid="vehicles.save_button"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add Vehicle"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog
        open={!!editVehicle}
        onOpenChange={(o) => !o && setEditVehicle(null)}
      >
        <DialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Edit Vehicle
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Vehicle Number
              </Label>
              <Input
                value={editForm.vehicleNumber}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, vehicleNumber: e.target.value }))
                }
                className="input-dark font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Owner Name
              </Label>
              <Input
                value={editForm.ownerName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, ownerName: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditVehicle(null)}
                data-ocid="vehicles.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={updateMutation.isPending}
                data-ocid="vehicles.save_button"
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

      {/* Reset Password Dialog */}
      <Dialog
        open={!!resetVehicle}
        onOpenChange={(o) => !o && setResetVehicle(null)}
      >
        <DialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Reset Password
            </DialogTitle>
          </DialogHeader>
          {resetVehicle && (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Reset password for{" "}
                <span className="text-foreground font-mono font-bold">
                  {resetVehicle.vehicleNumber}
                </span>
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  New Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-dark"
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setResetVehicle(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.17 75), oklch(0.48 0.19 60))",
                  }}
                  disabled={resetPwMutation.isPending}
                >
                  {resetPwMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteVehicle}
        onOpenChange={(o) => !o && setDeleteVehicle(null)}
      >
        <AlertDialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteVehicle?.vehicleNumber}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="vehicles.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="vehicles.delete_button.1"
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
