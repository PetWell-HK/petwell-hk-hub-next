"use client";

import { useState } from "react";
import DogMbtiQuiz from "@/components/DogMbtiQuiz";

const ChristmasDogMbti = () => {
  const [hasResult, setHasResult] = useState(false);

  // SEO

  return (
    <div className="min-h-screen flex flex-col">
      
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
      
    </div>
  );
};

export default ChristmasDogMbti;
