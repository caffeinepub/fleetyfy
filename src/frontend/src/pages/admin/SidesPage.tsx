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
  ChevronRight,
  Edit2,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Side } from "../../backend.d";
import { AdminHeader } from "../../components/AdminHeader";
import {
  useCreateSide,
  useDeleteSide,
  useListSides,
  useUpdateSide,
} from "../../hooks/useQueries";

export default function SidesPage() {
  const { data: sides = [], isLoading } = useListSides();
  const createMutation = useCreateSide();
  const updateMutation = useUpdateSide();
  const deleteMutation = useDeleteSide();

  const [addOpen, setAddOpen] = useState(false);
  const [editSide, setEditSide] = useState<Side | null>(null);
  const [deleteSide, setDeleteSide] = useState<Side | null>(null);

  const emptyForm = { name: "", lead: "", upRate: "", downRate: "" };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.lead || !form.upRate || !form.downRate) {
      toast.error("All fields are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: form.name,
        lead: BigInt(Math.round(Number.parseFloat(form.lead))),
        upRate: Number.parseFloat(form.upRate),
        downRate: Number.parseFloat(form.downRate),
      });
      toast.success("Side added successfully");
      setAddOpen(false);
      setForm(emptyForm);
    } catch {
      toast.error("Failed to add side");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSide) return;
    if (
      !editForm.name ||
      !editForm.lead ||
      !editForm.upRate ||
      !editForm.downRate
    ) {
      toast.error("All fields are required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editSide.id,
        name: editForm.name,
        lead: BigInt(Math.round(Number.parseFloat(editForm.lead))),
        upRate: Number.parseFloat(editForm.upRate),
        downRate: Number.parseFloat(editForm.downRate),
      });
      toast.success("Side updated");
      setEditSide(null);
    } catch {
      toast.error("Failed to update side");
    }
  };

  const handleDelete = async () => {
    if (!deleteSide) return;
    try {
      await deleteMutation.mutateAsync(deleteSide.id);
      toast.success("Side deleted");
      setDeleteSide(null);
    } catch {
      toast.error("Failed to delete side");
    }
  };

  const openEdit = (side: Side) => {
    setEditSide(side);
    setEditForm({
      name: side.name,
      lead: side.lead.toString(),
      upRate: side.upRate.toString(),
      downRate: side.downRate.toString(),
    });
  };

  return (
    <div className="pb-20">
      <AdminHeader title="Sides" subtitle="Route Sides & Rates" />

      <div className="px-4 pt-4 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Rate info is admin-only and hidden from drivers
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="btn-primary h-9 px-4 gap-1.5"
            data-ocid="sides.add_button"
          >
            <Plus className="w-4 h-4" />
            Add Side
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : sides.length === 0 ? (
          <div
            className="card-gradient rounded-2xl p-8 text-center"
            data-ocid="sides.empty_state"
          >
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No sides configured yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add your first route side to start tracking trips
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {sides.map((side: Side, idx: number) => (
              <div
                key={side.id}
                className="card-gradient rounded-xl p-4"
                data-ocid={`sides.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-fleet-amber/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-fleet-amber" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm">
                        {side.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lead: {side.lead.toString()} km
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-fleet-amber"
                      onClick={() => openEdit(side)}
                      data-ocid={`sides.edit_button.${idx + 1}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => setDeleteSide(side)}
                      data-ocid={`sides.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-fleet-green/10 rounded-lg px-3 py-2 border border-fleet-green/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Up Rate
                    </p>
                    <p className="font-bold text-fleet-green text-sm">
                      ₹{side.upRate}/ton
                    </p>
                  </div>
                  <div className="bg-fleet-blue/10 rounded-lg px-3 py-2 border border-fleet-blue/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Down Rate
                    </p>
                    <p className="font-bold text-fleet-blue text-sm">
                      ₹{side.downRate}/ton
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Side Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Add New Side
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Side Name
              </Label>
              <Input
                placeholder="e.g. Jharsuguda — Rourkela"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="input-dark"
                data-ocid="sides.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Lead (km)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 85"
                value={form.lead}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lead: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Up Rate (₹/ton)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 250"
                  value={form.upRate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, upRate: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Down Rate (₹/ton)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 180"
                  value={form.downRate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, downRate: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setAddOpen(false)}
                data-ocid="sides.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={createMutation.isPending}
                data-ocid="sides.save_button"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add Side"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Side Dialog */}
      <Dialog open={!!editSide} onOpenChange={(o) => !o && setEditSide(null)}>
        <DialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Edit Side
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Side Name
              </Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Lead (km)
              </Label>
              <Input
                type="number"
                value={editForm.lead}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, lead: e.target.value }))
                }
                className="input-dark"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Up Rate (₹/ton)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.upRate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, upRate: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Down Rate (₹/ton)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.downRate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, downRate: e.target.value }))
                  }
                  className="input-dark"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditSide(null)}
                data-ocid="sides.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={updateMutation.isPending}
                data-ocid="sides.save_button"
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
        open={!!deleteSide}
        onOpenChange={(o) => !o && setDeleteSide(null)}
      >
        <AlertDialogContent className="bg-fleet-dark-2 border-border mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Side?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteSide?.name}</strong>.
              Existing trips referencing this side won't be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="sides.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="sides.delete_button.1"
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
