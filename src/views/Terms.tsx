"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("terms.title")} - PetWell HK Limited`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `${t("terms.title")}. ${t("terms.lastUpdated")}`
      );
    }
  }, [t]);

  const sections = Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      title: t(`terms.sections.${id}.title`),
      content: t(`terms.sections.${id}.content`),
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />

      <main className="flex-1 pt-6 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-[#FF7D2A]">
              {t("terms.title")}
            </h1>
            <p className="text-center text-gray-500 mb-10">
              {t("terms.lastUpdated")}
            </p>

            <div className="w-full space-y-8">
              {sections.map((section) => (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className="border-b border-gray-200 pb-8"
                >
                  <h2 className="text-left text-2xl font-semibold text-[#FF7D2A] mb-4">
                    {section.id}. {section.title}
                  </h2>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-10 border-gray-200" />
            <p className="text-sm text-center text-gray-500">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
