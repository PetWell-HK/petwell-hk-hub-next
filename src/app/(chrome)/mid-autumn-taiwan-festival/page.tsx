import JsonLd from "@/components/seo/JsonLd";
import PageSuspense from "@/components/PageSuspense";
import Page from "@/views/MidAutumnFestivalRegistration";
import { absoluteUrl } from "@/lib/seo";

export default function RoutePage() {
  return (
    <>
      <JsonLd
        id="ld-mid-autumn-event"
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: "毛孩沉浸式台灣中秋祭",
          alternateName: "Furry Kids Immersive Taiwan Mid-Autumn Festival",
          startDate: "2026-09-25T16:00:00+08:00",
          endDate: "2026-09-27T21:00:00+08:00",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          isAccessibleForFree: true,
          inLanguage: "zh-HK",
          url: absoluteUrl("/mid-autumn-taiwan-festival"),
          image: absoluteUrl("/assets/blog-mid-autumn-pet-hk/festival-rsvp-banner.jpg"),
          location: {
            "@type": "Place",
            name: "觀塘海濱 AquaBeat 活動空間 02",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Kwun Tong Promenade",
              addressLocality: "Kwun Tong",
              addressRegion: "Kowloon",
              addressCountry: "HK",
            },
          },
          organizer: {
            "@type": "Organization",
            name: "PetWell HK Limited",
            url: "https://petwellhk.com",
          },
          offers: {
            "@type": "Offer",
            name: "入場",
            price: "0",
            priceCurrency: "HKD",
            availability: "https://schema.org/InStock",
            url: absoluteUrl("/mid-autumn-taiwan-festival"),
          },
        }}
      />
      <PageSuspense>
        <Page />
      </PageSuspense>
    </>
  );
}
