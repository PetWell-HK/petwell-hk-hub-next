import { cn } from "@/lib/utils";

export type NutritionTier = "a-plus" | "a" | "b" | "c" | "d";

export interface TierStyle {
  label: string;
  verdict: string;
  tone: NutritionTier;
  ring: string;
  chip: string;
  stripe: string;
  glow: string;
}

export function tierOf(score: number): TierStyle {
  if (score >= 90) {
    return {
      label: "A+",
      verdict: "極佳",
      tone: "a-plus",
      ring: "stroke-emerald-600",
      chip: "nutrition-chip nutrition-chip--excellent",
      stripe: "bg-emerald-500",
      glow: "shadow-[0_0_0_1px_rgba(5,150,105,0.15),0_8px_24px_-8px_rgba(5,150,105,0.35)]",
    };
  }
  if (score >= 80) {
    return {
      label: "A",
      verdict: "優秀",
      tone: "a",
      ring: "stroke-emerald-600",
      chip: "nutrition-chip nutrition-chip--excellent",
      stripe: "bg-emerald-500",
      glow: "shadow-[0_0_0_1px_rgba(5,150,105,0.12),0_8px_24px_-8px_rgba(5,150,105,0.28)]",
    };
  }
  if (score >= 70) {
    return {
      label: "B",
      verdict: "合格",
      tone: "b",
      ring: "stroke-amber-500",
      chip: "nutrition-chip nutrition-chip--good",
      stripe: "bg-amber-500",
      glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.15),0_8px_24px_-8px_rgba(245,158,11,0.28)]",
    };
  }
  if (score >= 60) {
    return {
      label: "C",
      verdict: "尚可",
      tone: "c",
      ring: "stroke-orange-500",
      chip: "nutrition-chip nutrition-chip--fair",
      stripe: "bg-orange-500",
      glow: "shadow-[0_0_0_1px_rgba(249,115,22,0.15),0_8px_24px_-8px_rgba(249,115,22,0.25)]",
    };
  }
  return {
    label: "D",
    verdict: "不建議",
    tone: "d",
    ring: "stroke-red-500",
    chip: "nutrition-chip nutrition-chip--poor",
    stripe: "bg-red-500",
    glow: "shadow-[0_0_0_1px_rgba(239,68,68,0.15),0_8px_24px_-8px_rgba(239,68,68,0.25)]",
  };
}

export function tierOfDetail(score: number): TierStyle & { verdict: string } {
  const base = tierOf(score);
  if (score >= 90) return { ...base, verdict: "非常推介" };
  if (score >= 80) return { ...base, verdict: "值得考慮" };
  if (score >= 70) return { ...base, verdict: "合格水平" };
  if (score >= 60) return { ...base, verdict: "有保留" };
  return { ...base, verdict: "建議避開" };
}

export function ratingToScore(rating: number): number {
  return Math.round(Math.max(0, Math.min(5, rating)) * 20);
}

export function gradeOf(score: number): string {
  return tierOf(score).label;
}

interface ScoreRingProps {
  score: number;
  size?: number;
  className?: string;
  showNumeric?: boolean;
  animate?: boolean;
}

export function NutritionScoreRing({
  score,
  size = 56,
  className,
  showNumeric = true,
  animate = false,
}: ScoreRingProps) {
  const t = tierOf(score);
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div
      className={cn("nutrition-score-ring relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={3.5} className="stroke-[hsl(var(--nutrition-line))] fill-none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("fill-none", t.ring, animate && "nutrition-score-ring__arc")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <div className="nutrition-display text-lg font-semibold">{t.label}</div>
        {showNumeric ? (
          <div className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">{score}</div>
        ) : null}
      </div>
    </div>
  );
}

export function NutritionGradeBadge({ score, className }: { score: number; className?: string }) {
  const t = tierOf(score);
  return (
    <span className={cn(t.chip, className)}>
      {t.verdict}
    </span>
  );
}
