import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface PetwellFaqItem {
  question: string;
  answer: string;
}

const FAQ_KEYS = ["q1", "q2", "q3", "q4"] as const;

export function usePetwellFaq(): PetwellFaqItem[] {
  const { t } = useTranslation();

  return useMemo(
    () =>
      FAQ_KEYS.map((key) => ({
        question: t(`about.faq.${key}`),
        answer: t(`about.faq.a${key.slice(1)}`),
      })),
    [t],
  );
}
