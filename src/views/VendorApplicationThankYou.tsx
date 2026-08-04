import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Instagram, MessageCircle, Home, CheckCircle2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
const vendorEventCover = "/assets/vendor-event-cover.jpg";

const IG_URL = "https://www.instagram.com/petwell_hk/";
const WA_URL =
  "https://wa.me/85255954078?text=" +
  encodeURIComponent("ä½ å¥½ï¼Œæˆ‘æƒ³æŸ¥è©¢ PetWell x Aquabeat è§€å¡˜å¯µç‰©å¸‚é›†æª”ä¸»å ±åäº‹å®œã€‚");

const VendorApplicationThankYou = () => {
  useSEO({
    title: "å¤šè¬å ±åï½œPetWell x Aquabeat è§€å¡˜å¯µç‰©å¸‚é›†",
    description:
      "ä½ çš„æª”ä¸»ï¼è´ŠåŠ©å ±åå·²æˆåŠŸæäº¤ã€‚å¦‚æœ‰ä»»ä½•å•é¡Œï¼Œæ­¡è¿Ž DM PetWell Instagram æˆ– WhatsApp è¯çµ¡æˆ‘å€‘ã€‚",
    canonicalUrl: "https://petwellhk.com/vendor-application/thank-you",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="w-full overflow-hidden max-h-48 md:max-h-64">
        <img
          src={vendorEventCover}
          alt="PetWell x Aquabeat è§€å¡˜å¯µç‰©å¸‚é›†"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <section className="container mx-auto px-4 py-12 md:py-16 max-w-xl">
        <Card className="p-8 md:p-10 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3">å¤šè¬ä½ å˜…å ±åï¼</h1>
          <p className="text-muted-foreground mb-2">
            æˆ‘å“‹å·²æ”¶åˆ°ä½ å˜…ç”³è«‹ï¼Œåœ˜éšŠæœƒç›¡å¿«å¯©æ ¸ï¼Œä¸¦ä»¥é›»éƒµï¼WhatsApp è¯çµ¡ä½ ç¢ºèªè©³æƒ…ã€‚
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            å¦‚æœ‰ä»»ä½•å•é¡Œï¼Œæ­¡è¿Žéš¨æ™‚ DM æˆ‘å“‹ï¼Œæˆ‘å“‹å¥½æ¨‚æ„å¹«æ‰‹è§£ç­”ã€‚
          </p>

          <div className="grid gap-3 mb-6">
            <Button asChild size="lg" className="w-full gap-2">
              <a href={IG_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5" />
                Instagram DM @petwell_hk
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full gap-2">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5" />
                WhatsApp è¯çµ¡æˆ‘å“‹
              </a>
            </Button>
          </div>

          <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
            <Link to="/">
              <Home className="w-4 h-4" />
              è¿”å›žä¸»é 
            </Link>
          </Button>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default VendorApplicationThankYou;
