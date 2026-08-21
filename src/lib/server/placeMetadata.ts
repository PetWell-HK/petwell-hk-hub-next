import type { Metadata } from "next";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { pickLocalized, serverGraphqlFetch, type Localized } from "@/lib/server/graphqlFetch";

export type PlaceKind = "restaurant" | "clinic" | "salon" | "lodging" | "mall" | "homeVisit";

const HOURS_FIELDS = `
        availableHours {
          mon { start end }
          tue { start end }
          wed { start end }
          thu { start end }
          fri { start end }
          sat { start end }
          sun { start end }
        }`;

const PLACE_QUERY: Record<PlaceKind, string> = {
  restaurant: `
    query GetRestaurant($id: ID!) {
      getRestaurant(id: $id) {
        id
        name { zh en }
        address { zh en }
        district
        coverPhoto
        petAccessArea
        verified
        phoneNo
        website
        totalRating
        combinedRating
        location { lat lon }
        ${HOURS_FIELDS}
      }
    }
  `,
  clinic: `
    query GetClinic($id: ID!) {
      getClinic(id: $id) {
        id
        name { zh en }
        address { zh en }
        district
        coverPhoto
        verified
        phoneNo
        website
        totalRating
        numReviews
        is247
        ${HOURS_FIELDS}
      }
    }
  `,
  salon: `
    query GetSalon($id: ID!) {
      getSalon(id: $id) {
        id
        name { zh en }
        address { zh en }
        district
        coverPhoto
        verified
        phoneNo
        website
        totalRating
        numReviews
        ${HOURS_FIELDS}
      }
    }
  `,
  lodging: `
    query GetLodging($id: ID!) {
      getLodging(id: $id) {
        id
        name { zh en }
        address { zh en }
        district
        coverPhoto
        verified
        phoneNo
        website
        totalRating
        numReviews
        ${HOURS_FIELDS}
      }
    }
  `,
  mall: `
    query GetMall($id: ID!) {
      getMall(id: $id) {
        id
        name { zh en }
        address { zh en }
        district
        coverPhoto
        phoneNo
        website
        petsAllowed
        petMovementMode
        location { lat lon }
        ${HOURS_FIELDS}
      }
    }
  `,
  homeVisit: `
    query GetHomeVisitProvider($id: ID!) {
      getHomeVisitProvider(id: $id) {
        id
        name { zh en }
        address { zh en }
        district
        coverPhoto
        verified
        phoneNo
        website
        totalRating
        numReviews
        location { lat lon }
        ${HOURS_FIELDS}
      }
    }
  `,
};

const DATA_KEY: Record<PlaceKind, string> = {
  restaurant: "getRestaurant",
  clinic: "getClinic",
  salon: "getSalon",
  lodging: "getLodging",
  mall: "getMall",
  homeVisit: "getHomeVisitProvider",
};

const PATH_PREFIX: Record<PlaceKind, string> = {
  restaurant: "/restaurants",
  clinic: "/clinics",
  salon: "/salons",
  lodging: "/lodging",
  mall: "/malls",
  homeVisit: "/home-visits",
};

const LIST_LABEL: Record<PlaceKind, string> = {
  restaurant: "寵物友善餐廳",
  clinic: "獸醫診所",
  salon: "寵物美容",
  lodging: "寵物寄養",
  mall: "寵物友善商場",
  homeVisit: "寵物上門服務",
};

const SCHEMA_TYPE: Record<PlaceKind, string> = {
  restaurant: "Restaurant",
  clinic: "VeterinaryCare",
  salon: "PetStore",
  lodging: "LodgingBusiness",
  mall: "ShoppingCenter",
  homeVisit: "ProfessionalService",
};

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAY_NAMES: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type PlaceRecord = {
  id: string;
  name?: Localized;
  address?: Localized;
  district?: string | null;
  coverPhoto?: string | null;
  petAccessArea?: string | null;
  verified?: boolean | null;
  phoneNo?: string | null;
  website?: string | null;
  totalRating?: number | null;
  combinedRating?: number | null;
  numReviews?: number | null;
  is247?: boolean | null;
  petsAllowed?: string | null;
  petMovementMode?: string | null;
  location?: { lat?: number | null; lon?: number | null } | null;
  availableHours?: Partial<Record<DayKey, { start?: string | null; end?: string | null } | null>> | null;
};

type PlaceSeo = {
  metadata: Metadata;
  jsonLd: object[] | null;
};

function fallbackMeta(kind: PlaceKind, id: string): Metadata {
  const labels: Record<PlaceKind, { title: string; description: string }> = {
    restaurant: {
      title: "寵物友善餐廳詳情 | PetWell HK",
      description: "查看寵物友善餐廳詳細資料及寵物政策",
    },
    clinic: {
      title: "獸醫診所詳情 | PetWell HK",
      description: "查看獸醫診所詳情、評價與聯絡資訊",
    },
    salon: {
      title: "寵物美容店詳情 | PetWell HK",
      description: "查看寵物美容店詳情與評價",
    },
    lodging: {
      title: "寵物寄養詳情 | PetWell HK",
      description: "查看寵物寄養／住宿詳情與評價",
    },
    mall: {
      title: "寵物友善商場詳情 | PetWell HK",
      description: "查看商場寵物政策與附近餐廳",
    },
    homeVisit: {
      title: "寵物上門服務詳情 | PetWell HK",
      description: "查看香港寵物上門服務詳細資料、服務範圍同聯絡方式",
    },
  };

  return buildMetadata({
    title: labels[kind].title,
    description: labels[kind].description,
    path: `${PATH_PREFIX[kind]}/${id}`,
  });
}

function openingHours(hours: PlaceRecord["availableHours"]) {
  if (!hours) return undefined;
  const days: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const specs = days.flatMap((day) => {
    const slot = hours[day];
    if (!slot?.start || !slot?.end) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES[day],
        opens: slot.start,
        closes: slot.end,
      },
    ];
  });
  return specs.length > 0 ? specs : undefined;
}

function placeJsonLd(kind: PlaceKind, place: PlaceRecord, meta: {
  name: string;
  address: string;
  district: string;
  description: string;
  path: string;
}): object[] {
  const url = absoluteUrl(meta.path);
  const ratingValue = place.combinedRating || place.totalRating;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[kind],
    "@id": `${url}#place`,
    name: meta.name,
    description: meta.description,
    url,
    image: place.coverPhoto || undefined,
    telephone: place.phoneNo || undefined,
    sameAs: place.website || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: meta.address || undefined,
      addressLocality: meta.district,
      addressRegion: "Hong Kong",
      addressCountry: "HK",
    },
  };

  if (place.location?.lat != null && place.location?.lon != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: place.location.lat,
      longitude: place.location.lon,
    };
  }

  const hours = openingHours(place.availableHours);
  if (hours) schema.openingHoursSpecification = hours;

  if (kind === "restaurant") {
    schema.servesCuisine = "Pet Friendly Dining";
    schema.amenityFeature = {
      "@type": "LocationFeatureSpecification",
      name: place.petAccessArea === "INDOOR_ALLOWED" ? "Indoor pet access" : "Outdoor pet dining",
      value: true,
    };
  }

  if (ratingValue && ratingValue > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount: Math.max(1, place.numReviews || 1),
      bestRating: 5,
      worstRating: 1,
    };
  }

  return [
    breadcrumbJsonLd([
      { name: "首頁", path: "/" },
      { name: LIST_LABEL[kind], path: PATH_PREFIX[kind] },
      { name: meta.name, path: meta.path },
    ]),
    schema,
  ];
}

function buildPlaceSeo(kind: PlaceKind, place: PlaceRecord): PlaceSeo {
  const name = pickLocalized(place.name) || LIST_LABEL[kind];
  const address = pickLocalized(place.address);
  const district = place.district || "香港";
  const ogImage = place.coverPhoto || undefined;
  const path = `${PATH_PREFIX[kind]}/${place.id}`;

  let title: string;
  let description: string;
  let keywords: string;

  switch (kind) {
    case "restaurant": {
      const indoor = place.petAccessArea === "INDOOR_ALLOWED";
      title = `${name} | ${district}寵物友善餐廳 | PetWell HK`;
      description = `${name}係${district}寵物友善餐廳，經PetWell認證。${indoor ? "可帶狗入室內" : "戶外用餐區"}。地址：${address}。`;
      keywords = `${name}寵物友善,${district}帶狗餐廳,${name}帶狗,寵物友善餐廳推薦`;
      break;
    }
    case "clinic":
      title = `${name} | ${district}獸醫診所 | PetWell HK`;
      description = `${name}位於${district}。${place.is247 ? "提供24小時服務。" : ""}地址：${address}。查看評價、營業時間與聯絡方式。`;
      keywords = `${name},${district}獸醫,香港獸醫診所${place.is247 ? ",24小時獸醫" : ""}`;
      break;
    case "salon":
      title = `${name} | ${district}寵物美容 | PetWell HK`;
      description = `${name}位於${district}。地址：${address}。查看服務、評價與聯絡方式。`;
      keywords = `${name},${district}寵物美容,香港寵物美容`;
      break;
    case "lodging":
      title = `${name} | ${district}寵物寄養 | PetWell HK`;
      description = `${name}位於${district}。地址：${address}。查看寄養服務與評價。`;
      keywords = `${name},${district}寵物寄養,香港寵物酒店`;
      break;
    case "mall":
      title = `${name} | ${district}寵物友善商場 | PetWell HK`;
      description = `${name}位於${district}。地址：${address}。查看寵物政策與附近友善餐廳。`;
      keywords = `${name},${district}寵物友善商場,帶狗商場`;
      break;
    case "homeVisit":
      title = `${name}｜香港寵物上門服務｜PetWell HK`;
      description = `${name}提供寵物上門服務${district ? `（${district}）` : ""}。${address ? `地址：${address}。` : ""}查看服務範圍同聯絡方式。`;
      keywords = `${name},寵物上門,${district}上門獸醫,home visit`;
      break;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }

  return {
    metadata: buildMetadata({
      title,
      description,
      keywords,
      path,
      ogImage,
    }),
    jsonLd: placeJsonLd(kind, place, { name, address, district, description, path }),
  };
}

async function loadPlaceSeo(kind: PlaceKind, id: string): Promise<PlaceSeo> {
  if (!id) {
    return { metadata: fallbackMeta(kind, id), jsonLd: null };
  }

  const data = await serverGraphqlFetch<Record<string, PlaceRecord | null>>(
    PLACE_QUERY[kind],
    { id },
    1800,
  );
  const place = data?.[DATA_KEY[kind]];
  if (!place) {
    return { metadata: fallbackMeta(kind, id), jsonLd: null };
  }

  return buildPlaceSeo(kind, place);
}

export async function generatePlaceMetadata(
  kind: PlaceKind,
  id: string,
): Promise<Metadata> {
  return (await loadPlaceSeo(kind, id)).metadata;
}

export async function generatePlaceJsonLd(
  kind: PlaceKind,
  id: string,
): Promise<object[] | null> {
  return (await loadPlaceSeo(kind, id)).jsonLd;
}
