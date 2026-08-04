import { useRef } from "react";
import { useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { STAT_GROUPS, type ResultMetricKey } from "@/data/otherServicesConfig";
import { parseMetricValue } from "@/lib/parseMetricValue";
import { CountUp } from "@/components/other-services/ScrollReveal";

const ALL_METRIC_KEYS = STAT_GROUPS.flatMap((group) => group.keys);

function MetricValue({
  metricKey,
  raw,
  active,
  delay,
}: {
  metricKey: ResultMetricKey;
  raw: string;
  active: boolean;
  delay: number;
}) {
  if (metricKey === "appStoreTop") {
    return (
      <CountUp
        value={9}
        prefix="Top "
        duration={1.4}
        delay={delay}
        active={active}
        className="os-stat-item__value"
      />
    );
  }

  const parsed = parseMetricValue(raw);
  if (parsed.kind === "text") {
    return <span className="os-stat-item__value">{parsed.text}</span>;
  }

  return (
    <CountUp
      value={parsed.value}
      prefix={parsed.prefix}
      suffix={parsed.suffix}
      duration={1.8}
      delay={delay}
      active={active}
      className="os-stat-item__value"
    />
  );
}

function StatItem({
  metricKey,
  active,
  index,
}: {
  metricKey: ResultMetricKey;
  active: boolean;
  index: number;
}) {
  const { t } = useTranslation();
  const raw = t(`otherServices.results.${metricKey}.value`);
  const delay = index * 0.07;

  return (
    <div className="os-stat-item">
      <MetricValue metricKey={metricKey} raw={raw} active={active} delay={delay} />
      <p className="os-stat-item__label">{t(`otherServices.results.${metricKey}.label`)}</p>
    </div>
  );
}

const StatsSection = () => {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(gridRef, {
    once: true,
    amount: 0.15,
    margin: "0px 0px -60px 0px",
  });

  return (
    <section className="os-section os-section--stats" aria-labelledby="os-stats-heading">
      <div className="container mx-auto px-6 md:px-10 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="os-eyebrow os-eyebrow--center">{t("otherServices.results.eyebrow")}</p>
          <h2 id="os-stats-heading" className="os-section-heading mt-2">
            {t("otherServices.results.title")}
          </h2>
          <p className="os-section-lead mx-auto mt-2">{t("otherServices.results.subtitle")}</p>
        </div>

        <div ref={gridRef} className="os-stats-grid mx-auto mt-8 max-w-5xl md:mt-10">
          {ALL_METRIC_KEYS.map((key, index) => (
            <StatItem key={key} metricKey={key} active={statsInView} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
