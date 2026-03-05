import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Vehicle = {
    id : Text;
    vehicleNumber : Text;
    passwordHash : Text;
    ownerName : Text;
    createdAt : Time.Time;
  };

  type Side = {
    id : Text;
    name : Text;
    lead : Nat;
    upRate : Float;
    downRate : Float;
    isActive : Bool;
  };

  type Trip = {
    id : Text;
    vehicleId : Text;
    date : Text;
    sideId : Text;
    sideName : Text;
    weightTons : Float;
    dieselLiters : Float;
    defLiters : Float;
    incomeCalculated : Float;
    direction : Text;
    createdAt : Time.Time;
    createdBy : Principal;
  };

  type LoginResult = {
    success : Bool;
    vehicleId : Text;
  };

  type TripSummary = {
    totalDiesel : Float;
    totalDef : Float;
    totalIncome : Float;
    tripCount : Nat;
  };

  type VehicleSummary = {
    vehicle : Vehicle;
    tripSummary : TripSummary;
  };

  type SideName = {
    id : Text;
    name : Text;
  };

  public type UserProfile = {
    name : Text;
    vehicleId : ?Text;
  };

  module Vehicle {
    public func compare(vehicle1 : Vehicle, vehicle2 : Vehicle) : Order.Order {
      Text.compare(vehicle1.id, vehicle2.id);
    };
  };

  module Side {
    public func compare(side1 : Side, side2 : Side) : Order.Order {
      Text.compare(side1.id, side2.id);
    };
  };

  module Trip {
    public func compare(trip1 : Trip, trip2 : Trip) : Order.Order {
      Text.compare(trip1.id, trip2.id);
    };
  };

  module SideName {
    public func compare(sideName1 : SideName, sideName2 : SideName) : Order.Order {
      switch (Text.compare(sideName1.name, sideName2.name)) {
        case (#equal) { Text.compare(sideName1.id, sideName2.id) };
        case (order) { order };
      };
    };
  };

  let vehicles = Map.empty<Text, Vehicle>();
  let vehicleNumberToId = Map.empty<Text, Text>();
  let sides = Map.empty<Text, Side>();
  let trips = Map.empty<Text, Trip>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextVehicleId = 1;
  var nextSideId = 1;
  var nextTripId = 1;

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only vehicle management functions
  public shared ({ caller }) func createVehicle(vehicleNumber : Text, passwordHash : Text, ownerName : Text) : async Vehicle {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create vehicles");
    };

    let id = nextVehicleId.toText();
    let vehicle : Vehicle = {
      id;
      vehicleNumber;
      passwordHash;
      ownerName;
      createdAt = Time.now();
    };

    vehicles.add(id, vehicle);
    vehicleNumberToId.add(vehicleNumber, id);
    nextVehicleId += 1;

    vehicle;
  };

  public shared ({ caller }) func updateVehicle(id : Text, vehicleNumber : Text, ownerName : Text) : async Vehicle {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update vehicles");
    };

    switch (vehicles.get(id)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?existing) {
        let updated : Vehicle = {
          id = existing.id;
          vehicleNumber;
          passwordHash = existing.passwordHash;
          ownerName;
          createdAt = existing.createdAt;
        };

        vehicles.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func resetVehiclePassword(id : Text, newPasswordHash : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset passwords");
    };

    switch (vehicles.get(id)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) {
        let updated : Vehicle = {
          id = vehicle.id;
          vehicleNumber = vehicle.vehicleNumber;
          passwordHash = newPasswordHash;
          ownerName = vehicle.ownerName;
          createdAt = vehicle.createdAt;
        };

        vehicles.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteVehicle(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete vehicles");
    };

    if (not vehicles.containsKey(id)) { return false };
    vehicles.remove(id);
    true;
  };

  public query ({ caller }) func listVehicles() : async [Vehicle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all vehicles");
    };

    vehicles.values().toArray().sort();
  };

  // Admin-only side management functions
  public shared ({ caller }) func createSide(name : Text, lead : Nat, upRate : Float, downRate : Float) : async Side {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create sides");
    };

    let id = nextSideId.toText();
    let side : Side = {
      id;
      name;
      lead;
      upRate;
      downRate;
      isActive = true;
    };

    sides.add(id, side);
    nextSideId += 1;

    side;
  };

  public shared ({ caller }) func updateSide(id : Text, name : Text, lead : Nat, upRate : Float, downRate : Float) : async Side {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update sides");
    };

    switch (sides.get(id)) {
      case (null) { Runtime.trap("Side not found") };
      case (?existing) {
        let updated : Side = {
          id = existing.id;
          name;
          lead;
          upRate;
          downRate;
          isActive = existing.isActive;
        };

        sides.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteSide(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete sides");
    };

    if (not sides.containsKey(id)) { return false };
    sides.remove(id);
    true;
  };

  public query ({ caller }) func listSides() : async [Side] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view side rates");
    };

    sides.values().toArray().sort();
  };

  // Customer function - side names only (no rates)
  public query ({ caller }) func getSideNames() : async [SideName] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view side names");
    };

    sides.values().toArray().map(
      func(side) {
        { id = side.id; name = side.name };
      }
    ).sort();
  };

  // Admin-only trip management functions
  public query ({ caller }) func getAllTrips() : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all trips");
    };

    trips.values().toArray().sort();
  };

  public shared ({ caller }) func addTrip(
    vehicleId : Text,
    date : Text,
    sideId : Text,
    weightTons : Float,
    dieselLiters : Float,
    defLiters : Float,
    direction : Text,
  ) : async Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add trips");
    };

    let tripId = nextTripId.toText();

    let side = switch (sides.get(sideId)) {
      case (null) { Runtime.trap("Side not found") };
      case (?side) { side };
    };

    let incomeCalculated = if (direction == "up") {
      side.upRate * weightTons;
    } else {
      side.downRate * weightTons;
    };

    let trip : Trip = {
      id = tripId;
      vehicleId;
      date;
      sideId;
      sideName = side.name;
      weightTons;
      dieselLiters;
      defLiters;
      incomeCalculated;
      direction;
      createdAt = Time.now();
      createdBy = caller;
    };

    trips.add(tripId, trip);
    nextTripId += 1;

    trip;
  };

  public shared ({ caller }) func updateTrip(
    id : Text,
    date : Text,
    sideId : Text,
    weightTons : Float,
    dieselLiters : Float,
    defLiters : Float,
    direction : Text,
  ) : async Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update trips");
    };

    switch (trips.get(id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?existing) {
        let side = switch (sides.get(sideId)) {
          case (null) { Runtime.trap("Side not found") };
          case (?side) { side };
        };

        let incomeCalculated = if (direction == "up") {
          side.upRate * weightTons;
        } else {
          side.downRate * weightTons;
        };

        let updated : Trip = {
          id = existing.id;
          vehicleId = existing.vehicleId;
          date;
          sideId;
          sideName = side.name;
          weightTons;
          dieselLiters;
          defLiters;
          incomeCalculated;
          direction;
          createdAt = existing.createdAt;
          createdBy = existing.createdBy;
        };

        trips.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteTrip(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete trips");
    };

    if (not trips.containsKey(id)) { return false };
    trips.remove(id);
    true;
  };

  // Public login function (accessible to guests)
  public query ({ caller }) func loginCustomer(vehicleNumber : Text, passwordHash : Text) : async LoginResult {
    switch (vehicleNumberToId.get(vehicleNumber)) {
      case (null) { { success = false; vehicleId = "" } };
      case (?vehicleId) {
        switch (vehicles.get(vehicleId)) {
          case (null) { { success = false; vehicleId = "" } };
          case (?vehicle) {
            if (vehicle.passwordHash == passwordHash) {
              { success = true; vehicleId };
            } else { { success = false; vehicleId = "" } };
          };
        };
      };
    };
  };

  // Customer function - view own trips only
  public query ({ caller }) func getMyTrips(vehicleId : Text) : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view trips");
    };

    // Verify ownership: caller must own this vehicle
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };

    let ownedVehicleId = switch (profile.vehicleId) {
      case (null) { Runtime.trap("No vehicle associated with this user") };
      case (?vid) { vid };
    };

    if (ownedVehicleId != vehicleId) {
      Runtime.trap("Unauthorized: Can only view trips for your own vehicle");
    };

    let filtered = trips.values().filter(
      func(trip) { trip.vehicleId == vehicleId }
    );
    filtered.toArray().sort();
  };

  // Customer function - view own vehicle only
  public query ({ caller }) func getMyVehicle(vehicleId : Text) : async Vehicle {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view vehicle details");
    };

    // Verify ownership: caller must own this vehicle
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };

    let ownedVehicleId = switch (profile.vehicleId) {
      case (null) { Runtime.trap("No vehicle associated with this user") };
      case (?vid) { vid };
    };

    if (ownedVehicleId != vehicleId) {
      Runtime.trap("Unauthorized: Can only view your own vehicle");
    };

    switch (vehicles.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) { vehicle };
    };
  };
};
