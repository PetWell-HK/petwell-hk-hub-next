const PHONE_EMAIL_SUFFIX = "@phone.petwellhk.com";
export const VOLUNTEER_HUB_URL = "https://suppaw.petwellhk.com";

export function isPhoneBootstrapEmail(email?: string | null) {
  return Boolean(email?.trim().toLowerCase().endsWith(PHONE_EMAIL_SUFFIX));
}

export function cognitoLoginUsername(input: string) {
  const trimmed = input.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  let digits = trimmed.replace(/[OoＯ○]/g, "0").replace(/\D/g, "");
  if (digits.startsWith("852") && digits.length === 11) digits = digits.slice(3);
  if (/^[2-9]\d{7}$/.test(digits)) return `+852${digits}`;
  return trimmed;
}

export function looksLikePhoneLogin(input: string) {
  return cognitoLoginUsername(input).startsWith("+852");
}

export async function claimPhoneEmail(idToken: string, email: string, password: string) {
  const response = await fetch(`${VOLUNTEER_HUB_URL}/api/account/claim-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ email, password }),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || "未能改成電郵登入");
}
