"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthPanel from "@/components/AuthPanel";
import ContactUsWidget from "@/components/ContactUsWidget";
import NametagDailyPopup from "@/components/NametagDailyPopup";
import NavigationRecovery from "@/components/NavigationRecovery";
import ScrollToTop from "@/components/ScrollToTop";
import SiteProtection from "@/components/SiteProtection";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthPanelProvider } from "@/contexts/AuthPanelContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ensureAmplifyConfigured } from "@/lib/amplifyInit";
import "@/i18n/config";

export default function AppProviders({ children }: { children: ReactNode }) {
  ensureAmplifyConfigured();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthPanelProvider>
            <WishlistProvider>
              <CompareProvider>
                <Toaster />
                <Sonner />
                {/* Suspense only for searchParams-using chrome — never wrap page children (breaks 404 status). */}
                <Suspense fallback={null}>
                  <NavigationRecovery />
                  <ScrollToTop />
                  <SiteProtection />
                  <AuthPanel />
                  <ContactUsWidget />
                  <NametagDailyPopup />
                </Suspense>
                {children}
              </CompareProvider>
            </WishlistProvider>
          </AuthPanelProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
