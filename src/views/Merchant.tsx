"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BellRing, BadgeCheck, Store, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createContactUsReport } from "@/services/reportService";

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "自助更新價格",
    desc: "隨時更新產品價格及特價，確保資訊準確",
  },
  {
    icon: BellRing,
    title: "特價推送通知",
    desc: "設定特價時，自動通知已追蹤該產品的用戶",
  },
  {
    icon: BadgeCheck,
    title: "認證商家標記",
    desc: "獲得「已認證 ✓」標記，建立用戶信任",
  },
];

const applicationSchema = z.object({
  storeName: z.string().trim().min(1, "請填寫店舖名稱").max(120),
  contactName: z.string().trim().min(1, "請填寫聯絡人姓名").max(80),
  phone: z.string().trim().min(6, "請填寫有效電話").max(40),
  email: z.string().trim().email("請填寫有效電郵").max(255),
  website: z.string().trim().max(255).optional().or(z.literal("")),
});

const Merchant = () => {
  const { isAuthenticated, userInfo } = useAuth();
  const [form, setForm] = useState({
    storeName: "",
    contactName: "",
    phone: "",
    email: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);


  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "請檢查表格", { duration: 3000 });
      return;
    }

    const data = parsed.data;
    const message = [
      "[Merchant Application]",
      `Store: ${data.storeName}`,
      `Contact: ${data.contactName}`,
      data.website ? `Website: ${data.website}` : null,
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
      toast.success("多謝！我哋會喺 2 個工作天內聯絡你。", { duration: 3000 });
      setForm({ storeName: "", contactName: "", phone: "", email: "", website: "" });
    } catch (error) {
      console.error("Failed to submit merchant application:", error);
      toast.error("暫時未能提交，請稍後再試", { duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 py-14 md:py-20 max-w-4xl text-center">
          <Badge variant="outline" className="mb-4 gap-1 border-primary/30 text-primary">
            <Store className="w-3 h-3" /> 商家合作計劃
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            你係寵物店或品牌？
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-7">
            免費登記成為 PetWell 認證商家，自行更新價格及特價資訊，直接觸達全港寵物主人。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="outline" asChild>
              <a href="#login">
                <LogIn className="w-4 h-4" /> 商家登入
              </a>
            </Button>
            <Button size="lg" asChild>
              <a href="#apply">申請成為合作商家</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">合作商家專屬功能</h2>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="container mx-auto px-4 pb-16 md:pb-24">
        <Card className="max-w-xl mx-auto p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-1">申請成為合作商家</h2>
          <p className="text-sm text-muted-foreground mb-6">
            填寫以下資料，我哋會盡快聯絡你。
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="storeName">店舖名稱 *</Label>
              <Input
                id="storeName"
                value={form.storeName}
                onChange={(e) => set("storeName", e.target.value)}
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">聯絡人姓名 *</Label>
              <Input
                id="contactName"
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                maxLength={80}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">電話 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  maxLength={40}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">電郵 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">店舖網址（選填）</Label>
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://"
                maxLength={255}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? "提交中…" : "提交申請"}
            </Button>
          </form>
        </Card>
      </section>

    </div>
  );
};

export default Merchant;
