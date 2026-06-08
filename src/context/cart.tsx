import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import type { Cart, CartItem } from "@/lib/api/types";
import { loadSelectedStoreId, saveSelectedStoreId, type ShopProduct } from "@/lib/catalog-display";
import { useAuth } from "@/context/auth";

export type CartLine = { item: CartItem; product?: ShopProduct };

type CartCtx = {
  storeId: string | null;
  cart: Cart | null;
  loading: boolean;
  error: unknown;
  items: CartLine[];
  add: (productId: string, itemStoreId: string, qty?: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const queryClient = useQueryClient();
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    setStoreId(loadSelectedStoreId());
  }, []);

  const enabled = ready && !!session && session.role === "customer" && !!storeId;

  const { data: cart, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["cart", storeId],
    queryFn: () => getCart(storeId!),
    enabled,
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["cart", storeId] });
  }, [queryClient, storeId]);

  const add = useCallback(
    async (productId: string, itemStoreId: string, qty = 1) => {
      await addCartItem(itemStoreId, productId, qty);
      setStoreId(itemStoreId);
      saveSelectedStoreId(itemStoreId);
      void queryClient.invalidateQueries({ queryKey: ["cart", itemStoreId] });
    },
    [queryClient],
  );

  const remove = useCallback(
    async (itemId: string) => {
      await removeCartItem(itemId);
      invalidate();
    },
    [invalidate],
  );

  const setQty = useCallback(
    async (itemId: string, qty: number) => {
      if (qty <= 0) {
        await remove(itemId);
        return;
      }
      await updateCartItem(itemId, qty);
      invalidate();
    },
    [invalidate, remove],
  );

  const clear = useCallback(async () => {
    if (!storeId) return;
    await clearCart(storeId);
    invalidate();
  }, [storeId, invalidate]);

  const items = useMemo<CartLine[]>(
    () => (cart?.items ?? []).map((item) => ({ item })),
    [cart?.items],
  );

  const value = useMemo<CartCtx>(
    () => ({
      storeId,
      cart: cart ?? null,
      loading: isLoading || isFetching,
      error: isError ? error : null,
      items,
      add,
      remove,
      setQty,
      clear,
      refresh: () => void refetch(),
      count: items.reduce((n, i) => n + i.item.qty, 0),
      subtotal: cart ? parseMoney(cart.subtotal) : 0,
    }),
    [storeId, cart, isLoading, isFetching, isError, error, items, add, remove, setQty, clear, refetch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
}
