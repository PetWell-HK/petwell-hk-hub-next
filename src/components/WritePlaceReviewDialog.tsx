import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
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

const RATING_LABELS: Record<number, string> = {
  1: "非常差",
  2: "不太滿意",
  3: "普通",
  4: "滿意",
  5: "非常好",
};

const MIN_REVIEW_LENGTH = 10;
const MAX_REVIEW_LENGTH = 1000;
const MAX_PHOTOS = 6;

export type WritePlaceReviewFormState = {
  rating: number;
  title: string;
  description: string;
  anonymous: boolean;
  photos: File[];
};

export type WritePlaceReviewInitialValues = {
  rating?: number;
  title?: string;
  description?: string;
  anonymous?: boolean;
  showTitle?: boolean;
  photos?: File[];
};

type WritePlaceReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeName: string;
  isSaving: boolean;
  onSubmit: (values: WritePlaceReviewFormState) => void | Promise<void>;
  initialValues?: WritePlaceReviewInitialValues | null;
  requireLoginToPost?: boolean;
};

export default function WritePlaceReviewDialog({
  open,
  onOpenChange,
  placeName,
  isSaving,
  onSubmit,
  initialValues = null,
  requireLoginToPost = false,
}: WritePlaceReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [touched, setTouched] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appliedInitialKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      appliedInitialKeyRef.current = null;
      return;
    }

    const initialKey = initialValues
      ? JSON.stringify({
          rating: initialValues.rating,
          title: initialValues.title,
          description: initialValues.description,
          anonymous: initialValues.anonymous,
          showTitle: initialValues.showTitle,
          photoCount: initialValues.photos?.length ?? 0,
          photoNames: initialValues.photos?.map((f) => `${f.name}:${f.size}`).join("|") ?? "",
        })
      : "defaults";

    if (appliedInitialKeyRef.current === initialKey) return;
    appliedInitialKeyRef.current = initialKey;

    setRating(initialValues?.rating && initialValues.rating >= 1 ? initialValues.rating : 5);
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    setAnonymous(Boolean(initialValues?.anonymous));
    setShowTitle(
      Boolean(initialValues?.showTitle) || Boolean(initialValues?.title?.trim()),
    );
    setTouched(false);
    setHoverRating(0);

    const nextPhotos = initialValues?.photos ? [...initialValues.photos] : [];
    setPhotos(nextPhotos);
    setPhotoPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return nextPhotos.map((file) => URL.createObjectURL(file));
    });
  }, [open, initialValues]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const displayRating = hoverRating || rating;
  const trimmedDescription = description.trim();
  const descriptionTooShort =
    trimmedDescription.length > 0 && trimmedDescription.length < MIN_REVIEW_LENGTH;
  const canSubmit = trimmedDescription.length >= MIN_REVIEW_LENGTH && rating >= 1;

  const ratingLabel = useMemo(
    () => RATING_LABELS[displayRating] ?? "請選擇評分",
    [displayRating],
  );

  const handlePhotosSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const nextFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const available = MAX_PHOTOS - photos.length;
    if (available <= 0) return;
    const accepted = nextFiles.slice(0, available);
    const previews = accepted.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...accepted]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    void onSubmit({
      rating,
      title: title.trim(),
      description: trimmedDescription,
      anonymous,
      photos,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] max-w-lg flex-col gap-0 overflow-hidden border-[hsl(var(--review-line))] p-0 sm:rounded-lg">
        <div className="shrink-0 border-b border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/40 px-5 py-4 sm:px-6">
          <DialogTitle className="text-[17px] font-semibold tracking-tight">
            撰寫評價
          </DialogTitle>
          <DialogDescription className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {placeName}
          </DialogDescription>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="pb-1">
            <p className="text-center text-[13px] font-semibold text-foreground">評分</p>
            <p className="mt-1 text-center text-[13px] text-muted-foreground" aria-live="polite">
              {ratingLabel}
            </p>
            <div
              className="mt-3 flex items-center justify-center gap-1.5"
              role="radiogroup"
              aria-label="評分"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= displayRating;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} 星`}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-md transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      "hover:bg-muted/60",
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
                        "h-7 w-7",
                        active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="place-review-body" className="text-[13px] font-semibold text-foreground">
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
            <Textarea
              id="place-review-body"
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
              onBlur={() => setTouched(true)}
              placeholder="分享你嘅體驗…"
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
                請至少輸入 {MIN_REVIEW_LENGTH} 個字
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
                  <label htmlFor="place-review-title" className="text-[13px] font-medium text-muted-foreground">
                    標題（可選）
                  </label>
                  <Input
                    id="place-review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="一句話總結你的體驗"
                    className="mt-1.5 border-[hsl(var(--review-line))] text-[14px]"
                    maxLength={80}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="mt-5 flex items-center justify-between gap-4 rounded-md border border-[hsl(var(--review-line))] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">匿名發佈</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">其他人只會見到「PetWell 用戶」</p>
            </div>
            <Switch
              id="place-review-anonymous"
              checked={anonymous}
              onCheckedChange={setAnonymous}
              aria-label="匿名發佈評價"
            />
          </section>

          <section className="mt-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handlePhotosSelected(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[hsl(var(--review-line))] bg-white px-4 py-3 text-[13px] font-medium text-primary transition-colors hover:bg-muted/40"
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
            >
              <ImagePlus className="h-4 w-4" />
              上傳圖片（可選）
              {photos.length > 0 ? (
                <span className="text-muted-foreground">· {photos.length}/{MAX_PHOTOS}</span>
              ) : null}
            </button>
            {photoPreviews.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {photoPreviews.map((preview, index) => (
                  <div key={preview} className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <img src={preview} alt={`預覽 ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                      onClick={() => removePhoto(index)}
                      aria-label={`移除圖片 ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <div className="shrink-0 border-t border-[hsl(var(--review-line))] bg-white px-5 py-4 sm:px-6">
          {requireLoginToPost ? (
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
              ) : requireLoginToPost ? (
                "登入並發佈"
              ) : (
                "發佈評價"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
