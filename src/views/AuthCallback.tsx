"use client";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signOut } from "aws-amplify/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { completeSocialLoginWithCode } from "@/services/authService";
import { resolveSocialLinkingConflict } from "@/services/authLinkingService";
import SetPasswordDialog from "@/components/SetPasswordDialog";
import LinkAccountDialog from "@/components/LinkAccountDialog";

const SOCIAL_REDIRECT_KEY = "petwell.social.redirect";

type LinkProvider = "Google" | "SignInWithApple";

type LinkContext = {
  email: string;
  provider: LinkProvider;
};

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setIsAuthenticated, setRequiresProfileCompletion, setUserInfo } = useAuth();
  const { openPanel, triggerAuthSuccess } = useAuthPanel();
  const hasStartedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [showLinkAccount, setShowLinkAccount] = useState(false);
  const [linkContext, setLinkContext] = useState<LinkContext | null>(null);

  const clearSocialRedirect = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SOCIAL_REDIRECT_KEY);
    }
  };

  const getStoredRedirect = () => {
    if (typeof window === "undefined") {
      return "/";
    }
    return window.sessionStorage.getItem(SOCIAL_REDIRECT_KEY) || "/";
  };

  const clearAuthState = () => {
    setUserInfo(null);
    setIsAuthenticated(false);
    setRequiresProfileCompletion(false);
  };

  const signOutLocalSession = async () => {
    try {
      await signOut({ global: true });
    } catch {
      try {
        await signOut();
      } catch {
        // Already signed out is fine.
      }
    }
  };

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const finalizeSocialLogin = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
          throw new Error("Missing social login callback parameters.");
        }

        const { userInfo, requiresProfileCompletion } = await completeSocialLoginWithCode(code, state);

        setUserInfo(userInfo);
        setIsAuthenticated(true);
        setRequiresProfileCompletion(requiresProfileCompletion);

        let linking = {
          canSetPassword: false,
          needsAccountLink: false,
          linkProvider: null as LinkProvider | null,
        };

        if (userInfo.email) {
          try {
            linking = await resolveSocialLinkingConflict(userInfo.email, {
              currentSub: userInfo.userId,
            });
          } catch (lookupError) {
            console.warn("resolveSocialLinkingConflict failed after social login:", lookupError);
            // Fail open to link when we have a federated session and email — matches mobile.
            linking = {
              canSetPassword: false,
              needsAccountLink: true,
              linkProvider: "Google",
            };
          }
        }

        if (linking.needsAccountLink) {
          // Do not treat as fully authenticated while linking is required.
          setIsAuthenticated(false);
          setRequiresProfileCompletion(false);
          setLinkContext({
            email: userInfo.email,
            provider: linking.linkProvider || "Google",
          });
          setShowLinkAccount(true);
          return;
        }

        if (linking.canSetPassword && !requiresProfileCompletion) {
          setShowSetPassword(true);
          return;
        }

        const redirectPath = getStoredRedirect();
        clearSocialRedirect();

        if (requiresProfileCompletion) {
          openPanel("PROFILE", userInfo.email);
          navigate(redirectPath, { replace: true });
          return;
        }

        triggerAuthSuccess();
        navigate(redirectPath, { replace: true });
      } catch (callbackError) {
        console.error("Error finishing social login:", callbackError);
        clearAuthState();
        setError(
          callbackError instanceof Error
            ? callbackError.message
            : t("auth.socialLoginFailed")
        );
      }
    };

    void finalizeSocialLogin();
  }, [location.search, navigate, openPanel, setIsAuthenticated, setRequiresProfileCompletion, setUserInfo, t, triggerAuthSuccess]);

  const handleLinkCancel = async () => {
    setShowLinkAccount(false);
    setLinkContext(null);
    clearSocialRedirect();
    clearAuthState();
    await signOutLocalSession();
    navigate("/", { replace: true });
  };

  const handleLinkClose = () => {
    setShowLinkAccount(false);
    setLinkContext(null);
  };

  const handleLinked = () => {
    clearAuthState();
  };

  return (
    <>
      <div className="container mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-16">
        <div className="w-full rounded-2xl border bg-background p-8 text-center shadow-sm">
          {error ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold">{t("auth.socialLoginFailed")}</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => navigate("/", { replace: true })}>
                {t("auth.returnHome")}
              </Button>
            </div>
          ) : showLinkAccount || showSetPassword ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold">{t("auth.finishingSocialLogin")}</h1>
              <p className="text-sm text-muted-foreground">
                {showLinkAccount
                  ? t("authLinking.linkAccountTitle")
                  : t("authLinking.setPasswordTitle")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h1 className="text-2xl font-semibold">{t("auth.finishingSocialLogin")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.redirectingToProvider")}
              </p>
            </div>
          )}
        </div>
      </div>

      <LinkAccountDialog
        open={showLinkAccount}
        email={linkContext?.email || ""}
        provider={linkContext?.provider || "Google"}
        onClose={handleLinkClose}
        onLinked={handleLinked}
        onCancel={handleLinkCancel}
      />

      <SetPasswordDialog
        open={showSetPassword}
        onClose={() => {
          setShowSetPassword(false);
          const redirectPath = getStoredRedirect();
          clearSocialRedirect();
          triggerAuthSuccess();
          navigate(redirectPath, { replace: true });
        }}
      />
    </>
  );
};

export default AuthCallback;
