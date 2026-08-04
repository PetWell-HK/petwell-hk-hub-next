import { useMemo, useState } from "react";
import { Search, MapPin, UtensilsCrossed, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FEHD_RESTAURANTS } from "@/data/fehdRestaurants";

const REGIONS = ["全部地區", "港島區", "九龍區", "新界區", "其他"];
const PAGE_SIZE = 50;

interface FehdPetFriendlyDirectoryProps {
  defaultRegion?: string;
  defaultDistrict?: string;
}

export default function FehdPetFriendlyDirectory({
  defaultRegion = "全部地區",
  defaultDistrict,
}: FehdPetFriendlyDirectoryProps) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState(defaultRegion);
  const [district, setDistrict] = useState(
    defaultDistrict && REGIONS.includes(defaultRegion) ? defaultDistrict : "全部分區",
  );
  const [visible, setVisible] = useState(PAGE_SIZE);

  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    FEHD_RESTAURANTS.forEach((r) => {
      if (region === "全部地區" || r.region === region) {
        if (r.district && r.district !== "其他") set.add(r.district);
      }
    });
    return ["全部分區", ...Array.from(set).sort()];
  }, [region]);

  const filtered = useMemo(() => {
    return FEHD_RESTAURANTS.filter((r) => {
      if (region !== "全部地區" && r.region !== region) return false;
      if (district !== "全部分區") {
        const districtMatch =
          r.district === district ||
          r.district.includes(district) ||
          district.includes(r.district);
        if (!districtMatch) return false;
      }
      if (search) {
        const q = search.toLowerCase().trim();
        // Name aliases: allow searching brands in either language
        const aliases: Record<string, string[]> = {
          "麥當勞餐廳": ["mcdonald", "mcdonalds", "mcdonald's", "麥當勞", "麦当劳"],
          "麥當勞": ["mcdonald", "mcdonalds", "mcdonald's"],
        };
        const nameMatches = r.name.toLowerCase().includes(q);
        const aliasMatches = Object.entries(aliases).some(
          ([cname, alts]) => r.name.includes(cname) && alts.some((a) => a.includes(q) || q.includes(a))
        );
        if (
          !nameMatches &&
          !aliasMatches &&
          !r.district.toLowerCase().includes(q) &&
          !r.address.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    }).sort((a, b) => {
      const aNoName = a.name === "(沒有記錄)" ? 1 : 0;
      const bNoName = b.name === "(沒有記錄)" ? 1 : 0;
      if (aNoName !== bNoName) return aNoName - bNoName;
      return a.name.localeCompare(b.name, "zh-HK");
    });
  }, [search, region, district]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="my-10 rounded-2xl border-2 border-primary/20 bg-background p-5 md:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <UtensilsCrossed className="w-5 h-5 text-primary" />
        <h3 className="text-xl md:text-2xl font-bold m-0">獲准許食肆名單搜尋器</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
        <span>數據來源：食環署牌照資料 (data.gov.hk) × 今日抽籤結果</span>
      </p>

      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px] mb-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋餐廳名稱、地區或地址…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={region}
          onValueChange={(v) => {
            setRegion(v);
            setDistrict("全部分區");
            setVisible(PAGE_SIZE);
          }}
        >
          <SelectTrigger><SelectValue placeholder="地區" /></SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select
          value={district}
          onValueChange={(v) => {
            setDistrict(v);
            setVisible(PAGE_SIZE);
          }}
        >
          <SelectTrigger><SelectValue placeholder="分區" /></SelectTrigger>
          <SelectContent className="max-h-72">
            {districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="hidden md:grid grid-cols-[110px_110px_1fr_1.4fr] bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">
          <div>地區</div>
          <div>分區</div>
          <div>餐廳名稱</div>
          <div>地址</div>
        </div>
        {shown.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            未找到符合條件的餐廳，請調整搜尋條件。
          </div>
        ) : (
          shown.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className="grid grid-cols-1 md:grid-cols-[110px_110px_1fr_1.4fr] items-start gap-1 md:gap-2 px-4 py-3 border-t first:border-t-0 hover:bg-muted/30 transition-colors"
            >
              <div className="md:hidden">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{r.region} · {r.district}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{r.address}</div>
              </div>
              <div className="hidden md:flex"><Badge variant="secondary" className="text-xs font-normal">{r.region}</Badge></div>
              <div className="hidden md:block text-sm text-muted-foreground">{r.district}</div>
              <div className="hidden md:block font-semibold text-sm">{r.name}</div>
              <div className="hidden md:block text-sm text-muted-foreground">{r.address}</div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <p className="text-xs text-muted-foreground">
          顯示 {Math.min(visible, filtered.length).toLocaleString()} / {filtered.length.toLocaleString()} 間 · 資料來源：食環署（FEHD）首階段抽籤結果
        </p>
        {visible < filtered.length && (
          <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            載入更多
          </Button>
        )}
      </div>
    </div>
  );
}
