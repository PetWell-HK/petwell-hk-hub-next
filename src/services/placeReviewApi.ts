import { uploadData } from "aws-amplify/storage";
import { graphqlQuery } from "@/services/graphqlClient";
import { buildPublicStorageUrl } from "@/utils/forumImageUrl";
import type {
  CreatePlaceReviewInput,
  PlaceReview,
  PlaceReviewType,
} from "@/types/placeReview";

const REVIEW_FIELDS = `
  id
  reviewerId
  title
  description
  environmentRating
  serviceRating
  personnelRating
  waitingRating
  valueRating
  totalRating
  fileAttachments
  anonymous
  source
  createdAt
  updatedAt
`;

const createRestaurantReviewSimple = /* GraphQL */ `
  mutation CreateRestaurantReview($input: CreateRestaurantReviewInput!) {
    createRestaurantReview(input: $input) {
      ${REVIEW_FIELDS}
      restaurantId
    }
  }
`;

const createClinicReviewSimple = /* GraphQL */ `
  mutation CreateClinicReview($input: CreateClinicReviewInput!) {
    createClinicReview(input: $input) {
      ${REVIEW_FIELDS}
      clinicId
    }
  }
`;

const createSalonReviewSimple = /* GraphQL */ `
  mutation CreateSalonReview($input: CreateSalonReviewInput!) {
    createSalonReview(input: $input) {
      ${REVIEW_FIELDS}
      salonId
    }
  }
`;

const createLodgingReviewSimple = /* GraphQL */ `
  mutation CreateLodgingReview($input: CreateLodgingReviewInput!) {
    createLodgingReview(input: $input) {
      ${REVIEW_FIELDS}
      lodgingId
    }
  }
`;

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

function getCreateMutation(placeType: PlaceReviewType) {
  switch (placeType) {
    case "restaurant":
      return { mutation: createRestaurantReviewSimple, resultKey: "createRestaurantReview" as const };
    case "clinic":
      return { mutation: createClinicReviewSimple, resultKey: "createClinicReview" as const };
    case "salon":
      return { mutation: createSalonReviewSimple, resultKey: "createSalonReview" as const };
    case "lodging":
      return { mutation: createLodgingReviewSimple, resultKey: "createLodgingReview" as const };
    default: {
      const _exhaustive: never = placeType;
      return _exhaustive;
    }
  }
}

function buildCreateInput(input: CreatePlaceReviewInput) {
  const base = {
    reviewerId: input.reviewerId,
    description: input.description,
    environmentRating: input.environmentRating,
    serviceRating: input.serviceRating,
    personnelRating: input.personnelRating,
    waitingRating: input.waitingRating,
    valueRating: input.valueRating,
    totalRating: input.totalRating,
    anonymous: input.anonymous ?? false,
    fileAttachments: input.fileAttachments ?? [],
    source: "petwell-hk-hub",
    ...(input.title?.trim() ? { title: input.title.trim() } : {}),
  };

  switch (input.placeType) {
    case "restaurant":
      return { ...base, restaurantId: input.placeId };
    case "clinic":
      // Live API may still require title until schema deploy
      return {
        ...base,
        clinicId: input.placeId,
        title: input.title?.trim() || "",
      };
    case "salon":
      return { ...base, salonId: input.placeId };
    case "lodging":
      return { ...base, lodgingId: input.placeId };
    default: {
      const _exhaustive: never = input.placeType;
      return _exhaustive;
    }
  }
}

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

export async function createPlaceReview(input: CreatePlaceReviewInput): Promise<PlaceReview> {
  const { mutation, resultKey } = getCreateMutation(input.placeType);
  const result = await graphqlQuery<Record<string, PlaceReview>>(
    mutation,
    { input: buildCreateInput(input) },
    { authMode: "userPool" },
  );

  updatePlaceRating({
    placeType: input.placeType,
    placeId: input.placeId,
    reviewRating: input.totalRating,
    delta: 1,
  }).catch(() => {});

  return result[resultKey];
}
