import { describe, expect, it } from "vitest";
import {
  FESTIVAL_ITEM_IDS,
  FESTIVAL_ITEMS,
  allInOffer,
  formatHkd,
  percentOff,
  quoteFestivalItems,
  quoteSavings,
  standalonePrice,
} from "./midAutumnFestivalPricing";

describe("standalonePrice", () => {
  it("uses early-bird for mooncake only among workshops", () => {
    expect(standalonePrice("mooncake")).toBe(638);
    expect(standalonePrice("scarf")).toBe(288);
    expect(standalonePrice("magnet")).toBe(288);
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

  it("prices a single mooncake at early-bird", () => {
    const quote = quoteFestivalItems(["mooncake"]);
    expect(quote.total).toBe(638);
    expect(quote.originalTotal).toBe(688);
  });

  it("keeps scarf at regular price when bought alone", () => {
    expect(quoteFestivalItems(["scarf"]).total).toBe(288);
  });

  it("applies the mooncake + scarf bundle when cheaper than singles", () => {
    const quote = quoteFestivalItems(["mooncake", "scarf"]);
    expect(quote.total).toBe(888);
    expect(quote.lines.some((line) => line.kind === "bundle" && line.bundleId === "mooncake-scarf")).toBe(
      true,
    );
  });

  it("reports savings against regular prices", () => {
    const quote = quoteFestivalItems(["mooncake", "scarf"]);
    expect(quoteSavings(quote)).toBe(88);
  });

  it("applies All-in when every item is selected", () => {
    const quote = quoteFestivalItems([
      "mooncake",
      "scarf",
      "magnet",
      "familyPhoto",
    ]);
    expect(quote.total).toBe(1100);
    expect(quote.originalTotal).toBe(1464);
    expect(quote.lines.some((line) => line.kind === "bundle" && line.bundleId === "all-in")).toBe(true);
  });

  it("picks scarf + magnet bundle over two regular scarves", () => {
    expect(quoteFestivalItems(["scarf", "magnet"]).total).toBe(528);
  });

  it("applies a percent discount code after bundles", () => {
    const quote = quoteFestivalItems(["mooncake", "scarf"], {
      code: "PETWELL10",
      kind: "percent",
      value: 10,
      label: "九折",
    });
    expect(quote.subtotal).toBe(888);
    expect(quote.discountAmount).toBe(89);
    expect(quote.total).toBe(799);
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
    expect(formatHkd(FESTIVAL_ITEMS.mooncake.earlyBirdPrice)).toBe("$638");
  });

  it("formats negative amounts with a minus sign", () => {
    expect(formatHkd(-216)).toBe("−$216");
  });
});

describe("allInOffer", () => {
  it("prices the empty cart as a $1,100 upgrade for four items", () => {
    const offer = allInOffer([]);
    expect(offer.allInPrice).toBe(1100);
    expect(offer.remainingCount).toBe(4);
    expect(offer.extraToUpgrade).toBe(1100);
    expect(offer.applied).toBe(false);
  });

  it("shows mooncake + scarf as $212 more to unlock All-in", () => {
    const offer = allInOffer(["mooncake", "scarf"]);
    expect(offer.currentTotal).toBe(888);
    expect(offer.remainingCount).toBe(2);
    expect(offer.extraToUpgrade).toBe(212);
  });

  it("makes adding the family photo cheaper once three workshops are selected", () => {
    const offer = allInOffer(["mooncake", "scarf", "magnet"]);
    expect(offer.currentTotal).toBe(1166);
    expect(offer.extraToUpgrade).toBeLessThan(0);
    expect(offer.remainingCount).toBe(1);
  });

  it("marks All-in as applied when every item is selected", () => {
    expect(allInOffer([...FESTIVAL_ITEM_IDS]).applied).toBe(true);
    expect(allInOffer([...FESTIVAL_ITEM_IDS]).extraToUpgrade).toBe(0);
  });
});

describe("percentOff", () => {
  it("rounds All-in to 25 percent off", () => {
    expect(percentOff(1464, 1100)).toBe(25);
  });

  it("rounds the mooncake scarf bundle to 9 percent off", () => {
    expect(percentOff(976, 888)).toBe(9);
  });

  it("returns zero when there is no discount", () => {
    expect(percentOff(288, 288)).toBe(0);
  });
});
