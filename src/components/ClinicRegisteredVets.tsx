"use client";

import { Stethoscope } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useClinicGovVets } from "@/hooks/useClinicGovVets";

type ClinicRegisteredVetsProps = {
  clinicId: string;
};

function displayName(
  vet: { nameEn: string | null; nameZh: string | null },
  lang: "zh" | "en",
): string {
  if (lang === "zh") return vet.nameZh || vet.nameEn || "";
  return vet.nameEn || vet.nameZh || "";
}

export default function ClinicRegisteredVets({ clinicId }: ClinicRegisteredVetsProps) {
  const { t, i18n } = useTranslation();
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";
  const { data, isLoading, isError } = useClinicGovVets(clinicId);
  const vets = data?.vets || [];

  if (isLoading || isError || vets.length === 0) return null;

  const sourceName = lang === "en" ? data?.source?.nameEn : data?.source?.nameZh;
  const sourceUrl = data?.source?.url || "https://www.vsbhk.org.hk/tc_chi/vsro/vsro.html";

  return (
    <section aria-labelledby="clinic-registered-vets-heading">
      <Card className="p-5 md:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="clinic-registered-vets-heading" className="text-xl md:text-2xl font-bold">
              {t("clinics.detail.registeredVetsTitle")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("clinics.detail.registeredVetsSubtitle", { count: vets.length })}
            </p>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {vets.map((vet) => {
            const name = displayName(vet, lang);
            return (
              <li key={vet.vsbRegNo} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-semibold leading-snug">{name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{vet.vsbRegNo}</p>
                </div>
                {vet.nameZh && vet.nameEn && lang === "zh" && vet.nameEn !== vet.nameZh && (
                  <p className="text-sm text-muted-foreground mt-0.5">{vet.nameEn}</p>
                )}
                {vet.qualifications && (
                  <p className="text-sm text-muted-foreground mt-1">{vet.qualifications}</p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-muted-foreground mt-4">
          {t("clinics.detail.registeredVetsSource")}{" "}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {sourceName || t("clinics.detail.registeredVetsSourceName")}
          </a>
        </p>
      </Card>
    </section>
  );
}
