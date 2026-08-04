"use client";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
const appStoreBadge = "/assets/app-store-badge-new.png";
const googlePlayBadge = "/assets/google-play-badge-new.png";

const ComingSoon = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Auto-detect device and redirect to appropriate store
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    
    // Check if iOS
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      window.location.href = "https://apps.apple.com/hk/app/petwell-hk/id6747191070?l=en-GB";
      return;
    }
    
    // Check if Android
    if (/android/i.test(userAgent)) {
      window.location.href = "https://play.google.com/store/apps/details?id=com.bugy.petwell";
      return;
    }
    
    // For desktop users, stay on the page
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-hero py-8 md:py-10 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary">
              {t('download.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-foreground max-w-2xl mx-auto">
              {t('download.subtitle1')}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-foreground/80">
              {t('download.subtitle2')}
            </p>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 justify-center items-center">
            <a
              href="https://apps.apple.com/hk/app/petwell-hk/id6747191070?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              className="w-[220px] sm:w-[220px] md:w-[260px] hover:opacity-80 transition-opacity"
            >
              <img 
                src={appStoreBadge} 
                alt="Download on the App Store" 
                className="w-full object-contain"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.bugy.petwell"
              target="_blank"
              rel="noopener noreferrer"
              className="w-[220px] sm:w-[220px] md:w-[260px] hover:opacity-80 transition-opacity"
            >
              <img 
                src={googlePlayBadge} 
                alt="Get it on Google Play" 
                className="w-full object-contain"
              />
            </a>
          </div>

          {/* CTA Section */}
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary/30 shadow-strong max-w-2xl mx-auto mt-8">
            <div className="flex items-center justify-center gap-2 text-primary mb-3">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t('download.ctaTitle')}</h2>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6">
              {t('download.ctaDescription')}
            </p>
            
            <div className="space-y-2 text-sm md:text-base text-muted-foreground mb-5">
              <p>✨ {t('download.feature1')}</p>
              <p>✨ {t('download.feature2')}</p>
              <p>✨ {t('download.feature3')}</p>
            </div>

            <Button
              size="lg"
              asChild
              className="bg-gradient-primary hover:opacity-90 transition-all shadow-strong text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 h-auto w-full group"
            >
              <a href="https://forms.gle/SAZgMtHqKKKw4jDR8" target="_blank" rel="noopener noreferrer">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="leading-snug whitespace-normal text-left">{t('download.ctaButton')}</span>
              </a>
            </Button>
            
            <p className="text-xs text-muted-foreground/70 mt-3">
              {t('download.disclaimer')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComingSoon;
