export type ParsedMetric =
  | { kind: "numeric"; value: number; prefix: string; suffix: string }
  | { kind: "text"; text: string };

export function parseMetricValue(raw: string): ParsedMetric {
  const text = raw.trim();
  if (!/^~?[\d,]/.test(text)) {
    return { kind: "text", text };
  }

  let prefix = "";
  let rest = text;
  if (rest.startsWith("~")) {
    prefix = "~";
    rest = rest.slice(1);
  }

  const kMatch = rest.match(/^([\d,]+(?:\.\d+)?)\s*([Kk])(\+?.*)?$/);
  if (kMatch) {
    return {
      kind: "numeric",
      value: parseFloat(kMatch[1].replace(/,/g, "")),
      prefix,
      suffix: `${kMatch[2].toUpperCase()}${kMatch[3] ?? ""}`,
    };
  }

  const match = rest.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { kind: "text", text };
  }

  return {
    kind: "numeric",
    value: parseFloat(match[1].replace(/,/g, "")),
    prefix,
    suffix: match[2] ?? "",
  };
}

export function isBadgeMetric(value: string): boolean {
  return parseMetricValue(value).kind === "text";
}
