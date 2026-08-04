import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthMethodsSummary } from "./authLinkingService";
import {
  getSocialOnlyMessage,
  isSocialOnlyAccount,
  resolveSocialLinkingConflict,
} from "./authLinkingService";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(async () => ({
    tokens: { idToken: { toString: () => "test-id-token" } },
  })),
}));

const mockSummary = (overrides: Partial<AuthMethodsSummary> = {}): AuthMethodsSummary => ({
  email: "user@example.com",
  exists: true,
  canResetPassword: false,
  federatedOnly: false,
  needsLinking: false,
  socialProviders: [],
  nativeSub: null,
  federatedSubs: [],
  ...overrides,
});

describe("isSocialOnlyAccount", () => {
  it("returns true for federated-only Google accounts", () => {
    expect(
      isSocialOnlyAccount(
        mockSummary({
          federatedOnly: true,
          socialProviders: ["Google"],
        })
      )
    ).toBe(true);
  });

  it("returns true when social exists but password reset is not available", () => {
    expect(
      isSocialOnlyAccount(
        mockSummary({
          socialProviders: ["Google"],
          canResetPassword: false,
          federatedOnly: false,
        })
      )
    ).toBe(true);
  });

  it("returns false when native password login is available", () => {
    expect(
      isSocialOnlyAccount(
        mockSummary({
          socialProviders: ["Google"],
          canResetPassword: true,
          federatedOnly: false,
          nativeSub: "native-sub",
        })
      )
    ).toBe(false);
  });

  it("returns false for brand-new emails with no providers", () => {
    expect(
      isSocialOnlyAccount(
        mockSummary({
          exists: false,
          socialProviders: [],
          canResetPassword: false,
        })
      )
    ).toBe(false);
  });
});

describe("getSocialOnlyMessage", () => {
  const t = (key: string) => key;

  it("returns Google-specific copy", () => {
    expect(
      getSocialOnlyMessage(mockSummary({ socialProviders: ["Google"] }), t)
    ).toBe("authLinking.socialOnlyGoogle");
  });

  it("returns Apple-specific copy", () => {
    expect(
      getSocialOnlyMessage(mockSummary({ socialProviders: ["SignInWithApple"] }), t)
    ).toBe("authLinking.socialOnlyApple");
  });

  it("returns both-providers copy", () => {
    expect(
      getSocialOnlyMessage(
        mockSummary({ socialProviders: ["Google", "SignInWithApple"] }),
        t
      )
    ).toBe("authLinking.socialOnlyBoth");
  });
});

describe("resolveSocialLinkingConflict", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const stubCheckAuthMethods = (summary: AuthMethodsSummary) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => summary,
      }))
    );
  };

  it("does not require link or set-password when email does not exist", async () => {
    stubCheckAuthMethods(
      mockSummary({
        exists: false,
      })
    );

    const result = await resolveSocialLinkingConflict("new@example.com", {
      currentSub: "google-sub",
    });

    expect(result.needsAccountLink).toBe(false);
    expect(result.canSetPassword).toBe(false);
    expect(result.linkProvider).toBeNull();
  });

  it("offers set-password for federated-only Google users", async () => {
    stubCheckAuthMethods(
      mockSummary({
        federatedOnly: true,
        socialProviders: ["Google"],
        federatedSubs: ["google-sub"],
        canResetPassword: false,
      })
    );

    const result = await resolveSocialLinkingConflict("google@example.com", {
      currentSub: "google-sub",
    });

    expect(result.needsAccountLink).toBe(false);
    expect(result.canSetPassword).toBe(true);
  });

  it("requires account link when native password account exists and session is federated", async () => {
    stubCheckAuthMethods(
      mockSummary({
        canResetPassword: true,
        needsLinking: true,
        socialProviders: ["Google"],
        nativeSub: "native-sub",
        federatedSubs: ["google-sub"],
      })
    );

    const result = await resolveSocialLinkingConflict("linked@example.com", {
      currentSub: "google-sub",
    });

    expect(result.needsAccountLink).toBe(true);
    expect(result.canSetPassword).toBe(false);
    expect(result.linkProvider).toBe("Google");
  });

  it("does not offer set-password when link is required", async () => {
    stubCheckAuthMethods(
      mockSummary({
        canResetPassword: true,
        federatedOnly: false,
        socialProviders: ["Google"],
        nativeSub: "native-sub",
        federatedSubs: ["google-sub"],
        needsLinking: true,
      })
    );

    const result = await resolveSocialLinkingConflict("both@example.com", {
      currentSub: "google-sub",
    });

    expect(result.needsAccountLink).toBe(true);
    expect(result.canSetPassword).toBe(false);
  });

  it("does not require link when current session is already the native sub", async () => {
    stubCheckAuthMethods(
      mockSummary({
        canResetPassword: true,
        socialProviders: ["Google"],
        nativeSub: "native-sub",
        federatedSubs: ["google-sub"],
        needsLinking: false,
      })
    );

    const result = await resolveSocialLinkingConflict("native@example.com", {
      currentSub: "native-sub",
    });

    expect(result.needsAccountLink).toBe(false);
    expect(result.canSetPassword).toBe(false);
  });

  it("picks Apple as link provider when only Apple is present", async () => {
    stubCheckAuthMethods(
      mockSummary({
        canResetPassword: true,
        needsLinking: true,
        socialProviders: ["SignInWithApple"],
        nativeSub: "native-sub",
        federatedSubs: ["apple-sub"],
      })
    );

    const result = await resolveSocialLinkingConflict("apple@example.com", {
      currentSub: "apple-sub",
    });

    expect(result.needsAccountLink).toBe(true);
    expect(result.linkProvider).toBe("SignInWithApple");
  });
});
