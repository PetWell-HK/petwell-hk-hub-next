import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Bug,
  CircleHelp,
  Clock3,
  Globe,
  House,
  Lightbulb,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  PlusCircle,
  Scissors,
  ShoppingBag,
  Stethoscope,
  Type,
  UtensilsCrossed,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getClientsByEmail } from "@/services/forumApi";
import {
  createGeneralFeedbackReport,
  createPlaceCorrectionReport,
  createSuggestNewPlaceReport,
  type WebCorrectionField,
  type WebFeedbackCategory,
  type WebReportPlaceType,
  type WebSuggestPlaceCategory,
} from "@/services/reportService";
import { cn } from "@/lib/utils";

type ReportMode = "place" | "feedback" | "suggest";

type PlaceReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeId?: string;
  placeName?: string;
  placeType?: WebReportPlaceType;
  defaultMode?: ReportMode;
  defaultCategory?: WebSuggestPlaceCategory;
};

const correctionFieldConfigs: Array<{
  value: WebCorrectionField;
  icon: typeof MapPin;
  labels: { zh: string; en: string };
}> = [
  { value: "ADDRESS", icon: MapPin, labels: { zh: "地址", en: "Address" } },
  { value: "HOURS", icon: Clock3, labels: { zh: "營業時間", en: "Hours" } },
  { value: "PHONE", icon: Phone, labels: { zh: "電話", en: "Phone" } },
  { value: "WEBSITE", icon: Globe, labels: { zh: "網站", en: "Website" } },
  { value: "NAME", icon: Type, labels: { zh: "名稱", en: "Name" } },
  { value: "OTHER", icon: CircleHelp, labels: { zh: "其他", en: "Other" } },
];

const feedbackCategoryConfigs: Array<{
  value: WebFeedbackCategory;
  icon: typeof MessageSquare;
  labels: { zh: string; en: string };
}> = [
  { value: "BUG", icon: Bug, labels: { zh: "問題回報", en: "Issue" } },
  { value: "FEATURE_REQUEST", icon: Lightbulb, labels: { zh: "功能建議", en: "Feature" } },
  { value: "SUGGESTION", icon: MessageSquare, labels: { zh: "一般意見", en: "Feedback" } },
  { value: "OTHER", icon: CircleHelp, labels: { zh: "其他", en: "Other" } },
];

const placeTypeConfigs: Record<
  WebReportPlaceType,
  { icon: typeof MapPin; labels: { zh: string; en: string } }
> = {
  clinic: { icon: Stethoscope, labels: { zh: "診所", en: "Clinic" } },
  salon: { icon: Scissors, labels: { zh: "美容店", en: "Salon" } },
  lodging: { icon: BedDouble, labels: { zh: "寄養場所", en: "Lodging" } },
  restaurant: { icon: UtensilsCrossed, labels: { zh: "餐廳", en: "Restaurant" } },
  homeVisit: { icon: House, labels: { zh: "上門服務", en: "Home visit" } },
};

const suggestCategoryConfigs: Array<{
  value: WebSuggestPlaceCategory;
  icon: typeof MapPin;
  labels: { zh: string; en: string };
}> = [
  { value: "restaurant", icon: UtensilsCrossed, labels: { zh: "餐廳", en: "Restaurant" } },
  { value: "clinic", icon: Stethoscope, labels: { zh: "診所", en: "Clinic" } },
  { value: "homeVisit", icon: House, labels: { zh: "上門服務", en: "Home visit" } },
  { value: "salon", icon: Scissors, labels: { zh: "美容店", en: "Salon" } },
  { value: "lodging", icon: BedDouble, labels: { zh: "寄養場所", en: "Lodging" } },
  { value: "mall", icon: ShoppingBag, labels: { zh: "商場", en: "Mall" } },
];

const PlaceReportModal = ({
  open,
  onOpenChange,
  placeId,
  placeName,
  placeType,
  defaultMode,
  defaultCategory,
}: PlaceReportModalProps) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, userInfo } = useAuth();
  const { toast } = useToast();
  const hasPlaceContext = Boolean(placeId && placeName && placeType);
  const initialMode = defaultMode ?? (hasPlaceContext ? "place" : "feedback");
  const [mode, setMode] = useState<ReportMode>(initialMode);
  const [selectedField, setSelectedField] = useState<WebCorrectionField | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState<WebFeedbackCategory>("BUG");
  const [suggestCategory, setSuggestCategory] = useState<WebSuggestPlaceCategory>(
    defaultCategory || "restaurant"
  );
  const [suggestPlaceName, setSuggestPlaceName] = useState("");
  const [suggestAddress, setSuggestAddress] = useState("");
  const [details, setDetails] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEnglish = i18n.language === "en";
  const isLoggedIn = isAuthenticated === true;

  const placeConfig = useMemo(
    () => (placeType ? placeTypeConfigs[placeType] : null),
    [placeType]
  );
  const PlaceIcon = placeConfig?.icon ?? MessageSquare;

  useEffect(() => {
    if (!open) return;
    setMode(defaultMode ?? (hasPlaceContext ? "place" : "feedback"));
    if (defaultCategory) {
      setSuggestCategory(defaultCategory);
    }
  }, [open, defaultMode, defaultCategory, hasPlaceContext]);

  useEffect(() => {
    if (!open) return;

    const prefillContactInfo = async () => {
      if (!isLoggedIn || !userInfo?.email) {
        return;
      }

      const fallbackName = userInfo.username && !userInfo.username.includes("@")
        ? userInfo.username
        : "";

      setContactEmail(userInfo.email);
      setContactName((current) => current || fallbackName);

      try {
        const clients = await getClientsByEmail(userInfo.rawEmail || userInfo.email);
        const bestClient = [...clients].sort((a, b) => {
          const score = (client: (typeof clients)[number]) =>
            Number(Boolean(client.firstName?.trim())) +
            Number(Boolean(client.lastName?.trim())) +
            Number(Boolean(client.phone?.trim()));
          return score(b) - score(a);
        })[0];

        const fullName = [bestClient?.firstName, bestClient?.lastName].filter(Boolean).join(" ").trim();
        setContactName(fullName || fallbackName || userInfo.email);
        setContactPhone(bestClient?.phone?.trim() || "");
      } catch (error) {
        console.warn("Unable to prefill report contact info:", error);
        setContactName((current) => current || fallbackName || userInfo.email);
      }
    };

    void prefillContactInfo();
  }, [open, isLoggedIn, userInfo?.email, userInfo?.rawEmail, userInfo?.username]);

  const resetForm = () => {
    setMode(initialMode);
    setSelectedField(null);
    setFeedbackCategory("BUG");
    setSuggestCategory(defaultCategory || "restaurant");
    setSuggestPlaceName("");
    setSuggestAddress("");
    setDetails("");
    if (!isLoggedIn) {
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    if (mode === "place" && (!hasPlaceContext || !selectedField)) {
      toast({
        title: isEnglish ? "Select a field" : "請選擇項目",
        variant: "destructive",
      });
      return;
    }

    const trimmedDetails = details.trim();
    const trimmedSuggestName = suggestPlaceName.trim();
    const trimmedSuggestAddress = suggestAddress.trim();
    const trimmedContactName = contactName.trim();
    const trimmedContactEmail = contactEmail.trim().toLowerCase();
    const trimmedContactPhone = contactPhone.trim();
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContactEmail);

    if (mode === "suggest" && !trimmedSuggestName) {
      toast({
        title: isEnglish ? "Enter place name" : "請填寫地點名稱",
        variant: "destructive",
      });
      return;
    }

    if (!isLoggedIn) {
      if (!trimmedContactEmail || !trimmedContactPhone || !emailLooksValid) {
        toast({
          title: isEnglish ? "Contact info required" : "請填寫聯絡資料",
          description: isEnglish
            ? "Please provide a valid email and phone number."
            : "請填寫有效電郵及電話號碼。",
          variant: "destructive",
        });
        return;
      }
    }

    if (mode === "feedback" && !trimmedDetails) {
      toast({
        title: isEnglish ? "Describe the issue" : "請填寫內容",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reporterId = isAuthenticated ? userInfo?.userId ?? null : null;
      const fallbackEmail = userInfo?.email?.trim().toLowerCase() || "";
      const contact = isLoggedIn
        ? {
            reporterName:
              trimmedContactName ||
              (userInfo?.username && !userInfo.username.includes("@")
                ? userInfo.username
                : fallbackEmail) ||
              "User",
            reporterEmail: trimmedContactEmail || fallbackEmail,
            reporterPhone: trimmedContactPhone,
          }
        : {
            reporterName: trimmedContactName || "Guest",
            reporterEmail: trimmedContactEmail,
            reporterPhone: trimmedContactPhone,
          };

      if (mode === "place") {
        await createPlaceCorrectionReport({
          reporterId,
          placeType: placeType!,
          placeId: placeId!,
          placeName: placeName!,
          correctionField: selectedField!,
          message: trimmedDetails || selectedField!,
          contact,
        });
      } else if (mode === "suggest") {
        await createSuggestNewPlaceReport({
          reporterId,
          category: suggestCategory,
          placeName: trimmedSuggestName,
          address: trimmedSuggestAddress,
          notes: trimmedDetails,
          contact,
        });
      } else {
        await createGeneralFeedbackReport({
          reporterId,
          feedbackCategory,
          message: trimmedDetails,
          contact,
        });
      }

      toast({
        title: t("report.successTitle"),
        description:
          mode === "suggest" ? t("report.suggestSuccessDesc") : t("report.successDesc"),
      });

      handleClose(false);
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast({
        title: isEnglish ? "Unable to submit" : "暫時未能提交",
        description: isEnglish ? "Please try again later." : "請稍後再試。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    mode === "suggest"
      ? t("report.suggestTitle")
      : isEnglish
        ? "Report or feedback"
        : "回報問題或意見";
  const description =
    mode === "suggest"
      ? t("report.suggestDesc")
      : isEnglish
        ? "Tell us what needs attention."
        : "簡單講低需要跟進的內容。";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-0">
        <div className="p-6 md:p-7">
          <DialogHeader className="mb-5 text-left">
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {hasPlaceContext && placeConfig && mode !== "suggest" && (
            <div className="mb-5 rounded-2xl border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary">
                  <PlaceIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {placeConfig.labels[isEnglish ? "en" : "zh"]}
                  </p>
                  <p className="font-semibold">{placeName}</p>
                </div>
              </div>
            </div>
          )}

          {hasPlaceContext && mode !== "suggest" && (
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
              {[
                { value: "place" as const, label: isEnglish ? "Place info" : "資料更正" },
                { value: "feedback" as const, label: isEnglish ? "Issue" : "問題意見" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    mode === item.value ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                  )}
                  onClick={() => setMode(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {!hasPlaceContext && (
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
              {[
                { value: "suggest" as const, label: t("report.suggestTab") },
                { value: "feedback" as const, label: isEnglish ? "Feedback" : "意見回報" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    mode === item.value ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                  )}
                  onClick={() => setMode(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {!isLoggedIn && (
            <div className="mb-5 rounded-2xl border bg-muted/30 p-4">
              <p className="mb-3 text-sm font-semibold">
                {isEnglish ? "Contact info" : "聯絡資料"}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {isEnglish ? "Name (optional)" : "姓名（選填）"}
                  </label>
                  <Input
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    placeholder={isEnglish ? "Your name" : "請輸入姓名"}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {isEnglish ? "Email" : "電郵"} *
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {isEnglish ? "Phone number" : "電話號碼"} *
                  </label>
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    placeholder={isEnglish ? "Phone number" : "請輸入電話"}
                  />
                </div>
              </div>
            </div>
          )}

          {mode === "place" && hasPlaceContext ? (
            <div className="mb-5">
              <p className="mb-3 text-sm font-semibold">
                {isEnglish ? "What is wrong?" : "邊方面有誤？"}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {correctionFieldConfigs.map((field) => {
                  const Icon = field.icon;
                  const isSelected = selectedField === field.value;

                  return (
                    <button
                      key={field.value}
                      type="button"
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                        isSelected ? "border-primary bg-primary/5" : "hover:border-primary/40"
                      )}
                      onClick={() => setSelectedField(field.value)}
                    >
                      <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium">{field.labels[isEnglish ? "en" : "zh"]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {mode === "feedback" ? (
            <div className="mb-5">
              <p className="mb-3 text-sm font-semibold">
                {isEnglish ? "Category" : "類別"}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {feedbackCategoryConfigs.map((category) => {
                  const Icon = category.icon;
                  const isSelected = feedbackCategory === category.value;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                        isSelected ? "border-primary bg-primary/5" : "hover:border-primary/40"
                      )}
                      onClick={() => setFeedbackCategory(category.value)}
                    >
                      <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium">{category.labels[isEnglish ? "en" : "zh"]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {mode === "suggest" ? (
            <div className="mb-5 space-y-5">
              <div>
                <p className="mb-3 text-sm font-semibold">{t("report.suggestCategory")}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggestCategoryConfigs.map((category) => {
                    const Icon = category.icon;
                    const isSelected = suggestCategory === category.value;

                    return (
                      <button
                        key={category.value}
                        type="button"
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                          isSelected ? "border-primary bg-primary/5" : "hover:border-primary/40"
                        )}
                        onClick={() => setSuggestCategory(category.value)}
                      >
                        <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-medium">{category.labels[isEnglish ? "en" : "zh"]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  {t("report.suggestName")} *
                </label>
                <Input
                  value={suggestPlaceName}
                  onChange={(event) => setSuggestPlaceName(event.target.value)}
                  placeholder={t("report.suggestNamePlaceholder")}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  {t("report.suggestAddressOptional")}
                </label>
                <Input
                  value={suggestAddress}
                  onChange={(event) => setSuggestAddress(event.target.value)}
                  placeholder={t("report.suggestAddressPlaceholder")}
                />
              </div>
            </div>
          ) : null}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              {mode === "place"
                ? isEnglish
                  ? "Details (optional)"
                  : "補充資料（選填）"
                : mode === "suggest"
                  ? t("report.suggestNotesOptional")
                  : isEnglish
                    ? "Details"
                    : "內容"}
            </label>
            <Textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={
                mode === "place"
                  ? isEnglish
                    ? "Example: new phone number, updated hours, or correct address."
                    : "例如：新電話、最新營業時間、正確地址。"
                  : mode === "suggest"
                    ? t("report.suggestNotesPlaceholder")
                    : isEnglish
                      ? "Describe what happened or what you want improved."
                      : "描述遇到的問題，或想改善的地方。"
              }
              className="min-h-[120px]"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              {isEnglish ? "Cancel" : "取消"}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting
                ? isEnglish
                  ? "Submitting..."
                  : "提交中..."
                : mode === "suggest"
                  ? (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {t("report.suggestSubmit")}
                    </>
                  )
                  : isEnglish
                    ? "Submit"
                    : "提交"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceReportModal;
