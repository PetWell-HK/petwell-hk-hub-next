import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import AuthRequiredDialog from "@/components/AuthRequiredDialog";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  currentLowest: number;
  className?: string;
  variant?: "icon" | "labeled";
  size?: "sm" | "md";
}

const WishlistHeartButton = ({
  productId,
  currentLowest,
  className,
  variant = "icon",
  size = "md",
}: Props) => {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggle } = useWishlist();
  const [authOpen, setAuthOpen] = useState(false);

  const saved = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    const added = toggle(productId, currentLowest);
    if (added) {
      toast.success("已加入追蹤清單 ✓", { duration: 3000 });
    } else {
      toast("已從追蹤清單移除", { duration: 3000 });
    }
  };

  const dim = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  if (variant === "labeled") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          aria-label="加入追蹤清單"
          aria-pressed={saved}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-md border h-10 px-3 text-sm font-medium transition-colors",
            saved
              ? "bg-primary/10 border-primary text-primary"
              : "bg-background hover:bg-muted border-input",
            className,
          )}
        >
          <Heart className={cn(dim, saved && "fill-primary")} />
          <span>{saved ? "已追蹤" : "加入追蹤清單"}</span>
        </button>
        <AuthRequiredDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? "從追蹤清單移除" : "加入追蹤清單"}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white border border-border shadow-sm transition-colors",
          size === "sm" ? "w-8 h-8" : "w-9 h-9",
          className,
        )}
      >
        <Heart
          className={cn(
            dim,
            saved ? "fill-primary text-primary" : "text-muted-foreground",
          )}
        />
      </button>
      <AuthRequiredDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default WishlistHeartButton;
