import { fetchAuthSession } from "aws-amplify/auth";

export const PET_SHARE_LAMBDA_URL =
  "https://k4vkypglgsndbrrvq4cgtl7ame0bntdu.lambda-url.ap-southeast-1.on.aws/";

export type AuthMethodsSummary = {
  email: string;
  exists: boolean;
  canResetPassword: boolean;
  federatedOnly: boolean;
  needsLinking: boolean;
  socialProviders: string[];
  nativeSub: string | null;
  federatedSubs: string[];
};

async function getIdToken() {
  const session = await fetchAuthSession();
  const token = session?.tokens?.idToken?.toString();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return token;
}

async function callAuthLinkingLambda(body: Record<string, unknown>, requireAuth = false) {
  if (!PET_SHARE_LAMBDA_URL) {
    throw new Error("PET_SHARE_LAMBDA_URL is not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    headers.Authorization = `Bearer ${await getIdToken()}`;
  }

  const response = await fetch(PET_SHARE_LAMBDA_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

export async function checkAuthMethods(email: string): Promise<AuthMethodsSummary> {
  return callAuthLinkingLambda({
    action: "check_auth_methods",
    email: email.trim().toLowerCase(),
  });
}

export async function linkProviderAccount({
  email,
  password,
  provider = "Google",
}: {
  email: string;
  password: string;
  provider?: "Google" | "SignInWithApple";
}) {
  return callAuthLinkingLambda(
    {
      action: "link_provider",
      email: email.trim().toLowerCase(),
      password,
      provider,
    },
    true
  );
}

export async function setAccountPassword(newPassword: string) {
  return callAuthLinkingLambda(
    {
      action: "set_password",
      newPassword,
    },
    true
  );
}

export async function resolveSocialLinkingConflict(
  email: string,
  options: { currentSub?: string } = {}
) {
  const summary = await checkAuthMethods(email);
  if (!summary.exists) {
    return {
      summary,
      canSetPassword: false,
      needsAccountLink: false,
      linkProvider: null as "Google" | "SignInWithApple" | null,
    };
  }

  const currentSub = String(options.currentSub || "").trim();
  const nativeSub = String(summary.nativeSub || "").trim();
  const federatedSubs = Array.isArray(summary.federatedSubs) ? summary.federatedSubs : [];
  const isOnFederatedSub = Boolean(
    currentSub
      && nativeSub
      && currentSub !== nativeSub
      && (federatedSubs.includes(currentSub) || summary.needsLinking)
  );

  // Native email/password account already owns this email — social session must link.
  const needsAccountLink = Boolean(
    nativeSub
      && currentSub
      && currentSub !== nativeSub
      && (isOnFederatedSub || summary.needsLinking || summary.canResetPassword)
  );

  const canSetPassword = !needsAccountLink && Boolean(
    summary.federatedOnly
      || (summary.socialProviders.length > 0 && !summary.canResetPassword)
  );

  let linkProvider: "Google" | "SignInWithApple" | null = null;
  if (needsAccountLink) {
    if (summary.socialProviders.includes("Google")) {
      linkProvider = "Google";
    } else if (summary.socialProviders.includes("SignInWithApple")) {
      linkProvider = "SignInWithApple";
    } else {
      linkProvider = "Google";
    }
  }

  return { summary, canSetPassword, needsAccountLink, linkProvider };
}

export function getFederatedOnlyMessage(summary: AuthMethodsSummary, t: (key: string) => string) {
  if (summary.socialProviders.includes("Google") && summary.socialProviders.includes("SignInWithApple")) {
    return t("authLinking.federatedOnlyBoth");
  }
  if (summary.socialProviders.includes("Apple") || summary.socialProviders.includes("SignInWithApple")) {
    return t("authLinking.federatedOnlyApple");
  }
  if (summary.socialProviders.includes("Google")) {
    return t("authLinking.federatedOnlyGoogle");
  }
  return t("authLinking.socialOnlyGeneric");
}

export function getSocialOnlyMessage(summary: AuthMethodsSummary, t: (key: string) => string) {
  if (summary.socialProviders.includes("Google") && summary.socialProviders.includes("SignInWithApple")) {
    return t("authLinking.socialOnlyBoth");
  }
  if (summary.socialProviders.includes("Apple") || summary.socialProviders.includes("SignInWithApple")) {
    return t("authLinking.socialOnlyApple");
  }
  if (summary.socialProviders.includes("Google")) {
    return t("authLinking.socialOnlyGoogle");
  }
  return t("authLinking.socialOnlyGeneric");
}

export function isSocialOnlyAccount(summary: AuthMethodsSummary): boolean {
  return Boolean(
    summary.federatedOnly ||
      (summary.socialProviders.length > 0 && !summary.canResetPassword)
  );
}
