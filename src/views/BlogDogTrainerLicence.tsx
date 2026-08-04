import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Facebook, Link2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const heroImage = "/assets/blog-dog-trainer-licence.jpg";
import BlogAdSense from "@/components/BlogAdSense";

const faqItems = [
  {
    question: "é¦™æ¸¯è¨“çŠ¬å¸«ä¸éœ€è¦ç‰Œç…§ï¼Œæ˜¯å¦ç­‰æ–¼ä¸å—ä»»ä½•æ³•å¾‹ä¿éšœï¼Ÿ",
    answer:
      "åŸºæœ¬ä¸Šæ˜¯çš„ã€‚è‹¥è¨“ç·´éŽç¨‹ä¸­ä½ çš„å¯µç‰©å—å‚·ï¼Œç›®å‰ä¸¦æ²’æœ‰é‡å°è¨“ç·´å¸«çš„è¡Œæ¥­è¦ç®¡æ©Ÿåˆ¶ï¼Œä¸»è¦éœ€é€éŽæ°‘äº‹é€”å¾‘è¿½ç©¶ã€‚å› æ­¤é¸æ“‡æœ‰èªè­‰çš„è¨“ç·´å¸«ï¼ŒåŒæ™‚ç°½è¨‚æ›¸é¢æœå‹™åˆç´„ï¼Œæ˜¯ä¿éšœè‡ªå·±å’Œæ¯›å­©çš„é‡è¦æ­¥é©Ÿã€‚",
  },
  {
    question: "ICA çš„ QSSD èªè­‰å’Œ IACP æœ‰ä»€éº¼é—œä¿‚ï¼Ÿ",
    answer:
      "QSSD ç”± ICA åŠ MINSENï¼ˆé¦™æ¸¯ï¼‰å…±åŒä¸»è¾¦ï¼Œç² IACPï¼ˆåœ‹éš›å°ˆæ¥­ç·´ç‹—å”æœƒï¼‰èªå¯ã€‚æŒæœ‰ QSSD è­‰æ›¸çš„äººå£«å¯ç”³è«‹è½‰æ›æˆ–åŒæ™‚æŒæœ‰ IACP çš„åœ‹éš›è­‰æ›¸ï¼Œå…©è€…äº’èªã€‚",
  },
  {
    question: "ERB çš„çŠ¬éš»è¨“ç·´å“¡èª²ç¨‹çœŸçš„å…è²»å—Žï¼Ÿ",
    answer:
      "æ˜¯çš„ï¼ŒERB è³‡åŠ©èª²ç¨‹å°ç¬¦åˆè³‡æ ¼çš„å­¸å“¡å…¨å…è²»ç”¨ã€‚ä»¥ä¿¡ç¾©æœƒ GTC ç‚ºä¾‹ï¼Œèª²ç¨‹å…¨æ—¥åˆ¶ç´„ 8 é€±ï¼Œ132 å°æ™‚ï¼Œé©åˆæœ‰æ„å…¥è¡Œçš„äººå£«ã€‚",
  },
  {
    question: "å¦‚æžœæˆ‘æƒ³æˆç‚ºè¨“ç·´å¸«ï¼Œæ‡‰è©²è€ƒå“ªå€‹è³‡æ ¼ï¼Ÿ",
    answer:
      "å¦‚æžœä½ å¸Œæœ›ä»¥é¦™æ¸¯å¸‚å ´ç‚ºä¸»ï¼ŒICA QSSD çš„æœ¬åœ°èªå—æ€§è¼ƒé«˜ï¼›å¦‚æžœä½ æœ‰æ„åœ¨åœ‹éš›å¸‚å ´ç™¼å±•ï¼ŒCPDT-KA çš„èªå—æ€§æ›´å»£ã€‚å…©è€…ä¸¦ä¸äº’æ–¥ï¼Œå¯ä»¥å…ˆè€ƒ QSSD å†é€²ä¿® CPDT-KAã€‚",
  },
];

const licenceTableData = [
  {
    type: "å‹•ç‰©å”®è³£å•†ç‰Œç…§ï¼ˆATLï¼‰",
    target: "å‡ºå”®è²“ç‹—çš„å¯µç‰©åº—",
    requirement: "å¼·åˆ¶ï¼Œç„¡ç‰Œå±¬é•æ³•",
  },
  {
    type: "ç”²é¡žç¹è‚²ç‹—éš»ç‰Œç…§ï¼ˆDBLAï¼‰",
    target: "ç¹è‚² 4 éš»æˆ–ä»¥ä¸‹é›ŒçŠ¬ä¸¦å‡ºå”®è€…",
    requirement: "å¼·åˆ¶",
  },
  {
    type: "ä¹™é¡žç¹è‚²ç‹—éš»ç‰Œç…§ï¼ˆDBLBï¼‰",
    target: "ç¹è‚² 5 éš»æˆ–ä»¥ä¸Šé›ŒçŠ¬ä¸¦å‡ºå”®è€…",
    requirement: "å¼·åˆ¶",
  },
];

const BlogDogTrainerLicence = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const pageUrl = "https://petwellhk.com/blog/hong-kong-dog-trainer-licence-guide";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "é¦™æ¸¯å¯µç‰©è¨“ç·´å¸«éœ€è¦ç‰Œç…§å—Žï¼Ÿ2026å¹´å®Œæ•´æŒ‡å—",
        description:
          "é¦™æ¸¯æ³•å¾‹ä¸Šä¸éœ€è¦å¯µç‰©è¨“ç·´å¸«æŒç‰Œâ€”â€”ä½†é€™å°ä½ çš„æ¯›å­©æœ‰ä»€éº¼å½±éŸ¿ï¼ŸPetWell ç‚ºä½ è§£æžæ¥­ç•Œèªè­‰ã€æ¼è¾²ç½²è¦ç®¡ç¯„åœåŠé¸å¸«è²¼å£«ã€‚",
        author: { "@type": "Organization", name: "PetWell HK" },
        publisher: { "@type": "Organization", name: "PetWell HK" },
        datePublished: "2026-03-06",
        dateModified: "2026-03-06",
        url: pageUrl,
        image: heroImage,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
    []
  );

  useSEO({
    title: "é¦™æ¸¯å¯µç‰©è¨“ç·´å¸«éœ€è¦ç‰Œç…§å—Žï¼Ÿ2026å¹´å®Œæ•´æŒ‡å—",
    description:
      "é¦™æ¸¯æ³•å¾‹ä¸Šä¸éœ€è¦å¯µç‰©è¨“ç·´å¸«æŒç‰Œâ€”â€”ä½†é€™å°ä½ çš„æ¯›å­©æœ‰ä»€éº¼å½±éŸ¿ï¼ŸPetWell ç‚ºä½ è§£æžæ¥­ç•Œèªè­‰ã€æ¼è¾²ç½²è¦ç®¡ç¯„åœåŠé¸å¸«è²¼å£«ã€‚",
    keywords:
      "é¦™æ¸¯è¨“çŠ¬å¸«èªè­‰,å¯µç‰©è¨“ç·´é¦™æ¸¯,è¨“çŠ¬å¸«ç‰Œç…§,ç‹—è¨“ç·´å¸«,å¯µç‰©è¨“ç·´å¸«è³‡æ ¼,ICA QSSD,CPDT-KA,æ¼è¾²ç½²",
    canonicalUrl: pageUrl,
    ogImage: heroImage,
    ogType: "article",
    articlePublishedTime: "2026-03-06",
    articleModifiedTime: "2026-03-06",
    articleAuthor: "PetWell HK",
    articleSection: "å¯µç‰©è¨“ç·´",
    articleTags: ["é¦™æ¸¯è¨“çŠ¬å¸«", "å¯µç‰©è¨“ç·´", "è¨“çŠ¬å¸«èªè­‰", "æ¼è¾²ç½²", "ICA QSSD", "CPDT-KA", "æ­£å‘å¼·åŒ–"],
    structuredData,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast({ title: "å·²è¤‡è£½é€£çµï¼", duration: 3000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent("é¦™æ¸¯å¯µç‰©è¨“ç·´å¸«éœ€è¦ç‰Œç…§å—Žï¼Ÿ2026å¹´å®Œæ•´æŒ‡å— " + pageUrl)}`,
      "_blank"
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pb-24">
        {/* Hero */}
        <section className="relative">
          <div className="w-full bg-white flex justify-center">
            <img
              src={heroImage}
              alt="é¦™æ¸¯è¨“çŠ¬å¸«èªè­‰ â€” å°ˆæ¥­å¯µç‰©è¨“ç·´é¦™æ¸¯æŒ‡å—"
              className="max-h-[420px] w-auto object-contain"
            />
          </div>
          <div className="container mx-auto px-4 py-10 md:py-14">
            <p className="text-sm text-muted-foreground mb-3 font-medium tracking-wide uppercase">
              PetWell ä¸»äººå°ˆå€
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              é¦™æ¸¯å¯µç‰©è¨“ç·´å¸«éœ€è¦ç‰Œç…§å—Žï¼Ÿ2026å¹´å®Œæ•´æŒ‡å—
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              åŽŸä¾†ä»»ä½•äººéƒ½å¯ä»¥è‡ªç¨±ã€Œè¨“ç·´å¸«ã€â€”â€”é€™å°ä½ çš„æ¯›å­©æ„å‘³è‘—ä»€éº¼ï¼Ÿ
            </p>
          </div>
        </section>

        <BlogAdSense placement="top" />

        {/* Body */}
        <article className="container mx-auto px-4 max-w-3xl">
          {/* Callout Box */}
          <div className="rounded-xl border-l-4 border-primary bg-[hsl(var(--accent))] p-6 md:p-8 mb-10">
            <p className="font-bold text-lg mb-2">ðŸ”” æ ¸å¿ƒäº‹å¯¦</p>
            <p className="text-base leading-relaxed">
              é¦™æ¸¯æ³•å¾‹ç›®å‰ä¸¦ç„¡è¦å®šå¯µç‰©è¨“ç·´å¸«æˆ–è¨“çŠ¬å¸«å¿…é ˆæŒæœ‰å®˜æ–¹ç‰Œç…§ã€‚ä»»ä½•äººï¼Œä¸è«–æœ‰æ²’æœ‰å—éŽæ­£å¼è¨“ç·´ï¼Œéƒ½å¯ä»¥åˆæ³•åœ°ä»¥ã€Œè¨“çŠ¬å¸«ã€èº«ä»½æ”¶è²»æä¾›æœå‹™ã€‚
            </p>
          </div>

          {/* Intro */}
          <div className="prose prose-lg max-w-none mb-10 space-y-5">
            <p>
              ä½ æœ‰æ²’æœ‰è©¦éŽï¼ŒèŠ±äº†å¹¾åƒå…ƒè«‹è¨“ç·´å¸«ï¼Œä½†ç‹—ç‹—çš„è¡Œç‚ºå•é¡Œä¸€é»žéƒ½æ²’æ”¹å–„ï¼Ÿ
            </p>
            <p>
              åœ¨ PetWellï¼Œæˆ‘å€‘æ¯æ˜ŸæœŸéƒ½æ”¶åˆ°é¡žä¼¼çš„è¨Šæ¯ã€‚å¾ˆå¤šä¸»äººäº‹å¾Œæ‰ç™¼ç¾ï¼ŒåŽŸä¾†é¦™æ¸¯çš„å¯µç‰©è¨“ç·´å¸«æ ¹æœ¬ä¸éœ€è¦ä»»ä½•ç‰Œç…§å°±å¯ä»¥åŸ·æ¥­â€”â€”é€™å€‹ç¾å¯¦ï¼Œæ¯”æƒ³åƒä¸­æ›´å€¼å¾—æ¯ä¸€ä½æ¯›å­©å®¶é•·äº†è§£ã€‚
            </p>
          </div>

          {/* Section: ç„¡ç‰Œç…§åˆ¶åº¦ */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">é¦™æ¸¯ç¾æ™‚ç„¡å¼·åˆ¶ç‰Œç…§åˆ¶åº¦</h2>
          <p className="text-base leading-relaxed mb-8 text-muted-foreground">
            é¦™æ¸¯çš„å¯µç‰©è¨“ç·´è¡Œæ¥­å±¬æ–¼è‡ªæˆ‘è¦ç®¡æ¨¡å¼ï¼Œæ”¿åºœæ²’æœ‰è¨­ç«‹ç™¼ç‰Œåˆ¶åº¦ï¼Œä¹Ÿæ²’æœ‰çµ±ä¸€çš„åŸ·æ¥­æ¨™æº–ã€‚é€™æ„å‘³è‘—å¸‚é¢ä¸Šçš„è¨“ç·´å¸«è³ªç´ åƒå·®ï¼Œå¾žæŽ¥å—éŽåœ‹éš›èªè­‰çš„å°ˆæ¥­äººå£«ï¼Œåˆ°å®Œå…¨æ²’æœ‰ä»»ä½•è¨“ç·´èƒŒæ™¯çš„äººï¼Œéƒ½æœ‰å¯èƒ½åœ¨ä½ é¢å‰èªªã€Œæˆ‘ä¿‚å°ˆæ¥­è¨“ç·´å¸«ã€ã€‚
          </p>

          {/* Section: æ¼è¾²ç½² */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">æ¼è¾²ç½²ç®¡çš„æ˜¯ä»€éº¼ï¼Ÿ</h2>
          <p className="text-base leading-relaxed mb-6 text-muted-foreground">
            å¾ˆå¤šäººä»¥ç‚ºæ¼è¾²è‡ªç„¶è­·ç†ç½²ï¼ˆæ¼è¾²ç½²ï¼‰æœƒè¦ç®¡è¨“ç·´å¸«ï¼Œå…¶å¯¦ä¸ç„¶ã€‚æ¼è¾²ç½²çš„ç‰Œç…§åˆ¶åº¦åªè¦†è“‹å‹•ç‰©è²·è³£å’Œç¹è‚²ï¼š
          </p>

          {/* Table */}
          <div className="overflow-x-auto mb-6 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-semibold">ç‰Œç…§é¡žåˆ¥</th>
                  <th className="text-left p-3 font-semibold">é©ç”¨å°è±¡</th>
                  <th className="text-left p-3 font-semibold">æ³•å¾‹è¦æ±‚</th>
                </tr>
              </thead>
              <tbody>
                {licenceTableData.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-medium">{row.type}</td>
                    <td className="p-3 text-muted-foreground">{row.target}</td>
                    <td className="p-3 text-muted-foreground">{row.requirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 mb-10">
            <p className="text-sm">
              <strong>âš ï¸ é‡è¦æç¤ºï¼š</strong>å¦‚æžœä½ çš„æ¥­å‹™åŒæ™‚æ¶‰åŠè¨“ç·´æœå‹™åŠ ä¸Šå‡ºå”®æˆ–ç¹è‚²å‹•ç‰©ï¼Œå”®è³£éƒ¨åˆ†ä¾ç„¶å—æ³•å¾‹è¦ç®¡ï¼Œä¸èƒ½å› ç‚ºã€Œä¸»æ¥­æ˜¯è¨“ç·´ã€è€Œè±å…ç”³è«‹ç‰Œç…§ã€‚
            </p>
          </div>

          {/* Section: è‡ªé¡˜æ€§èªè­‰ */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">æ¥­ç•Œèªå¯çš„è‡ªé¡˜æ€§èªè­‰</h2>
          <p className="text-base leading-relaxed mb-6 text-muted-foreground">
            é›–ç„¶æ²’æœ‰æ³•å¾‹å¼·åˆ¶ï¼Œä½†æœ‰è²¬ä»»æ„Ÿçš„è¨“ç·´å¸«é€šå¸¸æœƒä¸»å‹•è€ƒå–æ¥­ç•Œèªè­‰ã€‚ä»¥ä¸‹æ˜¯é¦™æ¸¯ç¾æ™‚ä¸»è¦çš„å¹¾å€‹è³‡æ ¼ï¼š
          </p>

          <div className="space-y-8 mb-10">
            {/* Cert 1 */}
            <div>
              <h3 className="text-xl font-bold mb-2">1. ICA é¦´çŠ¬å¸«æœå‹™è³ªç´ æ¨™æº–ï¼ˆQSSDï¼‰</h3>
              <p className="text-muted-foreground mb-3">ç”±åœ‹éš›èªè­‰æ©Ÿæ§‹ï¼ˆICAï¼‰ä¸»è¾¦ï¼Œè¨­æœ‰å››å€‹ç´šåˆ¥ï¼š</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Cert CC é¦´çŠ¬å¸«ï¼š</strong>å…·å‚™è¨“ç·´çŠ¬éš»æå‡ç‰¹æ®ŠæŠ€èƒ½çš„èƒ½åŠ›</li>
                <li><strong>Cert PT ç·´ç‹—å¸«ï¼š</strong>èƒ½è¨“ç·´çŠ¬éš»æŽŒæ¡ä¸€èˆ¬æŠ€å·§</li>
                <li><strong>Cert DH é ˜çŠ¬å¸«ï¼š</strong>å…·å‚™è™•ç†åŠæ“æŽ§çŠ¬éš»çš„å¯¦æˆ°ç¶“é©—</li>
                <li><strong>Cert PS åª¬å§†å¸«ï¼š</strong>å°ˆæ³¨çŠ¬éš»æ—¥å¸¸ç…§è­·</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">ç”³è«‹è²»ç”¨ HKD 1,500ï¼Œæ¯å…©å¹´é‡æ–°è©•å¯©ï¼Œç²åœ‹éš›å°ˆæ¥­ç·´ç‹—å”æœƒï¼ˆIACPï¼‰èªå¯ã€‚</p>
            </div>

            {/* Cert 2 */}
            <div>
              <h3 className="text-xl font-bold mb-2">2. é¦™æ¸¯è¨“çŠ¬å¸«åŸ¹è¨“å”æœƒï¼ˆHKACEï¼‰è¨“çŠ¬å“¡ç•¢æ¥­è­‰æ›¸</h3>
              <p className="text-muted-foreground">å®Œæˆèª²ç¨‹ä¸¦é€šéŽè€ƒæ ¸å¾Œå¯ç² HKACE é ’ç™¼çš„ç•¢æ¥­è­‰æ›¸ï¼Œè¡¨ç¾å„ªç§€è€…å¯é€²ä¸€æ­¥ç”³è«‹ IACP åœ‹éš›èªå¯è³‡æ ¼ã€‚</p>
            </div>

            {/* Cert 3 */}
            <div>
              <h3 className="text-xl font-bold mb-2">3. åƒ±å“¡å†åŸ¹è¨“å±€ï¼ˆERBï¼‰çŠ¬éš»è¨“ç·´å“¡è­‰æ›¸</h3>
              <p className="text-muted-foreground">ç”±ä¿¡ç¾©æœƒ GTC ç­‰æ©Ÿæ§‹æä¾›çš„ ERB è³‡åŠ©èª²ç¨‹ï¼Œå…¨æ—¥åˆ¶ç´„ 132 å°æ™‚ï¼ˆ8 é€±ï¼‰ï¼Œè²»ç”¨å…¨å…ï¼Œé©åˆæœ‰æ„è½‰è¡Œçš„äººå£«å…¥é–€ã€‚</p>
            </div>

            {/* Cert 4 */}
            <div>
              <h3 className="text-xl font-bold mb-2">4. CPDT-KA åœ‹éš›èªå¯è¨“çŠ¬å¸«è³‡æ ¼</h3>
              <p className="text-muted-foreground">ç”±ç¾Žåœ‹èªè­‰å°ˆæ¥­è¨“çŠ¬å¸«å§”å“¡æœƒï¼ˆCCPDTï¼‰é ’ç™¼ï¼Œæ˜¯åœ‹éš›èªå—æ€§æœ€é«˜çš„è¨“çŠ¬å¸«è³‡æ ¼ä¹‹ä¸€ã€‚é¦™æ¸¯ç›®å‰åªæœ‰æ¥µå°‘æ•¸è¨“ç·´å¸«æŒæœ‰æ­¤è³‡æ ¼ï¼Œæ˜¯å…¨çƒå«é‡‘é‡æœ€é«˜çš„æ¥­ç•Œèªè­‰ã€‚</p>
            </div>

            {/* Cert 5 */}
            <div>
              <h3 className="text-xl font-bold mb-2">5. SPCA é ˜çŠ¬å“¡è¨“ç·´ç­</h3>
              <p className="text-muted-foreground">ç”±é¦™æ¸¯æ„›è­·å‹•ç‰©å”æœƒæä¾›ï¼Œå®Œæˆèª²ç¨‹å¾Œå¯ç²è¨“ç·´ç­è­‰æ›¸åŠæ„›å”é ˜çŠ¬å“¡è³‡æ ¼å¡ï¼ˆä¸€å¹´æœ‰æ•ˆï¼‰ï¼Œæ¯å¹´é ˆå®Œæˆè‡³å°‘ 9 æ¬¡æ„›å”é ˜çŠ¬å“¡æœå‹™ä»¥çºŒæœŸã€‚</p>
            </div>

            {/* Cert 6 */}
            <div>
              <h3 className="text-xl font-bold mb-2">6. é’å¹´æœƒï¼é¦™æ¸¯é’å¹´å”æœƒ çŠ¬éš»è¡Œç‚ºè¨“ç·´åŠè­·ç†è­‰æ›¸</h3>
              <p className="text-muted-foreground">å¼·èª¿ä»¥ç§‘å­¸ç‚ºåŸºç¤Žçš„äººé“è¨“ç·´æ–¹æ³•ï¼Œè²»ç”¨ç´„ HKD 3,400â€“3,800ï¼Œé©åˆæœ‰å¿—æˆç‚ºè¨“ç·´å¸«çš„äººå£«ç³»çµ±æ€§å…¥é–€ã€‚</p>
            </div>
          </div>

          {/* Section: åˆ†è¾¨è¨“ç·´å¸« */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12">ä½œç‚ºä¸»äººï¼Œä½ å¦‚ä½•åˆ†è¾¨é è­œçš„è¨“ç·´å¸«ï¼Ÿ</h2>
          <ul className="space-y-3 mb-10">
            {[
              ["ç›´æŽ¥å•è³‡æ ¼", "è©¢å•è¨“ç·´å¸«æŒæœ‰å“ªäº›èªè­‰ï¼Œä¸¦è¦æ±‚æŸ¥çœ‹å¯¦ç‰©è­‰æ›¸æˆ–ç™»è¨˜ç·¨è™Ÿ"],
              ["äº†è§£è¨“ç·´æ–¹æ³•", "ç¾ä»£å‹•ç‰©è¡Œç‚ºç§‘å­¸ä¸€è‡´æŽ¨å´‡æ­£å‘å¼·åŒ–ï¼ˆPositive Reinforcementï¼‰ï¼Œæ‡‰é¿å…ä½¿ç”¨æ‡²ç½°ã€æåš‡æˆ–ç—›æ¥šä½œç‚ºè¨“ç·´æ‰‹æ®µ"],
              ["æŸ¥çœ‹çœŸå¯¦è©•åƒ¹", "åœ¨ Googleã€Facebook æˆ–æœ¬åœ°å¯µç‰©ç¾¤çµ„æœå°‹è¨“ç·´å¸«åå­—"],
              ["è¦æ±‚å…è²»è«®è©¢", "æ­£è¦è¨“ç·´å¸«é€šå¸¸é¡˜æ„å…ˆäº†è§£ä½ çš„ç‹—ç‹—æƒ…æ³ï¼Œå†åˆ¶å®šå€‹äººåŒ–è¨“ç·´è¨ˆåŠƒ"],
              ["è§€å¯Ÿè¨“ç·´å¸«èˆ‡ç‹—çš„äº’å‹•", "ç¬¬ä¸€å ‚èª²æ™‚ç•™æ„ç‹—ç‹—æ˜¯å¦æ”¾é¬†è€Œéžç„¦æ…®"],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>
                  <strong>{title}ï¼š</strong>
                  <span className="text-muted-foreground">{desc}</span>
                </span>
              </li>
            ))}
          </ul>


          {/* FAQ Section */}
          <h2 className="text-2xl md:text-3xl font-bold mb-6 mt-14">å¸¸è¦‹å•é¡Œ FAQ</h2>
          <Accordion type="single" collapsible className="mb-12">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Social Share */}
          <div className="border-t pt-8 mb-10">
            <p className="text-sm font-semibold mb-4">åˆ†äº«é€™ç¯‡æ–‡ç« </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={shareWhatsApp}>
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={shareFacebook}>
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Link2 className="w-4 h-4" />
                {copied ? "å·²è¤‡è£½ï¼" : "è¤‡è£½é€£çµ"}
              </Button>
            </div>
          </div>

          <BlogAdSense placement="bottom" />

          {/* Author Tag */}
          <div className="border-t pt-6 text-sm text-muted-foreground">
            PetWell åœ˜éšŠ | æ›´æ–°æ–¼ 2026 å¹´ 3 æœˆ
          </div>
        </article>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 md:p-4">
        <div className="container mx-auto flex justify-center">
          <Link to="/about">
            <Button size="lg" className="w-full max-w-md text-base font-semibold">
              è¯çµ¡ PetWell äº†è§£æ›´å¤š
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDogTrainerLicence;
