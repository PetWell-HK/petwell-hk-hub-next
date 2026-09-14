import { getPetwellApiBase } from "@/config/petwellApi";

export type ClinicGovVet = {
  vsbRegNo: string;
  nameEn: string | null;
  nameZh: string | null;
  qualifications: string | null;
  practisingAddress: {
    zh: string | null;
    en: string | null;
  };
};

export type ClinicGovVetsResponse = {
  vets: ClinicGovVet[];
  source?: {
    nameZh?: string;
    nameEn?: string;
    url?: string;
  };
};

export async function fetchClinicGovVets(clinicId: string): Promise<ClinicGovVetsResponse> {
  const res = await fetch(`${await getPetwellApiBase()}/api/clinics/${encodeURIComponent(clinicId)}/vets`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as ClinicGovVetsResponse & { error?: string };
  if (!res.ok) {
    throw new Error(json.error || `Clinic vets API ${res.status}`);
  }
  return {
    vets: Array.isArray(json.vets) ? json.vets : [],
    source: json.source,
  };
}
