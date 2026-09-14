import { useQuery } from "@tanstack/react-query";
import { fetchClinicGovVets } from "@/services/clinicVetsApi";

export function useClinicGovVets(clinicId: string | undefined) {
  return useQuery({
    queryKey: ["clinic-gov-vets", clinicId],
    queryFn: () => {
      if (!clinicId) throw new Error("Clinic ID is required");
      return fetchClinicGovVets(clinicId);
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
