import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatHkd } from "@/lib/midAutumnFestivalPricing";

type PromoCodePanelProps = {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  onClear?: () => void;
  applying?: boolean;
  appliedCode?: string | null;
  discountAmount?: number;
  message?: { tone: "ok" | "err"; text: string } | null;
  className?: string;
};

export function PromoCodePanel({
  value,
  onChange,
  onApply,
  onClear,
  applying = false,
  appliedCode,
  discountAmount = 0,
  message,
  className,
}: PromoCodePanelProps) {
  const applied = Boolean(appliedCode);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor="festival-promo-code" className="text-sm font-medium">
        優惠碼
        <span className="ml-1 font-normal text-muted-foreground">（選填）</span>
      </Label>

      {applied ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>
            已套用 {appliedCode}
            {discountAmount > 0 && (
              <span className="ml-2 tabular-nums text-primary">−{formatHkd(discountAmount)}</span>
            )}
          </p>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              清除
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            id="festival-promo-code"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onApply();
              }
            }}
            placeholder="輸入優惠碼"
            autoComplete="off"
            disabled={applying}
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={onApply}
            disabled={applying}
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "套用"}
          </Button>
        </div>
      )}

      {message && (
        <p
          className={cn(
            "text-sm",
            message.tone === "ok" ? "text-muted-foreground" : "text-destructive",
          )}
          role={message.tone === "err" ? "alert" : undefined}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
