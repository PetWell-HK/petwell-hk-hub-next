import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { signUp, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, getCurrentUser, confirmSignIn, signOut } from "aws-amplify/auth";
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
import { getCurrentUserInfo, signInWithAutoSignOut, signOutUser } from "@/services/authService";
import {
  checkAuthMethods,
  getFederatedOnlyMessage,
  getSocialOnlyMessage,
  isSocialOnlyAccount,
} from "@/services/authLinkingService";
import { ClientRegistrationProfile, createClientProfileForCurrentUser, getClientByEmail, getOrCreateClient, updateExistingClientProfile } from "@/services/forumApi";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
const logo = "/assets/logo.png";
import { signInWithApple, signInWithGoogle } from "@/services/authService";
import { Apple, ArrowLeft, Loader2, Mail, User } from "lucide-react";

const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "Aa1!" + password;
};

const DEFAULT_PROFILE = {
  firstName: "",
  lastName: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const SOCIAL_REDIRECT_KEY = "petwell.social.redirect";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.64 12.2c0-.64-.06-1.25-.16-1.84H12v3.48h5.41a4.63 4.63 0 0 1-2.01 3.04v2.52h3.24c1.89-1.74 3-4.3 3-7.2Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.52c-.9.6-2.04.96-3.37.96-2.59 0-4.77-1.75-5.56-4.1H3.09v2.58A9.99 9.99 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.44 13.9A5.98 5.98 0 0 1 6.13 12c0-.66.11-1.3.31-1.9V7.52H3.09A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.09 4.48l3.35-2.58Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.98c1.47 0 2.78.5 3.82 1.48l2.86-2.86C16.95 2.98 14.69 2 12 2A9.99 9.99 0 0 0 3.09 7.52l3.35 2.58c.79-2.35 2.97-4.12 5.56-4.12Z"
    />
  </svg>
);

const AuthPanel = () => {
  const { t } = useTranslation();
  const {
    isAuthenticated,
    requiresProfileCompletion,
    setIsAuthenticated,
    setRequiresProfileCompletion,
    setUserInfo,
    userInfo
  } = useAuth();
  const { isOpen, currentView: panelView, email: panelEmail, closePanel, openPanel, setView, setEmail: setContextEmail, triggerAuthSuccess } = useAuthPanel();

  const currentView = panelView;
  const isProfileCompletionRequired = currentView === "PROFILE" && requiresProfileCompletion;
  const [email, setEmail] = useState(panelEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialProviderLoading, setSocialProviderLoading] = useState<"google" | "apple" | null>(null);
  const [codePaused, setCodePaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [userType, setUserType] = useState<"NEW" | "EXISTING" | null>(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [hasPendingSignUp, setHasPendingSignUp] = useState(false);
  const tempPasswordRef = useRef<string>("");

  // Sync email with context
  useEffect(() => {
    if (isOpen) {
      setEmail(panelEmail);
    }
  }, [isOpen, panelEmail]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setContextEmail(newEmail);
    setError(null);
  };

  // Reset form state when panel opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setConfirmationCode("");
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSocialProviderLoading(null);
      setCodePaused(false);
      setTimeRemaining(60);
      setUserType(null);
      setProfile(DEFAULT_PROFILE);
      setHasPendingSignUp(false);
      tempPasswordRef.current = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated && requiresProfileCompletion && userInfo?.email && !isOpen) {
      openPanel("PROFILE", userInfo.email);
    }
  }, [isAuthenticated, isOpen, openPanel, requiresProfileCompletion, userInfo?.email]);

  // Countdown timer for resend code
  useEffect(() => {
    if (codePaused) {
      const countdownInterval = setInterval(() => {
        if (timeRemaining <= 0) {
          setTimeRemaining(60);
          setCodePaused(false);
        } else {
          setTimeRemaining((prev) => prev - 1);
        }
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [codePaused, timeRemaining]);

  const isValidEmail = (emailStr: string) => {
    return emailStr
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const isValidHongKongPhone = (phoneStr: string) => /^\d{8}$/.test(phoneStr);
  const isValidPassword = (password: string) =>
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const handleProfileFieldChange = (field: keyof typeof DEFAULT_PROFILE, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setError(null);
    setSocialProviderLoading(provider);

    try {
      if (typeof window !== "undefined") {
        const redirectPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.sessionStorage.setItem(SOCIAL_REDIRECT_KEY, redirectPath || "/");
      }

      if (provider === "google") {
        await signInWithGoogle();
        return;
      }

      await signInWithApple();
    } catch (socialError: any) {
      console.error("Social login error:", socialError);
      setError(socialError?.message || t("auth.socialLoginFailed"));
      setSocialProviderLoading(null);
    }
  };

  const buildRegistrationProfile = (): ClientRegistrationProfile => {
    const firstName = profile.firstName.trim();
    const lastName = profile.lastName.trim();

    return {
      firstName,
      lastName,
      phone: profile.phone.replace(/\D/g, ""),
      displayName: `${firstName} ${lastName}`.trim(),
    };
  };

  const handleExistingUserLogin = async () => {
    if (!password) {
      setError(t("auth.passwordRequired"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { isSignedIn, nextStep } = await signInWithAutoSignOut({
        username: email,
        password,
        options: { authFlowType: "USER_PASSWORD_AUTH" }
      });

      if (isSignedIn) {
        await completeLogin();
        return;
      }

      if (nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNewPassword("");
        setConfirmNewPassword("");
        setView("NEW_PASSWORD");
        setLoading(false);
        return;
      }

      setError(t("auth.unknownError"));
      setLoading(false);
    } catch (error: any) {
      console.error("Existing user login error:", error);

      if (error.name === "UserNotConfirmedException") {
        setUserType("NEW");
        setHasPendingSignUp(true);
        try {
          await resendSignUpCode({ username: email });
        } catch (_) {}
        setCodePaused(true);
        setTimeRemaining(60);
        setView("OTP");
        return;
      }

      if (error.name === "NotAuthorizedException") {
        setError(t("auth.invalidCredentials"));
        setLoading(false);
        return;
      }

      setError(error.message || t("auth.unknownError"));
      setLoading(false);
    }
  };

  const abortPendingSignIn = async () => {
    try {
      await signOut();
    } catch {
      // Ignore — used to drop an unfinished Cognito challenge.
    }
  };

  const handleConfirmNewPassword = async () => {
    if (!newPassword) {
      setError(t("auth.passwordRequired"));
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError(t("auth.passwordInvalid"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: newPassword,
      });

      if (isSignedIn) {
        await completeLogin();
        return;
      }

      setError(t("auth.unknownError"));
      setLoading(false);
    } catch (error: any) {
      console.error("Confirm new password error:", error);
      setError(error.message || t("auth.unknownError"));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError(null);

    try {
      const summary = await checkAuthMethods(email);
      if (summary.exists && summary.federatedOnly) {
        setError(getFederatedOnlyMessage(summary, t));
        return;
      }

      setUserType("EXISTING");
      await resetPassword({ username: email });
      setCodePaused(true);
      setTimeRemaining(60);
      setConfirmationCode("");
      setView("OTP");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setError(error.message || t("auth.unknownError"));
    } finally {
      setLoading(false);
    }
  };

  // Step 1: User enters email â†’ detect new/existing flow
  const handleEmailSubmit = async () => {
    setError(null);
    setLoading(true);

    if (!email || !isValidEmail(email)) {
      setError(t("auth.emailInvalid"));
      setLoading(false);
      return;
    }

    try {
      // Check if already signed in
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const userInfo = await getCurrentUserInfo();
          setIsAuthenticated(true);
          setUserInfo(userInfo);
          triggerAuthSuccess();
          closePanel();
          setLoading(false);
          return;
        }
      } catch (_) {
        // Not signed in, continue
      }

      // Check if user exists by trying dummy password
      let isNewUser = false;
      try {
        await signInWithAutoSignOut({
          username: email,
          password: "X7p!wqLz2#__dummy__",
          options: { authFlowType: "USER_PASSWORD_AUTH" }
        });
        isNewUser = false;
      } catch (checkError: any) {
        if (checkError.name === "UserNotFoundException") {
          // Federated Cognito usernames are google_â€¦ / signinwithapple_â€¦, not the email.
          // Probe by email returns UserNotFound â€” must check social methods before treating as NEW.
          try {
            const summary = await checkAuthMethods(email);
            if (!summary.exists) {
              isNewUser = true;
            } else if (isSocialOnlyAccount(summary)) {
              setError(getSocialOnlyMessage(summary, t));
              setView("LANDING");
              return;
            } else {
              isNewUser = false;
            }
          } catch (lookupError) {
            console.warn("checkAuthMethods failed during email probe:", lookupError);
            setError(t("auth.unknownError"));
            setView("LANDING");
            return;
          }
        } else if (checkError.name === "NotAuthorizedException") {
          isNewUser = false;
        } else if (checkError.name === "UserNotConfirmedException") {
          // Orphan UNCONFIRMED native next to Google/Apple â€” steer back to social login.
          try {
            const summary = await checkAuthMethods(email);
            if (summary.exists && isSocialOnlyAccount(summary)) {
              setError(getSocialOnlyMessage(summary, t));
              setView("LANDING");
              return;
            }
          } catch (lookupError) {
            console.warn("checkAuthMethods failed for unconfirmed user:", lookupError);
          }
          setUserType("NEW");
          setHasPendingSignUp(true);
          try {
            await resendSignUpCode({ username: email });
          } catch (_) {}
          setCodePaused(true);
          setTimeRemaining(60);
          setView("PROFILE");
          return;
        } else {
          throw checkError;
        }
      }

      if (isNewUser) {
        setUserType("NEW");
        setHasPendingSignUp(false);
        setView("PROFILE");
        return;
      } else {
        setUserType("EXISTING");
        setPassword("");
        setView("PASSWORD");
        return;
      }
    } catch (error: any) {
      console.error("Email submit error:", error);
      setError(error.message || t("auth.unknownError"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User enters OTP code â†’ verify & auto-login
  const handleVerifyOTP = async () => {
    if (confirmationCode.length === 0) {
      setError(t("auth.fillConfirmationCode"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (userType === "NEW") {
        const { isSignUpComplete } = await confirmSignUp({
          username: email,
          confirmationCode
        });

        if (isSignUpComplete) {
          const { isSignedIn } = await signInWithAutoSignOut({
            username: email,
            password: tempPasswordRef.current,
            options: { authFlowType: "USER_PASSWORD_AUTH" }
          });

          if (isSignedIn) {
            await completeLogin(buildRegistrationProfile());
            return;
          }
        }
      } else {
        const randomPassword = generateRandomPassword();
        await confirmResetPassword({
          username: email,
          confirmationCode,
          newPassword: randomPassword
        });

        const { isSignedIn } = await signInWithAutoSignOut({
          username: email,
          password: randomPassword,
          options: { authFlowType: "USER_PASSWORD_AUTH" }
        });

        if (isSignedIn) {
          await completeLogin();
          return;
        }
      }

      setLoading(false);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
      if (error.message?.includes("Current status is CONFIRMED") && userType === "NEW") {
        try {
          const { isSignedIn } = await signInWithAutoSignOut({
            username: email,
            password: tempPasswordRef.current,
            options: { authFlowType: "USER_PASSWORD_AUTH" }
          });
          if (isSignedIn) {
            await completeLogin(buildRegistrationProfile());
            return;
          }
        } catch (_) {}
      }

      if (error.message?.includes("already signed in") || error.name === "UserAlreadySignedInException") {
        if (userType === "NEW") {
          await completeLogin(buildRegistrationProfile());
          return;
        }
        await completeLogin();
        return;
      }

      setLoading(false);
      setError(error.message || t("auth.unknownError"));
    }
  };

  // Step 3: New user provides required profile details
  const handleCompleteProfile = async () => {
    const firstName = profile.firstName.trim();
    const lastName = profile.lastName.trim();
    const phone = profile.phone.replace(/\D/g, "");
    const password = profile.password;
    const confirmPassword = profile.confirmPassword;

    if (!firstName) {
      setError(t("auth.firstNameRequired"));
      return;
    }

    if (!lastName) {
      setError(t("auth.lastNameRequired"));
      return;
    }

    if (!isValidHongKongPhone(phone)) {
      setError(t("auth.phoneInvalid"));
      return;
    }

    if (userType === "NEW") {
      if (!isValidPassword(password)) {
        setError(t("auth.passwordInvalid"));
        return;
      }

      if (password !== confirmPassword) {
        setError(t("auth.passwordsDoNotMatch"));
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const registrationProfile = {
        firstName,
        lastName,
        phone,
        displayName: `${firstName} ${lastName}`.trim(),
      };

      if (userType === "NEW") {
        // Hard block: email already tied to Google/Apple must not create a second Cognito user.
        try {
          const summary = await checkAuthMethods(email);
          const hasSocial = summary.socialProviders.length > 0;
          if (summary.exists && (summary.federatedOnly || hasSocial)) {
            const message =
              summary.federatedOnly || !summary.canResetPassword
                ? getSocialOnlyMessage(summary, t)
                : t("authLinking.useExistingLogin");
            setError(message);
            setHasPendingSignUp(false);
            setView("LANDING");
            setLoading(false);
            return;
          }
        } catch (lookupError) {
          console.warn("checkAuthMethods failed before signUp:", lookupError);
        }

        tempPasswordRef.current = password;

        if (!hasPendingSignUp) {
          await signUp({
            username: email,
            password,
            options: {
              userAttributes: { email }
            }
          });
          setHasPendingSignUp(true);
        }

        setCodePaused(true);
        setTimeRemaining(60);
        setView("OTP");
        setLoading(false);
        return;
      }

      await completeLogin(registrationProfile);
    } catch (err) {
      console.error("Error completing profile:", err);
      setError(err instanceof Error ? err.message : t("auth.unknownError"));
      setLoading(false);
    }
  };

  const completeLogin = async (registrationProfile?: ClientRegistrationProfile) => {
    try {
      if (userType === "NEW") {
        await getOrCreateClient(email, email, registrationProfile);
      } else if (registrationProfile && requiresProfileCompletion) {
        const existingClient = await getClientByEmail(email);
        if (existingClient) {
          try {
            await updateExistingClientProfile(email, email, registrationProfile);
          } catch (profileUpdateError: any) {
            const message = profileUpdateError?.message || "";
            if (!message.includes("Not Authorized") && !message.includes("Unauthorized")) {
              throw profileUpdateError;
            }
            await createClientProfileForCurrentUser(email, email, registrationProfile);
          }
        } else {
          await createClientProfileForCurrentUser(email, email, registrationProfile);
        }
      }
      const userInfo = await getCurrentUserInfo();
      setUserInfo(userInfo);
    } catch (infoError: any) {
      console.error("Error completing login:", infoError);
      setError(infoError?.message || t("auth.unknownError"));
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);
    setRequiresProfileCompletion(false);
    triggerAuthSuccess();
    closePanel();
    setLoading(false);
  };

  const handleResendCode = async () => {
    try {
      if (userType === "NEW") {
        await resendSignUpCode({ username: email });
      } else {
        await resetPassword({ username: email });
      }
      setCodePaused(true);
      setTimeRemaining(60);
      setError(null);
    } catch (error: any) {
      setError(error.message || t("auth.failedToResendCode"));
    }
  };

  const handleForcedProfileClose = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Forced profile completion logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setRequiresProfileCompletion(false);
      setUserInfo(null);
      setError(null);
      closePanel();
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case "LANDING":
        return t("auth.welcomeBack");
      case "PASSWORD":
        return t("auth.login");
      case "OTP":
        return t("auth.verifyEmail");
      case "PROFILE":
        return t("auth.completeProfile");
      case "NEW_PASSWORD":
        return t("auth.setNewPassword");
      default: {
        const _exhaustive: never = currentView;
        return _exhaustive;
      }
    }
  };

  const getDescription = () => {
    switch (currentView) {
      case "LANDING":
        return t("auth.enterYourEmailToContinue");
      case "PASSWORD":
        return t("auth.enterPasswordToContinue");
      case "OTP":
        return `${t("auth.otpSentTo")} ${email}`;
      case "PROFILE":
        return t("auth.completeProfileDesc");
      case "NEW_PASSWORD":
        return t("auth.newPasswordRequiredDesc");
      default: {
        const _exhaustive: never = currentView;
        return _exhaustive;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (isProfileCompletionRequired) {
          void handleForcedProfileClose();
          return;
        }
        if (currentView === "NEW_PASSWORD") {
          void abortPendingSignIn();
        }
        closePanel();
      }
    }}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (isProfileCompletionRequired) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (isProfileCompletionRequired) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="PetWell Logo" className="h-10 w-auto" />
          </div>
          <DialogTitle className="text-2xl text-center">{getTitle()}</DialogTitle>
          <DialogDescription className="text-base text-center">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {/* LANDING VIEW - Email Input */}
          {currentView === "LANDING" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleEmailSubmit();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleEmailSubmit}
                disabled={loading || socialProviderLoading !== null}
                className="w-full bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("auth.submit")}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {t("auth.getCode")}
                  </>
                )}
              </Button>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide text-muted-foreground">
                  <span className="bg-background px-2">{t("auth.orContinueWith")}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={loading || socialProviderLoading !== null}
                  onClick={() => handleSocialLogin("google")}
                  className="w-full"
                >
                  {socialProviderLoading === "google" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.redirectingToProvider")}
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="ml-2">{t("auth.continueWithGoogle")}</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={loading || socialProviderLoading !== null}
                  onClick={() => handleSocialLogin("apple")}
                  className="w-full"
                >
                  {socialProviderLoading === "apple" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.redirectingToProvider")}
                    </>
                  ) : (
                    <>
                      <Apple className="h-4 w-4" />
                      <span className="ml-2">{t("auth.continueWithApple")}</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {t("auth.otpExplanation")}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t("authLinking.signInMethodHint")}
              </p>
            </>
          )}

          {/* PASSWORD VIEW - Existing user password login */}
          {currentView === "PASSWORD" && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{email}</span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-[#FF902A] shrink-0"
                  onClick={() => {
                    setView("LANDING");
                    setPassword("");
                    setError(null);
                  }}
                >
                  {t("auth.changeEmail")}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-login">{t("auth.loginPassword")}</Label>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder={t("auth.passwordPlaceholder")}
                  disabled={loading}
                  autoFocus
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleExistingUserLogin();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleExistingUserLogin}
                disabled={loading || !password}
                className="w-full bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("auth.verifying")}
                  </>
                ) : (
                  t("auth.login")
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-[#FF902A] font-semibold"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  {t("auth.forgotPassword")}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {t("authLinking.signInMethodHint")}
              </p>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={() => {
                    setView("LANDING");
                    setPassword("");
                    setError(null);
                  }}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("auth.back")}
                </Button>
              </div>
            </>
          )}

          {/* NEW_PASSWORD VIEW - Cognito FORCE_CHANGE_PASSWORD challenge */}
          {currentView === "NEW_PASSWORD" && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{email}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">{t("auth.password")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder={t("auth.passwordPlaceholder")}
                  disabled={loading}
                  autoFocus
                  autoComplete="new-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleConfirmNewPassword();
                    }
                  }}
                />
                <div className="text-xs text-muted-foreground">{t("auth.passwordHint")}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">{t("auth.confirmPassword")}</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  disabled={loading}
                  autoComplete="new-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleConfirmNewPassword();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleConfirmNewPassword}
                disabled={loading || !newPassword || !confirmNewPassword}
                className="w-full bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("auth.savingPassword")}
                  </>
                ) : (
                  t("auth.setNewPassword")
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={() => {
                    void abortPendingSignIn();
                    setView("PASSWORD");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setError(null);
                  }}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("auth.back")}
                </Button>
              </div>
            </>
          )}

          {/* OTP VIEW - Code Input */}
          {currentView === "OTP" && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{email}</span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-[#FF902A] shrink-0"
                  onClick={() => {
                    setView("LANDING");
                    setConfirmationCode("");
                    setError(null);
                  }}
                >
                  {t("auth.changeEmail")}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp-code">{t("auth.verificationCode")}</Label>
                <Input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  value={confirmationCode}
                  onChange={(e) => {
                    setConfirmationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError(null);
                  }}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyOTP();
                    }
                  }}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {t("auth.noRecieveCode")}{" "}
                {codePaused ? (
                  <span className="text-foreground font-medium">
                    {t("auth.wait")} {timeRemaining} {t("auth.getNewCode")}
                  </span>
                ) : (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[#FF902A] font-semibold"
                    onClick={handleResendCode}
                  >
                    {t("auth.resendCode")}
                  </Button>
                )}
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || confirmationCode.length < 6}
                className="w-full bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("auth.verifying")}
                  </>
                ) : (
                  t("auth.verifyAndLogin")
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={() => {
                    setView("LANDING");
                    setConfirmationCode("");
                    setError(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("auth.back")}
                </Button>
              </div>
            </>
          )}

          {/* PROFILE VIEW - Collect required details for new users */}
          {currentView === "PROFILE" && (
            <>
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-sm font-medium text-foreground">{email}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleProfileFieldChange("firstName", e.target.value)}
                    placeholder={t("auth.firstNamePlaceholder")}
                    disabled={loading}
                    autoFocus
                    maxLength={40}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleCompleteProfile();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleProfileFieldChange("lastName", e.target.value)}
                    placeholder={t("auth.lastNamePlaceholder")}
                    disabled={loading}
                    maxLength={40}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleCompleteProfile();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/20">
                  <div className="border-r px-3 py-2 text-sm font-medium text-muted-foreground">+852</div>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={profile.phone}
                    onChange={(e) => handleProfileFieldChange("phone", e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder={t("auth.phonePlaceholder")}
                    disabled={loading}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleCompleteProfile();
                      }
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{t("auth.phoneHint")}</div>
              </div>

              {userType === "NEW" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={profile.password}
                      onChange={(e) => handleProfileFieldChange("password", e.target.value)}
                      placeholder={t("auth.passwordPlaceholder")}
                      disabled={loading}
                      autoComplete="new-password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                          handleCompleteProfile();
                        }
                      }}
                    />
                    <div className="text-xs text-muted-foreground">{t("auth.passwordHint")}</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profile.confirmPassword}
                      onChange={(e) => handleProfileFieldChange("confirmPassword", e.target.value)}
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      disabled={loading}
                      autoComplete="new-password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                          handleCompleteProfile();
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleCompleteProfile}
                disabled={
                  loading ||
                  !profile.firstName.trim() ||
                  !profile.lastName.trim() ||
                  !profile.phone.trim() ||
                  (userType === "NEW" && (!profile.password || !profile.confirmPassword))
                }
                className="w-full bg-[#FF902A] hover:bg-[#FF7A1A] text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("auth.creatingAccount")}
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    {t("auth.completeSignup")}
                  </>
                )}
              </Button>

              <div className="text-center">
                {!isProfileCompletionRequired && (
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      setView("LANDING");
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {t("auth.back")}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPanel;
