import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import WritePlaceReviewDialog, {
  type WritePlaceReviewFormState,
  type WritePlaceReviewInitialValues,
} from "@/components/WritePlaceReviewDialog";
import { useCreatePlaceReview } from "@/hooks/usePlaceReviews";
import { uploadPlaceReviewImages } from "@/services/placeReviewApi";
import type { PlaceReviewType } from "@/types/placeReview";
import { cn } from "@/lib/utils";
import {
  clearPlaceReviewDraft,
  readMatchingPlaceReviewDraft,
  savePlaceReviewDraft,
  type PlaceReviewDraft,
} from "@/utils/placeReviewDraft";

type WritePlaceReviewCTAProps = {
  placeType: PlaceReviewType;
  placeId: string;
  placeName: string;
  variant?: "header" | "empty";
  className?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

type PendingPhotosRef = {
  photos: File[];
};

function draftToInitialValues(
  draft: PlaceReviewDraft,
  photos: File[] = [],
): WritePlaceReviewInitialValues {
  return {
    rating: draft.rating,
    title: draft.title,
    description: draft.description,
    anonymous: draft.anonymous,
    showTitle: draft.showTitle || Boolean(draft.title.trim()),
    photos,
  };
}

export default function WritePlaceReviewCTA({
  placeType,
  placeId,
  placeName,
  variant = "header",
  className,
  buttonVariant,
}: WritePlaceReviewCTAProps) {
  const { isAuthenticated, userInfo, requiresProfileCompletion } = useAuth();
  const { openPanel, onAuthSuccess } = useAuthPanel();
  const createReview = useCreatePlaceReview(placeType, placeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [initialValues, setInitialValues] = useState<WritePlaceReviewInitialValues | null>(null);
  const closingForAuthRef = useRef(false);
  const pendingPhotosRef = useRef<PendingPhotosRef | null>(null);
  const restoredDraftRef = useRef(false);

  const isLoggedIn = isAuthenticated === true && Boolean(userInfo?.userId);
  const canRestoreAfterAuth = isLoggedIn && !requiresProfileCompletion;

  const openWriteDialog = (values?: WritePlaceReviewInitialValues | null) => {
    if (values) {
      setInitialValues(values);
    } else {
      const draft = readMatchingPlaceReviewDraft(placeType, placeId);
      setInitialValues(
        draft
          ? draftToInitialValues(draft, pendingPhotosRef.current?.photos ?? [])
          : null,
      );
    }
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && closingForAuthRef.current) {
      closingForAuthRef.current = false;
      setDialogOpen(false);
      return;
    }
    if (!open) {
      setInitialValues(null);
    }
    setDialogOpen(open);
  };

  const restoreDraftAfterAuth = () => {
    if (restoredDraftRef.current) return;
    restoredDraftRef.current = true;
    const draft = readMatchingPlaceReviewDraft(placeType, placeId);
    const photos = pendingPhotosRef.current?.photos ?? [];
    if (draft) {
      openWriteDialog(draftToInitialValues(draft, photos));
    } else if (photos.length > 0) {
      openWriteDialog({ photos });
    } else {
      openWriteDialog(null);
    }
    // Cleared after apply so remount / social return does not auto-open again.
    clearPlaceReviewDraft();
    toast.success("登入成功！你可以繼續發佈評價");
  };

  useEffect(() => {
    if (!canRestoreAfterAuth || restoredDraftRef.current) return;
    if (!readMatchingPlaceReviewDraft(placeType, placeId)) return;
    restoreDraftAfterAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once when auth becomes ready for this place
  }, [canRestoreAfterAuth, placeType, placeId]);

  const promptLoginWithDraft = (values: WritePlaceReviewFormState) => {
    const draft: PlaceReviewDraft = {
      placeType,
      placeId,
      rating: values.rating,
      title: values.title,
      description: values.description,
      anonymous: values.anonymous,
      showTitle: Boolean(values.title.trim()),
    };
    savePlaceReviewDraft(draft);
    pendingPhotosRef.current = { photos: values.photos };
    restoredDraftRef.current = false;

    onAuthSuccess(() => {
      restoreDraftAfterAuth();
    });

    closingForAuthRef.current = true;
    setDialogOpen(false);
    openPanel("LANDING");
  };

  const handleSubmit = async (values: WritePlaceReviewFormState) => {
    if (!isLoggedIn || !userInfo?.userId) {
      promptLoginWithDraft(values);
      return;
    }

    try {
      setIsUploading(true);
      const fileAttachments = await uploadPlaceReviewImages(values.photos, placeType);
      const rating = values.rating;

      await createReview.mutateAsync({
        reviewerId: userInfo.userId,
        placeType,
        placeId,
        title: values.title || null,
        description: values.description,
        environmentRating: rating,
        serviceRating: rating,
        personnelRating: rating,
        waitingRating: rating,
        valueRating: rating,
        totalRating: rating,
        anonymous: values.anonymous,
        fileAttachments,
      });

      clearPlaceReviewDraft();
      pendingPhotosRef.current = null;
      setInitialValues(null);
      toast.success("已提交評價");
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失敗，請稍後再試");
    } finally {
      setIsUploading(false);
    }
  };

  const isSaving = createReview.isPending || isUploading;

  const dialog = (
    <WritePlaceReviewDialog
      open={dialogOpen}
      onOpenChange={handleDialogOpenChange}
      placeName={placeName}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      requireLoginToPost={!isLoggedIn}
    />
  );

  if (variant === "empty") {
    return (
      <>
        <div className={cn("rounded-lg border border-dashed bg-muted/30 px-4 py-10 text-center", className)}>
          <p className="text-[14px] font-medium">暫時未有評價</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            分享你嘅體驗，幫到其他寵物主人。
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => openWriteDialog(null)}>
            成為第一個評價
          </Button>
        </div>
        {dialog}
      </>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant={buttonVariant}
        className={cn("h-9 rounded-md text-[13px]", className)}
        onClick={() => openWriteDialog(null)}
      >
        撰寫評價
      </Button>
      {dialog}
    </>
  );
}
