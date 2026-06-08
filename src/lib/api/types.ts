/** API types aligned with https://grocery-marketplace-bk.onrender.com/api/v1/docs */

export type ApiRole = "CUSTOMER" | "VENDOR" | "RIDER" | "ADMIN";

export type PublicUser = {
  id: string;
  role: ApiRole;
  phone: string;
  email?: string | null;
  customerProfileId?: string;
  vendorProfileId?: string;
  riderProfileId?: string;
  permissions: string[];
  status: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED" | "DELETED";
  phoneVerifiedAt?: string;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  user: PublicUser;
};

export type MfaLoginChallenge = {
  mfaRequired: true;
  mfaToken: string;
  /** Present when the account must enrol TOTP before sign-in can complete. */
  otpauthUri?: string;
  message?: string;
};

export type LoginResponse = TokenPair | MfaLoginChallenge;

export type ErrorResponse = {
  error: string;
  message: string;
  code?: string;
  details?: Array<{ path?: string; message?: string; code?: string }> | Record<string, unknown>;
};

export type OtpChallengeResponse = { challengeId: string; expiresInSeconds: number };

export type MfaSetupResponse = { enabled: boolean; otpauthUri?: string };

export type HealthResponse = {
  status: string;
  uptime: number;
  timestamp: string;
  db: string;
  redis: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  type:
    | "PERISHABLE"
    | "FROZEN"
    | "PANTRY"
    | "BEVERAGES"
    | "HOUSEHOLD"
    | "PERSONAL_CARE"
    | "ELECTRONICS"
    | "OTHER";
  parentId?: string | null;
  sortOrder: number;
};

export type ProductImage = { url: string; alt?: string | null; sortOrder?: number };

export type Product = {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  unit: string;
  price: string;
  compareAtPrice?: string | null;
  currency: string;
  perishable: boolean;
  requiresColdChain: boolean;
  stockQty: number;
  lowStockThreshold?: number | null;
  status: "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  images: ProductImage[];
};

export type StoreSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  status: "OPEN" | "CLOSED" | "SUSPENDED";
  prepTimeMinutes: number;
  deliveryRadiusKm: number;
  lat: number;
  lng: number;
  addressLine?: string | null;
  city?: string | null;
  rating: number;
  ratingCount: number;
  productCount?: number;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  qty: number;
  unit: string;
  unitPriceSnapshot: string;
  lineTotal: string;
  stockQty: number;
};

export type Cart = {
  id: string;
  customerId: string;
  storeId: string;
  status: "ACTIVE" | "CONVERTED" | "ABANDONED";
  subtotal: string;
  items: CartItem[];
};

export type Address = {
  id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  country: string;
  lat: number;
  lng: number;
  landmark?: string | null;
  contactPhone?: string | null;
  isDefault: boolean;
};

export type CustomerLoyalty = {
  tier: string;
  points: number;
  lifetimeSpend: string;
  nextTier?: string | null;
  spendToNextTier?: string | null;
  currency: string;
};

export type CustomerProfile = {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  defaultAddressId?: string | null;
  phone: string;
  email?: string | null;
  loyalty?: CustomerLoyalty | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  store: { id: string; name: string; slug: string; logoUrl?: string | null; city?: string | null };
  address: Address;
  subtotal: string;
  deliveryFee: string;
  serviceFee: string;
  discountTotal: string;
  total: string;
  currency: string;
  promotionId?: string | null;
  notes?: string | null;
  placedAt?: string | null;
  acceptedAt?: string | null;
  readyAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: string;
  lineTotal: string;
};

export type CustomerTracking = {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  delivery?: {
    id: string;
    status: string;
    pickup?: { lat: number; lng: number; addressLine?: string | null; city?: string | null };
    dropoff?: {
      lat: number;
      lng: number;
      line1: string;
      line2?: string | null;
      city: string;
      region?: string | null;
      landmark?: string | null;
    };
    distanceKm?: number | null;
    assignedAt?: string | null;
    acceptedAt?: string | null;
    pickedUpAt?: string | null;
    deliveredAt?: string | null;
    failedReason?: string | null;
  } | null;
  rider?: {
    id: string;
    fullName: string;
    vehicleType: string;
    plateNumber?: string | null;
    availability: string;
    rating: number;
    ratingCount: number;
    currentLat?: number | null;
    currentLng?: number | null;
    lastSeenAt?: string | null;
  } | null;
};

export type CheckoutResult = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    customerId: string;
    storeId: string;
    addressId: string;
    subtotal: string;
    deliveryFee: string;
    serviceFee: string;
    discountTotal: string;
    total: string;
    currency: string;
    notes?: string | null;
    items: OrderItem[];
  };
  payment: Payment;
  nextAction?: { type?: string; message?: string };
};

export type Payment = {
  id: string;
  orderId: string;
  status: string;
  amount: string;
  currency: string;
  channel?: string;
  provider?: string;
  momoNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FulfilmentOrder = CustomerOrder & {
  customerId: string;
  storeId: string;
  storeName: string;
  customer: { phone: string; firstName?: string | null; lastName?: string | null };
  payment?: Payment | null;
};

export type Delivery = {
  id: string;
  orderId: string;
  riderId?: string | null;
  status: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm?: number | null;
  proofUrl?: string | null;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  failedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    storeId: string;
    storeName: string;
    customerPhone: string;
    customerName?: string | null;
  };
  pickup?: { lat: number; lng: number; addressLine?: string | null; city?: string | null };
  dropoff?: {
    lat: number;
    lng: number;
    line1: string;
    line2?: string | null;
    city: string;
    region?: string | null;
    landmark?: string | null;
    contactPhone?: string | null;
  };
};

export type VendorProfile = {
  id: string;
  userId: string;
  businessName: string;
  contactName?: string | null;
  approvalStatus: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED" | "DELETED";
  approvedAt?: string | null;
  tier: "STANDARD" | "PREMIUM" | "ELITE";
  commissionRate: number;
  storeCount: number;
  phone: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RiderProfile = {
  id: string;
  availability: "ONLINE" | "OFFLINE" | "ON_DELIVERY";
  currentLat?: number | null;
  currentLng?: number | null;
  lastSeenAt?: string | null;
};

export type AdminDashboard = {
  orders: number;
  pendingOrders: number;
  activeDeliveries: number;
  pendingOutbox: number;
  pendingRefunds: number;
  pendingPayouts: number;
  openDisputes: number;
};

export type Dispute = {
  id: string;
  orderId: string;
  orderNumber?: string | null;
  customerId: string;
  customerPhone?: string | null;
  storeId?: string | null;
  storeName?: string | null;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
  reason: string;
  description?: string | null;
  resolution?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Promotion = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED" | "FREE_DELIVERY";
  value: string;
  minSubtotal?: string | null;
  storeId?: string | null;
  maxRedemptions?: number | null;
  perUserLimit?: number | null;
  redeemedCount: number;
  startsAt: string;
  endsAt: string;
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  createdAt: string;
};

export type Review = {
  id: string;
  customerId: string;
  orderId?: string | null;
  target: "STORE" | "PRODUCT" | "RIDER";
  storeId?: string | null;
  productId?: string | null;
  riderId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type EarningsSummary = {
  currency: string;
  pendingBalance: string;
  availableBalance: string;
  lifetimeEarnings: string;
};

export type LedgerEntry = {
  id: string;
  amount: string;
  currency: string;
  type: string;
  status: string;
  createdAt: string;
  description?: string | null;
};

export type PayoutRun = {
  id: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  completedAt?: string | null;
};

export type ReferralInfo = {
  code: string;
  referralCount: number;
  rewardBalance: string;
  currency: string;
};
