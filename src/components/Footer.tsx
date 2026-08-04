import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Facebook, Youtube, Instagram } from "lucide-react";
const logo = "/assets/logo.png";
import PlaceReportModal from "@/components/PlaceReportModal";

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
              <Link to="/" className="flex items-center mb-4">
                <img src={logo} alt="PetWellé¦™æ¸¯å¯µç‰©å¥åº·App - ç¸é†«è¨ºæ‰€è©•åƒ¹ã€å¯µç‰©å¥åº·ç®¡ç†" className="h-8 w-auto brightness-0 invert" />
              </Link>
              <p className="text-sm text-background/80">
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="hover:text-primary transition-colors">
                  {t("nav.home")}
                </Link>
                <Link to="/forum" className="hover:text-primary transition-colors">
                  {t("nav.forum")}
                </Link>
                <Link to="/pet-activities" className="hover:text-primary transition-colors">
                  {t("nav.petActivities")}
                </Link>
                <Link to="/restaurants" className="hover:text-primary transition-colors">
                  {t("nav.restaurants")}
                </Link>
                <Link to="/salons" className="hover:text-primary transition-colors">
                  {t("nav.salons")}
                </Link>
                <Link to="/lodging" className="hover:text-primary transition-colors">
                  {t("nav.lodging")}
                </Link>
                <Link to="/clinics" className="hover:text-primary transition-colors">
                  {t("nav.clinics")}
                </Link>
                <Link to="/malls" className="hover:text-primary transition-colors">
                  {t("nav.malls")}
                </Link>
                <Link to="/owner-zone" className="hover:text-primary transition-colors">
                  {t("nav.ownerZone")}
                </Link>
                <Link to="/other-services" className="hover:text-primary transition-colors">
                  {t("nav.otherServices")}
                </Link>
                <Link to="/about" className="hover:text-primary transition-colors">
                  {t("nav.about")}
                </Link>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  {t("footer.terms")}
                </Link>
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
