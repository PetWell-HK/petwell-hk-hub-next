"use client";

import { useEffect } from "react";
const logo = "/assets/logo.png";

const WhatsAppPetwellEng = () => {
  useEffect(() => {
    window.location.href = "https://api.whatsapp.com/send/?phone=%2B85263478437&text=I%E2%80%99ve+registered+for+the+name+tag%2C+please+notify+me+when+it%E2%80%99s+ready%21&type=phone_number&app_absent=0";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-background to-secondary/20">
      <img src={logo} alt="PetWell Logo" className="h-24 w-auto animate-fade-in" />
      <p className="text-lg text-muted-foreground animate-fade-in">Redirecting to WhatsApp...</p>
    </div>
  );
};

export default WhatsAppPetwellEng;
