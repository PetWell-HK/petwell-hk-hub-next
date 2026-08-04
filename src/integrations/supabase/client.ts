"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getPublicEnv } from "@/lib/env";

const SUPABASE_URL = getPublicEnv("VITE_SUPABASE_URL") || "";
const SUPABASE_PUBLISHABLE_KEY = getPublicEnv("VITE_SUPABASE_PUBLISHABLE_KEY") || "";

function getStorage() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: getStorage() as Storage,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});
