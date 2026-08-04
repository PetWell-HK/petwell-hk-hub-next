import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type RestaurantSectionId = "overview" | "pet-policy" | "reviews" | "info";

interface Section {
  id: RestaurantSectionId;
  label: string;
}

interface RestaurantDetailSectionNavProps {
  sections: Section[];
  className?: string;
}

export function RestaurantDetailSectionNav({ sections, className }: RestaurantDetailSectionNavProps) {
  const [activeId, setActiveId] = useState<RestaurantSectionId>(sections[0]?.id ?? "overview");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          });
        },
        {
          rootMargin: "-40% 0px -45% 0px",
          threshold: 0,
        },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [sections]);

  const scrollTo = (id: RestaurantSectionId) => {
    const element = document.getElementById(id);
    if (!element) return;
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 72;
    const top = element.getBoundingClientRect().top + window.scrollY - offset - 48;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <nav
      className={cn("restaurant-section-nav", className)}
      aria-label="Page sections"
    >
      <div className="flex overflow-x-auto scrollbar-none">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-active={activeId === id}
            className={cn("restaurant-nav-tab")}
            onClick={() => scrollTo(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
