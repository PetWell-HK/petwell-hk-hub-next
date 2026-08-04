import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type OsCtaButtonProps = {
  className?: string;
};

function openContactWidget() {
  window.dispatchEvent(new Event("petwell:open-contact"));
}

const OsCtaButton = ({ className }: OsCtaButtonProps) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={cn(
        "os-cta-btn inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold md:text-base",
        className,
      )}
      onClick={openContactWidget}
    >
      {t("otherServices.audiences.enterprise.cta")}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
};

export default OsCtaButton;
