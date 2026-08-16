"use client";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2, MessageSquareText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserReviewList from "@/components/UserReviewList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { useSEO } from "@/hooks/useSEO";
import { fetchUserReviews } from "@/services/userReviewApi";

const MyReviews = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, userInfo } = useAuth();
  const { openPanel } = useAuthPanel();
  const userId = userInfo?.userId;
  const isLoggedIn = isAuthenticated === true && Boolean(userId);
  const isAuthPending = isAuthenticated !== false && !isLoggedIn;

  useSEO({
    title: `${t("userReviews.myReviews")} | PetWell`,
    description: t("userReviews.mySeoDescription"),
    canonicalUrl: "https://petwellhk.com/account/reviews",
  });

  useEffect(() => {
    if (isAuthenticated === false) {
      openPanel("LANDING");
    }
  }, [isAuthenticated, openPanel]);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["userReviews", userId, true, i18n.language],
    queryFn: () => fetchUserReviews(userId!, { includeAnonymous: true, language: i18n.language }),
    enabled: isLoggedIn,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mb-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">{t("nav.home")}</Link>
              <span className="mx-2">/</span>
              <span>{t("userReviews.myReviews")}</span>
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-4xl">
              <MessageSquareText className="h-6 w-6 text-primary md:h-8 md:w-8" />
              {t("userReviews.myReviews")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {t("userReviews.mySubtitle")}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          {isAuthPending || (isLoggedIn && isLoading) ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("userReviews.loading")}
            </div>
          ) : isAuthenticated === false ? (
            <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center">
              <h2 className="mb-2 text-lg font-semibold">{t("userReviews.loginRequiredTitle")}</h2>
              <p className="mb-5 text-sm text-muted-foreground">{t("userReviews.loginRequiredBody")}</p>
              <Button onClick={() => openPanel("LANDING")}>{t("auth.login")}</Button>
            </div>
          ) : (
            <>
              {reviews.length > 0 ? (
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  {t("userReviews.reviewsCount", { count: reviews.length })}
                </p>
              ) : null}
              <UserReviewList
                reviews={reviews}
                showAnonymousBadge
                emptyMessage={t("userReviews.myEmpty")}
              />
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyReviews;
