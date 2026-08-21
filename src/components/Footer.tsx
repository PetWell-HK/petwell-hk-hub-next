"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Facebook, Youtube, Instagram } from "lucide-react";
import AppLink from "@/components/AppLink";
import PlaceReportModal from "@/components/PlaceReportModal";

const logo = "/assets/logo.png";

type FooterModalMode = "feedback" | "suggest";

const Footer = () => {
  const { t } = useTranslation();
  const [modalMode, setModalMode] = useState<FooterModalMode>("feedback");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openModal = (mode: FooterModalMode) => {
    setModalMode(mode);
    setIsReportModalOpen(true);
  };

  return (
    <>
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <AppLink href="/" className="flex items-center mb-4">
                <Image src={logo} alt="PetWell香港寵物健康App - 獸醫診所評價、寵物健康管理" width={128} height={32} className="h-8 w-auto brightness-0 invert" />
              </AppLink>
              <p className="text-sm text-background/80">
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <nav className="flex flex-col gap-3">
                <AppLink href="/" className="hover:text-primary transition-colors">
                  {t("nav.home")}
                </AppLink>
                <AppLink href="/forum" className="hover:text-primary transition-colors">
                  {t("nav.forum")}
                </AppLink>
                <AppLink href="/pet-activities" className="hover:text-primary transition-colors">
                  {t("nav.petActivities")}
                </AppLink>
                <AppLink href="/restaurants" className="hover:text-primary transition-colors">
                  {t("nav.restaurants")}
                </AppLink>
                <AppLink href="/salons" className="hover:text-primary transition-colors">
                  {t("nav.salons")}
                </AppLink>
                <AppLink href="/lodging" className="hover:text-primary transition-colors">
                  {t("nav.lodging")}
                </AppLink>
                <AppLink href="/clinics" className="hover:text-primary transition-colors">
                  {t("nav.clinics")}
                </AppLink>
                <AppLink href="/home-visits" className="hover:text-primary transition-colors">
                  {t("nav.homeVisits")}
                </AppLink>
                <AppLink href="/malls" className="hover:text-primary transition-colors">
                  {t("nav.malls")}
                </AppLink>
                <AppLink href="/owner-zone" className="hover:text-primary transition-colors">
                  {t("nav.ownerZone")}
                </AppLink>
                <AppLink href="/other-services" className="hover:text-primary transition-colors">
                  {t("nav.otherServices")}
                </AppLink>
                <AppLink href="/about" className="hover:text-primary transition-colors">
                  {t("nav.about")}
                </AppLink>
                <AppLink href="/terms" className="hover:text-primary transition-colors">
                  {t("footer.terms")}
                </AppLink>
                <button
                  type="button"
                  className="text-left hover:text-primary transition-colors"
                  onClick={() => openModal("suggest")}
                >
                  {t("footer.suggestPlace")}
                </button>
                <button
                  type="button"
                  className="text-left hover:text-primary transition-colors"
                  onClick={() => openModal("feedback")}
                >
                  {t("footer.feedback")}
                </button>
              </nav>
            </div>

            <div className="md:col-span-2">
              <div className="flex gap-4 justify-end">
                <a
                  href="https://www.facebook.com/petwellhkg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.youtube.com/@PetWell-hk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/petwell_hk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-background/20 pt-8">
            <p className="text-center text-background/80">
              {t("footer.copyright")}
            </p>
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
