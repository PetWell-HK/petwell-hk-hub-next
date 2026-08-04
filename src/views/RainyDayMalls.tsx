"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MapPin,
  Train,
  Car,
  ChevronDown,
  ChevronUp,
  Utensils,
  Search,
  ExternalLink,
  Clock,
  Zap,
  ArrowUp,
  Info,
  Sparkles,
} from "lucide-react";
import {
  petFriendlyMalls,
  POLICY_LABELS,
  REGION_LABELS,
  type MallPolicy,
  type MallRegion,
} from "@/data/petFriendlyMalls";
import { mallParkingDetails } from "@/data/mallParkingDetails";
import { mallParkingDetailsZh } from "@/data/mallParkingDetailsZh";
import {
  mallParkingTips,
  getMallParkWise,
} from "@/data/mallOverlays";
import NearbyRestaurants from "@/components/NearbyRestaurants";
import { mallDiningOverrides } from "@/data/mallDiningOverrides";


import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "react-i18next";
import BlogAdSense from "@/components/BlogAdSense";
import { localizeOpeningHoursText } from "@/utils/availableHours";

const POLICY_META: Record<
  MallPolicy,
  { emoji: string; pill: string; dot: string }
> = {
  "leash-ok": {
    emoji: "🐾",
    pill: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  designated: {
    emoji: "📍",
    pill: "bg-amber-100 text-amber-900 border-amber-200",
    dot: "bg-amber-500",
  },
  carrier: {
    emoji: "🛒",
    pill: "bg-orange-100 text-orange-900 border-orange-200",
    dot: "bg-orange-500",
  },
};

const REGION_TABS: Array<{ key: "all" | MallRegion; label: string }> = [
  { key: "all", label: "全部" },
  { key: "hk-island", label: "港島" },
  { key: "kowloon", label: "九龍" },
  { key: "new-territories", label: "新界" },
];

import rainyDayHeroAsset from "@/assets/blog-rainy-day-pets.jpg.asset.json";
const HERO_BG = rainyDayHeroAsset.url;

const RainyDayMalls = () => {
  useSEO({
    title: "2025–2026 香港寵物友善商場完全指南 | 44間商場寵物政策、停車及設施",
    description:
      "全港44間寵物友善商場最新資訊，包括寵物政策、停車場、附近車位及設施。按地區、政策篩選，一鍵搵到最啱你同毛孩嘅商場。",
    keywords:
      "寵物友善商場,香港商場寵物,雨天好去處,寵物商場停車場,可帶狗商場,The Southside,Stanley Plaza,K11 Musea,Airside",
    canonicalUrl:
      "https://petwellhk.com/rainy-day-pet-friendly-indoor-hong-kong",
    ogImage: HERO_BG,
  });

  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.toLowerCase().startsWith("en");
  const parkingSource = isEn ? mallParkingDetails : mallParkingDetailsZh;

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<"all" | MallRegion>("all");
  const [policies, setPolicies] = useState<Set<MallPolicy>>(new Set());
  const [carParkOnly, setCarParkOnly] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, "policy" | "parking" | "dining" | "food" | null>>({});
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const togglePolicy = (p: MallPolicy) => {
    setPolicies((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const setSection = (id: string, key: "policy" | "parking" | "dining" | "food") => {
    setExpanded((prev) => ({ ...prev, [id]: prev[id] === key ? null : key }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return petFriendlyMalls.filter((m) => {
      if (region !== "all" && m.region !== region) return false;
      if (policies.size > 0 && !policies.has(m.policy)) return false;
      if (carParkOnly && !m.hasOwnCarPark) return false;
      if (q) {
        const hay = `${m.name} ${m.chineseName} ${m.area} ${m.mtr}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, region, policies, carParkOnly]);

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAFAF8" }}>
      <Header />

      <main className="flex-1">
        {/* HEADER (editorial style) */}
        <section className="w-full border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4 pt-8 pb-6 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 max-w-4xl">
            <h1 className="text-[26px] leading-[1.25] sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4 break-words">
              🐾 香港寵物友善商場指南 2025–2026
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-5 sm:mb-6 leading-relaxed">
              全港44間商場・寵物政策・停車資訊・附近車位一次睇晒。
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B35]" />
                PetWell HK 編輯部
              </span>
              <span className="hidden sm:inline text-gray-300">·</span>
              <span>2026年6月18日 最新更新</span>
            </div>
          </div>
        </section>

        <BlogAdSense placement="top" />

        {/* STICKY FILTER BAR */}
        <div
          id="malls"
          className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md shadow-sm"
        >
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜尋商場名稱、地區、MTR..."
                  className="pl-9 h-10 rounded-full bg-white"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
                {REGION_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setRegion(t.key)}
                    className={`px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition ${
                      region === t.key
                        ? "bg-[#FF6B35] text-white shadow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(POLICY_LABELS) as MallPolicy[]).map((p) => {
                const active = policies.has(p);
                const meta = POLICY_META[p];
                return (
                  <button
                    key={p}
                    onClick={() => togglePolicy(p)}
                    className={`px-3 h-8 rounded-full text-xs font-medium border transition ${
                      active
                        ? `${meta.pill} ring-2 ring-offset-1 ring-[#FF6B35]/50`
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {meta.emoji} {POLICY_LABELS[p]}
                  </button>
                );
              })}
              <button
                onClick={() => setCarParkOnly((v) => !v)}
                className={`px-3 h-8 rounded-full text-xs font-medium border transition inline-flex items-center gap-1 ${
                  carParkOnly
                    ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                有停車場
              </button>
              <div className="ml-auto text-xs text-muted-foreground">
                顯示 <strong className="text-[#FF6B35]">{filtered.length}</strong> /{" "}
                {petFriendlyMalls.length} 間商場
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <section className="container mx-auto px-4 py-10">
          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              冇符合條件嘅商場，試下調整篩選條件 🐾
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filtered.map((m) => {
                const meta = POLICY_META[m.policy];
                const pk = parkingSource[m.name] ?? mallParkingDetails[m.name];
                const tip = mallParkingTips[m.name];
                const sec = expanded[m.id] ?? null;
                const gmapsUrl = m.googleMapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  m.name
                )}`;
                return (
                  <Card
                    key={m.id}
                    className="overflow-hidden rounded-xl border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col bg-white"
                  >
                    {/* Header badges */}
                    <div className="relative px-5 pt-5 pb-2 flex items-center justify-between gap-2">
                      <Badge className="bg-gray-100 text-gray-800 border-none rounded-full">
                        {REGION_LABELS[m.region]}
                      </Badge>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${meta.pill}`}
                      >
                        {meta.emoji} {POLICY_LABELS[m.policy]}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold leading-tight">
                        {m.name}
                      </h3>
                      {m.chineseName !== "—" && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {m.chineseName}
                        </p>
                      )}

                      <div className="mt-3 space-y-1.5 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <Train className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                          <span>
                            {m.area} · {m.mtr}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                          <span className="line-clamp-1">{m.address}</span>
                        </div>
                        {(() => {
                          const hoursText = !isEn
                            ? pk?.openingHours && pk.openingHours !== "未確認"
                              ? pk.openingHours
                              : localizeOpeningHoursText(m.openingHours, "zh") ||
                                "請參考官網"
                            : m.openingHours ||
                              (pk?.openingHours &&
                              pk.openingHours !== "unverified"
                                ? pk.openingHours
                                : null);
                          if (!hoursText) return null;
                          return (
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                              <span className="line-clamp-1">{hoursText}</span>
                            </div>
                          );
                        })()}
                      </div>

                      {m.amenities && m.amenities !== "—" && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.amenities
                            .split(/[、,]/)
                            .map((a) => a.trim())
                            .filter(Boolean)
                            .slice(0, 4)
                            .map((a, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                              >
                                {a}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Expandable sections */}
                      <div className="mt-4 space-y-2">
                        <ExpandRow
                          label="🐾 寵物政策詳情"
                          open={sec === "policy"}
                          onClick={() => setSection(m.id, "policy")}
                        >
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {m.policyDetails}
                          </p>
                        </ExpandRow>

                        <ExpandRow
                          label="🚗 停車資訊"
                          open={sec === "parking"}
                          onClick={() => setSection(m.id, "parking")}
                        >
                          <div className="space-y-3">
                            {pk?.parking && (
                              <div className="p-3 rounded-lg border bg-gray-50">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1">
                                  <Car className="w-3.5 h-3.5" />
                                  {t("malls.mallParking")}
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {pk.parking}
                                </p>
                                {/EV|charg|充電/i.test(pk.parking) && (
                                  <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-none gap-1">
                                    <Zap className="w-3 h-3" />
                                    {t("malls.evCharging")}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {pk?.nearbyCarParks && pk.nearbyCarParks.length > 0 && (
                              <div>
                                <div className="text-xs font-semibold text-gray-800 mb-2">
                                  {t("malls.nearbyParking")}
                                </div>
                                <div className="space-y-2">
                                  {pk.nearbyCarParks.slice(0, 3).map((c, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start justify-between gap-3 p-2.5 rounded-lg border bg-white text-xs"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-800 truncate">
                                          {c.name}
                                        </div>
                                        <div className="mt-0.5 text-gray-500 truncate">
                                          {c.address}
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-right space-y-0.5">
                                        <div className="text-gray-700">{c.distance || "—"}</div>
                                        <div className="text-gray-500">
                                          {t("malls.heightLimit")}: {c.height || "—"}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {tip && (
                              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex gap-2">
                                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-900 leading-relaxed">
                                  💡 {tip}
                                </p>
                              </div>
                            )}

                            {(() => {
                              const pw = getMallParkWise(m.name);
                              return (
                                <div className="space-y-2">
                                  <a
                                    href={pw.region}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm shadow-sm transition"
                                  >
                                    🅿️ 查看附近實時車位 → Park Wise 泊得好
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                  {pw.chips.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {pw.chips.slice(0, 3).map((c) => (
                                        <a
                                          key={c.url}
                                          href={c.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 text-xs font-medium transition"
                                        >
                                          {c.name} · {c.distance}
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-[11px] text-gray-500 pt-0.5">
                                    以上車位資料由 Park Wise 泊得好 提供，實時更新
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        </ExpandRow>

                        {mallDiningOverrides[m.id] && (
                          <ExpandRow
                            label="🍴 商場內餐廳"
                            open={sec === "dining"}
                            onClick={() => setSection(m.id, "dining")}
                          >
                            <div className="space-y-3">
                              <div className="space-y-2.5">
                                {mallDiningOverrides[m.id].map((r, i) => (
                                  <a
                                    key={i}
                                    href={r.link || m.diningWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                      <div className="flex">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                                          {r.image ? (
                                            <img
                                              src={r.image}
                                              alt={r.name}
                                              className="w-full h-full object-cover"
                                              loading="lazy"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#FFF4E6] to-[#FFE4CC] flex items-center justify-center">
                                              <Utensils className="w-7 h-7 text-[#FF6B35]" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1">
                                            {r.name}
                                          </h4>
                                          {r.floor && (
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                              📍 {r.floor}
                                            </p>
                                          )}
                                          {r.hours && (
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                              🕒 {r.hours}
                                            </p>
                                          )}
                                          <span className="text-[11px] text-[#FF6B35] mt-1 inline-flex items-center gap-1">
                                            查看詳情 <ExternalLink className="w-3 h-3" />
                                          </span>
                                        </div>
                                      </div>
                                    </Card>
                                  </a>
                                ))}
                              </div>
                              <p className="text-[11px] text-gray-500">
                                ⚠️ 根據法例，寵物不可進入食肆及超市範圍。
                              </p>
                              {m.diningWebsite && (
                                <a
                                  href={m.diningWebsite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <Button
                                    size="sm"
                                    className="w-full gap-1.5 rounded-xl bg-[#FF6B35] hover:bg-[#e85a26] text-white"
                                  >
                                    <Utensils className="w-3.5 h-3.5" />
                                    查看商場官方餐廳列表
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </ExpandRow>
                        )}


                        <ExpandRow
                          label="🍽️ 附近寵物友善餐廳"
                          open={sec === "food"}
                          onClick={() => setSection(m.id, "food")}
                        >
                          {sec === "food" && (
                            <NearbyRestaurants eventLat={m.lat} eventLon={m.lon} />
                          )}
                        </ExpandRow>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        {m.website && (
                          <a
                            href={m.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[120px]"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-1 rounded-full"
                            >
                              官方網站
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                        {pk?.parkingWebsite && (
                          <a
                            href={pk.parkingWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[120px]"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-1 rounded-full"
                            >
                              <Car className="w-3.5 h-3.5" />
                              泊車官網
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[120px]"
                        >
                          <Button
                            size="sm"
                            className="w-full gap-1 rounded-full bg-[#FF6B35] hover:bg-[#e85a26]"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Google Maps
                          </Button>
                        </a>
                      </div>

                      <div className="mt-3 text-center">
                        <a
                          href="https://wa.me/85255954078"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-[#FF6B35] transition"
                        >
                          發現資料有誤？WhatsApp 我們
                        </a>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <div className="container mx-auto px-4 max-w-4xl pb-10">
          <BlogAdSense placement="bottom" />
        </div>
      </main>


      {/* Back to top */}
      {showBackTop && (
        <button
          onClick={scrollTop}
          aria-label="返回頂部"
          className="fixed bottom-4 left-4 z-40 w-10 h-10 rounded-full bg-[#FF6B35] text-white shadow-lg hover:bg-[#e85a26] flex items-center justify-center transition"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <Footer />
    </div>
  );
};

const ExpandRow = ({
  label,
  open,
  onClick,
  children,
}: {
  label: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Collapsible open={open}>
    <CollapsibleTrigger asChild>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-800 transition"
      >
        <span>{label}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
    </CollapsibleTrigger>
    <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
      <div className="px-3 pt-3 pb-1">{children}</div>
    </CollapsibleContent>
  </Collapsible>
);

export default RainyDayMalls;
