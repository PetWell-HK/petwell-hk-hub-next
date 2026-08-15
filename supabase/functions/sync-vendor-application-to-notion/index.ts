declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VENDOR_LIST_DATABASE_ID = "90cdf363-17e9-4276-8175-1e0562f6c815";
const NOTION_VERSION = "2022-06-28";
const MAX_RICH_TEXT = 2000;

type JoinType = "booth" | "sponsor" | "both";

type VendorApplicationPayload = {
  joinType: JoinType;
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

const JOIN_TYPES = new Set<JoinType>(["booth", "sponsor", "both"]);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function truncate(value: string, max = MAX_RICH_TEXT) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function richText(content: string) {
  const text = truncate(content);
  if (!text) return undefined;
  return {
    rich_text: [{ type: "text", text: { content: text } }],
  };
}

function titleText(content: string) {
  return {
    title: [{ type: "text", text: { content: truncate(content, 200) } }],
  };
}

function buildNotes(input: VendorApplicationPayload) {
  return [
    `參與形式: ${input.joinLabel}`,
    input.brandIntro ? `${input.unitLabel}簡介: ${input.brandIntro}` : null,
    `販售內容 / 贊助物品: ${input.productDesc}`,
    input.ig ? `IG / 網址: ${input.ig}` : null,
    "來源: PetWell 官網申請表格",
    `提交時間: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSpecialRequirements(input: VendorApplicationPayload) {
  if (input.isSponsorOnly) return "";
  return [
    `電力需求: ${input.electricity?.trim() || "不需要"}`,
    `設備及瓦數: ${input.equipment?.trim() || "不適用"}`,
  ].join("\n");
}

function validatePayload(body: unknown): VendorApplicationPayload | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Record<string, unknown>;

  const joinType = value.joinType;
  if (typeof joinType !== "string" || !JOIN_TYPES.has(joinType as JoinType)) return null;

  const requiredStrings = [
    "joinLabel",
    "brandName",
    "productDesc",
    "contactName",
    "phone",
    "email",
    "unitLabel",
  ] as const;

  for (const key of requiredStrings) {
    if (typeof value[key] !== "string" || !value[key].trim()) return null;
  }

  if (typeof value.isSponsorOnly !== "boolean") return null;

  const optionalStrings = ["brandIntro", "ig", "electricity", "equipment"] as const;
  for (const key of optionalStrings) {
    if (value[key] !== undefined && typeof value[key] !== "string") return null;
  }

  return {
    joinType: joinType as JoinType,
    joinLabel: value.joinLabel.trim(),
    brandName: value.brandName.trim(),
    brandIntro: typeof value.brandIntro === "string" ? value.brandIntro.trim() : undefined,
    productDesc: value.productDesc.trim(),
    contactName: value.contactName.trim(),
    phone: value.phone.trim(),
    email: value.email.trim().toLowerCase(),
    ig: typeof value.ig === "string" ? value.ig.trim() : undefined,
    electricity: typeof value.electricity === "string" ? value.electricity.trim() : undefined,
    equipment: typeof value.equipment === "string" ? value.equipment.trim() : undefined,
    isSponsorOnly: value.isSponsorOnly,
    unitLabel: value.unitLabel.trim(),
  };
}

function buildNotionProperties(input: VendorApplicationPayload) {
  const notes = buildNotes(input);
  const specialRequirements = buildSpecialRequirements(input);
  const commissionApplies = !input.isSponsorOnly;

  const properties: Record<string, unknown> = {
    攤位名稱: titleText(input.brandName),
    Email: { email: input.email },
    聯絡人: richText(input.contactName),
    聯絡方式: { phone_number: input.phone },
    狀態: { status: { name: "Not started" } },
    "已填 Google Form": { checkbox: true },
    同意抽傭: { checkbox: commissionApplies },
  };

  const notesProperty = richText(notes);
  if (notesProperty) properties.備注 = notesProperty;

  if (commissionApplies) {
    const commissionRate = richText("25%");
    if (commissionRate) properties.抽傭比例 = commissionRate;
  }

  const specialProperty = richText(specialRequirements);
  if (specialProperty) properties.特殊需求 = specialProperty;

  return properties;
}

async function createVendorListRow(input: VendorApplicationPayload, notionToken: string) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${notionToken}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: VENDOR_LIST_DATABASE_ID },
      properties: buildNotionProperties(input),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Notion API request failed";
    throw new Error(message);
  }

  return payload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const notionToken = Deno.env.get("NOTION_TOKEN");
    if (!notionToken) {
      console.error("NOTION_TOKEN is not configured");
      return jsonResponse({ error: "Notion sync is not configured" }, 503);
    }

    const body = await req.json().catch(() => null);
    const input = validatePayload(body);
    if (!input) {
      return jsonResponse({ error: "Invalid vendor application payload" }, 400);
    }

    const page = await createVendorListRow(input, notionToken);

    return jsonResponse({
      ok: true,
      notionPageId: typeof page.id === "string" ? page.id : null,
      notionUrl: typeof page.url === "string" ? page.url : null,
    });
  } catch (error) {
    console.error("sync-vendor-application-to-notion failed:", error);
    return jsonResponse({ error: "Failed to sync vendor application to Notion" }, 500);
  }
});
