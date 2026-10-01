import { describe, expect, it } from "vitest";
import {
  FESTIVAL_ITEMS,
  formatHkd,
  percentOff,
  quoteFestivalItems,
  quoteSavings,
  standalonePrice,
} from "./midAutumnFestivalPricing";

describe("standalonePrice", () => {
  it("uses last-3-day specials for mooncake and scarf", () => {
    expect(standalonePrice("mooncake")).toBe(480);
    expect(standalonePrice("scarf")).toBe(180);
  });

  it("uses early-bird for photography", () => {
    expect(standalonePrice("familyPhoto")).toBe(150);
  });
});

describe("quoteFestivalItems", () => {
  it("returns zero for an empty selection", () => {
    const quote = quoteFestivalItems([]);
    expect(quote.total).toBe(0);
    expect(quote.lines).toEqual([]);
  });

  it("prices a single mooncake at the special", () => {
    const quote = quoteFestivalItems(["mooncake"]);
    expect(quote.total).toBe(480);
    expect(quote.originalTotal).toBe(688);
  });

  it("prices scarf at the special", () => {
    expect(quoteFestivalItems(["scarf"]).total).toBe(180);
  });

  it("adds mooncake and scarf at list prices with no bundle", () => {
    const quote = quoteFestivalItems(["mooncake", "scarf"]);
    expect(quote.total).toBe(660);
    expect(quote.lines.every((line) => line.kind !== "bundle")).toBe(true);
  });

  it("reports savings against regular prices", () => {
    const quote = quoteFestivalItems(["mooncake", "scarf"]);
    expect(quoteSavings(quote)).toBe(316);
  });

  it("sums all selected items without a package price", () => {
    const quote = quoteFestivalItems(["mooncake", "scarf", "familyPhoto"]);
    expect(quote.total).toBe(480 + 180 + 150);
    expect(quote.originalTotal).toBe(688 + 288 + 200);
    expect(quote.lines.some((line) => line.kind === "bundle")).toBe(false);
  });

  it("applies a percent discount code after item prices", () => {
    const quote = quoteFestivalItems(["mooncake", "scarf"], {
      code: "PETWELL10",
      kind: "percent",
      value: 10,
      label: "九折",
    });
    expect(quote.subtotal).toBe(660);
    expect(quote.discountAmount).toBe(66);
    expect(quote.total).toBe(594);
  });

  it("caps a fixed discount at the subtotal", () => {
    const quote = quoteFestivalItems(["familyPhoto"], {
      code: "BIG",
      kind: "fixed",
      value: 500,
      label: "滿減",
    });
    expect(quote.total).toBe(0);
    expect(quote.discountAmount).toBe(150);
  });
});

describe("formatHkd", () => {
  it("formats with a dollar sign", () => {
    expect(formatHkd(1100)).toBe("$1,100");
    expect(formatHkd(FESTIVAL_ITEMS.mooncake.earlyBirdPrice)).toBe("$480");
  });

  it("formats negative amounts with a minus sign", () => {
    expect(formatHkd(-216)).toBe("−$216");
  });
});

describe("percentOff", () => {
  it("rounds the mooncake special to 30 percent off", () => {
    expect(percentOff(688, 480)).toBe(30);
  });

  it("rounds scarf special to 38 percent off", () => {
    expect(percentOff(288, 180)).toBe(38);
  });

  it("returns zero when there is no discount", () => {
    expect(percentOff(288, 288)).toBe(0);
  });
});
