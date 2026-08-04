import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DogMbtiQuiz from "@/components/DogMbtiQuiz";
import { useSEO } from "@/hooks/useSEO";

const ChristmasDogMbti = () => {
  const [hasResult, setHasResult] = useState(false);

  // SEO
  useSEO({
    title: "狗狗MBTI性格測試 | 聖誕活動+寵物友善餐廳推薦 | PetWell HK",
    description: "免費狗狗MBTI性格測試！根據毛孩性格，推薦適合佢嘅聖誕活動同寵物友善餐廳。3分鐘完成測試，即睇結果！",
    keywords: "狗狗MBTI,狗性格測試,聖誕狗狗活動,寵物友善餐廳推薦,帶狗聖誕活動,狗狗性格分析,狗狗好去處,聖誕好去處2025",
    canonicalUrl: "https://petwellhk.com/christmas-dog-mbti-2025",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Quiz",
      "name": "狗狗MBTI性格測試",
      "description": "根據毛孩性格，推薦適合嘅聖誕活動同寵物友善餐廳",
      "educationalLevel": "Beginner",
      "about": {
        "@type": "Thing",
        "name": "狗狗性格分析"
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 mt-[72px]">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Hero Section - hidden when result is shown */}
          {!hasResult && (
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
              <span className="text-5xl md:text-6xl mb-4 block">🎄🐕</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                聖誕去邊玩？
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-3">
                由主子性格話事！
              </p>
              <p className="text-base sm:text-lg text-muted-foreground">
                測狗狗 MBTI → 推介真・寵物友善餐廳 + 活動
              </p>
            </div>
          )}
          
          {/* Quiz Component */}
          <DogMbtiQuiz onResultChange={setHasResult} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChristmasDogMbti;
