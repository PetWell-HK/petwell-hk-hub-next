import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, MessageSquareText, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useMyAccountProfile } from "@/hooks/useMyAccountProfile";
import { getAccountDisplayName } from "@/services/accountApi";
import { resolveProfileImageUrl } from "@/utils/reviewDisplay";
import { cn } from "@/lib/utils";

interface UserAccountMenuProps {
  variant: "desktop" | "mobile";
  onLogout: () => void;
  onNavigate?: () => void;
}

function useAccountIdentity() {
  const { userInfo } = useAuth();
  const { data: profile } = useMyAccountProfile();
  const displayName =
    getAccountDisplayName(profile, userInfo?.username) || userInfo?.email || "";
  const email = profile?.email || userInfo?.rawEmail || userInfo?.email || "";
  const avatarUrl = resolveProfileImageUrl(profile?.profileImage);
  const initials = (displayName || email || "?").charAt(0).toUpperCase();

  return { displayName, email, avatarUrl, initials };
}

const UserAccountMenu = ({ variant, onLogout, onNavigate }: UserAccountMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { displayName, email, avatarUrl, initials } = useAccountIdentity();

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  if (variant === "desktop") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            aria-label={t("accountProfile.title")}
          >
            <Avatar className="h-9 w-9 border border-border">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                {email ? (
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                ) : null}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => go("/account")} className="gap-2">
            <UserRound className="h-4 w-4" />
            {t("accountProfile.title")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => go("/account/reviews")} className="gap-2">
            <MessageSquareText className="h-4 w-4" />
            {t("userReviews.myReviews")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-border">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
          {email ? (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-col">
        <Link
          to="/account"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-1 py-2 text-sm font-medium text-foreground hover:text-primary",
          )}
        >
          <UserRound className="h-4 w-4" />
          {t("accountProfile.title")}
        </Link>
        <Link
          to="/account/reviews"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-1 py-2 text-sm font-medium text-foreground hover:text-primary"
        >
          <MessageSquareText className="h-4 w-4" />
          {t("userReviews.myReviews")}
        </Link>
        <button
          type="button"
          onClick={() => {
            onLogout();
            onNavigate?.();
          }}
          className="flex items-center gap-2 rounded-md px-1 py-2 text-left text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
};

export default UserAccountMenu;
