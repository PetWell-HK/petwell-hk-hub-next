import { describe, expect, it } from "vitest";
import { discountFromLookup, workshopSlotsOverlap } from "../data/midAutumnFestival2026";
import { quoteFestivalItems } from "../lib/midAutumnFestivalPricing";

describe("workshopSlotsOverlap", () => {
  it("detects a mooncake session covering a scarf slot", () => {
    expect(
      workshopSlotsOverlap({
        mooncake: "mooncake|fri|16:00",
        scarf: "scarf|fri|16:30",
      }),
    ).toBe(true);
  });

  it("allows the same start on different days", () => {
    expect(
      workshopSlotsOverlap({
        mooncake: "mooncake|fri|16:00",
        scarf: "scarf|sat|16:00",
      }),
    ).toBe(false);
  });

  it("allows back-to-back sessions", () => {
    expect(
      workshopSlotsOverlap({
        scarf: "scarf|fri|16:00",
        magnet: "magnet|fri|16:30",
      }),
    ).toBe(false);
  });
});

describe("discountFromLookup", () => {
  it("maps a valid backend lookup to a percent discount", () => {
    expect(
      discountFromLookup({
        valid: true,
        code: "MISU",
        kind: "percent",
        value: 10,
        label: "推廣碼九折",
      }),
    ).toEqual({
      code: "MISU",
      kind: "percent",
      value: 10,
      label: "推廣碼九折",
    });
  });

  it("rejects invalid lookups", () => {
    expect(discountFromLookup({ valid: false })).toBeNull();
    expect(discountFromLookup(null)).toBeNull();
  });

  it("applies 10% after the workshop bundle price", () => {
    const discount = discountFromLookup({
      valid: true,
      code: "BOAT",
      kind: "percent",
      value: 10,
      label: "推廣碼九折",
    });
    const quote = quoteFestivalItems(["mooncake", "scarf"], discount);
    expect(quote.subtotal).toBe(888);
    expect(quote.discountAmount).toBe(89);
    expect(quote.total).toBe(799);
  });
});
