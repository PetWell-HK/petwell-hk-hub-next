"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BODY_LOOKS,
  bodyLookFromBcs,
  calculateMer,
  fromKg,
  gramsFromKcal,
  toKg,
  type BodyLook,
  type MerAgeGroup,
  type MerGoal,
  type WeightUnit,
} from "@/lib/dogMer";
import { Input } from "@/components/ui/input";

const AGE_KEYS: { key: MerAgeGroup; label: string }[] = [
  { key: "young_active", label: "活躍" },
  { key: "inactive_neutered", label: "普通" },
  { key: "senior", label: "高齡" },
];

const BODY_KEYS: { key: BodyLook; label: string }[] = [
  { key: "slim", label: "瘦" },
  { key: "fit", label: "剛好" },
  { key: "round", label: "圓" },
];

const GOAL_KEYS: { key: MerGoal; label: string }[] = [
  { key: "maintain", label: "維持" },
  { key: "lose", label: "減重" },
  { key: "gain", label: "增重" },
];

function formatKcal(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function Keypad({
  on,
  children,
  onClick,
  compact,
}: {
  on: boolean;
  children: ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md text-sm font-semibold tabular-nums ${
        compact ? "w-12 shrink-0" : "flex-1"
      } ${on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

export default function DogMerCalculator() {
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [weight, setWeight] = useState("8");
  const [bcs, setBcs] = useState(5);
  const [ageGroup, setAgeGroup] = useState<MerAgeGroup>("inactive_neutered");
  const [goal, setGoal] = useState<MerGoal>("maintain");
  const [kcalPer100g, setKcalPer100g] = useState("");
  const [meals, setMeals] = useState(2);

  const parsedWeight = Number(weight);
  const look = bodyLookFromBcs(bcs);
  const result = useMemo(
    () =>
      calculateMer({
        weight: parsedWeight,
        unit,
        bcs,
        ageGroup,
        goal,
      }),
    [parsedWeight, unit, bcs, ageGroup, goal],
  );

  const grams = result ? gramsFromKcal(result.merKcal, Number(kcalPer100g)) : null;
  const perMeal = grams && meals > 0 ? grams / meals : null;

  const switchUnit = (next: WeightUnit) => {
    if (next === unit) return;
    if (Number.isFinite(parsedWeight) && parsedWeight > 0) {
      setWeight(fromKg(toKg(parsedWeight, unit), next).toFixed(1));
    }
    setUnit(next);
  };

  const pickLook = (next: BodyLook) => {
    const preset = BODY_LOOKS[next];
    setBcs(preset.bcs);
    setGoal(preset.goal);
  };

  return (
    <section className="mb-10" aria-label="今日餵幾多">
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="bg-foreground px-5 py-6 text-background sm:px-6" aria-live="polite">
          <p className="text-xs tracking-[0.18em] text-background/60">今日餵幾多</p>
          {result ? (
            <>
              <p className="mt-2 text-right font-semibold tabular-nums leading-none">
                <span className="text-5xl sm:text-6xl">
                  {grams ? Math.round(grams) : formatKcal(result.merKcal)}
                </span>
                <span className="ml-1.5 text-lg text-background/55">{grams ? "g" : "kcal"}</span>
              </p>
              <p className="mt-3 text-right text-sm tabular-nums text-background/55">
                {grams ? `${formatKcal(result.merKcal)} kcal` : "填糧袋 kcal 就轉成克"}
                {perMeal ? `  ·  ${meals} 餐 × ${Math.round(perMeal)} g` : ""}
              </p>
            </>
          ) : (
            <p className="mt-4 text-right text-3xl tabular-nums text-background/40">—</p>
          )}
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <Row label="體重">
            <Input
              id="mer-weight"
              type="number"
              inputMode="decimal"
              min={0.5}
              max={unit === "kg" ? 120 : 265}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-10 flex-1 text-right text-base font-semibold tabular-nums"
            />
            {(["kg", "lb"] as const).map((next) => (
              <Keypad key={next} compact on={unit === next} onClick={() => switchUnit(next)}>
                {next}
              </Keypad>
            ))}
          </Row>

          <Row label="身形">
            {BODY_KEYS.map(({ key, label }) => (
              <Keypad key={key} on={look === key} onClick={() => pickLook(key)}>
                {label}
              </Keypad>
            ))}
          </Row>

          <Row label="活動">
            {AGE_KEYS.map(({ key, label }) => (
              <Keypad key={key} on={ageGroup === key} onClick={() => setAgeGroup(key)}>
                {label}
              </Keypad>
            ))}
          </Row>

          <Row label="目標">
            {GOAL_KEYS.map(({ key, label }) => (
              <Keypad key={key} on={goal === key} onClick={() => setGoal(key)}>
                {label}
              </Keypad>
            ))}
          </Row>

          <Row label="糧袋">
            <Input
              id="mer-kcal"
              type="number"
              inputMode="decimal"
              min={50}
              max={800}
              placeholder="kcal / 100g"
              value={kcalPer100g}
              onChange={(e) => setKcalPer100g(e.target.value)}
              className="h-10 flex-1 text-right text-base font-semibold tabular-nums"
            />
          </Row>

          <Row label="分餐">
            {[2, 3].map((count) => (
              <Keypad key={count} on={meals === count} onClick={() => setMeals(count)}>
                {count} 餐
              </Keypad>
            ))}
          </Row>
        </div>
      </div>
    </section>
  );
}
