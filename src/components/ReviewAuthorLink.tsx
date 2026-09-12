import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { canLinkToUserProfile } from "@/services/userReviewApi";
import {
  ANON_AVATAR_TONE,
  isExternalReviewSource,
  resolveProfileImageUrl,
  reviewAuthorInitials,
  reviewAvatarTone,
} from "@/utils/reviewDisplay";
import { cn } from "@/lib/utils";

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
    : displayName?.trim() || t("userReviews.unknownUser");

  const canLink = canLinkToUserProfile({ anonymous, source, reviewerId });
  const initials = anonymous ? "?" : reviewAuthorInitials(name);
  const tone = anonymous ? ANON_AVATAR_TONE : reviewAvatarTone(name);
  const avatarUrl = !anonymous && !isExternal ? resolveProfileImageUrl(profileImage) : null;

  const avatar = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        avatarClassName || "h-9 w-9",
        initials.length > 1 ? "text-[11px] tracking-wide" : "text-sm",
      )}
      style={avatarUrl ? undefined : { background: tone.bg, color: tone.fg }}
      aria-hidden
    >
      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
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
    <AppLink
      href={`/users/${reviewerId}`}
      className={className || "flex items-center gap-3 hover:opacity-90"}
    >
      {avatar}
      <span className="text-sm font-semibold text-primary">{name}</span>
    </AppLink>
  );
}
