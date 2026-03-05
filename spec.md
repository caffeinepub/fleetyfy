# Fleetyfy

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add

**Authentication**
- Admin login (fixed admin credentials)
- Customer login using vehicle number + password (credentials created by admin)

**Admin Panel**
- Dashboard with overview of all vehicles and trips
- Vehicle management: create vehicles, assign vehicle number + password to customer
- Side (route) management: add/edit sides with fields: side name, lead (km), up-rate, down-rate (all invisible to customer except side name)
- When admin enters side details, those sides appear as selectable options in trip entry
- Trip entry form per vehicle: date, vehicle number, side (dropdown), weight (tons), diesel consumed (liters), DEF consumed (liters)
- Per trip income auto-calculated: income = side rate × ton (side rate = up-rate or down-rate based on direction, or total up-down rate as configured)
- Edit/delete trips
- Edit/delete sides
- Export reports: Excel (.xlsx) and PDF for any vehicle or date range

**Customer Panel (read-only)**
- Login with vehicle number + password
- Daily trip report for own vehicle
- Full trip history
- Per trip: date, side, weight, diesel consumed, DEF consumed, trip income
- Totals: total diesel consumption, total DEF consumption, total income
- Vehicle running side details

**Company Info (footer/about)**
- Office address: Jharsuguda 768201, Vedanta Road
- Customer care: 7735665622
- Email: unitedmissioncorporation.jsg@gmail.com

### Modify
None (new project)

### Remove
None (new project)

## Implementation Plan

**Backend (Motoko)**
- Data types: Vehicle, Side, Trip
- Vehicle: id, vehicleNumber, passwordHash, ownerName
- Side: id, name, lead, upRate, downRate (rates stored but only name shown to customers)
- Trip: id, vehicleId, date, sideId, weightTons, dieselLiters, defLiters, incomeCalculated
- Admin functions: createVehicle, updateVehicle, deleteVehicle, listVehicles
- Admin functions: createSide, updateSide, deleteSide, listSides (with full rate details)
- Admin functions: addTrip, updateTrip, deleteTrip, getTripsForVehicle, getAllTrips
- Customer functions: loginCustomer (vehicle number + password), getMyTrips, getMyVehicle, getSideNames
- Report export: getTripsForExport (admin only, returns structured data for frontend to render as Excel/PDF)
- Income calculation: incomeCalculated = upRate × weightTons (configurable per side direction)

**Frontend**
- Mobile-first layout, premium dark theme
- Login screen: two paths — Admin login, Customer login (by vehicle number)
- Admin layout: sidebar/bottom nav with sections: Dashboard, Vehicles, Sides, Trips, Reports
- Customer layout: bottom nav with sections: Today, History, Summary
- Trip entry: dropdown of side names, weight input, diesel input, DEF input, auto-show calculated income
- Reports page: filter by vehicle + date range, export Excel and PDF buttons (client-side generation using xlsx + jsPDF libraries)
- Company info footer on login screen and about page
