import { useEffect } from "react";
const logo = "/assets/logo.png";

const TARGET_URL =
  "https://www.afcd.gov.hk/tc_chi/whatsnew/what_qua/files/PetFoodSafetyGuidelines_ConsultationQuestionnaire_Chi.pdf";

const AfcdPdfRedirect = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = TARGET_URL;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-md space-y-6">
        <img
          src={logo}
          alt="PetWell"
          className="h-20 w-auto animate-pulse"
        />

        <div className="space-y-2">
          <p className="text-lg md:text-xl font-semibold text-foreground">
            æ­£åœ¨è·³è½‰è‡³æ¼è­·è™•å®‰å…¨æ„è¦‹æ”¶é›†PDF...
          </p>
          <p className="text-base md:text-lg text-muted-foreground">
            Redirecting you to the AFCD Pet Food Safety Consultation PDF...
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
        </div>

        <p className="text-xs text-muted-foreground">
          å¦‚æœªè‡ªå‹•è·³è½‰ï¼Œè«‹{" "}
          <a
            href={TARGET_URL}
            className="underline text-primary"
            rel="noopener noreferrer"
          >
            æŒ‰æ­¤ç¹¼çºŒ / click here
          </a>
          ã€‚
        </p>
      </div>
    </div>
  );
};

export default AfcdPdfRedirect;
