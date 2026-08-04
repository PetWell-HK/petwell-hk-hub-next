import { graphqlQuery } from "@/services/graphqlClient";

const CREATE_RESTAURANT_RESERVATION_MUTATION = `
  mutation CreateRestaurantReservation($input: CreateRestaurantReservationInput!) {
    createRestaurantReservation(input: $input) {
      id
      restaurantId
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

export type CreateRestaurantReservationInput = {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reservationAt: string;
  partySize: number;
  petCount?: number;
  petSummary?: string;
  specialRequest?: string;
};

export type RestaurantReservation = {
  id: string;
  restaurantId: string;
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

type CreateRestaurantReservationResult = {
  createRestaurantReservation: RestaurantReservation | null;
};

const cleanOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export async function createRestaurantReservation(
  input: CreateRestaurantReservationInput,
): Promise<RestaurantReservation> {
  const customerEmail = input.customerEmail.trim().toLowerCase();
  if (!customerEmail) {
    throw new Error("Customer email is required");
  }

  const result = await graphqlQuery<CreateRestaurantReservationResult>(
    CREATE_RESTAURANT_RESERVATION_MUTATION,
    {
      input: {
        restaurantId: input.restaurantId,
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

  if (!result?.createRestaurantReservation) {
    throw new Error("Reservation was not returned by server.");
  }

  return result.createRestaurantReservation;
}
