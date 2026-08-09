import { graphqlQuery } from "@/services/graphqlClient";

export type WebReportPlaceType = "clinic" | "salon" | "lodging" | "restaurant" | "homeVisit";
export type WebSuggestPlaceCategory = WebReportPlaceType | "mall";
export type WebCorrectionField =
  | "ADDRESS"
  | "HOURS"
  | "PHONE"
  | "WEBSITE"
  | "NAME"
  | "OTHER";
export type WebFeedbackCategory = "FEATURE_REQUEST" | "BUG" | "SUGGESTION" | "OTHER";

const CREATE_REPORT_MUTATION = `
  mutation CreateReport($input: CreateReportInput!) {
    createReport(input: $input) {
      id
      reportType
      placeType
      placeId
      placeName
      correctionField
      message
      createdAt
    }
  }
`;

const REPORT_PLACE_TYPE_MAP: Record<WebReportPlaceType, string> = {
  clinic: "CLINIC",
  salon: "SALON",
  lodging: "LODGING",
  restaurant: "RESTAURANT",
  homeVisit: "HOME_VISIT_PROVIDER",
};

type ReportContactInput = {
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
};

type CreatePlaceCorrectionReportInput = {
  reporterId?: string | null;
  placeType: WebReportPlaceType;
  placeId: string;
  placeName: string;
  correctionField: WebCorrectionField;
  message: string;
  contact: ReportContactInput;
};

type CreateGeneralFeedbackReportInput = {
  reporterId?: string | null;
  feedbackCategory: WebFeedbackCategory;
  message: string;
  contact: ReportContactInput;
};

type CreateContactUsReportInput = {
  reporterId?: string | null;
  message: string;
  contact: ReportContactInput;
};

type CreateSuggestNewPlaceReportInput = {
  reporterId?: string | null;
  category: WebSuggestPlaceCategory;
  placeName: string;
  address?: string;
  notes?: string;
  contact: ReportContactInput;
};

const SUGGEST_CATEGORIES = new Set<WebSuggestPlaceCategory>([
  "clinic",
  "salon",
  "lodging",
  "restaurant",
  "mall",
  "homeVisit",
]);

export function buildSuggestNewPlaceMessage(input: {
  category: WebSuggestPlaceCategory;
  address?: string;
  notes?: string;
}): string {
  const category = SUGGEST_CATEGORIES.has(input.category) ? input.category : "restaurant";
  const lines = [`Category: ${category}`];
  const address = (input.address || "").trim();
  const notes = (input.notes || "").trim();
  if (address) lines.push(`Address: ${address}`);
  if (notes) lines.push(`Notes: ${notes}`);
  return lines.join("\n");
}

const getReportAuthMode = (reporterId?: string | null) =>
  reporterId ? "userPool" : "apiKey";

const isContactFieldSchemaError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("reporterName") ||
    message.includes("reporterEmail") ||
    message.includes("reporterPhone") ||
    message.includes("FieldUndefined") ||
    message.includes("not defined for input object type 'CreateReportInput'") ||
    message.includes('not defined for input object type "CreateReportInput"') ||
    message.includes("The variables input contains a field that is not defined")
  );
};

const withContactFallbackMessage = (message: string, contact: ReportContactInput) =>
  [
    "[Reporter Contact]",
    `Name: ${contact.reporterName}`,
    `Email: ${contact.reporterEmail}`,
    `Phone: ${contact.reporterPhone}`,
    "",
    "[Report Details]",
    message,
  ].join("\n");

async function createReportWithContactFallback(
  input: Record<string, unknown>,
  reporterId: string | null | undefined,
  contact: ReportContactInput
) {
  const authMode = getReportAuthMode(reporterId);
  const inputWithContact = {
    ...input,
    reporterName: contact.reporterName,
    reporterEmail: contact.reporterEmail,
    reporterPhone: contact.reporterPhone,
  };

  try {
    return await graphqlQuery<{ createReport: { id: string } }>(
      CREATE_REPORT_MUTATION,
      { input: inputWithContact },
      { authMode }
    );
  } catch (error) {
    if (!isContactFieldSchemaError(error)) {
      throw error;
    }

    return graphqlQuery<{ createReport: { id: string } }>(
      CREATE_REPORT_MUTATION,
      {
        input: {
          ...input,
          message: withContactFallbackMessage(String(input.message || ""), contact),
        },
      },
      { authMode }
    );
  }
}

export async function createPlaceCorrectionReport(
  input: CreatePlaceCorrectionReportInput
) {
  return createReportWithContactFallback(
    {
      reportType: "INFORMATION_CORRECTION",
      reporterId: input.reporterId || null,
      placeType: REPORT_PLACE_TYPE_MAP[input.placeType],
      placeId: input.placeId,
      placeName: input.placeName,
      correctionField: input.correctionField,
      message: input.message,
    },
    input.reporterId,
    input.contact
  );
}

export async function createGeneralFeedbackReport(
  input: CreateGeneralFeedbackReportInput
) {
  return createReportWithContactFallback(
    {
      reportType: "GENERAL_FEEDBACK",
      reporterId: input.reporterId || null,
      feedbackCategory: input.feedbackCategory,
      message: input.message,
    },
    input.reporterId,
    input.contact
  );
}

export async function createContactUsReport(input: CreateContactUsReportInput) {
  return createReportWithContactFallback(
    {
      reportType: "CONTACT_US",
      reporterId: input.reporterId || null,
      message: input.message,
    },
    input.reporterId,
    input.contact
  );
}

export async function createSuggestNewPlaceReport(
  input: CreateSuggestNewPlaceReportInput
) {
  const placeName = input.placeName.trim();
  return createReportWithContactFallback(
    {
      reportType: "INFORMATION_CORRECTION",
      reporterId: input.reporterId || null,
      placeType: "SUGGEST_NEW",
      placeName,
      message: buildSuggestNewPlaceMessage({
        category: input.category,
        address: input.address,
        notes: input.notes,
      }),
    },
    input.reporterId,
    input.contact
  );
}

type CreateReviewReportInput = {
  reporterId?: string | null;
  relatedReviewId: string;
  placeName?: string;
  message: string;
  contact?: ReportContactInput | null;
};

export async function createReviewReport(input: CreateReviewReportInput) {
  const baseInput = {
    reportType: "REVIEW_REPORT",
    reporterId: input.reporterId || null,
    placeName: input.placeName || null,
    relatedReviewId: input.relatedReviewId,
    message: input.message,
  };

  if (input.contact) {
    return createReportWithContactFallback(baseInput, input.reporterId, input.contact);
  }

  const authMode = input.reporterId ? "userPool" : "apiKey";
  return graphqlQuery<{ createReport: { id: string } }>(
    CREATE_REPORT_MUTATION,
    { input: baseInput },
    { authMode },
  );
}
