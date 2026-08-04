import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, Loader2, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import WriteProductReviewDialog, {
  type WriteProductReviewFormState,
  type WriteProductReviewInitialValues,
} from "@/components/WriteProductReviewDialog";
import {
  useCreateProductReview,
  useDeleteProductReview,
  useProductReviews,
  useUpdateProductReview,
} from "@/hooks/useProductReviews";
import { getClientsByEmail } from "@/services/forumApi";
import { createReviewReport } from "@/services/reportService";
import type { ProductReview } from "@/types/productReview";
import { cn } from "@/lib/utils";
import ReviewAuthorLink from "@/components/ReviewAuthorLink";
import {
  clearProductReviewDraft,
  readMatchingProductReviewDraft,
  saveProductReviewDraft,
  type ProductReviewDraft,
} from "@/utils/productReviewDraft";

type ProductReviewSectionProps = {
  productId: string;
  productName: string;
  avgRating?: number | null;
  numReviews?: number;
};

function formatReviewDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-HK", { year: "numeric", month: "short", day: "numeric" });
}

function draftToInitialValues(draft: ProductReviewDraft): WriteProductReviewInitialValues {
  return {
    rating: draft.rating,
    title: draft.title,
    description: draft.description,
    anonymous: draft.anonymous,
    showTitle: draft.showTitle || Boolean(draft.title.trim()),
  };
}

export default function ProductReviewSection({
  productId,
  productName,
  avgRating,
  numReviews = 0,
}: ProductReviewSectionProps) {
  const { isAuthenticated, userInfo, requiresProfileCompletion } = useAuth();
  const { openPanel, onAuthSuccess } = useAuthPanel();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductReviews(productId);
  const createReview = useCreateProductReview(productId);
  const updateReview = useUpdateProductReview(productId);
  const deleteReview = useDeleteProductReview(productId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [initialValues, setInitialValues] = useState<WriteProductReviewInitialValues | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const closingForAuthRef = useRef(false);
  const restoredDraftRef = useRef(false);

  const reviews = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const displayAvg = avgRating ?? (
    reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0
  );
  const displayCount = numReviews || reviews.length;

  const isLoggedIn = isAuthenticated === true && Boolean(userInfo?.userId);
  const canRestoreAfterAuth = isLoggedIn && !requiresProfileCompletion;
  const ownReview = reviews.find((review) => review.reviewerId === userInfo?.userId);

  const openCreateDialog = (values?: WriteProductReviewInitialValues | null) => {
    setEditingReview(null);
    if (values) {
      setInitialValues(values);
    } else {
      const draft = readMatchingProductReviewDraft(productId);
      setInitialValues(draft ? draftToInitialValues(draft) : null);
    }
    setDialogOpen(true);
  };

  const openWriteDialog = (review?: ProductReview) => {
    // Edit of own review requires login.
    if (review) {
      if (!isLoggedIn) {
        openPanel("LANDING");
        return;
      }
      setInitialValues(null);
      setEditingReview(review);
      setDialogOpen(true);
      return;
    }

    // Logged-in users with an existing review go to edit.
    if (isLoggedIn && ownReview) {
      setInitialValues(null);
      setEditingReview(ownReview);
      setDialogOpen(true);
      return;
    }

    // Guests (and logged-in users without a review) can draft a create form.
    openCreateDialog(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && closingForAuthRef.current) {
      closingForAuthRef.current = false;
      setDialogOpen(false);
      return;
    }
    if (!open) {
      setEditingReview(null);
      setInitialValues(null);
    }
    setDialogOpen(open);
  };

  const restoreDraftAfterAuth = () => {
    if (restoredDraftRef.current) return;
    restoredDraftRef.current = true;
    const draft = readMatchingProductReviewDraft(productId);
    const existingOwn = reviews.find((review) => review.reviewerId === userInfo?.userId);

    if (draft && existingOwn) {
      setEditingReview(existingOwn);
      setInitialValues(draftToInitialValues(draft));
      setDialogOpen(true);
    } else if (draft) {
      openCreateDialog(draftToInitialValues(draft));
    } else if (existingOwn) {
      setEditingReview(existingOwn);
      setInitialValues(null);
      setDialogOpen(true);
    } else {
      openCreateDialog(null);
    }

    clearProductReviewDraft();
    toast.success("登入成功！你可以繼續發佈評價");
  };

  useEffect(() => {
    if (!canRestoreAfterAuth || restoredDraftRef.current) return;
    if (!readMatchingProductReviewDraft(productId)) return;
    restoreDraftAfterAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once when auth becomes ready for this product
  }, [canRestoreAfterAuth, productId, reviews, userInfo?.userId]);

  const promptLoginWithDraft = (values: WriteProductReviewFormState) => {
    const draft: ProductReviewDraft = {
      productId,
      rating: values.rating,
      title: values.title,
      description: values.description,
      anonymous: values.anonymous,
      showTitle: Boolean(values.title.trim()),
    };
    saveProductReviewDraft(draft);
    restoredDraftRef.current = false;

    onAuthSuccess(() => {
      restoreDraftAfterAuth();
    });

    closingForAuthRef.current = true;
    setDialogOpen(false);
    openPanel("LANDING");
  };

  const handleSubmit = async (values: WriteProductReviewFormState) => {
    if (!isLoggedIn || !userInfo?.userId) {
      promptLoginWithDraft(values);
      return;
    }

    try {
      if (editingReview) {
        await updateReview.mutateAsync({
          input: {
            id: editingReview.id,
            title: values.title || null,
            description: values.description,
            rating: values.rating,
            anonymous: values.anonymous,
          },
          oldReviewRating: editingReview.rating,
        });
        toast.success("已更新評價");
      } else if (ownReview) {
        // Draft restore after login when user already reviewed: treat as update.
        await updateReview.mutateAsync({
          input: {
            id: ownReview.id,
            title: values.title || null,
            description: values.description,
            rating: values.rating,
            anonymous: values.anonymous,
          },
          oldReviewRating: ownReview.rating,
        });
        toast.success("已更新評價");
      } else {
        await createReview.mutateAsync({
          reviewerId: userInfo.userId,
          productId,
          title: values.title || null,
          description: values.description,
          rating: values.rating,
          anonymous: values.anonymous,
        });
        toast.success("已提交評價");
      }
      clearProductReviewDraft();
      setInitialValues(null);
      setDialogOpen(false);
      setEditingReview(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失敗，請稍後再試");
    }
  };

  const handleDelete = async (review: ProductReview) => {
    if (!window.confirm("確定要刪除此評價？")) return;
    try {
      await deleteReview.mutateAsync({ id: review.id, reviewRating: review.rating });
      toast.success("已刪除評價");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "刪除失敗");
    }
  };

  const handleReport = async (review: ProductReview) => {
    const message = window.prompt("請簡述舉報原因：");
    if (!message?.trim()) return;

    let contact: { reporterName: string; reporterEmail: string; reporterPhone: string } | null = null;

    if (isAuthenticated === true && userInfo?.email) {
      const fallbackName =
        userInfo.username && !userInfo.username.includes("@") ? userInfo.username : userInfo.email;
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
        contact = {
          reporterName: fullName || fallbackName,
          reporterEmail: (bestClient?.email || userInfo.email).trim().toLowerCase(),
          reporterPhone: bestClient?.phone?.trim() || "",
        };
      } catch {
        contact = {
          reporterName: fallbackName,
          reporterEmail: userInfo.email.trim().toLowerCase(),
          reporterPhone: "",
        };
      }
    } else {
      const email = window.prompt("請輸入你的電郵（方便跟進）：")?.trim().toLowerCase() || "";
      const phone = window.prompt("請輸入你的電話號碼（方便跟進）：")?.trim() || "";
      const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!email || !phone || !emailLooksValid) {
        toast.error("請填寫有效電郵及電話號碼");
        return;
      }
      contact = {
        reporterName: "Guest",
        reporterEmail: email,
        reporterPhone: phone,
      };
    }

    setReportingId(review.id);
    try {
      await createReviewReport({
        reporterId: userInfo?.userId ?? null,
        relatedReviewId: review.id,
        placeName: productName,
        message: message.trim(),
        contact,
      });
      toast.success("已提交舉報，多謝你的回饋");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "舉報失敗");
    } finally {
      setReportingId(null);
    }
  };

  const isSaving = createReview.isPending || updateReview.isPending;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          {displayCount > 0 ? (
            <p className="text-[12px] text-muted-foreground">
              平均 {displayAvg.toFixed(1)} 星 · {displayCount} 個評價
            </p>
          ) : (
            <p className="text-[12px] text-muted-foreground">暫時未有評價</p>
          )}
        </div>
        <Button size="sm" className="h-9 rounded-md text-[13px]" onClick={() => openWriteDialog()}>
          {ownReview ? "編輯我的評價" : "撰寫評價"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          載入評價中…
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[hsl(var(--review-line))] bg-[hsl(var(--review-canvas))]/30 px-4 py-10 text-center">
          <p className="text-[14px] font-medium">暫時未有評價</p>
          <p className="mt-1 text-[13px] text-muted-foreground">分享你用過呢款產品嘅心得，幫到其他寵物主人。</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => openWriteDialog()}>
            成為第一個評價
          </Button>
        </div>
      ) : (
        <>
          <ReviewsDistribution reviews={reviews} avgRating={displayAvg} />
          <div className="mt-4 divide-y divide-[hsl(var(--review-line))]">
            {reviews.map((review) => {
              const isOwner = review.reviewerId === userInfo?.userId;
              return (
                <article key={review.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <ReviewAuthorLink
                          reviewerId={review.reviewerId || review.reviewer?.id}
                          anonymous={review.anonymous}
                          source={review.source}
                          displayName={
                            review.reviewer?.displayName || review.reviewer?.firstName || null
                          }
                          profileImage={review.reviewer?.profileImage}
                          avatarClassName="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold text-primary"
                        />
                        <span className="text-[11px] text-muted-foreground">{formatReviewDate(review.createdAt)}</span>
                      </div>
                      <div className="mt-1 flex items-center">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn(
                              "h-3.5 w-3.5",
                              n <= Math.round(review.rating) ? "fill-amber-400 text-amber-400" : "text-muted",
                            )}
                          />
                        ))}
                      </div>
                      {review.title ? (
                        <h4 className="mt-2 text-[13px] font-semibold">{review.title}</h4>
                      ) : null}
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{review.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                              onClick={() => openWriteDialog(review)}
                            >
                              <Pencil className="h-3 w-3" />
                              編輯
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] text-destructive hover:text-destructive"
                              onClick={() => handleDelete(review)}
                            >
                              <Trash2 className="h-3 w-3" />
                              刪除
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                            onClick={() => handleReport(review)}
                            disabled={reportingId === review.id}
                          >
                            <Flag className="h-3 w-3" />
                            舉報
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {hasNextPage ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "載入中…" : "載入更多評價"}
            </Button>
          ) : null}
        </>
      )}

      <WriteProductReviewDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        productName={productName}
        editingReview={editingReview}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        requireLoginToPost={!isLoggedIn}
      />
    </div>
  );
}

function ReviewsDistribution({
  reviews,
  avgRating,
}: {
  reviews: ProductReview[];
  avgRating: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-[hsl(var(--review-line))] pb-5 md:gap-6">
      <div className="text-center">
        <p className="review-display text-4xl">{avgRating.toFixed(1)}</p>
        <div className="mt-1 flex items-center justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={cn(
                "h-4 w-4",
                n <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted",
              )}
            />
          ))}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{reviews.length} 個評價</p>
      </div>
      <div className="min-w-[180px] flex-1 space-y-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => Math.round(r.rating) === star).length;
          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-[11px]">
              <span className="w-3 text-muted-foreground">{star}</span>
              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--review-canvas))]">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-5 text-right tabular-nums text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
