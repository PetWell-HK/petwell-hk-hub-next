"use client";

import type { ReactNode } from "react";
import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { useMyAccountProfile } from "@/hooks/useMyAccountProfile";
import { useMyReviews } from "@/hooks/useMyReviews";
import { formatDisplayPhone, getAccountDisplayName } from "@/services/accountApi";
import { resolveProfileImageUrl } from "@/utils/reviewDisplay";
import { cn } from "@/lib/utils";

type AccountHomeTab = "profile" | "reviews";

type AccountHomeShellProps = {
  tab: AccountHomeTab;
  onEditProfile?: () => void;
  children: ReactNode;
};

const AccountHomeShell = ({ tab, onEditProfile, children }: AccountHomeShellProps) => {
  const { t } = useTranslation();
  const { isAuthenticated, userInfo } = useAuth();
  const { openPanel } = useAuthPanel();
  const { data: profile, isLoading, isError } = useMyAccountProfile();
  const { data: reviews = [], isFetched: reviewsFetched } = useMyReviews();

  const userId = userInfo?.userId;
  const isLoggedIn = isAuthenticated === true && Boolean(userId);
  const isAuthPending = isAuthenticated !== false && !isLoggedIn;
  const showLoading = isAuthPending || (isLoggedIn && isLoading);

  const displayName =
    getAccountDisplayName(profile, userInfo?.username) || userInfo?.email || "";
  const email = profile?.email || userInfo?.rawEmail || userInfo?.email || "";
  const avatarUrl = resolveProfileImageUrl(profile?.profileImage);
  const initials = (displayName || email || "?").charAt(0).toUpperCase();
  const isPortrait = tab === "profile";

  return (
    <div className="account-home-page flex min-h-screen flex-col">
      <main className="flex-1">
        {showLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("accountProfile.loading")}
          </div>
        ) : isAuthenticated === false ? (
          <div className="container mx-auto px-4 py-8">
            <div className="account-home-gate">
              <h2>
                {tab === "reviews"
                  ? t("userReviews.loginRequiredTitle")
                  : t("accountProfile.loginRequiredTitle")}
              </h2>
              <p>
                {tab === "reviews"
                  ? t("userReviews.loginRequiredBody")
                  : t("accountProfile.loginRequiredBody")}
              </p>
              <Button onClick={() => openPanel("LANDING")}>{t("auth.login")}</Button>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 pt-8 md:pt-10">
            <div className="account-home-shell">
              <header
                className={cn(
                  "account-home-hero",
                  isPortrait ? "account-home-hero--portrait" : "account-home-hero--compact",
                )}
              >
                <div className="account-home-hero__inner">
                  {isPortrait && onEditProfile ? (
                    <button
                      type="button"
                      className="account-home-portrait"
                      onClick={onEditProfile}
                      aria-label={t("accountProfile.changePhoto")}
                    >
                      <span className="account-home-portrait__ring">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span aria-hidden>{initials}</span>}
                      </span>
                      <span className="account-home-portrait__edit">
                        <Camera className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </button>
                  ) : (
                    <div className="account-home-portrait">
                      <span className="account-home-portrait__ring">
                        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span aria-hidden>{initials}</span>}
                      </span>
                    </div>
                  )}

                  <div className="account-home-identity">
                    <p className="account-home-eyebrow">{t("userReviews.memberBadge")}</p>
                    <h1 className="account-home-name">{displayName || t("userReviews.anonymousUser")}</h1>
                    <div className="account-home-meta">
                      {email ? <p>{email}</p> : null}
                      {isPortrait && profile?.phone ? (
                        <p>{formatDisplayPhone(profile.phone)}</p>
                      ) : null}
                    </div>
                    {isPortrait && onEditProfile ? (
                      <div className="account-home-edit">
                        <Button variant="outline" size="sm" onClick={onEditProfile}>
                          {t("accountProfile.edit")}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </header>

              <nav className="account-home-tabs" aria-label={t("accountProfile.sections")}>
                <AppLink
                  href="/account"
                  className={cn("account-home-tab", tab === "profile" && "is-active")}
                  aria-current={tab === "profile" ? "page" : undefined}
                >
                  {t("accountProfile.title")}
                </AppLink>
                <AppLink
                  href="/account/reviews"
                  className={cn("account-home-tab", tab === "reviews" && "is-active")}
                  aria-current={tab === "reviews" ? "page" : undefined}
                >
                  {t("userReviews.myReviews")}
                  {reviewsFetched ? (
                    <span className="account-home-tab__count">{reviews.length}</span>
                  ) : null}
                </AppLink>
              </nav>

              {isLoggedIn && isError && !profile ? (
                <div className="account-home-room">
                  <div className="account-home-empty">
                    <p>{t("accountProfile.loadFailed")}</p>
                  </div>
                </div>
              ) : (
                <div className="account-home-room">{children}</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountHomeShell;
