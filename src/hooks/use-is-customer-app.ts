import { useAuth } from "@/context/auth";

/** True when the signed-in user should see the customer delivery UI shell. */
export function useIsCustomerApp(): boolean {
  const { session, ready } = useAuth();
  return ready && session?.role === "customer" && session.profileComplete !== false;
}
