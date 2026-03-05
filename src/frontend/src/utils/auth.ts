export const AUTH_KEYS = {
  IS_ADMIN: "fleetyfy_isAdmin",
  VEHICLE_ID: "fleetyfy_vehicleId",
  VEHICLE_NUMBER: "fleetyfy_vehicleNumber",
} as const;

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEYS.IS_ADMIN) === "true";
}

export function isDriverLoggedIn(): boolean {
  return !!localStorage.getItem(AUTH_KEYS.VEHICLE_ID);
}

export function getVehicleId(): string | null {
  return localStorage.getItem(AUTH_KEYS.VEHICLE_ID);
}

export function getVehicleNumber(): string | null {
  return localStorage.getItem(AUTH_KEYS.VEHICLE_NUMBER);
}

export function loginAsAdmin(): void {
  localStorage.setItem(AUTH_KEYS.IS_ADMIN, "true");
}

export function loginAsDriver(vehicleId: string, vehicleNumber: string): void {
  localStorage.setItem(AUTH_KEYS.VEHICLE_ID, vehicleId);
  localStorage.setItem(AUTH_KEYS.VEHICLE_NUMBER, vehicleNumber);
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEYS.IS_ADMIN);
  localStorage.removeItem(AUTH_KEYS.VEHICLE_ID);
  localStorage.removeItem(AUTH_KEYS.VEHICLE_NUMBER);
}
