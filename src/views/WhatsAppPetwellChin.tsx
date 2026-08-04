import { useEffect } from "react";
const logo = "/assets/logo.png";

const WhatsAppPetwellChin = () => {
  useEffect(() => {
    window.location.href = "https://api.whatsapp.com/send/?phone=%2B85263478437&text=%E6%88%91%E7%99%BB%E8%A8%98%E5%92%97%E5%90%8D%E7%89%8C%EF%BC%8C%E6%95%B4%E5%A5%BD%E8%AB%8B%E9%80%9A%E7%9F%A5%E6%88%91%EF%BC%81&type=phone_number&app_absent=0";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-background to-secondary/20">
      <img src={logo} alt="PetWell Logo" className="h-24 w-auto animate-fade-in" />
      <p className="text-lg text-muted-foreground animate-fade-in">æ­£åœ¨è·³è½‰åˆ° WhatsApp...</p>
    </div>
  );
};

export default WhatsAppPetwellChin;
