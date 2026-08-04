import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ProductReview } from "@/types/productReview";

const RATING_LABELS: Record<number, string> = {
  1: "非常差",
  2: "不太滿意",
  3: "普通",
  4: "滿意",
  5: "非常好",
};

const MIN_REVIEW_LENGTH = 10;
const MAX_REVIEW_LENGTH = 1000;

export type WriteProductReviewFormState = {
  rating: number;
  title: string;
  description: string;
  anonymous: boolean;
};

export type WriteProductReviewInitialValues = {
  rating?: number;
  title?: string;
  description?: string;
  anonymous?: boolean;
  showTitle?: boolean;
};

type WriteProductReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  editingReview: ProductReview | null;
  isSaving: boolean;
  onSubmit: (values: WriteProductReviewFormState) => void | Promise<void>;
  initialValues?: WriteProductReviewInitialValues | null;
  requireLoginToPost?: boolean;
};

export default function WriteProductReviewDialog({
  open,
  onOpenChange,
  productName,
  editingReview,
  isSaving,
  onSubmit,
  initialValues = null,
  requireLoginToPost = false,
}: WriteProductReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const appliedInitialKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      appliedInitialKeyRef.current = null;
      return;
    }

    // Prefer draft initialValues when restoring after login onto an existing review.
    const source = initialValues
      ? {
          rating: initialValues.rating ?? 5,
          title: initialValues.title ?? "",
          description: initialValues.description ?? "",
          anonymous: Boolean(initialValues.anonymous),
          showTitle:
            Boolean(initialValues.showTitle) || Boolean(initialValues.title?.trim()),
          mode: editingReview ? "edit-draft" : "draft",
          id: editingReview?.id ?? "draft",
        }
      : editingReview
        ? {
            rating: editingReview.rating,
            title: editingReview.title ?? "",
            description: editingReview.description ?? "",
            anonymous: Boolean(editingReview.anonymous),
            showTitle: Boolean(editingReview.title?.trim()),
            mode: "edit",
            id: editingReview.id,
          }
        : {
            rating: 5,
            title: "",
            description: "",
            anonymous: false,
            showTitle: false,
            mode: "defaults",
            id: "defaults",
          };

    const initialKey = JSON.stringify(source);
    if (appliedInitialKeyRef.current === initialKey) return;
    appliedInitialKeyRef.current = initialKey;

    setRating(source.rating && source.rating >= 1 ? source.rating : 5);
    setTitle(source.title);
    setDescription(source.description);
    setAnonymous(source.anonymous);
    setShowTitle(source.showTitle);
    setTouched(false);
    setHoverRating(0);
  }, [open, editingReview, initialValues]);

  const displayRating = hoverRating || rating;
  const trimmedDescription = description.trim();
  const descriptionTooShort = trimmedDescription.length > 0 && trimmedDescription.length < MIN_REVIEW_LENGTH;
  const canSubmit = trimmedDescription.length >= MIN_REVIEW_LENGTH && rating >= 1;

  const ratingLabel = useMemo(
    () => RATING_LABELS[displayRating] ?? "請選擇評分",
    [displayRating],
  );

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    void onSubmit({
      rating,
      title: title.trim(),
      description: trimmedDescription,
      anonymous,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] max-w-lg flex-col gap-0 overflow-hidden border-[hsl(var(--review-line))] p-0 sm:rounded-lg">
        <div className="shrink-0 border-b border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/40 px-5 py-4 sm:px-6">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            {editingReview ? "編輯評價" : "撰寫產品評價"}
          </DialogTitle>
          <DialogDescription className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {productName}
          </DialogDescription>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="rounded-lg border border-[hsl(var(--review-line))] bg-white px-4 py-5">
            <p className="text-center text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
              整體評分
            </p>
            <p
              className={cn(
                "mt-2 text-center text-[15px] font-semibold transition-colors",
                displayRating ? "text-foreground" : "text-muted-foreground",
              )}
              aria-live="polite"
            >
              {ratingLabel}
            </p>
            <div
              className="mt-4 flex items-center justify-center gap-2"
              role="radiogroup"
              aria-label="產品評分"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= displayRating;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} 星 · ${RATING_LABELS[value]}`}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      active ? "scale-105" : "scale-100 opacity-70 hover:opacity-100",
                    )}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    onFocus={() => setHoverRating(value)}
                    onBlur={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(value);
                      setTouched(false);
                      window.requestAnimationFrame(() => textareaRef.current?.focus());
                    }}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="review-body" className="text-[13px] font-semibold text-foreground">
                評價內容
                <span className="ml-1 text-primary">*</span>
              </label>
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  description.length > MAX_REVIEW_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {description.length}/{MAX_REVIEW_LENGTH}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              分享寵物食後反應、品質或性價比，幫助其他主人做決定。
            </p>
            <Textarea
              id="review-body"
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
              onBlur={() => setTouched(true)}
              placeholder="例如：我隻狗食咗兩星期，毛色同精神都好好，性價比高。"
              className={cn(
                "mt-2.5 min-h-[180px] resize-none rounded-md border-[hsl(var(--review-line))] text-[14px] leading-relaxed",
                touched && descriptionTooShort && "border-destructive/60 focus-visible:ring-destructive/30",
              )}
            />
            {touched && !trimmedDescription ? (
              <p className="mt-1.5 text-[12px] text-destructive">請填寫評價內容</p>
            ) : null}
            {touched && descriptionTooShort ? (
              <p className="mt-1.5 text-[12px] text-destructive">
                請至少輸入 {MIN_REVIEW_LENGTH} 個字，方便其他用家了解你的體驗
              </p>
            ) : null}

            <div className="mt-3">
              {!showTitle ? (
                <button
                  type="button"
                  className="text-[13px] font-medium text-primary hover:underline"
                  onClick={() => setShowTitle(true)}
                >
                  + 加入標題（可選）
                </button>
              ) : (
                <div>
                  <label htmlFor="review-title" className="text-[13px] font-medium text-muted-foreground">
                    標題（可選）
                  </label>
                  <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="一句話總結，例如：適口性高"
                    className="mt-1.5 border-[hsl(var(--review-line))] text-[14px]"
                    maxLength={80}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/25 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">匿名發佈</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">其他人只會見到「PetWell 用戶」</p>
            </div>
            <Switch
              id="review-anonymous"
              checked={anonymous}
              onCheckedChange={setAnonymous}
              aria-label="匿名發佈評價"
            />
          </section>
        </div>

        <div className="shrink-0 border-t border-[hsl(var(--review-line))] bg-white px-5 py-4 sm:px-6">
          {requireLoginToPost && !editingReview ? (
            <p className="mb-3 text-center text-[12px] text-muted-foreground">
              需要登入或建立帳戶後才能發佈評價，你寫嘅內容會被保留
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="h-10 text-[13px] text-muted-foreground"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button
              type="button"
              className="h-10 min-w-[120px] rounded-md text-[14px] font-semibold"
              onClick={handleSubmit}
              disabled={isSaving || !canSubmit}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中…
                </>
              ) : editingReview ? (
                "儲存評價"
              ) : requireLoginToPost ? (
                "登入並發佈"
              ) : (
                "發佈評價"
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground sm:text-right">
            每位用戶只可為同一產品評價一次
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
