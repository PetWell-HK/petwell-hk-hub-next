import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LinkAccountDialog from "./LinkAccountDialog";

const linkProviderAccount = vi.fn();
const signInWithGoogle = vi.fn();
const signInWithApple = vi.fn();
const signOut = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("aws-amplify/auth", () => ({
  signOut: (...args: unknown[]) => signOut(...args),
}));

vi.mock("@/services/authLinkingService", () => ({
  linkProviderAccount: (...args: unknown[]) => linkProviderAccount(...args),
}));

vi.mock("@/services/authService", () => ({
  signInWithGoogle: (...args: unknown[]) => signInWithGoogle(...args),
  signInWithApple: (...args: unknown[]) => signInWithApple(...args),
}));

describe("LinkAccountDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signOut.mockResolvedValue(undefined);
    signInWithGoogle.mockResolvedValue(undefined);
    signInWithApple.mockResolvedValue(undefined);
  });

  it("links account with password then continues with Google", async () => {
    const user = userEvent.setup();
    const onLinked = vi.fn();
    const onClose = vi.fn();
    linkProviderAccount.mockResolvedValue({ ok: true });

    render(
      <LinkAccountDialog
        open
        email="user@example.com"
        provider="Google"
        onClose={onClose}
        onLinked={onLinked}
        onCancel={vi.fn()}
      />
    );

    await user.type(
      screen.getByLabelText("authLinking.linkAccountPassword"),
      "Secret123"
    );
    await user.click(screen.getByRole("button", { name: "authLinking.linkAccountSubmit" }));

    await waitFor(() => {
      expect(linkProviderAccount).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "Secret123",
        provider: "Google",
      });
      expect(onLinked).toHaveBeenCalled();
      expect(screen.getByText("authLinking.linkAccountSuccess")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "auth.continueWithGoogle" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ global: true });
      expect(onClose).toHaveBeenCalled();
      expect(signInWithGoogle).toHaveBeenCalled();
    });
  });

  it("shows invalid password error without calling onLinked", async () => {
    const user = userEvent.setup();
    const onLinked = vi.fn();
    linkProviderAccount.mockRejectedValue(new Error("ERR_INVALID_PASSWORD"));

    render(
      <LinkAccountDialog
        open
        email="user@example.com"
        provider="Google"
        onClose={vi.fn()}
        onLinked={onLinked}
        onCancel={vi.fn()}
      />
    );

    await user.type(
      screen.getByLabelText("authLinking.linkAccountPassword"),
      "wrong-password"
    );
    await user.click(screen.getByRole("button", { name: "authLinking.linkAccountSubmit" }));

    await waitFor(() => {
      expect(
        screen.getByText("authLinking.linkAccountInvalidPassword")
      ).toBeInTheDocument();
    });
    expect(onLinked).not.toHaveBeenCalled();
    expect(signInWithGoogle).not.toHaveBeenCalled();
  });

  it("calls onCancel when back is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn().mockResolvedValue(undefined);

    render(
      <LinkAccountDialog
        open
        email="user@example.com"
        provider="Google"
        onClose={vi.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "auth.back" }));

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });
});
