import { uploadData } from "aws-amplify/storage";
import { graphqlQuery } from "@/services/graphqlClient";
import { forumRequest } from "@/services/forumHttp";
import { buildPublicStorageUrl } from "@/utils/forumImageUrl";
import { getContentModerationMessage } from "@/utils/contentModeration";
import type {
  CreatePlaceReviewInput,
  PlaceReview,
  PlaceReviewType,
} from "@/types/placeReview";

const updateRestaurantRatingMutation = /* GraphQL */ `
  mutation UpdateRestaurantRating(
    $restaurantId: ID!
    $reviewRating: Float!
    $delta: Int!
    $oldReviewRating: Float
  ) {
    updateRestaurantRating(
      restaurantId: $restaurantId
      reviewRating: $reviewRating
      delta: $delta
      oldReviewRating: $oldReviewRating
    ) {
      id
      totalRating
      combinedRating
      numReviews
      updatedAt
    }
  }
`;

const updateClinicRatingMutation = /* GraphQL */ `
  mutation UpdateClinicRating(
    $clinicId: ID!
    $reviewRating: Float!
    $delta: Int!
    $oldReviewRating: Float
  ) {
    updateClinicRating(
      clinicId: $clinicId
      reviewRating: $reviewRating
      delta: $delta
      oldReviewRating: $oldReviewRating
    ) {
      id
      totalRating
      numReviews
      updatedAt
    }
  }
`;

const updateSalonRatingMutation = /* GraphQL */ `
  mutation UpdateSalonRating(
    $salonId: ID!
    $reviewRating: Float!
    $delta: Int!
    $oldReviewRating: Float
  ) {
    updateSalonRating(
      salonId: $salonId
      reviewRating: $reviewRating
      delta: $delta
      oldReviewRating: $oldReviewRating
    ) {
      id
      totalRating
      numReviews
      updatedAt
    }
  }
`;

const updateLodgingRatingMutation = /* GraphQL */ `
  mutation UpdateLodgingRating(
    $lodgingId: ID!
    $reviewRating: Float!
    $delta: Int!
    $oldReviewRating: Float
  ) {
    updateLodgingRating(
      lodgingId: $lodgingId
      reviewRating: $reviewRating
      delta: $delta
      oldReviewRating: $oldReviewRating
    ) {
      id
      totalRating
      numReviews
      updatedAt
    }
  }
`;

export async function updatePlaceRating(params: {
  placeType: PlaceReviewType;
  placeId: string;
  reviewRating: number;
  delta: number;
  oldReviewRating?: number;
}) {
  const variables = {
    reviewRating: params.reviewRating,
    delta: params.delta,
    oldReviewRating: params.oldReviewRating ?? undefined,
  };

  switch (params.placeType) {
    case "restaurant":
      return graphqlQuery(
        updateRestaurantRatingMutation,
        { ...variables, restaurantId: params.placeId },
        { authMode: "userPool" },
      );
    case "clinic":
      return graphqlQuery(
        updateClinicRatingMutation,
        { ...variables, clinicId: params.placeId },
        { authMode: "userPool" },
      );
    case "salon":
      return graphqlQuery(
        updateSalonRatingMutation,
        { ...variables, salonId: params.placeId },
        { authMode: "userPool" },
      );
    case "lodging":
      return graphqlQuery(
        updateLodgingRatingMutation,
        { ...variables, lodgingId: params.placeId },
        { authMode: "userPool" },
      );
    default: {
      const _exhaustive: never = params.placeType;
      return _exhaustive;
    }
  }
}

export async function uploadPlaceReviewImages(
  files: File[],
  placeType: PlaceReviewType,
): Promise<string[]> {
  if (files.length === 0) return [];

  const timestamp = Date.now();
  const uploaded = await Promise.all(
    files.map(async (file, index) => {
      const extension = file.name.split(".").pop() || "jpg";
      const imageKey = `reviews/${placeType}/${timestamp}-${index}.${extension}`;
      await uploadData({
        key: imageKey,
        data: file,
        options: {
          contentType: file.type || "image/jpeg",
          accessLevel: "guest",
        },
      }).result;
      // Match mobile review attachment paths: public/reviews/...
      return `public/${imageKey}`;
    }),
  );

  return uploaded;
}

export function resolvePlaceReviewImageUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return buildPublicStorageUrl(pathOrUrl);
}

export async function createPlaceReview(
  input: CreatePlaceReviewInput,
): Promise<PlaceReview | { pendingReview: true; message: string }> {
  // Moderation is server-side; do not hard-block in the browser so flagged
  // content can enter the same FilteredForumContent review queue as forum.
  const result = await forumRequest<{
    blocked?: boolean;
    pendingReview?: boolean;
    message?: string;
    review?: PlaceReview;
  }>("/api/reviews", {
    method: "POST",
    auth: true,
    body: {
      placeType: input.placeType,
      placeId: input.placeId,
      description: input.description,
      title: input.title,
      totalRating: input.totalRating,
      environmentRating: input.environmentRating,
      serviceRating: input.serviceRating,
      personnelRating: input.personnelRating,
      waitingRating: input.waitingRating,
      valueRating: input.valueRating,
      anonymous: input.anonymous ?? false,
      fileAttachments: input.fileAttachments ?? [],
      source: "petwell-hk-hub",
    },
  });

  if (result.pendingReview || result.blocked) {
    return {
      pendingReview: true,
      message: result.message || "Content was sent to manual review.",
    };
  }

  if (!result.review) {
    throw new Error(result.message || getContentModerationMessage());
  }

  return result.review;
}
