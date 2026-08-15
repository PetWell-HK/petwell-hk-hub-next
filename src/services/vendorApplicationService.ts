import { getPublicEnv } from "@/lib/env";

export type VendorJoinType = "booth" | "sponsor" | "both";

export type VendorApplicationSyncInput = {
  joinType: VendorJoinType;
  joinLabel: string;
  brandName: string;
  brandIntro?: string;
  productDesc: string;
  contactName: string;
  phone: string;
  email: string;
  ig?: string;
  electricity?: string;
  equipment?: string;
  isSponsorOnly: boolean;
  unitLabel: string;
};

type SyncVendorApplicationResponse = {
  ok?: boolean;
  error?: string;
};

const getSupabaseFunctionUrl = (functionName: string) => {
  const baseUrl = getPublicEnv("VITE_SUPABASE_URL");
  if (!baseUrl) return null;
  return `${baseUrl}/functions/v1/${functionName}`;
};

export async function syncVendorApplicationToNotion(input: VendorApplicationSyncInput) {
  const endpoint = getSupabaseFunctionUrl("sync-vendor-application-to-notion");
  const publishableKey = getPublicEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!endpoint || !publishableKey) {
    throw new Error("Vendor application sync is not configured");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as SyncVendorApplicationResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to sync vendor application");
  }

  return payload;
}
