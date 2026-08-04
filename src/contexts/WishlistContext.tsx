import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type WishlistEntry = {
  productId: string;
  addedAt: string; // ISO
  priceAtAdd: number;
};

interface WishlistContextType {
  items: WishlistEntry[];
  isInWishlist: (productId: string) => boolean;
  add: (productId: string, currentLowest: number) => void;
  remove: (productId: string) => void;
  toggle: (productId: string, currentLowest: number) => boolean; // returns true if added
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "petwell:wishlist:v1";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: WishlistEntry[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items],
  );

  const add = useCallback(
    (productId: string, currentLowest: number) => {
      if (items.some((i) => i.productId === productId)) return;
      persist([
        ...items,
        { productId, addedAt: new Date().toISOString(), priceAtAdd: currentLowest },
      ]);
    },
    [items],
  );

  const remove = useCallback(
    (productId: string) => {
      persist(items.filter((i) => i.productId !== productId));
    },
    [items],
  );

  const toggle = useCallback(
    (productId: string, currentLowest: number) => {
      if (items.some((i) => i.productId === productId)) {
        persist(items.filter((i) => i.productId !== productId));
        return false;
      }
      persist([
        ...items,
        { productId, addedAt: new Date().toISOString(), priceAtAdd: currentLowest },
      ]);
      return true;
    },
    [items],
  );

  const clear = useCallback(() => persist([]), []);

  return (
    <WishlistContext.Provider value={{ items, isInWishlist, add, remove, toggle, clear }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
