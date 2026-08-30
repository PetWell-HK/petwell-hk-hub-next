"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, MapPinPlus, Youtube } from "lucide-react";
import AppLink from "@/components/AppLink";
import PlaceReportModal from "@/components/PlaceReportModal";
import { Button } from "@/components/ui/button";
import { eventsSiteUrl } from "@/lib/sites";

const logo = "/assets/logo.png";

type FooterModalMode = "feedback" | "suggest";

type FooterRoute = {
  to: string;
  labelKey: string;
};

const EXPLORE_LINKS: FooterRoute[] = [
  { to: "/restaurants", labelKey: "nav.restaurants" },
  { to: "/malls", labelKey: "nav.malls" },
  { to: "/pet-activities", labelKey: "nav.petActivities" },
];

const CARE_LINKS: FooterRoute[] = [
  { to: "/clinics", labelKey: "nav.clinics" },
  { to: "/home-visits", labelKey: "nav.homeVisits" },
  { to: "/salons", labelKey: "nav.salons" },
  { to: "/lodging", labelKey: "nav.lodging" },
];

const COMMUNITY_LINKS: FooterRoute[] = [
  { to: "/forum", labelKey: "nav.forum" },
  { to: "/owner-zone", labelKey: "nav.blog" },
  { to: "/review", labelKey: "nav.review" },
  { to: "/nutrition", labelKey: "nav.nutritionScore" },
  { to: "/ngos", labelKey: "nav.ngos" },
];

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/petwellhkg", label: "Facebook", icon: Facebook },
  { href: "https://www.youtube.com/@PetWell-hk", label: "YouTube", icon: Youtube },
  { href: "https://www.instagram.com/petwell_hk/", label: "Instagram", icon: Instagram },
] as const;

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="site-footer__heading">{title}</h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </nav>
  );
}

function FooterRouteItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <AppLink href={to} className="site-footer__link">
        {children}
      </AppLink>
    </li>
  );
}

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [modalMode, setModalMode] = useState<FooterModalMode>("feedback");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openModal = (mode: FooterModalMode) => {
    setModalMode(mode);
    setIsReportModalOpen(true);
  };

  return (
    <>
      <footer className="site-footer">
        <div className="container mx-auto px-4 pb-8 pt-12 md:pb-10 md:pt-14">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-8">
            <div className="col-span-2 flex max-w-sm flex-col lg:col-span-4">
              <AppLink href="/" className="mb-3 inline-flex w-fit items-center">
                <Image
                  src={logo}
                  alt={t("nav.logoAlt")}
                  width={128}
                  height={32}
                  className="h-8 w-auto"
                />
              </AppLink>
              <p className="text-sm leading-relaxed text-[hsl(var(--footer-muted))]">
                {t("footer.tagline")}
              </p>

              <p className="mb-2.5 mt-6 text-xs font-semibold tracking-wide text-[hsl(var(--footer-ink))]">
                {t("footer.follow")}
              </p>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer__social"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-6 w-fit border-[hsl(var(--footer-line))] bg-white/70 text-[hsl(var(--footer-ink))] hover:border-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => openModal("suggest")}
              >
                <MapPinPlus className="h-4 w-4" />
                {t("footer.suggestPlace")}
              </Button>
            </div>

            <div className="lg:col-span-2">
              <FooterColumn title={t("footer.explore")}>
                {EXPLORE_LINKS.map((link) => (
                  <FooterRouteItem key={link.to} to={link.to}>
                    {t(link.labelKey)}
                  </FooterRouteItem>
                ))}
              </FooterColumn>
            </div>

            <div className="lg:col-span-2">
              <FooterColumn title={t("footer.care")}>
                {CARE_LINKS.map((link) => (
                  <FooterRouteItem key={link.to} to={link.to}>
                    {t(link.labelKey)}
                  </FooterRouteItem>
                ))}
              </FooterColumn>
            </div>

            <div className="lg:col-span-2">
              <FooterColumn title={t("footer.community")}>
                {COMMUNITY_LINKS.map((link) => (
                  <FooterRouteItem key={link.to} to={link.to}>
                    {t(link.labelKey)}
                  </FooterRouteItem>
                ))}
              </FooterColumn>
            </div>

            <div className="lg:col-span-2">
              <FooterColumn title={t("footer.company")}>
                <FooterRouteItem to="/about">{t("nav.about")}</FooterRouteItem>
                <FooterRouteItem to="/other-services">
                  {t("nav.partnershipMenu.merchant")}
                </FooterRouteItem>
                <li>
                  <a
                    href={eventsSiteUrl(i18n.language)}
                    className="site-footer__link"
                  >
                    {t("nav.partnershipMenu.events")}
                  </a>
                </li>
              </FooterColumn>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[hsl(var(--footer-line))] pt-6 md:mt-12 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-[hsl(var(--footer-muted))] md:text-sm">
              {t("footer.copyright")}
            </p>
            <nav
              aria-label={t("footer.legal")}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <AppLink href="/terms" className="site-footer__link text-xs md:text-sm">
                {t("footer.terms")}
              </AppLink>
              <AppLink href="/privacy" className="site-footer__link text-xs md:text-sm">
                {t("footer.privacy")}
              </AppLink>
              <AppLink href="/download" className="site-footer__link text-xs md:text-sm">
                {t("nav.download")}
              </AppLink>
              <button
                type="button"
                className="site-footer__link text-xs md:text-sm"
                onClick={() => openModal("feedback")}
              >
                {t("footer.feedback")}
              </button>
            </nav>
          </div>
        </div>
      </footer>

      <PlaceReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        defaultMode={modalMode}
      />
    </>
  );
};

export default Footer;
