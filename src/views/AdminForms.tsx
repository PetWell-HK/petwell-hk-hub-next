"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
const logo = "/assets/logo.png";

const AdminForms = () => {
  const { t } = useTranslation();
  
  const forms = [
    {
      name: "Name Tag Sign Up",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSdNpEdP6lFSA8FM8qNC8tiC7RWHMQkiyIEnGGWk25_ixRAViQ/viewform?usp=dialog",
    },
    // Add more forms here as needed
  ];

  useEffect(() => {
    // Automatically redirect to the Google Form
    window.location.href = forms[0].url;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <img src={logo} alt="PetWell Logo" className="h-24 w-auto animate-fade-in" />
        <p className="text-lg text-muted-foreground animate-fade-in">{t("adminForms.redirecting")}</p>
      </div>
    </div>
  );
};

export default AdminForms;
