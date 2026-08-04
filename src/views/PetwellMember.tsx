"use client";

import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PetwellMember = () => {
  const { t } = useTranslation();

  const steps = [
    {
      step: 1,
      title: '下載 PetWell App',
      description: '在 App Store 或 Google Play 搜尋「PetWell」並下載',
    },
    {
      step: 2,
      title: '註冊帳戶',
      description: '使用手機號碼和電郵註冊成為 PetWell 用戶',
    },
    {
      step: 3,
      title: '享用會員優惠',
      description: '購物時填寫電郵地址即可享有會員折扣',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* How to Join */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              如何成為會員
            </h2>
            <div className="space-y-4">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center mb-8">
            <Button asChild size="lg">
              <a href="https://apps.apple.com/hk/app/petwell/id1574894802" target="_blank" rel="noopener noreferrer">
                下載 PetWell App
              </a>
            </Button>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-8">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  已經是 PetWell 用戶？
                </h3>
                <p className="text-muted-foreground">
                  下單時請備註您的 PetWell 帳戶電郵地址，即可享有會員折扣
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PetwellMember;
