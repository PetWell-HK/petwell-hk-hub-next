import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Clock, MapPin, Sparkles, Store, Gift, Zap, Plug } from "lucide-react";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { createContactUsReport } from "@/services/reportService";
const vendorEventCover = "/assets/vendor-event-cover.jpg";
const vendorEventFloorPlan = "/assets/vendor-event-floor-plan.jpg";

type JoinType = "booth" | "sponsor" | "both";

const JOIN_OPTIONS: { value: JoinType; icon: string; title: string; desc: string }[] = [
  {
    value: "booth",
    icon: "ðŸª",
    title: "è¦ªèº«åƒèˆ‡é–‹æª”",
    desc: "å–ºæ´»å‹•ç¾å ´è¨­ç½®å¯¦é«”æ”¤ä½ï¼Œç›´æŽ¥æŽ¥è§¸æ¯›å­©å®¶é•·ã€‚",
  },
  {
    value: "sponsor",
    icon: "ðŸŽ",
    title: "è´ŠåŠ©å…è²»è©¦ç”¨å“æˆ–ç¦®ç‰©",
    desc: "åªè´ŠåŠ©è©¦ç”¨å“ï¼ç¦®ç‰©ï¼Œå””éœ€è¦è¦ªèº«å‡ºå¸­æ´»å‹•ã€‚",
  },
  {
    value: "both",
    icon: "ðŸªðŸŽ",
    title: "è¦ªèº«åƒèˆ‡é–‹æª” + è´ŠåŠ©å…è²»è©¦ç”¨å“æˆ–ç¦®ç‰©",
    desc: "ç¾å ´è¨­ç½®æ”¤ä½ï¼ŒåŒæ™‚è´ŠåŠ©è©¦ç”¨å“ï¼ç¦®ç‰©ã€‚",
  },
];

const EVENT_HIGHLIGHTS = [
  "å¤œå¸‚ç¾Žé£Ÿå€ï¼šå°å¼ç‡’è‚‰å¡é›†ç« æŒ‘æˆ°ï¼Œå¯µç‰©å‹å–„ç¾Žå‘³",
  "è¨±é¡˜å¤©ç‡ˆå€ï¼šå¯µç‰©å‹å–„ LED ç’°ä¿æ°«æ°£çƒå¤©ç‡ˆï¼Œä¸€åŒå¯„è¨—ä¸­ç§‹é¡˜æœ›",
  "ç‰¹è‰²æ‰“å¡å€ï¼šå¾©åˆ»ååˆ†è»Šç«™ã€å½©è™¹çœ·æ‘ã€è¥¿é–€ç”ºå½©è™¹åœ°ç­‰å°ç£ç¶“å…¸æ™¯é»ž",
  "å“ç‰Œäº’å‹•å€ï¼šå¥åº·è«®è©¢æœå‹™ã€ç”¢å“è©¦ç”¨é«”é©—",
];

const EVENT_TIMES = [
  "9æœˆ25æ—¥ï¼ˆäº”ï¼‰16:00â€“20:00",
  "9æœˆ26æ—¥ï¼ˆå…­ï¼‰15:00â€“19:00",
  "9æœˆ27æ—¥ï¼ˆæ—¥ï¼‰15:00â€“19:00",
];

const TERMS = [
  "å ±åé ˆç¶“ PetWell å¯©æ ¸ï¼Œç¢ºèªå¾Œæœƒä»¥é›»éƒµï¼WhatsApp é€šçŸ¥ï¼Œä¸¦ç™¼å‡ºä»˜æ¬¾æˆ–ç¢ºèªæŒ‡ç¤ºã€‚",
  "æ”¤ä½ä»¥å…ˆåˆ°å…ˆå¾—æ–¹å¼åˆ†é…ï¼Œç´„ 20 æª”ï¼Œé¡æ»¿å³æ­¢ï¼›ä¸»è¾¦æ–¹ä¿ç•™æœ€çµ‚æ”¤ä½ç·¨æŽ’åŠå¯©æ‰¹æ¬Šã€‚",
  "ç¢ºèªå¾Œå¦‚éœ€å–æ¶ˆï¼Œé ˆæ–¼æ´»å‹•å‰ 14 æ—¥é€šçŸ¥ï¼›é€¾æœŸå–æ¶ˆæ•ä¸é€€å›žä»»ä½•è²»ç”¨ã€‚",
  "æª”ä¸»é ˆè‡ªè¡Œè² è²¬è²¨å“é‹é€ã€ä¿éšªåŠç¾å ´äººæ‰‹å®‰æŽ’ï¼Œä¸¦éµå®ˆå ´åœ°åŠç›¸é—œæ³•ä¾‹è¦å®šã€‚",
  "ç¾å ´åš´ç¦è²©å”®æ´»é«”å‹•ç‰©ã€è—¥ç‰©ã€è™•æ–¹ç³§æˆ–ä»»ä½•æœªç¶“æ‰¹å‡†ä¹‹å•†å“ã€‚",
  "æ‰€æœ‰æ”¤ä½é ˆä¿æŒå ´åœ°æ¸…æ½”ï¼Œæ´»å‹•çµæŸå¾Œé ˆå³æ™‚æ¸…èµ°æ‰€æœ‰ç‰©è³‡åŠåžƒåœ¾ã€‚",
  "å¦‚é‡ 8 è™Ÿæˆ–ä»¥ä¸Šé¢±é¢¨è¨Šè™Ÿã€é»‘è‰²æš´é›¨è­¦å‘Šæˆ–æ”¿åºœæŒ‡ç¤ºï¼Œæ´»å‹•æˆ–æœƒå»¶æœŸæˆ–å–æ¶ˆï¼Œä¸»è¾¦æ–¹æœƒå¦è¡Œå…¬ä½ˆå®‰æŽ’ã€‚",
  "ä¸»è¾¦æ–¹æœ‰æ¬Šæ–¼å®£å‚³ç‰©æ–™ã€ç¤¾äº¤åª’é«”åŠç¶²ç«™ä½¿ç”¨æ´»å‹•ç¾å ´ç›¸ç‰‡åŠæª”ä¸»å“ç‰Œè³‡æ–™ä½œæŽ¨å»£ç”¨é€”ã€‚",
];

const BOOTH_DETAILS = [
  "æ”¤ä½é¢ç©ç´„ 6 å‘Ž x 3 å‘Žï¼ŒåŒ…ä¸€å¼µé•·æž±åŠå…©å¼µæ‘ºæ¤…ã€‚",
  "æž±å¸ƒã€è²¨æž¶ã€æ˜“æ‹‰æž¶ã€å®£å‚³ç‰©æ–™ç­‰ç”±æª”ä¸»è‡ªè¡Œæº–å‚™ã€‚",
  "å…¥å ´ä½ˆç½®æ™‚é–“ç‚ºæ´»å‹•é–‹å§‹å‰ 90 åˆ†é˜ï¼Œæ’¤å ´é ˆæ–¼æ´»å‹•çµæŸå¾Œ 60 åˆ†é˜å…§å®Œæˆã€‚",
  "ç¾å ´è¨­æœ‰å…±ç”¨å¯µç‰©å‹å–„é€šé“ï¼Œæ”¤ä½ä¸å¯é˜»å¡žé€šé“æˆ–èµ°ç«é€šé“ã€‚",
];

const ELECTRICITY_TERMS = [
  "é›»åŠ›ä¾›æ‡‰æ•¸é‡æœ‰é™ï¼Œé ˆæ–¼å ±åæ™‚ç”³è«‹ï¼Œä¸¦ä»¥ä¸»è¾¦æ–¹æœ€çµ‚ç¢ºèªç‚ºæº–ã€‚",
  "æ¯æª”æ¨™æº–ä¾›é›»ä¸Šé™ç‚º 500Wï¼›è¶…éŽé ˆå¦è¡Œç”³è«‹ä¸¦å¯èƒ½éœ€é¡å¤–æ”¶è²»ã€‚",
  "æª”ä¸»é ˆè‡ªå‚™ç¬¦åˆå®‰å…¨æ¨™æº–ä¹‹æ‹–æ¿åŠé›»ç·šï¼ˆæœ€å°‘ 3 ç±³ï¼‰ï¼Œä¸¦é ˆå¦¥å–„ä»¥è† ç´™å›ºå®šã€‚",
  "åš´ç¦ä½¿ç”¨æ˜Žç«ã€ç‡’çƒ¤çˆã€é«˜æº«é›»ç†±å™¨å…·æˆ–æœªç¶“ç”³å ±ä¹‹é«˜ç“¦æ•¸é›»å™¨ã€‚",
  "å¦‚æœªç¶“ç”³è«‹è‡ªè¡ŒæŽ¥é§é›»æºï¼Œä¸»è¾¦æ–¹æœ‰æ¬Šå³æ™‚è¦æ±‚åœæ­¢ä½¿ç”¨ã€‚",
];

const applicationSchema = z.object({
  brandName: z.string().trim().min(1, "è«‹å¡«å¯«æ”¤ä½ï¼å“ç‰Œåç¨±").max(120),
  brandIntro: z.string().trim().max(500).optional().or(z.literal("")),
  productDesc: z.string().trim().min(1, "è«‹å¡«å¯«è²©å”®å…§å®¹ï¼è´ŠåŠ©ç‰©å“èªªæ˜Ž").max(1000),
  contactName: z.string().trim().min(1, "è«‹å¡«å¯«è¯çµ¡äººå§“å").max(80),
  phone: z.string().trim().min(6, "è«‹å¡«å¯«æœ‰æ•ˆé›»è©±").max(40),
  email: z.string().trim().email("è«‹å¡«å¯«æœ‰æ•ˆé›»éƒµ").max(255),
  ig: z.string().trim().max(255).optional().or(z.literal("")),
  electricity: z.string().trim().max(500).optional().or(z.literal("")),
  equipment: z.string().trim().max(500).optional().or(z.literal("")),
});

const SectionHeading = ({ step, title, hint }: { step: number; title: string; hint?: string }) => (
  <div className="mb-4">
    <div className="flex items-center gap-3">
      <span className="w-7 h-7 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
        {step}
      </span>
      <h2 className="text-lg md:text-xl font-bold">{title}</h2>
    </div>
    {hint && <p className="text-sm text-muted-foreground mt-2 ml-10">{hint}</p>}
  </div>
);

const VendorApplication = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userInfo } = useAuth();
  const [joinType, setJoinType] = useState<JoinType | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    brandName: "",
    brandIntro: "",
    productDesc: "",
    contactName: "",
    phone: "",
    email: "",
    ig: "",
    electricity: "",
    equipment: "",
  });

  useSEO({
    title: "PetWell x Aquabeat è§€å¡˜å¯µç‰©å¸‚é›†ï½œæª”ä¸»æ‹›å‹Ÿ 09-2026",
    description:
      "2026å¹´9æœˆ25-27æ—¥è§€å¡˜æµ·æ¿±æ´»å‹•ç©ºé–“02ï¼Œæ¯›å­©æ²‰æµ¸å°å¼ä¸­ç§‹ç¯€ã€‚PetWell Ã— AquaBeat è¯ä¹˜å¯µç‰©å¸‚é›†æª”ä¸»åŠè´ŠåŠ©æ‹›å‹Ÿï¼Œç´„20æª”ï¼Œé¡æ»¿å³æ­¢ã€‚",
    canonicalUrl: "https://petwellhk.com/vendor-application",
  });

  const isSponsorOnly = joinType === "sponsor";
  const unitLabel = isSponsorOnly ? "å“ç‰Œ" : "æ”¤ä½";

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const steps = useMemo(() => {
    const base = ["åƒèˆ‡å½¢å¼", "æ´»å‹•æ¢æ¬¾", `${unitLabel}è³‡æ–™`];
    if (!isSponsorOnly) base.push("é›»åŠ›éœ€æ±‚", "è¨­å‚™åŠç“¦æ•¸éœ€æ±‚");
    return base;
  }, [isSponsorOnly, unitLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinType) {
      toast.error("è«‹å…ˆæ€é¸åƒèˆ‡å½¢å¼", { duration: 3000 });
      return;
    }
    if (!agreed) {
      toast.error("è«‹é–±è®€ä¸¦åŒæ„æ´»å‹•æ¢æ¬¾", { duration: 3000 });
      return;
    }
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "è«‹æª¢æŸ¥è¡¨æ ¼", { duration: 3000 });
      return;
    }

    const data = parsed.data;
    const joinLabel = JOIN_OPTIONS.find((o) => o.value === joinType)?.title ?? "";
    const message = [
      "[Vendor Application] PetWell x Aquabeat è§€å¡˜å¯µç‰©å¸‚é›† 09-2026",
      `åƒèˆ‡å½¢å¼: ${joinLabel}`,
      `${unitLabel}åç¨±: ${data.brandName}`,
      data.brandIntro ? `${unitLabel}ç°¡ä»‹: ${data.brandIntro}` : null,
      `è²©å”®å…§å®¹ / è´ŠåŠ©ç‰©å“: ${data.productDesc}`,
      data.ig ? `IG / ç¶²å€: ${data.ig}` : null,
      isSponsorOnly ? null : `é›»åŠ›éœ€æ±‚: ${data.electricity || "ä¸éœ€è¦"}`,
      isSponsorOnly ? null : `è¨­å‚™åŠç“¦æ•¸: ${data.equipment || "ä¸é©ç”¨"}`,
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    try {
      await createContactUsReport({
        reporterId: isAuthenticated === true ? userInfo?.userId ?? null : null,
        message,
        contact: {
          reporterName: data.contactName,
          reporterEmail: data.email.trim().toLowerCase(),
          reporterPhone: data.phone.trim(),
        },
      });
      navigate("/vendor-application/thank-you", { replace: true });
    } catch (error) {
      console.error("Failed to submit vendor application:", error);
      toast.error("æš«æ™‚æœªèƒ½æäº¤ï¼Œè«‹ç¨å¾Œå†è©¦", { duration: 3000 });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero / Event info */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="w-full overflow-hidden">
          <img
            src={vendorEventCover}
            alt="PetWell x Aquabeat è§€å¡˜å¯µç‰©å¸‚é›†ï½œæª”ä¸»æ‹›å‹Ÿ 09-2026"
            className="w-full h-auto object-cover"
            fetchPriority="high"
          />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <Badge variant="outline" className="mb-4 gap-1 border-primary/30 text-primary">
            <Store className="w-3 h-3" /> æª”ä¸»æ‹›å‹Ÿ
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-3">
            ðŸ¾ PetWell x Aquabeat è§€å¡˜å¯µç‰©å¸‚é›† | æª”ä¸»æ‹›å‹Ÿ 09-2026
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            ã€ æ¯›å­©æ²‰æµ¸å°å¼ä¸­ç§‹ç¯€ ã€‘ PetWell Ã— AquaBeat è¯ä¹˜æ´»å‹•ï¼Œå¸¶ä½ åŒæ¯›å­©ä¸€é½Šé«”é©—å°å¼å¤œå¸‚æ–‡åŒ–ï¼
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">æ—¥æœŸ</p>
                  <p className="text-sm text-muted-foreground">ðŸ“… 2026å¹´9æœˆ25-27æ—¥ï¼ˆæ˜ŸæœŸäº”è‡³æ—¥ï¼‰</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">åœ°é»ž</p>
                  <p className="text-sm text-muted-foreground">ðŸ“ è§€å¡˜æµ·æ¿±æ´»å‹•ç©ºé–“02</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:col-span-2">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">æ™‚é–“</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {EVENT_TIMES.map((t) => (
                      <li key={t}>â° {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="font-semibold">æ´»å‹•äº®é»ž</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {EVENT_HIGHLIGHTS.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-primary">â€¢</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Card>

          <p className="text-sm md:text-base font-medium text-foreground/80">
            ç´„20æª” â€¢ é¡æ»¿å³æ­¢ â€¢ é–‹æª” / Sponsor å‡å¯ | 57K+ IGæ›å…‰ | 10K Appç”¨æˆ¶ | 280K ç¶²ç«™æ›å…‰
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: participation type */}
          <Card className="p-6 md:p-8">
            <SectionHeading step={1} title="åƒèˆ‡å½¢å¼ *" hint="è«‹æ€é¸ä½ æƒ³ä»¥é‚Šç¨®å½¢å¼åƒèˆ‡ä»Šæ¬¡å¸‚é›†ã€‚" />
            <div className="grid gap-3">
              {JOIN_OPTIONS.map((opt) => {
                const active = joinType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setJoinType(opt.value)}
                    aria-pressed={active}
                    className={`text-left rounded-xl border-2 p-4 transition-colors ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl leading-none mt-0.5">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{opt.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                      </div>
                      <span
                        className={`w-5 h-5 shrink-0 rounded-full border-2 mt-0.5 ${
                          active ? "border-primary bg-primary" : "border-muted-foreground/40"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            {joinType && (
              <p className="text-xs text-muted-foreground mt-4">
                ä½ éœ€è¦å¡«å¯«ï¼š{steps.join(" â†’ ")}
              </p>
            )}
          </Card>

          {/* Step 2: terms */}
          <Card className="p-6 md:p-8">
            <SectionHeading step={2} title="æ´»å‹•æ¢æ¬¾åŠç´°å‰‡" />
            <ul className="space-y-2 text-sm text-muted-foreground mb-5">
              {TERMS.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-primary">â€¢</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-lg bg-muted/50 p-4 mb-4">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" /> æ”¤ä½è©³æƒ…
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {BOOTH_DETAILS.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-primary">â€¢</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 mb-5">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> é›»åŠ›ä½¿ç”¨æ¢æ¬¾
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {ELECTRICITY_TERMS.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-primary">â€¢</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-5">
              <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> å ´åœ°å¹³é¢åœ–
              </p>
              <div className="rounded-lg border overflow-hidden bg-white">
                <img
                  src={vendorEventFloorPlan}
                  alt="æ´»å‹•å ´åœ°å¹³é¢åœ–"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">æ”¤ä½ä½ç½®ä»¥ä¸»è¾¦æ–¹æœ€çµ‚ç·¨æŽ’ç‚ºæº–ã€‚</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm">æˆ‘å·²é–±è®€ä¸¦åŒæ„ä»¥ä¸Šæ´»å‹•æ¢æ¬¾åŠç´°å‰‡ *</span>
            </label>
          </Card>

          {/* Step 3: brand / booth info */}
          <Card className="p-6 md:p-8">
            <SectionHeading step={3} title={`${unitLabel}è³‡æ–™`} />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="brandName">æ”¤ä½åç¨± / å“ç‰Œåç¨± *</Label>
                <Input
                  id="brandName"
                  value={form.brandName}
                  onChange={(e) => set("brandName", e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brandIntro">æ”¤ä½/å“ç‰Œç°¡ä»‹ (ç´„50å­—)</Label>
                <Textarea
                  id="brandIntro"
                  value={form.brandIntro}
                  onChange={(e) => set("brandIntro", e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productDesc">è²©å”®å…§å®¹èªªæ˜Ž / è´ŠåŠ©ç‰©å“èªªæ˜Ž *</Label>
                <p className="text-xs text-muted-foreground">
                  è«‹ç°¡è¿°ä¸»è¦å•†å“ï¼æœå‹™å…§å®¹ï¼Œæˆ–è´ŠåŠ©ä¹‹è©¦ç”¨å“/ç¦®ç‰©è©³æƒ…
                </p>
                <Textarea
                  id="productDesc"
                  value={form.productDesc}
                  onChange={(e) => set("productDesc", e.target.value)}
                  maxLength={1000}
                  rows={4}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contactName">è¯çµ¡äººå§“å *</Label>
                  <Input
                    id="contactName"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">è¯çµ¡é›»è©± (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    maxLength={40}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">é›»éƒµ *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ig">IG / ç¶²å€ï¼ˆé¸å¡«ï¼‰</Label>
                  <Input
                    id="ig"
                    value={form.ig}
                    onChange={(e) => set("ig", e.target.value)}
                    placeholder="@yourbrand æˆ– https://"
                    maxLength={255}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Steps 4 & 5: only for booth participants */}
          {!isSponsorOnly && (
            <>
              <Card className="p-6 md:p-8">
                <SectionHeading
                  step={4}
                  title="é›»åŠ›éœ€æ±‚"
                  hint="å¦‚éœ€è¦ç¾å ´ä¾›é›»ï¼Œè«‹èªªæ˜Žç”¨é€”åŠæ‰€éœ€æ’åº§æ•¸é‡ï¼›å¦‚ä¸éœ€è¦è«‹å¡«ã€Œä¸éœ€è¦ã€ã€‚"
                />
                <Textarea
                  id="electricity"
                  value={form.electricity}
                  onChange={(e) => set("electricity", e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="ä¾‹ï¼šéœ€è¦ 1 å€‹æ’åº§ï¼Œç”¨ä½œ LED ç‡ˆç®±"
                />
              </Card>

              <Card className="p-6 md:p-8">
                <SectionHeading
                  step={5}
                  title="è¨­å‚™åŠç“¦æ•¸éœ€æ±‚"
                  hint="è«‹åˆ—å‡ºæœƒä½¿ç”¨å˜…é›»å™¨åŠå„è‡ªç“¦æ•¸ï¼ˆæ¯æª”ä¸Šé™ 500Wï¼‰ã€‚"
                />
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                  <Plug className="w-4 h-4 text-primary mt-0.5" />
                  <span>ä¾‹ï¼šLED ç‡ˆç®± 30Wã€é›»å­ç£… 10Wã€é›ªæ«ƒ 120W</span>
                </div>
                <Textarea
                  id="equipment"
                  value={form.equipment}
                  onChange={(e) => set("equipment", e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </Card>
            </>
          )}

          {isSponsorOnly && (
            <Card className="p-5 flex items-start gap-3">
              <Gift className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                ä½ æ€é¸å’—ã€Œè´ŠåŠ©å…è²»è©¦ç”¨å“æˆ–ç¦®ç‰©ã€ï¼Œå””éœ€è¦å¡«å¯«é›»åŠ›éœ€æ±‚åŒè¨­å‚™åŠç“¦æ•¸éœ€æ±‚ã€‚æˆ‘å“‹æœƒå¦è¡ŒåŒä½ å®‰æŽ’æ”¶ä»¶æ–¹å¼ã€‚
              </p>
            </Card>
          )}

          <Button type="submit" disabled={submitting} size="lg" className="w-full">
            {submitting ? "æäº¤ä¸­â€¦" : "æäº¤å ±å"}
          </Button>
        </form>
      </section>

      <Footer />
    </div>
  );
};

export default VendorApplication;
