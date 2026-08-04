import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "petwell:compare:v1";

interface CompareContextType {
  ids: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => { ok: boolean; reason?: string };
  remove: (id: string) => void;
  clear: () => void;
  max: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: string[]) => {
    setIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const isSelected = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) {
        persist(ids.filter((x) => x !== id));
        return { ok: true };
      }
      if (ids.length >= MAX_COMPARE) {
        return { ok: false, reason: `最多只可同時比較 ${MAX_COMPARE} 件產品` };
      }
      persist([...ids, id]);
      return { ok: true };
    },
    [ids],
  );

  const remove = useCallback(
    (id: string) => {
      persist(ids.filter((x) => x !== id));
    },
    [ids],
  );

  const clear = useCallback(() => persist([]), []);

  return (
    <CompareContext.Provider value={{ ids, isSelected, toggle, remove, clear, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
