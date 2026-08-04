import { graphqlQuery } from "@/services/graphqlClient";

const CREATE_PLACE_RESERVATION_MUTATION = `
  mutation CreatePlaceReservation($input: CreatePlaceReservationInput!) {
    createPlaceReservation(input: $input) {
      id
      placeType
      placeId
      customerName
      customerPhone
      customerEmail
      reservationAt
      partySize
      petCount
      petSummary
      specialRequest
      status
      createdAt
      updatedAt
    }
  }
`;

export type PlaceReservationPlaceType = "SALON" | "CLINIC" | "LODGING";

export type CreatePlaceReservationInput = {
  placeType: PlaceReservationPlaceType;
  placeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reservationAt: string;
  partySize: number;
  petCount?: number;
  petSummary?: string;
  specialRequest?: string;
};

export type PlaceReservation = {
  id: string;
  placeType: PlaceReservationPlaceType;
  placeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  reservationAt: string;
  partySize: number;
  petCount: number;
  petSummary?: string | null;
  specialRequest?: string | null;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED" | "ARRIVED" | "NO_SHOW";
  createdAt?: string | null;
  updatedAt?: string | null;
};

type CreatePlaceReservationResult = {
  createPlaceReservation: PlaceReservation | null;
};

const cleanOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export async function createPlaceReservation(
  input: CreatePlaceReservationInput,
): Promise<PlaceReservation> {
  const customerEmail = input.customerEmail.trim().toLowerCase();
  if (!customerEmail) {
    throw new Error("Customer email is required");
  }

  const result = await graphqlQuery<CreatePlaceReservationResult>(
    CREATE_PLACE_RESERVATION_MUTATION,
    {
      input: {
        placeType: input.placeType,
        placeId: input.placeId,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        customerEmail,
        reservationAt: input.reservationAt,
        partySize: input.partySize,
        petCount: input.petCount ?? 0,
        petSummary: cleanOptional(input.petSummary),
        specialRequest: cleanOptional(input.specialRequest),
      },
    },
    { authMode: "apiKey" },
  );

  if (!result?.createPlaceReservation) {
    throw new Error("Reservation was not returned by server.");
  }

  return result.createPlaceReservation;
}
