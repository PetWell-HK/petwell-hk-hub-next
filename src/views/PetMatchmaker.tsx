"use client";

import { useTranslation } from 'react-i18next';
import PetMatchmakerQuiz from '@/components/PetMatchmakerQuiz';

const PetMatchmaker = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <main className="container mx-auto flex-1 px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-in fade-in-50 slide-in-from-top-4 duration-700 px-4">
            <h1 className="text-2xl md:text-5xl font-bold text-foreground leading-tight">
              {t('petMatchmaker.title')}
            </h1>
            <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {t('petMatchmaker.intro')}
            </p>
          </div>

          <div className="pt-8">
            <PetMatchmakerQuiz />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetMatchmaker;
