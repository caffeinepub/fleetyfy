import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Side, SideName, Trip, Vehicle } from "../backend.d";
import { useActor } from "./useActor";

export function useListVehicles() {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listVehicles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListSides() {
  const { actor, isFetching } = useActor();
  return useQuery<Side[]>({
    queryKey: ["sides"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSides();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSideNames() {
  const { actor, isFetching } = useActor();
  return useQuery<SideName[]>({
    queryKey: ["sideNames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSideNames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTrips() {
  const { actor, isFetching } = useActor();
  return useQuery<Trip[]>({
    queryKey: ["allTrips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyTrips(vehicleId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Trip[]>({
    queryKey: ["myTrips", vehicleId],
    queryFn: async () => {
      if (!actor || !vehicleId) return [];
      return actor.getMyTrips(vehicleId);
    },
    enabled: !!actor && !isFetching && !!vehicleId,
  });
}

export function useGetMyVehicle(vehicleId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle | null>({
    queryKey: ["myVehicle", vehicleId],
    queryFn: async () => {
      if (!actor || !vehicleId) return null;
      return actor.getMyVehicle(vehicleId);
    },
    enabled: !!actor && !isFetching && !!vehicleId,
  });
}

export function useCreateVehicle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      vehicleNumber,
      passwordHash,
      ownerName,
    }: {
      vehicleNumber: string;
      passwordHash: string;
      ownerName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createVehicle(vehicleNumber, passwordHash, ownerName);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      vehicleNumber,
      ownerName,
    }: {
      id: string;
      vehicleNumber: string;
      ownerName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateVehicle(id, vehicleNumber, ownerName);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteVehicle(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useResetVehiclePassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      id,
      newPasswordHash,
    }: {
      id: string;
      newPasswordHash: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.resetVehiclePassword(id, newPasswordHash);
    },
  });
}

export function useCreateSide() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      lead,
      upRate,
      downRate,
    }: {
      name: string;
      lead: bigint;
      upRate: number;
      downRate: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createSide(name, lead, upRate, downRate);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sides"] });
      qc.invalidateQueries({ queryKey: ["sideNames"] });
    },
  });
}

export function useUpdateSide() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      lead,
      upRate,
      downRate,
    }: {
      id: string;
      name: string;
      lead: bigint;
      upRate: number;
      downRate: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSide(id, name, lead, upRate, downRate);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sides"] });
      qc.invalidateQueries({ queryKey: ["sideNames"] });
    },
  });
}

export function useDeleteSide() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSide(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sides"] });
      qc.invalidateQueries({ queryKey: ["sideNames"] });
    },
  });
}

export function useAddTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      vehicleId,
      date,
      sideId,
      weightTons,
      dieselLiters,
      defLiters,
      direction,
    }: {
      vehicleId: string;
      date: string;
      sideId: string;
      weightTons: number;
      dieselLiters: number;
      defLiters: number;
      direction: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTrip(
        vehicleId,
        date,
        sideId,
        weightTons,
        dieselLiters,
        defLiters,
        direction,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTrips"] });
      qc.invalidateQueries({ queryKey: ["myTrips"] });
    },
  });
}

export function useUpdateTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      date,
      sideId,
      weightTons,
      dieselLiters,
      defLiters,
      direction,
    }: {
      id: string;
      date: string;
      sideId: string;
      weightTons: number;
      dieselLiters: number;
      defLiters: number;
      direction: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTrip(
        id,
        date,
        sideId,
        weightTons,
        dieselLiters,
        defLiters,
        direction,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTrips"] });
      qc.invalidateQueries({ queryKey: ["myTrips"] });
    },
  });
}

export function useDeleteTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTrip(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTrips"] });
      qc.invalidateQueries({ queryKey: ["myTrips"] });
    },
  });
}

export function useLoginCustomer() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      vehicleNumber,
      passwordHash,
    }: {
      vehicleNumber: string;
      passwordHash: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.loginCustomer(vehicleNumber, passwordHash);
    },
  });
}
