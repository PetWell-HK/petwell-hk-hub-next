import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { canLinkToUserProfile } from "@/services/userReviewApi";
import { isExternalReviewSource, resolveProfileImageUrl } from "@/utils/reviewDisplay";

type ReviewAuthorLinkProps = {
  reviewerId?: string | null;
  anonymous?: boolean | null;
  source?: string | null;
  displayName?: string | null;
  profileImage?: string | null;
  className?: string;
  avatarClassName?: string;
};

export default function ReviewAuthorLink({
  reviewerId,
  anonymous,
  source,
  displayName,
  profileImage,
  className,
  avatarClassName,
}: ReviewAuthorLinkProps) {
  const { t } = useTranslation();
  const isExternal = isExternalReviewSource(source);
  const name = anonymous
    ? t("userReviews.anonymousUser")
    : isExternal
      ? `${t("userReviews.externalUser")} ${source}`
      : displayName?.trim() || t("userReviews.unknownUser");

  const canLink = canLinkToUserProfile({ anonymous, source, reviewerId });
  const initial = name.charAt(0).toUpperCase() || "?";
  const avatarUrl =
    !anonymous && !isExternal ? resolveProfileImageUrl(profileImage) : null;

  const avatar = (
    <div
      className={
        avatarClassName ||
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-foreground"
      }
      aria-hidden
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : anonymous || isExternal ? (
        "👤"
      ) : (
        initial
      )}
    </div>
  );

  if (!canLink || !reviewerId) {
    return (
      <div className={className || "flex items-center gap-3"}>
        {avatar}
        <span className="text-sm font-semibold text-foreground">{name}</span>
      </div>
    );
  }

  return (
    <Link
      to={`/users/${reviewerId}`}
      className={className || "flex items-center gap-3 hover:opacity-90"}
    >
      {avatar}
      <span className="text-sm font-semibold text-primary">{name}</span>
    </Link>
  );
}
