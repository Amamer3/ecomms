import { apiRequest } from "./client";
import type {
  Address,
  AdminDashboard,
  AdminPasswordResetResult,
  AdminUser,
  AdminUserCreateResult,
  AdminUserList,
  HealthResponse,
  Cart,
  Category,
  CheckoutResult,
  PaymentOtpVerifyResult,
  CustomerOrder,
  CustomerProfile,
  CustomerTracking,
  Delivery,
  Dispute,
  EarningsSummary,
  FulfilmentOrder,
  LedgerEntry,
  LoginResponse,
  MfaSetupResponse,
  OtpChallengeResponse,
  Payment,
  PayoutRun,
  Product,
  Promotion,
  PublicUser,
  ReferralInfo,
  Review,
  RiderProfile,
  StoreSummary,
  TokenPair,
  VendorProfile,
} from "./types";

// —— Health ——
export const getHealth = () => apiRequest<HealthResponse>("/health");

// —— Auth ——
export const requestOtp = (phone: string) =>
  apiRequest<OtpChallengeResponse>("/auth/otp/request", { method: "POST", body: { phone } });

export const resendOtp = (phone: string) =>
  apiRequest<OtpChallengeResponse>("/auth/otp/resend", { method: "POST", body: { phone } });

export const verifyOtp = (phone: string, code: string) =>
  apiRequest<TokenPair>("/auth/otp/verify", { method: "POST", body: { phone, code } });

export const login = (identifier: string, password: string) =>
  apiRequest<LoginResponse>("/auth/login", { method: "POST", body: { identifier, password } });

export const verifyMfa = (mfaToken: string, totp: string) =>
  apiRequest<TokenPair>("/auth/mfa/verify", { method: "POST", body: { mfaToken, totp } });

export const setupMfa = (totp?: string) =>
  apiRequest<MfaSetupResponse>("/auth/mfa/setup", {
    method: "POST",
    body: totp !== undefined ? { totp } : undefined,
    auth: true,
  });

export const refreshAuth = (refreshToken: string) =>
  apiRequest<TokenPair>("/auth/refresh", { method: "POST", body: { refreshToken } });

export const logout = (refreshToken: string) =>
  apiRequest<void>("/auth/logout", { method: "POST", body: { refreshToken }, auth: true });

export const getMe = () => apiRequest<PublicUser>("/auth/me", { auth: true });

export const registerVendor = (body: Record<string, unknown>) =>
  apiRequest<TokenPair>("/auth/vendor/register", { method: "POST", body });

export const registerRider = (body: Record<string, unknown>) =>
  apiRequest<TokenPair>("/auth/rider/register", { method: "POST", body });

// —— Catalog ——
export const listCategories = () => apiRequest<Category[]>("/categories");

export const listStores = (query?: { q?: string; city?: string; limit?: number; offset?: number }) =>
  apiRequest<StoreSummary[]>("/stores", { query });

export const getStore = (id: string) => apiRequest<StoreSummary>(`/stores/${id}`);

export const updateStore = (id: string, body: Record<string, unknown>) =>
  apiRequest<StoreSummary>(`/stores/${id}`, { method: "PATCH", body, auth: true });

export const listStoreProducts = (
  storeId: string,
  query?: { q?: string; categoryId?: string; status?: string; limit?: number; offset?: number },
) => apiRequest<Product[]>(`/stores/${storeId}/products`, { query });

export const getProduct = (id: string) => apiRequest<Product>(`/products/${id}`);

export const createProduct = (body: Record<string, unknown>) =>
  apiRequest<Product>("/products", { method: "POST", body, auth: true });

export const updateProduct = (id: string, body: Record<string, unknown>) =>
  apiRequest<Product>(`/products/${id}`, { method: "PATCH", body, auth: true });

export const deleteProduct = (id: string) => apiRequest<void>(`/products/${id}`, { method: "DELETE", auth: true });

export const listVendorStores = () => apiRequest<StoreSummary[]>("/vendor/stores", { auth: true });

export const listVendorProducts = (query?: { storeId?: string; limit?: number; offset?: number }) =>
  apiRequest<Product[]>("/vendor/products", { auth: true, query });

// —— Cart ——
export const getCart = (storeId: string) => apiRequest<Cart>("/cart", { auth: true, query: { storeId } });

export const clearCart = (storeId: string) =>
  apiRequest<void>("/cart", { method: "DELETE", auth: true, query: { storeId } });

export const addCartItem = (storeId: string, productId: string, qty: number) =>
  apiRequest<Cart>("/cart/items", { method: "POST", auth: true, body: { storeId, productId, qty } });

export const updateCartItem = (itemId: string, qty: number) =>
  apiRequest<Cart>(`/cart/items/${itemId}`, { method: "PATCH", auth: true, body: { qty } });

export const removeCartItem = (itemId: string) =>
  apiRequest<Cart>(`/cart/items/${itemId}`, { method: "DELETE", auth: true });

// —— Customer ——
export const getCustomerProfile = () => apiRequest<CustomerProfile>("/customer/profile", { auth: true });

export const updateCustomerProfile = (body: Record<string, unknown>) =>
  apiRequest<CustomerProfile>("/customer/profile", { method: "PATCH", body, auth: true });

export const listAddresses = () => apiRequest<Address[]>("/customer/addresses", { auth: true });

export const createAddress = (body: Record<string, unknown>) =>
  apiRequest<Address>("/customer/addresses", { method: "POST", body, auth: true });

export const listCustomerOrders = (query?: { status?: string; limit?: number; offset?: number }) =>
  apiRequest<CustomerOrder[]>("/customer/orders", { auth: true, query });

export const getCustomerOrder = (orderId: string) =>
  apiRequest<CustomerOrder>(`/customer/orders/${orderId}`, { auth: true });

export const getOrderTracking = (orderId: string) =>
  apiRequest<CustomerTracking>(`/customer/orders/${orderId}/tracking`, { auth: true });

export const listTransactions = (query?: { limit?: number; offset?: number }) =>
  apiRequest<Payment[]>("/customer/transactions", { auth: true, query });

export const getTransaction = (paymentId: string) =>
  apiRequest<Payment>(`/customer/transactions/${paymentId}`, { auth: true });

export const listCustomerDisputes = () => apiRequest<Dispute[]>("/customer/disputes", { auth: true });

export const openDispute = (body: { orderId: string; reason: string; description?: string }) =>
  apiRequest<Dispute>("/customer/disputes", { method: "POST", body, auth: true });

export const getReferral = () => apiRequest<ReferralInfo>("/customer/referral", { auth: true });

export const claimReferral = (code: string) =>
  apiRequest<{ message: string }>("/customer/referral/claim", { method: "POST", body: { code }, auth: true });

// —— Checkout ——
export const checkout = (body: Record<string, unknown>) =>
  apiRequest<CheckoutResult>("/checkout", { method: "POST", body, auth: true });

export const verifyPaymentOtp = (paymentId: string, otp: string) =>
  apiRequest<PaymentOtpVerifyResult>(`/customer/transactions/${paymentId}/verify-otp`, {
    method: "POST",
    body: { otp: otp.trim() },
    auth: true,
  });

// —— Vendor ——
export const getVendorProfile = () => apiRequest<VendorProfile>("/vendor/profile", { auth: true });

export const updateVendorProfile = (body: Record<string, unknown>) =>
  apiRequest<VendorProfile>("/vendor/profile", { method: "PATCH", body, auth: true });

export const listVendorOrders = (query?: { storeId?: string; status?: string; limit?: number; offset?: number }) =>
  apiRequest<FulfilmentOrder[]>("/vendor/orders", { auth: true, query });

export const getVendorOrder = (orderId: string) =>
  apiRequest<FulfilmentOrder>(`/vendor/orders/${orderId}`, { auth: true });

export const acceptVendorOrder = (orderId: string) =>
  apiRequest<FulfilmentOrder>(`/vendor/orders/${orderId}/accept`, { method: "POST", auth: true });

export const rejectVendorOrder = (orderId: string, reason?: string) =>
  apiRequest<FulfilmentOrder>(`/vendor/orders/${orderId}/reject`, { method: "POST", auth: true, body: { reason } });

export const preparingVendorOrder = (orderId: string) =>
  apiRequest<FulfilmentOrder>(`/vendor/orders/${orderId}/preparing`, { method: "POST", auth: true });

export const readyVendorOrder = (orderId: string) =>
  apiRequest<FulfilmentOrder>(`/vendor/orders/${orderId}/ready`, { method: "POST", auth: true });

export const getVendorEarningsSummary = () => apiRequest<EarningsSummary>("/vendor/earnings/summary", { auth: true });

export const listVendorEarnings = (query?: { limit?: number; offset?: number }) =>
  apiRequest<LedgerEntry[]>("/vendor/earnings", { auth: true, query });

export const listVendorPayouts = (query?: { limit?: number; offset?: number }) =>
  apiRequest<PayoutRun[]>("/vendor/payouts", { auth: true, query });

// —— Rider ——
export const getRiderProfile = () => apiRequest<RiderProfile>("/rider/profile", { auth: true });

export const updateRiderProfile = (body: Record<string, unknown>) =>
  apiRequest<RiderProfile>("/rider/profile", { method: "PATCH", body, auth: true });

export const setRiderAvailability = (availability: "ONLINE" | "OFFLINE") =>
  apiRequest<RiderProfile>("/rider/availability", { method: "PATCH", auth: true, body: { availability } });

export const updateRiderLocation = (lat: number, lng: number) =>
  apiRequest<RiderProfile>("/rider/location", { method: "PATCH", auth: true, body: { lat, lng } });

export const listRiderDeliveries = (query?: { status?: string; limit?: number; offset?: number }) =>
  apiRequest<Delivery[]>("/rider/deliveries", { auth: true, query });

export const getRiderDelivery = (deliveryId: string) =>
  apiRequest<Delivery>(`/rider/deliveries/${deliveryId}`, { auth: true });

export const acceptDelivery = (deliveryId: string) =>
  apiRequest<Delivery>(`/rider/deliveries/${deliveryId}/accept`, { method: "POST", auth: true });

export const enRouteToStore = (deliveryId: string) =>
  apiRequest<Delivery>(`/rider/deliveries/${deliveryId}/en-route-to-store`, { method: "POST", auth: true });

export const atStore = (deliveryId: string) =>
  apiRequest<Delivery>(`/rider/deliveries/${deliveryId}/at-store`, { method: "POST", auth: true });

export const pickupDelivery = (deliveryId: string) =>
  apiRequest<Delivery>(`/rider/deliveries/${deliveryId}/pickup`, { method: "POST", auth: true });

export const inTransitDelivery = (deliveryId: string) =>
  apiRequest<Delivery>(`/rider/deliveries/${deliveryId}/in-transit`, { method: "POST", auth: true });

export const completeDelivery = (deliveryId: string, handoverCode: string) =>
  apiRequest<Delivery>(`/rider/deliveries/${deliveryId}/complete`, {
    method: "POST",
    auth: true,
    body: { handoverCode },
  });

export const getRiderEarningsSummary = () => apiRequest<EarningsSummary>("/rider/earnings/summary", { auth: true });

export const listRiderEarnings = (query?: { limit?: number; offset?: number }) =>
  apiRequest<LedgerEntry[]>("/rider/earnings", { auth: true, query });

export const listRiderPayouts = (query?: { limit?: number; offset?: number }) =>
  apiRequest<PayoutRun[]>("/rider/payouts", { auth: true, query });

// —— Admin ——
export const getAdminDashboard = () => apiRequest<AdminDashboard>("/admin/dashboard", { auth: true });

export const listAdminUsers = (query?: {
  role?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => apiRequest<AdminUserList>("/admin/users", { auth: true, query });

export const getAdminUser = (id: string) =>
  apiRequest<AdminUser>(`/admin/users/${id}`, { auth: true });

export const createAdminUser = (body: { phone: string; email: string; password: string }) =>
  apiRequest<AdminUserCreateResult>("/admin/users/admins", { method: "POST", body, auth: true });

export const updateAdminUser = (id: string, body: Record<string, unknown>) =>
  apiRequest<AdminUser>(`/admin/users/${id}`, { method: "PATCH", body, auth: true });

export const deleteAdminUser = (id: string) =>
  apiRequest<AdminUser>(`/admin/users/${id}`, { method: "DELETE", auth: true });

export const updateAdminUserStatus = (id: string, status: string) =>
  apiRequest<AdminUser>(`/admin/users/${id}/status`, { method: "PATCH", body: { status }, auth: true });

export const resetAdminUserPassword = (
  id: string,
  body: { password: string; revokeSessions?: boolean },
) => apiRequest<AdminPasswordResetResult>(`/admin/users/${id}/password`, { method: "POST", body, auth: true });

export const approveVendor = (id: string) =>
  apiRequest<VendorProfile>(`/admin/vendors/${id}/approve`, { method: "POST", auth: true });

export const approveRider = (id: string) =>
  apiRequest<RiderProfile>(`/admin/riders/${id}/approve`, { method: "POST", auth: true });

export const setVendorTier = (id: string, body: { tier: string; commissionRate?: number }) =>
  apiRequest<VendorProfile>(`/admin/vendors/${id}/tier`, { method: "PATCH", body, auth: true });

export const listAdminOrders = (query?: { status?: string; limit?: number; offset?: number }) =>
  apiRequest<FulfilmentOrder[]>("/admin/orders", { auth: true, query });

export const getAdminOrder = (id: string) =>
  apiRequest<FulfilmentOrder>(`/admin/orders/${id}`, { auth: true });

export const listAdminPayments = (query?: { status?: string; limit?: number; offset?: number }) =>
  apiRequest<Payment[]>("/admin/payments", { auth: true, query });

export const listAdminDisputes = (query?: { status?: string; limit?: number; offset?: number }) =>
  apiRequest<Dispute[]>("/admin/disputes", { auth: true, query });

export const updateAdminDispute = (disputeId: string, body: Record<string, unknown>) =>
  apiRequest<Dispute>(`/admin/disputes/${disputeId}`, { method: "PATCH", body, auth: true });

export const listAdminRefunds = (query?: { limit?: number; offset?: number }) =>
  apiRequest<Payment[]>("/admin/refunds", { auth: true, query });

export const processRefunds = () => apiRequest<{ processed: number }>("/admin/refunds/process", { method: "POST", auth: true });

export const listAdminLedger = (query?: { limit?: number; offset?: number }) =>
  apiRequest<LedgerEntry[]>("/admin/ledger", { auth: true, query });

export const generateLedger = () => apiRequest<{ created: number }>("/admin/ledger/generate", { method: "POST", auth: true });

export const listAdminPayouts = (query?: { limit?: number; offset?: number }) =>
  apiRequest<PayoutRun[]>("/admin/payouts", { auth: true, query });

export const runAdminPayouts = () => apiRequest<{ runs: number }>("/admin/payouts/run", { method: "POST", auth: true });

// —— Promotions & reviews ——
export const validatePromotion = (code: string, storeId: string, subtotal: string) =>
  apiRequest<{ valid: boolean; discount: string; promotion?: Promotion }>("/promotions/validate", {
    method: "POST",
    auth: true,
    body: { code, storeId, subtotal },
  });

export const listPromotions = (query?: { storeId?: string; status?: string }) =>
  apiRequest<Promotion[]>("/promotions", { auth: true, query });

export const createPromotion = (body: Record<string, unknown>) =>
  apiRequest<Promotion>("/promotions", { method: "POST", body, auth: true });

export const updatePromotion = (promotionId: string, body: Record<string, unknown>) =>
  apiRequest<Promotion>(`/promotions/${promotionId}`, { method: "PATCH", body, auth: true });

export const pausePromotion = (promotionId: string) =>
  apiRequest<Promotion>(`/promotions/${promotionId}/pause`, { method: "POST", auth: true });

export const paymentCallback = (body: Record<string, unknown>, signature?: string) =>
  apiRequest<{ message?: string }>("/payments/callback", {
    method: "POST",
    body,
    headers: signature ? { "x-payment-signature": signature } : undefined,
  });

export const listReviews = (query?: { storeId?: string; productId?: string; riderId?: string; limit?: number }) =>
  apiRequest<Review[]>("/reviews", { query });

export const createReview = (body: Record<string, unknown>) =>
  apiRequest<Review>("/reviews", { method: "POST", body, auth: true });
