"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Microscope,
  Phone,
  ShieldCheck,
  Stethoscope,
  TestTube2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { useSEO } from "@/hooks/useSEO";
import { createTestBookingPaymentLink } from "@/services/testBookingPaymentApi";
import { getClientsByEmail } from "@/services/forumApi";

type BookingProduct = {
  id: string;
  name: string;
  shortName: string;
  price: number;
  description: string;
  highlights: string[];
  bestFor: string;
  method: string;
  sample: string;
  turnaround: string;
  clinicalKeywords: string[];
};

type ClinicOption = {
  id: string;
  name: string;
  phone: string;
  address: string;
  hours: string;
};

const TEST_CURRENCY = "HKD";
const PRODUCT_PRICES: Record<string, number> = {
  "allergen-ige-125": 2800,
  "pcr-100-plus": 2800,
};
const DISPLAY_DISCOUNT_RATE = 0.2;

const medicalDisclaimerKey = "testBooking.medicalDisclaimer";

const TestBooking = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, userInfo } = useAuth();
  const { openPanel } = useAuthPanel();

  const [shopperFirstName, setShopperFirstName] = useState("");
  const [shopperLastName, setShopperLastName] = useState("");
  const [shopperEmail, setShopperEmail] = useState(userInfo?.email || "");
  const [shopperPhoneNumber, setShopperPhoneNumber] = useState("");
  const [petName, setPetName] = useState("");
  const [bookingClinic, setBookingClinic] = useState("");
  const [notes, setNotes] = useState("");
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BookingProduct | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const productSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (userInfo?.email) {
      setShopperEmail((current) => (current ? current : userInfo.email));
    }
  }, [userInfo?.email]);

  useEffect(() => {
    const prefillProfileForLoggedInUser = async () => {
      if (isAuthenticated !== true || !userInfo?.email) {
        return;
      }

      try {
        const clients = await getClientsByEmail(userInfo.email);
        const bestClient = [...clients].sort((a, b) => {
          const score = (client: (typeof clients)[number]) =>
            Number(Boolean(client.firstName?.trim())) +
            Number(Boolean(client.lastName?.trim())) +
            Number(Boolean(client.phone?.trim()));
          return score(b) - score(a);
        })[0];

        const normalizePhoneForInput = (phone?: string) => {
          const digits = (phone || "").replace(/\D/g, "");
          if (!digits) return "";
          if (digits.startsWith("852") && digits.length > 8) {
            return digits.slice(3);
          }
          return digits;
        };

        const fallbackNameParts = (() => {
          const rawName = (userInfo.username || "").trim();
          if (!rawName || rawName.includes("@")) {
            return { firstName: "", lastName: "" };
          }
          const parts = rawName.split(/\s+/).filter(Boolean);
          return {
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" "),
          };
        })();

        const firstName = bestClient?.firstName?.trim() || fallbackNameParts.firstName;
        const lastName = bestClient?.lastName?.trim() || fallbackNameParts.lastName;
        const normalizedPhone = normalizePhoneForInput(bestClient?.phone);

        setShopperFirstName((current) => (current ? current : firstName));
        setShopperLastName((current) => (current ? current : lastName));
        setShopperEmail((current) => (current ? current : userInfo.email));
        setShopperPhoneNumber((current) => (current ? current : normalizedPhone));
      } catch (error) {
        console.warn("Unable to prefill booking contact info:", error);
      }
    };

    void prefillProfileForLoggedInUser();
  }, [isAuthenticated, userInfo?.email]);

  const products = useMemo<BookingProduct[]>(
    () => [
      {
        id: "allergen-ige-125",
        name: t("testBooking.products.allergen.name"),
        shortName: t("testBooking.products.allergen.shortName"),
        price: PRODUCT_PRICES["allergen-ige-125"],
        description: t("testBooking.products.allergen.description"),
        highlights: [
          t("testBooking.products.allergen.h1"),
          t("testBooking.products.allergen.h2"),
          t("testBooking.products.allergen.h3"),
        ],
        bestFor: t("testBooking.products.allergen.bestFor"),
        method: t("testBooking.products.allergen.method"),
        sample: t("testBooking.products.allergen.sample"),
        turnaround: t("testBooking.products.allergen.turnaround"),
        clinicalKeywords: [
          t("testBooking.keywords.ige"),
          t("testBooking.keywords.rast"),
          t("testBooking.keywords.auMl"),
          t("testBooking.keywords.serum"),
          t("testBooking.keywords.enzymeImmunoblot"),
        ],
      },
      {
        id: "pcr-100-plus",
        name: t("testBooking.products.pcr.name"),
        shortName: t("testBooking.products.pcr.shortName"),
        price: PRODUCT_PRICES["pcr-100-plus"],
        description: t("testBooking.products.pcr.description"),
        highlights: [
          t("testBooking.products.pcr.h1"),
          t("testBooking.products.pcr.h2"),
          t("testBooking.products.pcr.h3"),
        ],
        bestFor: t("testBooking.products.pcr.bestFor"),
        method: t("testBooking.products.pcr.method"),
        sample: t("testBooking.products.pcr.sample"),
        turnaround: t("testBooking.products.pcr.turnaround"),
        clinicalKeywords: [
          t("testBooking.keywords.pcr"),
          t("testBooking.keywords.respiratory"),
          t("testBooking.keywords.gastrointestinal"),
          t("testBooking.keywords.zoonotic"),
          t("testBooking.keywords.pcrTargets"),
        ],
      },
    ],
    [t],
  );

  const clinicOptions = useMemo<ClinicOption[]>(
    () => [
      {
        id: "fairview",
        name: t("testBooking.clinics.fairview.name"),
        phone: t("testBooking.clinics.fairview.phone"),
        address: t("testBooking.clinics.fairview.address"),
        hours: t("testBooking.clinics.fairview.hours"),
      },
      {
        id: "ivet",
        name: t("testBooking.clinics.ivet.name"),
        phone: t("testBooking.clinics.ivet.phone"),
        address: t("testBooking.clinics.ivet.address"),
        hours: t("testBooking.clinics.ivet.hours"),
      },
      {
        id: "parkIsland",
        name: t("testBooking.clinics.parkIsland.name"),
        phone: t("testBooking.clinics.parkIsland.phone"),
        address: t("testBooking.clinics.parkIsland.address"),
        hours: t("testBooking.clinics.parkIsland.hours"),
      },
    ],
    [t],
  );
  const selectedClinic = clinicOptions.find((clinic) => clinic.name === bookingClinic);

  useSEO({
    title: t("testBooking.seoTitle"),
    description: t("testBooking.seoDescription"),
    keywords: t("testBooking.seoKeywords"),
    canonicalUrl: "https://petwellhk.com/test-booking",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t("testBooking.structuredDataName"),
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "MedicalTest",
          name: product.name,
          description: product.description,
          usedToDiagnose: product.bestFor,
          relevantSpecialty: t("testBooking.structuredDataSpecialty"),
          offers: {
            "@type": "Offer",
            priceCurrency: TEST_CURRENCY,
            price: product.price,
            availability: "https://schema.org/InStock",
          },
        },
      })),
    },
    faqItems: [
      {
        question: t("testBooking.faq.q1"),
        answer: t("testBooking.faq.a1"),
      },
      {
        question: t("testBooking.faq.q2"),
        answer: t("testBooking.faq.a2"),
      },
      {
        question: t("testBooking.faq.q3"),
        answer: t("testBooking.faq.a3"),
      },
    ],
  });

  const handlePurchase = async (product: BookingProduct) => {
    const normalizedEmail = shopperEmail.trim().toLowerCase();
    const firstName = shopperFirstName.trim();
    const lastName = shopperLastName.trim();
    const phoneNumber = shopperPhoneNumber.trim();
    const isLoggedInWithEmail = isAuthenticated === true && Boolean(userInfo?.email);

    const normalizedPetName = petName.trim();
    const normalizedClinic = bookingClinic.trim();
    const bookingTimeForRecord = t("testBooking.form.bookingTimeContactRecord");

    if (!firstName || !lastName || !normalizedEmail || !phoneNumber || !normalizedPetName || !normalizedClinic) {
      toast({
        title: t("testBooking.toast.missingFieldsTitle"),
        description: t("testBooking.toast.missingFieldsDesc"),
        variant: "destructive",
      });
      return;
    }

    setProcessingProductId(product.id);
    try {
      const result = await createTestBookingPaymentLink({
        userEmail: isLoggedInWithEmail ? userInfo.email : normalizedEmail,
        amount: product.price,
        currency: TEST_CURRENCY,
        productCode: product.id,
        productName: product.name,
        shopperEmail: normalizedEmail,
        shopperFirstName: firstName,
        shopperLastName: lastName,
        shopperPhoneNumber: phoneNumber,
        petName: normalizedPetName,
        bookingClinic: normalizedClinic,
        bookingTime: bookingTimeForRecord,
        notes: notes.trim(),
        returnUrl: `${window.location.origin}/test-booking?status=paid`,
        usePublicAuth: !isLoggedInWithEmail,
      });

      setIsCheckoutModalOpen(false);
      window.location.assign(result.url);
    } catch (error) {
      toast({
        title: t("testBooking.toast.paymentFailedTitle"),
        description: error instanceof Error ? error.message : t("testBooking.toast.paymentFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleOpenCheckoutModal = (product: BookingProduct) => {
    setSelectedProduct(product);
    setIsCheckoutModalOpen(true);
  };

  const scrollToProductSection = () => {
    if (!productSectionRef.current) return;
    const top = productSectionRef.current.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleModalOpenChange = (open: boolean) => {
    if (processingProductId) {
      return;
    }
    setIsCheckoutModalOpen(open);
  };

  const handleModalFieldFocus = (event: FocusEvent<HTMLElement>) => {
    if (window.innerWidth >= 768) return;
    const target = event.currentTarget;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 220);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-background to-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-5 md:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-orange-200/70 bg-background shadow-lg animate-in fade-in-50 slide-in-from-bottom-3 duration-700 md:rounded-[2rem]">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-orange-200/30 blur-3xl animate-in fade-in-0 zoom-in-95 duration-1000 md:h-72 md:w-72" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-amber-100/50 blur-3xl animate-in fade-in-0 zoom-in-95 duration-1000 delay-150 md:h-56 md:w-56" />
          <div className="relative grid gap-5 p-5 md:grid-cols-[1.2fr_0.8fr] md:gap-8 md:p-10">
            <div className="animate-in fade-in-50 slide-in-from-left-4 duration-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary md:text-xs md:tracking-[0.2em]">
                <TestTube2 className="h-4 w-4" />
                {t("testBooking.badge")}
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground md:mt-5 md:text-6xl">
                {t("testBooking.title")}
              </h1>
              <p className="mt-4 max-w-2xl overflow-hidden text-sm leading-6 text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] md:mt-5 md:block md:text-lg md:leading-7">
                {t("testBooking.subtitle")}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-orange-100 bg-orange-50/60 p-3 md:hidden">
                {[
                  { label: t("testBooking.stats.allergens"), value: "125" },
                  { label: t("testBooking.stats.sample"), value: "50 μL" },
                  { label: t("testBooking.stats.rast"), value: "0-3" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-lg font-black text-orange-600">{item.value}</div>
                    <div className="mt-0.5 text-[10px] font-medium leading-tight text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 md:mt-6">
                {[
                  t("testBooking.heroKeywords.igeAllergy"),
                  t("testBooking.heroKeywords.pcrPathogen"),
                  t("testBooking.heroKeywords.rastClass"),
                  t("testBooking.heroKeywords.serumSample"),
                  t("testBooking.heroKeywords.veterinaryDiagnostics"),
                ].map((keyword, index) => (
                  <Badge key={keyword} variant="secondary" className={`rounded-full px-3 py-1 text-[11px] md:text-xs ${index > 2 ? "hidden sm:inline-flex" : ""}`}>
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-8">
                <Button
                  size="lg"
                  onClick={scrollToProductSection}
                  className="border-2 border-orange-500 bg-orange-500 text-white shadow-sm hover:bg-orange-600"
                >
                  {t("testBooking.heroPrimaryCta")}
                </Button>
                <Button
                  size="lg"
                  onClick={scrollToProductSection}
                  className="border-2 border-orange-500 bg-orange-500 text-white shadow-sm hover:bg-orange-600"
                >
                  {t("testBooking.heroSecondaryCta")}
                </Button>
              </div>
            </div>

            <Card className="relative hidden overflow-hidden border-orange-300/80 bg-gradient-to-br from-orange-200/80 via-orange-100/60 to-amber-50 text-foreground shadow-xl animate-in fade-in-50 slide-in-from-right-4 duration-700 delay-150 md:block">
              <div className="absolute bottom-0 left-6 right-6 h-1 rounded-t-full bg-orange-400" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-orange-200 bg-white/70 p-3 shadow-sm">
                    <Microscope className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">{t("testBooking.labCardLabel")}</p>
                    <h2 className="text-xl font-semibold text-foreground">{t("testBooking.labCardTitle")}</h2>
                  </div>
                </div>
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
                <div className="grid gap-3">
                  {[
                    { label: t("testBooking.stats.allergens"), value: "125" },
                    { label: t("testBooking.stats.pcrTargets"), value: "100+" },
                    { label: t("testBooking.stats.sample"), value: "50 μL" },
                    { label: t("testBooking.stats.rast"), value: "0-3" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-orange-200/80 bg-white/80 px-4 py-3 shadow-sm">
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                      <span className="text-2xl font-bold text-orange-600">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
                <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
                  <ShieldCheck className="mb-2 h-5 w-5 text-orange-600" />
                  {t("testBooking.labCardDesc")}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8 hidden gap-4 md:grid md:grid-cols-4">
          {[
            { icon: Microscope, title: t("testBooking.valueProps.quantitativeTitle"), desc: t("testBooking.valueProps.quantitativeDesc") },
            { icon: Activity, title: t("testBooking.valueProps.clinicalTitle"), desc: t("testBooking.valueProps.clinicalDesc") },
            { icon: FileText, title: t("testBooking.valueProps.reportTitle"), desc: t("testBooking.valueProps.reportDesc") },
            { icon: Clock, title: t("testBooking.valueProps.workflowTitle"), desc: t("testBooking.valueProps.workflowDesc") },
          ].map((item) => (
            <Card key={item.title} className="border-primary/10 animate-in fade-in-50 slide-in-from-bottom-3 duration-700">
              <CardContent className="p-5">
                <item.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section ref={productSectionRef} className="mt-6 scroll-mt-20 animate-in fade-in-50 slide-in-from-bottom-3 duration-700 delay-100 md:mt-10 md:scroll-mt-24">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-3">{t("testBooking.productSectionBadge")}</Badge>
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">{t("testBooking.productSectionTitle")}</h2>
            <p className="mt-3 hidden text-muted-foreground sm:block">{t("testBooking.productSectionDesc")}</p>
          </div>
        </section>

        <section className="mt-4 grid items-stretch gap-4 md:mt-6 md:grid-cols-2 md:gap-5">
          {products.map((product) => {
            const isProcessing = processingProductId === product.id;
            const isComingSoon = product.id === "pcr-100-plus";
            const originalPrice = product.price / (1 - DISPLAY_DISCOUNT_RATE);
            const savings = originalPrice - product.price;
            return (
              <Card key={product.id} className="group flex h-full flex-col overflow-hidden border-orange-200/70 shadow-sm transition hover:-translate-y-1 hover:shadow-lg animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                <CardHeader className="border-b bg-gradient-to-br from-primary/10 to-transparent p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className="mb-2 rounded-full md:mb-3">{product.shortName}</Badge>
                      <CardTitle className="text-xl leading-tight md:text-2xl">{product.name}</CardTitle>
                    </div>
                    <div className="rounded-2xl bg-background p-2 shadow-sm md:p-3">
                      {product.id === "allergen-ige-125" ? (
                        <Stethoscope className="h-6 w-6 text-primary" />
                      ) : (
                        <Microscope className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-4 md:p-6">
                  <p className="overflow-hidden text-sm leading-6 text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:block">{product.description}</p>
                  <div className="mt-5 hidden gap-3 rounded-2xl border bg-muted/30 p-4 text-sm sm:grid">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{t("testBooking.productMeta.bestFor")}</span>
                      <span className="text-right font-medium">{product.bestFor}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{t("testBooking.productMeta.method")}</span>
                      <span className="text-right font-medium">{product.method}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{t("testBooking.productMeta.sample")}</span>
                      <span className="text-right font-medium">{product.sample}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{t("testBooking.productMeta.turnaround")}</span>
                      <span className="text-right font-medium">{product.turnaround}</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm md:mt-5 md:space-y-3">
                    {product.highlights.map((highlight, index) => (
                      <li key={highlight} className={`items-start gap-2 ${index > 1 ? "hidden sm:flex" : "flex"}`}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
                    {product.clinicalKeywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="rounded-full">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto pt-4 md:pt-6">
                    {isComingSoon ? (
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:rounded-3xl">
                        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-slate-200/70" />
                        <Badge variant="outline" className="relative border-slate-300 bg-white text-slate-700">
                          {t("testBooking.comingSoon.badge")}
                        </Badge>
                        <h3 className="relative mt-3 text-lg font-bold text-slate-900">
                          {t("testBooking.comingSoon.title")}
                        </h3>
                        <p className="relative mt-2 text-sm leading-6 text-slate-600">
                          {t("testBooking.comingSoon.desc")}
                        </p>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-stone-50 shadow-sm md:rounded-3xl">
                        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-100/80" />
                        <div className="relative flex items-center justify-between border-b border-amber-200 bg-gradient-to-r from-stone-100 via-amber-50 to-orange-50 px-3 py-2.5 md:px-4 md:py-3">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">
                              {t("testBooking.offer.label")}
                            </span>
                            <p className="mt-0.5 text-sm font-bold text-stone-900">{t("testBooking.offer.title")}</p>
                          </div>
                          <div className="rounded-2xl border border-amber-200 bg-white px-3 py-2 text-center text-amber-700 shadow-sm">
                            <span className="block text-xl font-black leading-none">{Math.round(DISPLAY_DISCOUNT_RATE * 100)}%</span>
                            <span className="block text-[10px] font-bold uppercase leading-none">
                              {t("testBooking.offer.off")}
                            </span>
                          </div>
                        </div>
                        <div className="relative grid grid-cols-[1fr_auto] items-end gap-3 px-3 py-3 md:px-4 md:py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                              {t("testBooking.offer.originalPrice")}
                            </span>
                            <span className="mt-1 text-sm text-muted-foreground line-through md:text-base">
                              {TEST_CURRENCY} {originalPrice.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                              {t("testBooking.offer.todayPrice")}
                            </span>
                            <p className="mt-1 text-2xl font-black leading-none text-stone-900 md:text-3xl">
                              {TEST_CURRENCY} {product.price.toFixed(1)}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-amber-200 bg-white/70 px-4 py-2.5">
                          <p className="text-sm font-bold text-emerald-700">
                            {t("testBooking.offer.savings", {
                              currency: TEST_CURRENCY,
                              amount: savings.toFixed(1),
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    <Button
                      size="lg"
                      className="mt-3 w-full bg-orange-500 text-white shadow-md hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none md:mt-4"
                      onClick={() => handleOpenCheckoutModal(product)}
                      disabled={isComingSoon || Boolean(processingProductId)}
                    >
                      {isComingSoon ? (
                        t("testBooking.comingSoon.button")
                      ) : isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("testBooking.processing")}
                        </>
                      ) : (
                        t("testBooking.buyNow")
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-12 hidden gap-6 md:grid lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-primary/10">
            <CardHeader>
              <Badge variant="outline" className="w-fit">{t("testBooking.methodology.badge")}</Badge>
              <CardTitle className="text-2xl">{t("testBooking.methodology.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>{t("testBooking.methodology.desc1")}</p>
              <p>{t("testBooking.methodology.desc2")}</p>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-900">
                {t(medicalDisclaimerKey)}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { step: "01", title: t("testBooking.workflow.step1Title"), desc: t("testBooking.workflow.step1Desc") },
              { step: "02", title: t("testBooking.workflow.step2Title"), desc: t("testBooking.workflow.step2Desc") },
              { step: "03", title: t("testBooking.workflow.step3Title"), desc: t("testBooking.workflow.step3Desc") },
              { step: "04", title: t("testBooking.workflow.step4Title"), desc: t("testBooking.workflow.step4Desc") },
            ].map((item) => (
              <Card key={item.step} className="border-primary/10">
                <CardContent className="p-5">
                  <span className="text-sm font-bold text-primary">{item.step}</span>
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </main>
      <Dialog open={isCheckoutModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] translate-y-0 overflow-y-auto pb-4 sm:top-[50%] sm:max-h-[85vh] sm:max-w-xl sm:-translate-y-1/2">
          <DialogHeader>
            <DialogTitle>{t("testBooking.checkoutModalTitle")}</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? t("testBooking.checkoutModalDesc", { productName: selectedProduct.name })
                : t("testBooking.buyerInfoDesc")}
            </DialogDescription>
          </DialogHeader>

          {isAuthenticated === false ? (
            <div className="mt-1 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("testBooking.authChoiceTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("testBooking.authChoiceDesc")}</p>
              </div>
              <Button type="button" variant="outline" onClick={() => openPanel("LANDING")}>
                {t("testBooking.loginToContinue")}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-4 pt-1 md:grid-cols-2">
            <div>
              <Label htmlFor="modal-shopper-first-name">{t("testBooking.form.firstName")}</Label>
              <Input
                id="modal-shopper-first-name"
                value={shopperFirstName}
                onChange={(event) => setShopperFirstName(event.target.value)}
                onFocus={handleModalFieldFocus}
                placeholder={t("testBooking.form.firstNamePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="modal-shopper-last-name">{t("testBooking.form.lastName")}</Label>
              <Input
                id="modal-shopper-last-name"
                value={shopperLastName}
                onChange={(event) => setShopperLastName(event.target.value)}
                onFocus={handleModalFieldFocus}
                placeholder={t("testBooking.form.lastNamePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="modal-shopper-email">{t("testBooking.form.email")}</Label>
              <Input
                id="modal-shopper-email"
                type="email"
                value={shopperEmail}
                onChange={(event) => setShopperEmail(event.target.value)}
                onFocus={handleModalFieldFocus}
                placeholder={t("testBooking.form.emailPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="modal-shopper-phone">{t("testBooking.form.phone")}</Label>
              <Input
                id="modal-shopper-phone"
                type="tel"
                inputMode="numeric"
                value={shopperPhoneNumber}
                onChange={(event) => setShopperPhoneNumber(event.target.value)}
                onFocus={handleModalFieldFocus}
                placeholder={t("testBooking.form.phonePlaceholder")}
                required
              />
            </div>
            <div>
              <Label htmlFor="modal-pet-name">{t("testBooking.form.petName")}</Label>
              <Input
                id="modal-pet-name"
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                onFocus={handleModalFieldFocus}
                placeholder={t("testBooking.form.petNamePlaceholder")}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="modal-booking-clinic">{t("testBooking.form.bookingClinic")}</Label>
              <Select
                value={bookingClinic}
                onValueChange={setBookingClinic}
              >
                <SelectTrigger id="modal-booking-clinic" className="mt-1">
                  <SelectValue placeholder={t("testBooking.form.bookingClinicPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {clinicOptions.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.name}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClinic ? (
                <div className="mt-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-sm">
                  <div className="grid gap-3">
                    <a
                      href={`tel:${selectedClinic.phone.replace(/\s+/g, "")}`}
                      className="flex items-start gap-3 text-foreground transition hover:text-orange-700"
                    >
                      <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("testBooking.clinicInfo.phone")}
                        </span>
                        {selectedClinic.phone}
                      </span>
                    </a>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("testBooking.clinicInfo.address")}
                        </span>
                        {selectedClinic.address}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("testBooking.clinicInfo.hours")}
                        </span>
                        {selectedClinic.hours}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900">
                <Clock className="mb-2 h-4 w-4 text-amber-700" />
                {t("testBooking.form.bookingTimeContactPrompt")}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="modal-notes">{t("testBooking.form.notes")}</Label>
              <Textarea
                id="modal-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                onFocus={handleModalFieldFocus}
                placeholder={t("testBooking.form.notesPlaceholder")}
              />
            </div>
          </div>

          <Button
            className="mt-2 w-full"
            onClick={() => {
              if (selectedProduct) {
                void handlePurchase(selectedProduct);
              }
            }}
            disabled={!selectedProduct || Boolean(processingProductId)}
          >
            {selectedProduct && processingProductId === selectedProduct.id ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("testBooking.processing")}
              </>
            ) : (
              t("testBooking.buyNow")
            )}
          </Button>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default TestBooking;
