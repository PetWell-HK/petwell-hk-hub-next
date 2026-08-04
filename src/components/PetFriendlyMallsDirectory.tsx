import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MapPin,
  Train,
  PawPrint,
  Car,
  ChevronDown,
  Utensils,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  petFriendlyMalls,
  POLICY_LABELS,
  REGION_LABELS,
  type MallPolicy,
  type MallRegion,
} from "@/data/petFriendlyMalls";
import NearbyRestaurants from "@/components/NearbyRestaurants";
import { mallParkingDetails } from "@/data/mallParkingDetails";

const POLICY_BADGE_COLORS: Record<MallPolicy, string> = {
  "leash-ok": "bg-green-100 text-green-800 border-green-200",
  "designated": "bg-orange-100 text-orange-800 border-orange-200",
  "carrier": "bg-blue-100 text-blue-800 border-blue-200",
};

const PetFriendlyMallsDirectory = () => {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<"all" | MallRegion>("all");
  const [policy, setPolicy] = useState<"all" | MallPolicy>("all");
  const [carParkOnly, setCarParkOnly] = useState(false);
  const [openMallId, setOpenMallId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return petFriendlyMalls.filter((m) => {
      if (region !== "all" && m.region !== region) return false;
      if (policy !== "all" && m.policy !== policy) return false;
      if (carParkOnly && !m.hasOwnCarPark) return false;
      if (q) {
        const hay = `${m.name} ${m.chineseName} ${m.area} ${m.mtr}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, region, policy, carParkOnly]);

  const counts = useMemo(() => {
    return {
      total: petFriendlyMalls.length,
      leashOk: petFriendlyMalls.filter((m) => m.policy === "leash-ok").length,
      designated: petFriendlyMalls.filter((m) => m.policy === "designated").length,
      carrier: petFriendlyMalls.filter((m) => m.policy === "carrier").length,
    };
  }, []);

  return (
    <div className="my-8 not-prose">
      {/* Stats banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{counts.total}</div>
          <div className="text-xs text-muted-foreground mt-1">總商場數</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{counts.leashOk}</div>
          <div className="text-xs text-muted-foreground mt-1">可繫繩自由行</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-700">{counts.designated}</div>
          <div className="text-xs text-muted-foreground mt-1">指定區域繫繩</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{counts.carrier}</div>
          <div className="text-xs text-muted-foreground mt-1">須入袋／推車</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜尋商場名稱 / 中文 / 地區 / MTR…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={region} onValueChange={(v) => setRegion(v as typeof region)}>
            <SelectTrigger>
              <SelectValue placeholder="所有地區" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有地區</SelectItem>
              {(Object.keys(REGION_LABELS) as MallRegion[]).map((r) => (
                <SelectItem key={r} value={r}>{REGION_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={policy} onValueChange={(v) => setPolicy(v as typeof policy)}>
            <SelectTrigger>
              <SelectValue placeholder="所有寵物政策" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有寵物政策</SelectItem>
              {(Object.keys(POLICY_LABELS) as MallPolicy[]).map((p) => (
                <SelectItem key={p} value={p}>{POLICY_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={carParkOnly ? "default" : "outline"}
            onClick={() => setCarParkOnly((v) => !v)}
            className="gap-2"
          >
            <Car className="w-4 h-4" />
            只睇有停車場
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          顯示 <strong>{filtered.length}</strong> 間商場（共 {counts.total} 間）
        </div>
      </Card>

      {/* Mall cards */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          冇符合條件嘅商場，試下調整篩選條件 🐾
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const isOpen = openMallId === m.id;
            return (
              <Card key={m.id} className="overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">
                        {m.name}
                        {m.chineseName !== "—" && (
                          <span className="text-base font-normal text-muted-foreground ml-2">
                            {m.chineseName}
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {REGION_LABELS[m.region]}・{m.area}
                        </span>
                        <span className="flex items-center gap-1">
                          <Train className="w-3.5 h-3.5" />
                          {m.mtr}
                        </span>
                        {m.hasOwnCarPark && (
                          <span className="flex items-center gap-1 text-green-700">
                            <Car className="w-3.5 h-3.5" />
                            有停車場
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={`${POLICY_BADGE_COLORS[m.policy]} gap-1 whitespace-nowrap`}>
                      <PawPrint className="w-3 h-3" />
                      {POLICY_LABELS[m.policy]}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                    {m.policyDetails}
                  </p>

                  {m.amenities !== "—" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong className="text-foreground/70">設施：</strong>{m.amenities}
                    </p>
                  )}

                  {(() => {
                    const pk = mallParkingDetails[m.name];
                    if (!pk && !m.parkingWebsite) return null;
                    const hasInfo = pk && (pk.parking || pk.nearbyCarParks.length > 0);
                    if (!hasInfo && !m.parkingWebsite) return null;
                    return (
                      <div className="mt-3 p-3 rounded-md bg-muted/40 border border-border/60">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 mb-1.5">
                          <Car className="w-3.5 h-3.5" />
                          泊車資訊
                        </div>
                        {pk?.parking && (
                          <p className="text-xs text-foreground/75 leading-relaxed">{pk.parking}</p>
                        )}
                        {pk && pk.nearbyCarParks.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs font-medium text-foreground/70">附近停車場：</div>
                            <ul className="text-xs text-foreground/70 space-y-0.5 pl-1">
                              {pk.nearbyCarParks.map((c, i) => (
                                <li key={i} className="flex flex-wrap gap-x-2">
                                  <span className="font-medium">{c.name}</span>
                                  {c.distance && <span className="text-muted-foreground">・{c.distance}</span>}
                                  {c.height && <span className="text-muted-foreground">・限高 {c.height}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {m.parkingWebsite && (
                          <div className="mt-2">
                            <a href={m.parkingWebsite} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                                🅿️ 官方停車場資訊
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {m.diningWebsite && (
                    <div className="mt-3">
                      <a href={m.diningWebsite} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Utensils className="w-3.5 h-3.5" />
                          商場內餐廳
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Collapsible
                      open={isOpen}
                      onOpenChange={(o) => setOpenMallId(o ? m.id : null)}
                      className="flex-1 min-w-[200px]"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant={isOpen ? "default" : "outline"}
                          size="sm"
                          className="w-full sm:w-auto gap-2"
                        >
                          <Utensils className="w-4 h-4" />
                          {isOpen ? "收起附近餐廳" : "查看附近寵物友善餐廳"}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>

                    {m.website && (
                      <a href={m.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="gap-1">
                          官方網站
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="gap-1">
                        Google Maps
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>

                  <Collapsible open={isOpen}>
                    <CollapsibleContent>
                      <div className="mt-4 -mx-1">
                        {/* NearbyRestaurants only mounts when expanded → lazy fetch */}
                        {isOpen && (
                          <NearbyRestaurants eventLat={m.lat} eventLon={m.lon} />
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PetFriendlyMallsDirectory;
