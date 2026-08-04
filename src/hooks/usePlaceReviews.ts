import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlaceReview } from "@/services/placeReviewApi";
import type { CreatePlaceReviewInput, PlaceReviewType } from "@/types/placeReview";

function invalidatePlaceQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  placeType: PlaceReviewType,
  placeId: string,
) {
  switch (placeType) {
    case "restaurant":
      queryClient.invalidateQueries({ queryKey: ["restaurant", placeId] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      break;
    case "clinic":
      queryClient.invalidateQueries({ queryKey: ["clinic", placeId] });
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      break;
    case "salon":
      queryClient.invalidateQueries({ queryKey: ["salon", placeId] });
      queryClient.invalidateQueries({ queryKey: ["salons"] });
      break;
    case "lodging":
      queryClient.invalidateQueries({ queryKey: ["lodging", placeId] });
      queryClient.invalidateQueries({ queryKey: ["lodging"] });
      break;
    default: {
      const _exhaustive: never = placeType;
      return _exhaustive;
    }
  }
}

export function useCreatePlaceReview(placeType: PlaceReviewType, placeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlaceReviewInput) => createPlaceReview(input),
    onSuccess: () => {
      invalidatePlaceQueries(queryClient, placeType, placeId);
    },
  });
}
