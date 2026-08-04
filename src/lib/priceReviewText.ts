type Language = string | undefined;

type ShippingRule = {
  pattern: RegExp;
  zh: string;
};

const SHIPPING_RULES: ShippingRule[] = [
  {
    pattern: /receive tomorrow if the order placed before 10pm/i,
    zh: "晚上 10 點前下單，最快明天送達",
  },
  {
    pattern: /free shipping on order delivered by hktvmall at a specific purchase amount/i,
    zh: "HKTVmall 派送訂單滿指定金額免運費",
  },
  {
    pattern: /the product will be delivered by hktvmall/i,
    zh: "由 HKTVmall 派送",
  },
  {
    pattern: /enjoy free delivery for orders above hkd\s?(\d+)/i,
    zh: "滿 HK$$1 免運費",
  },
  {
    pattern: /free shipping for orders above hkd\s?(\d+)/i,
    zh: "滿 HK$$1 免運費",
  },
  {
    pattern: /free shipping/i,
    zh: "免運費",
  },
  {
    pattern: /8-?hour delivery|h-?our delivery/i,
    zh: "8 小時送貨",
  },
];

export function formatPriceReviewShipping(note: string | null | undefined, language: Language): string {
  const value = String(note || "").trim();
  if (!value) return "運費以店舖頁面為準";
  if (language?.toLowerCase().startsWith("en")) return value;
  if (containsCjk(value)) return value;

  const translatedParts = value
    .split(/\s*[.;]\s*/)
    .map((part) => translateShippingPart(part.trim()))
    .filter(Boolean);

  return translatedParts.length ? dedupe(translatedParts).join("；") : value;
}

function translateShippingPart(value: string): string {
  if (!value) return "";
  for (const rule of SHIPPING_RULES) {
    if (rule.pattern.test(value)) return value.replace(rule.pattern, rule.zh);
  }
  return value;
}

function containsCjk(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

