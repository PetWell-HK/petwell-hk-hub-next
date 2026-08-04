"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, Globe, Search, Filter, Heart, Users } from "lucide-react";
import { useFilteredNGOs } from "@/hooks/useNGOs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSEO } from "@/hooks/useSEO";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NGOs = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const { ngos: regionFilteredNGOs, isLoading, error } = useFilteredNGOs(selectedRegion);
  const isMobile = useIsMobile();

  // SEO
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "????????",
    "description": "????????????????????",
    "numberOfItems": regionFilteredNGOs.length,
    "itemListElement": regionFilteredNGOs.slice(0, 10).map((ngo, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NGO",
        "name": i18n.language === 'en' ? ngo.nameEn : ngo.name,
        "description": i18n.language === 'en' ? ngo.descriptionEn : ngo.description,
        "address": ngo.address,
        "telephone": ngo.phone
      }
    }))
  }), [regionFilteredNGOs, i18n.language]);

  useSEO({
    title: "???????? | ??????????? | PetWell HK",
    description: "???????????????????????????????????????????????",
    keywords: "??????,????,????,????,????,????,??NGO,?????,????,??????",
    canonicalUrl: "https://petwellhk.com/ngos",
    structuredData
  });

  const filteredNGOs = regionFilteredNGOs.filter((ngo) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = (i18n.language === 'en' ? ngo.nameEn : ngo.name).toLowerCase();
      const description = (i18n.language === 'en' ? ngo.descriptionEn : ngo.description).toLowerCase();
      if (!name.includes(query) && !description.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const regions = [
    { value: "all", label: t('ngos.regions.all') },
    { value: "Kowloon", label: t('ngos.regions.kowloon') },
    { value: "Hong Kong", label: t('ngos.regions.hongKong') },
    { value: "New Territories", label: t('ngos.regions.newTerritories') },
  ];

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setIsSheetOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-6 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-primary">{t('ngos.pageTitle')}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {t('ngos.subtitle')}
            </p>
            <p className="text-base text-muted-foreground">
              {t('ngos.description')}
            </p>
          </section>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder={t('ngos.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Region Tabs - Desktop */}
          {!isMobile && (
            <nav aria-label="????" className="mb-8">
              <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedRegion}>
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
                  {regions.map((region) => (
                    <TabsTrigger key={region.value} value={region.value}>
                      {region.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </nav>
          )}

          {/* Region Filter - Mobile Sidebar */}
          {isMobile && (
            <div className="mb-6 flex justify-center">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {regions.find(r => r.value === selectedRegion)?.label || t('ngos.regions.all')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>{t('ngos.filterByRegion')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {regions.map((region) => (
                      <button
                        key={region.value}
                        onClick={() => handleRegionChange(region.value)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedRegion === region.value
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-muted"
                        }`}
                      >
                        {region.label}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* NGOs Grid */}
          {!isLoading && !error && (
            <>
              <section aria-label="????????">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNGOs.map((ngo) => (
                    <article key={ngo.id}>
                      <Link to={`/ngos/${ngo.id}`}>
                        <Card className="p-6 h-full hover:shadow-strong transition-shadow cursor-pointer">
                          <div className="space-y-4">
                            <header>
                              <h2 className="text-xl font-bold mb-2">
                                {i18n.language === 'en' ? ngo.nameEn : ngo.name}
                              </h2>
                              {ngo.established && (
                                <p className="text-sm text-muted-foreground">
                                  {t('ngos.established')}: {ngo.established}
                                </p>
                              )}
                            </header>

                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {i18n.language === 'en' ? ngo.descriptionEn : ngo.description}
                            </p>

                            <address className="flex items-start gap-2 text-muted-foreground not-italic">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                              <span className="text-xs">{ngo.address}</span>
                            </address>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                              <a href={`tel:${ngo.phone}`} className="text-xs hover:text-primary transition-colors">
                                {ngo.phone}
                              </a>
                            </div>

                            {ngo.website && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Globe className="w-4 h-4 flex-shrink-0 text-primary" />
                                <a 
                                  href={ngo.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs hover:text-primary transition-colors truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {ngo.website.replace('https://', '')}
                                </a>
                              </div>
                            )}

                            <div className="pt-3 border-t border-border space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Heart className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground">
                                  {ngo.donationCampaigns.length} {t('ngos.activeCampaigns')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground">
                                  {ngo.volunteerEvents.length} {t('ngos.volunteerEvents')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* No Results */}
          {!isLoading && !error && filteredNGOs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                {t('ngos.noResults')}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NGOs;
