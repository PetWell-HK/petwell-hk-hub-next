import { graphqlQuery } from "@/services/graphqlClient";

const CREATE_PAYMENT_LINK_MUTATION = `
  mutation CreatePaymentLink($input: CreatePaymentLinkInput!) {
    createPaymentLink(input: $input) {
      id
      url
      amount
      currency
      status
      expires_at
    }
  }
`;

interface CreatePaymentLinkInput {
  amount: number;
  currency: string;
  paymentSourceId: string;
  paymentSourceType: "ORGANIZED_EVENT_BOOKING";
  clientId: string;
  description?: string;
  returnUrl?: string;
  shopperEmail?: string;
  shopperFirstName?: string;
  shopperLastName?: string;
  shopperPhoneNumber?: string;
}

interface CreatePaymentLinkResult {
  createPaymentLink: {
    id: string;
    url: string;
    amount: number;
    currency: string;
    status: string;
    expires_at?: string;
  };
}

export interface TestBookingCheckoutInput {
  userEmail?: string;
  amount: number;
  currency: string;
  productCode: string;
  productName: string;
  shopperEmail: string;
  shopperFirstName: string;
  shopperLastName: string;
  shopperPhoneNumber?: string;
  petName: string;
  bookingClinic: string;
  bookingTime: string;
  notes?: string;
  returnUrl?: string;
  usePublicAuth?: boolean;
}

const BOOKING_META_PREFIX = "BOOKING_META::";

const encodeBookingMeta = (meta: Record<string, string>): string => {
  const json = JSON.stringify(meta);
  const base64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${BOOKING_META_PREFIX}${base64}`;
};

const CLIENTS_BY_EMAIL_QUERY = `
  query ClientsByEmail($email: ID!, $limit: Int) {
    clientsByEmail(email: $email, limit: $limit) {
      items {
        id
      }
    }
  }
`;

const LIST_CLIENTS_BY_EMAIL_FILTER_QUERY = `
  query GetClientByEmail($email: ID!) {
    listClients(filter: { email: { eq: $email } }, limit: 1) {
      items {
        id
      }
    }
  }
`;

const findClientIdByEmail = async (email: string): Promise<string | undefined> => {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const byIndexResult = await graphqlQuery<{
      clientsByEmail?: { items?: Array<{ id?: string | null } | null> | null };
    }>(CLIENTS_BY_EMAIL_QUERY, { email: normalizedEmail, limit: 1 });
    const clientId = byIndexResult.clientsByEmail?.items?.[0]?.id ?? undefined;
    if (clientId) {
      return clientId;
    }
  } catch {
    // Fall through to filter query.
  }

  const byFilterResult = await graphqlQuery<{
    listClients?: { items?: Array<{ id?: string | null } | null> | null };
  }>(LIST_CLIENTS_BY_EMAIL_FILTER_QUERY, { email: normalizedEmail });

  return byFilterResult.listClients?.items?.[0]?.id ?? undefined;
};

const createGuestClientId = (email: string): string => {
  const normalizedEmail = email.trim().toLowerCase();
  const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 96);
  return `guest_${safeEmail || "checkout"}`;
};

const createPaymentSourceId = (productCode: string): string => {
  const safeCode = productCode.replace(/[^a-zA-Z0-9_-]/g, "_");
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `tb_${safeCode}_${Date.now()}_${randomPart}`;
};

export async function createTestBookingPaymentLink(
  input: TestBookingCheckoutInput,
): Promise<{ id: string; url: string }> {
  const normalizedUserEmail = input.userEmail?.trim().toLowerCase();
  const normalizedShopperEmail = input.shopperEmail.trim().toLowerCase();
  const lookupEmail = normalizedUserEmail || normalizedShopperEmail;
  const resolvedClientId = await findClientIdByEmail(lookupEmail);
  const clientId = resolvedClientId || createGuestClientId(lookupEmail);

  const mutationInput: CreatePaymentLinkInput = {
    amount: input.amount,
    currency: input.currency,
    paymentSourceId: createPaymentSourceId(input.productCode),
    paymentSourceType: "ORGANIZED_EVENT_BOOKING",
    clientId,
    description: encodeBookingMeta({
      testType: input.productName,
      petName: input.petName.trim(),
      bookingClinic: input.bookingClinic.trim(),
      bookingTime: input.bookingTime.trim(),
      notes: input.notes?.trim() || "",
    }),
    returnUrl: input.returnUrl,
    shopperEmail: normalizedShopperEmail,
    shopperFirstName: input.shopperFirstName?.trim(),
    shopperLastName: input.shopperLastName?.trim(),
    shopperPhoneNumber: input.shopperPhoneNumber?.trim(),
  };

  const result = await graphqlQuery<CreatePaymentLinkResult>(
    CREATE_PAYMENT_LINK_MUTATION,
    {
      input: mutationInput,
    },
    input.usePublicAuth ? { authMode: "apiKey" } : undefined,
  );

  if (!result?.createPaymentLink?.url) {
    throw new Error("Payment link was not returned by server.");
  }

  return {
    id: result.createPaymentLink.id,
    url: result.createPaymentLink.url,
  };
}
