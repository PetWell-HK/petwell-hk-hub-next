"use client";

import { type ComponentProps, type DragEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import NametagHero from "@/components/NametagHero";
import NametagAccountPrompt from "@/components/NametagAccountPrompt";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { SPECIES_OPTIONS, type SpeciesKey } from "@/constants/petBreedsBySpecies";
import {
  getNametagRegisterConfigError,
  isNametagRegisterConfigured,
  submitNametagRegistration,
  type NametagRegisterInput,
  type NametagRegisterResponse,
} from "@/services/nametagRegisterApi";

type FormState = NametagRegisterInput & {
  petSpecies: SpeciesKey;
};

const initialForm: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  petName: "",
  petSpecies: "dogs",
  petPhotoFile: null,
  petBirthday: "",
  microchipNo: "",
  petWeight: "",
  sfAddress: "",
  specialRequirement: "",
  deliveryMethod: "郵寄",
  groupShippingPhone: "",
};

const requiredFields: Array<keyof FormState> = ["email", "firstName", "lastName", "phone", "petName", "sfAddress"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const weightPattern = /^\d+(\.\d{0,1})?$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const Nametag = () => {
  const { t, i18n } = useTranslation();
  const isZh = (i18n.language || "").startsWith("zh");
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<NametagRegisterResponse | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [alreadyHasAccount, setAlreadyHasAccount] = useState(false);
  const { toast } = useToast();

  const faqItems = useMemo(
    () => [
      { question: t("nametagPage.seo.faq.q1"), answer: t("nametagPage.seo.faq.a1") },
      { question: t("nametagPage.seo.faq.q2"), answer: t("nametagPage.seo.faq.a2") },
      { question: t("nametagPage.seo.faq.q3"), answer: t("nametagPage.seo.faq.a3") },
      { question: t("nametagPage.seo.faq.q4"), answer: t("nametagPage.seo.faq.a4") },
      { question: t("nametagPage.seo.faq.q5"), answer: t("nametagPage.seo.faq.a5") },
    ],
    [t],
  );

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: t("nametagPage.seo.structuredDataName"),
      url: "https://petwellhk.com/anti-lost-dog-tag-hk",
      description: t("nametagPage.seo.description"),
      keywords: t("nametagPage.seo.keywords"),
      serviceType: t("nametagPage.seo.structuredDataName"),
      provider: { "@type": "Organization", name: "PetWell HK" },
      areaServed: "Hong Kong",
      inLanguage: ["zh-HK", "en"],
    }),
    [t],
  );

  useSEO({
    title: t("nametagPage.seo.title"),
    description: t("nametagPage.seo.description"),
    keywords: t("nametagPage.seo.keywords"),
    canonicalUrl: "https://petwellhk.com/anti-lost-dog-tag-hk",
    structuredData,
    faqItems,
    howToSteps: {
      name: t("nametagPage.seo.howTo.name"),
      description: t("nametagPage.seo.howTo.description"),
      steps: [
        { name: t("nametagPage.seo.howTo.step1Name"), text: t("nametagPage.seo.howTo.step1Text") },
        { name: t("nametagPage.seo.howTo.step2Name"), text: t("nametagPage.seo.howTo.step2Text") },
        { name: t("nametagPage.seo.howTo.step3Name"), text: t("nametagPage.seo.howTo.step3Text") },
      ],
    },
    speakableSelectors: [".nametag-hero-summary", ".nametag-hero__chips", "h1"],
  });

  const updateField = (field: keyof FormState, value: string | File | null) => {
    if (field === "petWeight" && typeof value === "string") {
      const normalized = value.replace(/[^\d.]/g, "");
      const [whole = "", ...decimalParts] = normalized.split(".");
      const decimal = decimalParts.join("").slice(0, 1);
      const safeValue = decimalParts.length > 0 ? `${whole}.${decimal}` : whole;
      setForm((current) => ({ ...current, [field]: safeValue }));
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (!form.petPhotoFile) {
      setPhotoPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(form.petPhotoFile);
    setPhotoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.petPhotoFile]);

  const showPhotoError = (title: string, description: string) => {
    toast({ title, description, variant: "destructive" });
  };

  const selectPhoto = (file?: File | null) => {
    if (!file) {
      updateField("petPhotoFile", null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      showPhotoError(t("nametagPage.validation.invalidPhotoTitle"), t("nametagPage.validation.invalidPhotoDesc"));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showPhotoError(t("nametagPage.validation.photoTooLargeTitle"), t("nametagPage.validation.photoTooLargeDesc"));
      return;
    }
    updateField("petPhotoFile", file);
  };

  const handlePhotoDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    selectPhoto(event.dataTransfer.files?.[0]);
  };

  const validateForm = () => {
    const missing = requiredFields.some((field) => {
      const value = form[field];
      return typeof value !== "string" || !value.trim();
    });
    if (missing) {
      toast({
        title: t("nametagPage.validation.requiredTitle"),
        description: t("nametagPage.validation.requiredDesc"),
        variant: "destructive",
      });
      return false;
    }
    if (!emailPattern.test(form.email.trim())) {
      toast({
        title: t("nametagPage.validation.invalidEmailTitle"),
        description: t("nametagPage.validation.invalidEmailDesc"),
        variant: "destructive",
      });
      return false;
    }
    if (form.petWeight && !weightPattern.test(form.petWeight)) {
      toast({
        title: t("nametagPage.validation.requiredTitle"),
        description: t("nametagPage.validation.requiredDesc"),
        variant: "destructive",
      });
      return false;
    }
    if (!form.petPhotoFile) {
      toast({
        title: t("nametagPage.validation.photoRequiredTitle"),
        description: t("nametagPage.validation.photoRequiredDesc"),
        variant: "destructive",
      });
      return false;
    }
    if (!isNametagRegisterConfigured()) {
      toast({
        title: t("nametagPage.validation.notConfiguredTitle"),
        description: getNametagRegisterConfigError() || t("nametagPage.validation.notConfiguredDesc"),
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const submitPayload: NametagRegisterInput = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        petName: form.petName,
        petSpecies: form.petSpecies,
        petPhotoFile: form.petPhotoFile,
        petBirthday: form.petBirthday,
        microchipNo: form.microchipNo,
        petWeight: form.petWeight,
        sfAddress: form.sfAddress,
        specialRequirement: form.specialRequirement,
        deliveryMethod: form.deliveryMethod || "郵寄",
        groupShippingPhone: form.groupShippingPhone,
      };
      const result = await submitNametagRegistration(submitPayload);
      setSubmissionResult(result);
      setSubmitted(true);
      const isExistingAccount = Boolean(result.alreadyRegistered || result.cognitoUserCreated === false);
      toast({
        title: result.alreadyRegistered ? t("nametagPage.toast.alreadyRegisteredTitle") : t("nametagPage.toast.successTitle"),
        description: isExistingAccount
          ? t("nametagPage.toast.successDescExistingAccount")
          : t("nametagPage.toast.successDescNewAccount"),
      });
    } catch (error) {
      toast({
        title: t("nametagPage.toast.errorTitle"),
        description: error instanceof Error ? error.message : t("nametagPage.toast.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpeciesChange = (species: SpeciesKey) => {
    if (species === form.petSpecies) return;
    setForm((current) => ({ ...current, petSpecies: species }));
  };

  return (
    <div className="nametag-page min-h-screen overflow-x-hidden">
      <Header />
      <main className="overflow-x-hidden">
        <NametagHero />

        <section className="nametag-main">
          <div className="container mx-auto max-w-3xl px-4 pb-12 md:px-6 md:pb-16">
            <Card id="nametag-register" className="nametag-panel overflow-hidden border-0 shadow-none">
              <CardHeader className="nametag-panel__header">
                <CardTitle className="nametag-panel__title">{t("nametagPage.form.title")}</CardTitle>
                <p className="nametag-panel__subtitle">{t("nametagPage.form.subtitle")}</p>
              </CardHeader>
              <CardContent className="nametag-panel__body space-y-5">
                <NametagAccountPrompt alreadyHasAccount={alreadyHasAccount} onSelect={setAlreadyHasAccount} />

                {submitted ? (
                  <div className="nametag-state-card">
                    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">{t("nametagPage.success.title")}</h2>
                    <p className="mt-3 text-muted-foreground">{t("nametagPage.success.desc")}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {submissionResult?.alreadyRegistered || submissionResult?.cognitoUserCreated === false
                        ? t("nametagPage.success.existingAccountDesc")
                        : t("nametagPage.success.newAccountDesc")}
                    </p>
                    <Button className="mt-4" onClick={() => window.location.assign("/download")}>
                      {t("nametagPage.success.downloadCta")}
                    </Button>
                    <Button
                      className="mt-4 ml-3"
                      variant="outline"
                      onClick={() => {
                        setSubmitted(false);
                        setSubmissionResult(null);
                      }}
                    >
                      {t("nametagPage.success.submitAnother")}
                    </Button>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="firstName" label={t("nametagPage.form.firstNameLabel")} value={form.firstName} onChange={(value) => updateField("firstName", value)} placeholder={t("nametagPage.form.firstNamePlaceholder")} />
                      <FormField id="lastName" label={t("nametagPage.form.lastNameLabel")} value={form.lastName} onChange={(value) => updateField("lastName", value)} placeholder={t("nametagPage.form.lastNamePlaceholder")} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="email" label={t("nametagPage.form.emailLabel")} type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="example@email.com" />
                      <FormField id="phone" label={t("nametagPage.form.phoneLabel")} type="tel" value={form.phone} onChange={(value) => updateField("phone", value)} placeholder={t("nametagPage.form.phonePlaceholder")} />
                    </div>
                    <FormField id="petName" label={t("nametagPage.form.petNameLabel")} value={form.petName} onChange={(value) => updateField("petName", value)} placeholder={t("nametagPage.form.petNamePlaceholder")} />
                    <div className="space-y-2">
                      <Label htmlFor="petSpecies">{t("petTag.species")}</Label>
                      <Select value={form.petSpecies} onValueChange={(value) => handleSpeciesChange(value as SpeciesKey)}>
                        <SelectTrigger id="petSpecies">
                          <SelectValue placeholder={t("petTag.species")} />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIES_OPTIONS.map((option) => (
                            <SelectItem key={option.key} value={option.key}>
                              {isZh ? option.zh : option.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormField id="microchipNo" label={t("nametagPage.form.microchipLabel")} value={form.microchipNo} onChange={(value) => updateField("microchipNo", value)} placeholder={t("nametagPage.form.microchipPlaceholder")} />
                    <FormField id="sfAddress" label={t("nametagPage.form.sfAddressLabel")} value={form.sfAddress || ""} onChange={(value) => updateField("sfAddress", value)} placeholder={t("nametagPage.form.sfAddressPlaceholder")} />
                    <FormField id="specialRequirement" label={t("nametagPage.form.specialRequirementLabel")} value={form.specialRequirement || ""} onChange={(value) => updateField("specialRequirement", value)} placeholder={t("nametagPage.form.specialRequirementPlaceholder")} />
                    <FormField id="groupShippingPhone" label={t("nametagPage.form.groupShippingPhoneLabel")} value={form.groupShippingPhone || ""} onChange={(value) => updateField("groupShippingPhone", value)} placeholder={t("nametagPage.form.groupShippingPhonePlaceholder")} />
                    <PhotoUploadField
                      file={form.petPhotoFile}
                      previewUrl={photoPreviewUrl}
                      onSelect={selectPhoto}
                      onDrop={handlePhotoDrop}
                      onClear={() => updateField("petPhotoFile", null)}
                      label={t("nametagPage.photo.label")}
                      previewAlt={t("nametagPage.photo.previewAlt")}
                      replaceHint={t("nametagPage.photo.replaceHint")}
                      uploadPrompt={t("nametagPage.photo.uploadPrompt")}
                      uploadHint={t("nametagPage.photo.uploadHint")}
                      supportText={t("nametagPage.photo.supportText")}
                      removeLabel={t("nametagPage.photo.remove")}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="petBirthday" label={t("nametagPage.form.petBirthdayLabel")} type="date" value={form.petBirthday} onChange={(value) => updateField("petBirthday", value)} />
                      <FormField id="petWeight" label={t("nametagPage.form.petWeightLabel")} type="number" min="0" step="0.1" inputMode="decimal" value={form.petWeight} onChange={(value) => updateField("petWeight", value)} placeholder={t("nametagPage.form.petWeightPlaceholder")} />
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">{t("nametagPage.form.disclaimer")}</p>
                    <Button type="submit" size="lg" className="nametag-submit w-full text-base font-bold" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t("nametagPage.form.submitting")}
                        </>
                      ) : (
                        t("nametagPage.form.submit")
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="nametag-faq mt-8">
              <h2 className="nametag-faq__title">{t("nametagPage.seo.faqTitle")}</h2>
              <Accordion type="single" collapsible defaultValue="faq-0" className="mt-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={item.question} value={`faq-${index}`} className="nametag-faq__item">
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-6 text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentProps<typeof Input>, "id" | "value" | "onChange">;

const FormField = ({ id, label, value, onChange, ...props }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
  </div>
);

type PhotoUploadFieldProps = {
  file?: File | null;
  previewUrl: string;
  onSelect: (file?: File | null) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onClear: () => void;
  label: string;
  previewAlt: string;
  replaceHint: string;
  uploadPrompt: string;
  uploadHint: string;
  supportText: string;
  removeLabel: string;
};

const PhotoUploadField = ({
  file,
  previewUrl,
  onSelect,
  onDrop,
  onClear,
  label,
  previewAlt,
  replaceHint,
  uploadPrompt,
  uploadHint,
  supportText,
  removeLabel,
}: PhotoUploadFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="petPhotoFile">{label}</Label>
    <label
      htmlFor="petPhotoFile"
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="nametag-photo-upload group flex cursor-pointer flex-col items-center justify-center px-4 py-6 text-center"
    >
      {previewUrl ? (
        <div className="w-full">
          <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-2xl border bg-background shadow-sm">
            <img src={previewUrl} alt={previewAlt} className="h-full w-full object-cover" />
          </div>
          <p className="text-sm font-semibold text-foreground break-all">{file?.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{replaceHint}</p>
        </div>
      ) : (
        <>
          <div className="mb-3 rounded-full bg-background p-3 text-primary shadow-sm transition group-hover:scale-105">
            <ImagePlus className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold text-foreground">{uploadPrompt}</p>
          <p className="mt-1 text-xs text-muted-foreground">{uploadHint}</p>
        </>
      )}
      <Input id="petPhotoFile" type="file" accept="image/*" className="sr-only" onChange={(event) => onSelect(event.target.files?.[0])} />
    </label>
    <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>{supportText}</span>
      {file ? (
        <Button type="button" variant="ghost" size="sm" className="h-8 justify-start px-2" onClick={onClear}>
          <X className="h-4 w-4" />
          {removeLabel}
        </Button>
      ) : null}
    </div>
  </div>
);

export default Nametag;
