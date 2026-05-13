const NEARBY_DELIVERY_KM = 3.5;
const deliveryTrackingSeed = [
  {
    id: "R-2031",
    vendorId: "akws-farms",
    vendorName: "Akwaaba Farms",
    orderId: "ORD-1042",
    customerContactEmail: "customer-tracker@randys.local",
    customerName: "Ama Mensah",
    customerArea: "Osu",
    courierLocation: "Airport City",
    pickup: "Akwaaba Farms · East Legon",
    dropoff: "Osu Oxford Street",
    payout: 13.2,
    status: "available",
    distanceKm: 9.8,
    etaMinutes: 26,
    courier: {
      name: "Kojo Asare",
      phone: "+233 24 555 0198",
      vehicle: "Motorbike",
      plateNumber: "GR-2419-23",
      rating: 4.8
    },
    courierPoint: { lat: 5.6052, lng: -0.1707 },
    pickupPoint: { lat: 5.6374, lng: -0.1513 },
    dropoffPoint: { lat: 5.5558, lng: -0.171 }
  },
  {
    id: "R-2030",
    vendorId: "hearth-bakery",
    vendorName: "Hearth Bakery",
    orderId: "ORD-1041",
    customerName: "Nana Boateng",
    customerArea: "Madina",
    courierLocation: "Adenta Barrier",
    pickup: "Hearth Bakery · Adenta",
    dropoff: "Madina",
    payout: 8.4,
    status: "available",
    distanceKm: 5.4,
    etaMinutes: 17,
    courier: {
      name: "Esi Owusu",
      phone: "+233 55 111 2040",
      vehicle: "Scooter",
      plateNumber: "GE-8831-22",
      rating: 4.7
    },
    courierPoint: { lat: 5.7017, lng: -0.1712 },
    pickupPoint: { lat: 5.7042, lng: -0.1668 },
    dropoffPoint: { lat: 5.6823, lng: -0.1647 }
  },
  {
    id: "R-2029",
    vendorId: "pure-dairy",
    vendorName: "Pure Dairy",
    orderId: "ORD-1039",
    customerContactEmail: "customer-tracker@randys.local",
    customerName: "Kwame Adjei",
    customerArea: "Dansoman",
    courierLocation: "Circle",
    pickup: "Pure Dairy · Kaneshie",
    dropoff: "Dansoman",
    payout: 11.6,
    status: "accepted",
    distanceKm: 7.1,
    etaMinutes: 21,
    courier: {
      name: "Yaw Mensah",
      phone: "+233 20 333 7744",
      vehicle: "Motorbike",
      plateNumber: "GS-1190-21",
      rating: 4.9
    },
    courierPoint: { lat: 5.5719, lng: -0.2076 },
    pickupPoint: { lat: 5.5665, lng: -0.2348 },
    dropoffPoint: { lat: 5.5336, lng: -0.2614 }
  },
  {
    id: "R-2028",
    vendorId: "pure-dairy",
    vendorName: "Pure Dairy",
    orderId: "ORD-1038",
    customerName: "Afia Sarpong",
    customerArea: "Mamprobi",
    courierLocation: "Kaneshie",
    pickup: "Pure Dairy · Kaneshie",
    dropoff: "Mamprobi",
    payout: 9.9,
    status: "accepted",
    distanceKm: 4.4,
    etaMinutes: 15,
    courier: {
      name: "Yaw Mensah",
      phone: "+233 20 333 7744",
      vehicle: "Motorbike",
      plateNumber: "GS-1190-21",
      rating: 4.9
    },
    courierPoint: { lat: 5.5665, lng: -0.2348 },
    pickupPoint: { lat: 5.5665, lng: -0.2348 },
    dropoffPoint: { lat: 5.5359, lng: -0.2388 }
  },
  {
    id: "R-2024",
    vendorId: "coast-catch",
    vendorName: "Coast Catch",
    orderId: "ORD-1037",
    customerContactEmail: "customer-tracker@randys.local",
    customerName: "Kofi Lartey",
    customerArea: "Spintex",
    courierLocation: "Community 1, Tema",
    pickup: "Coast Catch · Tema",
    dropoff: "Spintex",
    payout: 14.8,
    status: "delivered",
    distanceKm: 11.9,
    etaMinutes: 30,
    courier: {
      name: "Abena Osei",
      phone: "+233 27 991 4402",
      vehicle: "Van",
      plateNumber: "GT-4592-20",
      rating: 4.6
    },
    courierPoint: { lat: 5.665, lng: -93e-4 },
    pickupPoint: { lat: 5.6698, lng: -0.0166 },
    dropoffPoint: { lat: 5.6384, lng: -0.1015 }
  }
];
function getVendorDeliveries(vendorId) {
  return deliveryTrackingSeed.filter((delivery) => delivery.vendorId === vendorId);
}
function getActiveDeliveries(deliveries = deliveryTrackingSeed) {
  return deliveries.filter((delivery) => delivery.status === "accepted");
}
function getDistanceKm(a, b) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}
function toRadians(value) {
  return value * Math.PI / 180;
}
const CUSTOMER_TRACKER_DEMO_EMAIL = "customer-tracker@randys.local";
const PROFILE_DEMO_ORDER_IDS = /* @__PURE__ */ new Set(["R-2031", "R-2029", "R-2024"]);
function getCustomerProfileOrders(email, displayName) {
  const e = email.trim().toLowerCase();
  const matched = e ? deliveryTrackingSeed.filter((d) => d.customerContactEmail?.toLowerCase() === e) : [];
  const isDemoSample = matched.length === 0;
  const base = isDemoSample ? deliveryTrackingSeed.filter((d) => PROFILE_DEMO_ORDER_IDS.has(d.id)) : matched;
  const name = displayName.trim();
  const orders = base.map((d) => ({
    ...d,
    customerName: name || d.customerName
  }));
  return { orders, isDemoSample };
}
export {
  CUSTOMER_TRACKER_DEMO_EMAIL as C,
  NEARBY_DELIVERY_KM as N,
  getVendorDeliveries as a,
  getDistanceKm as b,
  getActiveDeliveries as c,
  deliveryTrackingSeed as d,
  getCustomerProfileOrders as g
};
