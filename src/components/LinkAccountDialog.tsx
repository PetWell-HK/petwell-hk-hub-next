import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signOut } from "aws-amplify/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { linkProviderAccount } from "@/services/authLinkingService";
import { signInWithApple, signInWithGoogle } from "@/services/authService";

type LinkProvider = "Google" | "SignInWithApple";

type LinkAccountDialogProps = {
  open: boolean;
  email: string;
  provider?: LinkProvider;
  onClose: () => void;
  onLinked?: () => void;
  onCancel?: () => void | Promise<void>;
};

const errorMessage = (error: unknown) =>
  String(error instanceof Error ? error.message : error || "");

const isInvalidPasswordError = (error: unknown) => {
  const message = errorMessage(error);
  return (
    message.includes("ERR_INVALID_PASSWORD")
    || message.includes("NotAuthorizedException")
    || message.includes("Incorrect")
    || message.toLowerCase().includes("incorrect username or password")
  );
};

const isTempPasswordError = (error: unknown) => {
  const message = errorMessage(error);
  return (
    message.includes("NEW_PASSWORD_REQUIRED")
    || message.includes("PasswordResetRequiredException")
    || message.includes("UserNotConfirmedException")
    || message.toLowerCase().includes("temporary password")
    || message.toLowerCase().includes("password change required")
  );
};

const isAuthFlowError = (error: unknown) => {
  const message = errorMessage(error);
  return (
    message.includes("ERR_AUTH_FLOW")
    || message.includes("Auth flow not enabled")
    || message.includes("ADMIN_USER_PASSWORD_AUTH")
  );
};

const isNativeMissingError = (error: unknown) =>
  errorMessage(error).includes("ERR_NATIVE_USER_NOT_FOUND");

const isMergeError = (error: unknown) => {
  const message = errorMessage(error);
  return (
    message.includes("ERR_LINK_MERGE")
    || message.includes("Merging is not currently supported")
  );
};

const LinkAccountDialog = ({
  open,
  email,
  provider = "Google",
  onClose,
  onLinked,
  onCancel,
}: LinkAccountDialogProps) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reauthLoading, setReauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedProvider: LinkProvider =
    provider === "SignInWithApple" ? "SignInWithApple" : "Google";

  const resetLocalState = () => {
    setPassword("");
    setSuccess(false);
    setLoading(false);
    setReauthLoading(false);
    setError(null);
  };

  const handleCancel = async () => {
    resetLocalState();
    try {
      await onCancel?.();
    } catch (cancelError) {
      console.warn("Link account cancel cleanup failed:", cancelError);
    }
  };

  const mapLinkError = (linkError: unknown) => {
    if (isInvalidPasswordError(linkError)) {
      return t("authLinking.linkAccountInvalidPassword");
    }
    if (isTempPasswordError(linkError)) {
      return t("authLinking.linkAccountTempPasswordRequired");
    }
    if (isAuthFlowError(linkError)) {
      return t("authLinking.linkAccountAuthFlowError");
    }
    if (isNativeMissingError(linkError)) {
      return t("authLinking.linkAccountNativeMissing");
    }
    if (isMergeError(linkError)) {
      return t("authLinking.linkAccountMergeError");
    }
    return t("authLinking.linkAccountServerError");
  };

  const handleSubmit = async () => {
    if (!email?.includes("@")) {
      setError(t("auth.unknownError"));
      return;
    }
    if (!password) {
      setError(t("authLinking.linkAccountPassword"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await linkProviderAccount({
        email,
        password,
        provider: normalizedProvider,
      });
      setSuccess(true);
      onLinked?.();
    } catch (linkError) {
      setError(mapLinkError(linkError));
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSocial = async () => {
    setReauthLoading(true);
    setError(null);

    try {
      // Drop the orphan federated session before Hosted UI re-auth.
      // Prefer Amplify signOut only — avoid Hosted UI logout redirect.
      try {
        await signOut({ global: true });
      } catch {
        try {
          await signOut();
        } catch {
          // Already signed out is fine.
        }
      }

      resetLocalState();
      onClose();

      if (normalizedProvider === "SignInWithApple") {
        await signInWithApple();
      } else {
        await signInWithGoogle();
      }
    } catch (reauthError) {
      setError(
        reauthError instanceof Error
          ? reauthError.message
          : t("auth.socialLoginFailed")
      );
      setReauthLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading && !reauthLoading) {
          void handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("authLinking.linkAccountTitle")}</DialogTitle>
          <DialogDescription>
            {success
              ? t("authLinking.linkAccountSuccess")
              : t("authLinking.linkAccountDescription")}
          </DialogDescription>
        </DialogHeader>

        {email ? (
          <p className="text-sm font-medium truncate">{email}</p>
        ) : null}

        {success ? (
          <div className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button
              className="w-full bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
              onClick={handleContinueSocial}
              disabled={reauthLoading}
            >
              {reauthLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.redirectingToProvider")}
                </>
              ) : normalizedProvider === "SignInWithApple" ? (
                t("auth.continueWithApple")
              ) : (
                t("auth.continueWithGoogle")
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {t("authLinking.linkAccountTempPasswordHint")}
            </p>
            <div className="space-y-2">
              <Label htmlFor="link-account-password">{t("authLinking.linkAccountPassword")}</Label>
              <Input
                id="link-account-password"
                type="password"
                value={password}
                disabled={loading}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !loading) {
                    void handleSubmit();
                  }
                }}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => void handleCancel()}
                disabled={loading}
              >
                {t("auth.back")}
              </Button>
              <Button
                className="flex-1 bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
                onClick={() => void handleSubmit()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.verifying")}
                  </>
                ) : (
                  t("authLinking.linkAccountSubmit")
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LinkAccountDialog;
