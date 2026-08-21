import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AuthCallback from "./AuthCallback";

const completeSocialLoginWithCode = vi.fn();
const resolveSocialLinkingConflict = vi.fn();
const setIsAuthenticated = vi.fn();
const setRequiresProfileCompletion = vi.fn();
const setUserInfo = vi.fn();
const openPanel = vi.fn();
const triggerAuthSuccess = vi.fn();
const navigate = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("code=abc&state=xyz"),
}));

vi.mock("@/hooks/useAppNavigate", () => ({
  useAppNavigate: () => navigate,
}));

vi.mock("aws-amplify/auth", () => ({
  signOut: vi.fn(async () => undefined),
}));

vi.mock("@/services/authService", () => ({
  completeSocialLoginWithCode: (...args: unknown[]) => completeSocialLoginWithCode(...args),
}));

vi.mock("@/services/authLinkingService", () => ({
  resolveSocialLinkingConflict: (...args: unknown[]) => resolveSocialLinkingConflict(...args),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    setIsAuthenticated,
    setRequiresProfileCompletion,
    setUserInfo,
  }),
}));

vi.mock("@/contexts/AuthPanelContext", () => ({
  useAuthPanel: () => ({
    openPanel,
    triggerAuthSuccess,
  }),
}));

vi.mock("@/components/SetPasswordDialog", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div>set-password-dialog</div> : null,
}));

vi.mock("@/components/LinkAccountDialog", () => ({
  default: ({ open, email }: { open: boolean; email: string }) =>
    open ? <div>link-account-dialog:{email}</div> : null,
}));

const renderCallback = () => render(<AuthCallback />);

describe("AuthCallback linking branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    completeSocialLoginWithCode.mockResolvedValue({
      userInfo: {
        userId: "google-sub",
        username: "google_123",
        email: "user@example.com",
      },
      requiresProfileCompletion: false,
    });
  });

  it("opens link account dialog when needsAccountLink is true", async () => {
    resolveSocialLinkingConflict.mockResolvedValue({
      needsAccountLink: true,
      canSetPassword: false,
      linkProvider: "Google",
    });

    renderCallback();

    await waitFor(() => {
      expect(resolveSocialLinkingConflict).toHaveBeenCalledWith("user@example.com", {
        currentSub: "google-sub",
      });
      expect(screen.getByText("link-account-dialog:user@example.com")).toBeInTheDocument();
    });

    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(screen.queryByText("set-password-dialog")).not.toBeInTheDocument();
    expect(triggerAuthSuccess).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("opens set password dialog when federated-only and no link needed", async () => {
    resolveSocialLinkingConflict.mockResolvedValue({
      needsAccountLink: false,
      canSetPassword: true,
      linkProvider: null,
    });

    renderCallback();

    await waitFor(() => {
      expect(screen.getByText("set-password-dialog")).toBeInTheDocument();
    });

    expect(screen.queryByText(/link-account-dialog/)).not.toBeInTheDocument();
    expect(triggerAuthSuccess).not.toHaveBeenCalled();
  });

  it("navigates home when neither link nor set-password is needed", async () => {
    resolveSocialLinkingConflict.mockResolvedValue({
      needsAccountLink: false,
      canSetPassword: false,
      linkProvider: null,
    });

    renderCallback();

    await waitFor(() => {
      expect(triggerAuthSuccess).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("fail-opens to link dialog when conflict lookup throws", async () => {
    resolveSocialLinkingConflict.mockRejectedValue(new Error("lambda down"));

    renderCallback();

    await waitFor(() => {
      expect(screen.getByText("link-account-dialog:user@example.com")).toBeInTheDocument();
    });

    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
  });
});
