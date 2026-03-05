import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Trip {
    id: string;
    direction: string;
    sideName: string;
    date: string;
    createdAt: Time;
    createdBy: Principal;
    weightTons: number;
    dieselLiters: number;
    defLiters: number;
    sideId: string;
    incomeCalculated: number;
    vehicleId: string;
}
export type Time = bigint;
export interface Side {
    id: string;
    lead: bigint;
    name: string;
    isActive: boolean;
    upRate: number;
    downRate: number;
}
export interface LoginResult {
    success: boolean;
    vehicleId: string;
}
export interface SideName {
    id: string;
    name: string;
}
export interface Vehicle {
    id: string;
    ownerName: string;
    vehicleNumber: string;
    createdAt: Time;
    passwordHash: string;
}
export interface UserProfile {
    name: string;
    vehicleId?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTrip(vehicleId: string, date: string, sideId: string, weightTons: number, dieselLiters: number, defLiters: number, direction: string): Promise<Trip>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSide(name: string, lead: bigint, upRate: number, downRate: number): Promise<Side>;
    createVehicle(vehicleNumber: string, passwordHash: string, ownerName: string): Promise<Vehicle>;
    deleteSide(id: string): Promise<boolean>;
    deleteTrip(id: string): Promise<boolean>;
    deleteVehicle(id: string): Promise<boolean>;
    getAllTrips(): Promise<Array<Trip>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyTrips(vehicleId: string): Promise<Array<Trip>>;
    getMyVehicle(vehicleId: string): Promise<Vehicle>;
    getSideNames(): Promise<Array<SideName>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listSides(): Promise<Array<Side>>;
    listVehicles(): Promise<Array<Vehicle>>;
    loginCustomer(vehicleNumber: string, passwordHash: string): Promise<LoginResult>;
    resetVehiclePassword(id: string, newPasswordHash: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateSide(id: string, name: string, lead: bigint, upRate: number, downRate: number): Promise<Side>;
    updateTrip(id: string, date: string, sideId: string, weightTons: number, dieselLiters: number, defLiters: number, direction: string): Promise<Trip>;
    updateVehicle(id: string, vehicleNumber: string, ownerName: string): Promise<Vehicle>;
}
