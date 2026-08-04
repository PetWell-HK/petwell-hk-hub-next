import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getClientsByEmail } from "@/services/forumApi";
import { createGeneralFeedbackReport } from "@/services/reportService";

const REASONS = [
  { value: "price", label: "價格有誤" },
  { value: "discontinued", label: "產品已下架" },
  { value: "image_name", label: "圖片或名稱不對" },
  { value: "store_missing", label: "此店舖沒有此產品" },
  { value: "other", label: "其他" },
] as const;

interface PriceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  storeName?: string;
}

const PriceReportDialog = ({
  open,
  onOpenChange,
  productId,
  productName,
  storeName,
}: PriceReportDialogProps) => {
  const { isAuthenticated, userInfo } = useAuth();
  const isLoggedIn = isAuthenticated === true;
  const [reason, setReason] = useState("price");
  const [note, setNote] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const prefillContactInfo = async () => {
      if (!isLoggedIn || !userInfo?.email) return;

      const fallbackName =
        userInfo.username && !userInfo.username.includes("@") ? userInfo.username : "";

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

        const fullName = [bestClient?.firstName, bestClient?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        setContactName(fullName || fallbackName || userInfo.email);
        setContactPhone(bestClient?.phone?.trim() || "");
      } catch (error) {
        console.warn("Unable to prefill price report contact info:", error);
        setContactName((current) => current || fallbackName || userInfo.email);
      }
    };

    void prefillContactInfo();
  }, [open, isLoggedIn, userInfo?.email, userInfo?.rawEmail, userInfo?.username]);

  const resetForm = () => {
    setReason("price");
    setNote("");
    if (!isLoggedIn) {
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !submitting) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const trimmedEmail = contactEmail.trim().toLowerCase();
    const trimmedPhone = contactPhone.trim();
    const trimmedName = contactName.trim();
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isLoggedIn) {
      if (!trimmedEmail || !trimmedPhone || !emailLooksValid) {
        toast.error("請填寫有效電郵及電話號碼");
        return;
      }
    }

    const reasonLabel = REASONS.find((r) => r.value === reason)?.label ?? reason;
    const message = [
      "[Price / Product Data Report]",
      `Product ID: ${productId}`,
      `Product: ${productName}`,
      storeName ? `Store: ${storeName}` : null,
      `Reason: ${reasonLabel}`,
      note.trim() ? `Note: ${note.trim().slice(0, 1000)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    try {
      const fallbackEmail = userInfo?.email?.trim().toLowerCase() || "";
      await createGeneralFeedbackReport({
        reporterId: isLoggedIn ? userInfo?.userId ?? null : null,
        feedbackCategory: "BUG",
        message,
        contact: {
          reporterName:
            trimmedName ||
            (userInfo?.username && !userInfo.username.includes("@")
              ? userInfo.username
              : fallbackEmail) ||
            "Guest",
          reporterEmail: trimmedEmail || fallbackEmail,
          reporterPhone: trimmedPhone,
        },
      });
      toast.success("多謝你的舉報！我哋會盡快核查。", { duration: 3000 });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit price report:", error);
      toast.error("暫時未能提交，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>舉報資料問題</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {storeName ? `${storeName} · ${productName}` : productName}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={reason} onValueChange={setReason} className="gap-3 py-2">
          {REASONS.map((r) => (
            <div key={r.value} className="flex items-center gap-2">
              <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
              <Label htmlFor={`reason-${r.value}`} className="cursor-pointer font-normal">
                {r.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="space-y-1.5">
          <Label htmlFor="report-note" className="text-sm">
            補充說明（選填）
          </Label>
          <Textarea
            id="report-note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 1000))}
            placeholder="例如：實際價格、缺貨日期等"
            rows={3}
          />
        </div>

        {!isLoggedIn && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium">聯絡資料</p>
            <div className="space-y-1.5">
              <Label htmlFor="price-report-name" className="text-xs text-muted-foreground">
                姓名（選填）
              </Label>
              <Input
                id="price-report-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="請輸入姓名"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price-report-email" className="text-xs text-muted-foreground">
                電郵 *
              </Label>
              <Input
                id="price-report-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price-report-phone" className="text-xs text-muted-foreground">
                電話號碼 *
              </Label>
              <Input
                id="price-report-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="請輸入電話"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "提交中…" : "提交舉報"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceReportDialog;
