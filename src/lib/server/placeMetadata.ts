import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { pickLocalized, serverGraphqlFetch, type Localized } from "@/lib/server/graphqlFetch";

type PlaceKind = "restaurant" | "clinic" | "salon" | "lodging" | "mall" | "homeVisit";

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

type PlaceRecord = {
  id: string;
  name?: Localized;
  address?: Localized;
  district?: string | null;
  coverPhoto?: string | null;
  petAccessArea?: string | null;
  verified?: boolean | null;
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

export async function generatePlaceMetadata(
  kind: PlaceKind,
  id: string,
): Promise<Metadata> {
  if (!id) return fallbackMeta(kind, id);

  const data = await serverGraphqlFetch<Record<string, PlaceRecord | null>>(
    PLACE_QUERY[kind],
    { id },
    1800,
  );
  const place = data?.[DATA_KEY[kind]];
  if (!place) return fallbackMeta(kind, id);

  const name = pickLocalized(place.name);
  const address = pickLocalized(place.address);
  const district = place.district || "香港";

  switch (kind) {
    case "restaurant": {
      const indoor = place.petAccessArea === "INDOOR_ALLOWED";
      return buildMetadata({
        title: `${name} | ${district}寵物友善餐廳 | PetWell HK`,
        description: `${name}係${district}寵物友善餐廳，經PetWell認證。${indoor ? "可帶狗入室內" : "戶外用餐區"}。地址：${address}。`,
        keywords: `${name}寵物友善,${district}帶狗餐廳,${name}帶狗,寵物友善餐廳推薦`,
        path: `/restaurants/${id}`,
        ogImage: place.coverPhoto || undefined,
      });
    }
    case "clinic":
      return buildMetadata({
        title: `${name} | ${district}獸醫診所 | PetWell HK`,
        description: `${name}位於${district}。地址：${address}。查看評價、營業時間與聯絡方式。`,
        keywords: `${name},${district}獸醫,香港獸醫診所`,
        path: `/clinics/${id}`,
        ogImage: place.coverPhoto || undefined,
      });
    case "salon":
      return buildMetadata({
        title: `${name} | ${district}寵物美容 | PetWell HK`,
        description: `${name}位於${district}。地址：${address}。查看服務、評價與聯絡方式。`,
        keywords: `${name},${district}寵物美容,香港寵物美容`,
        path: `/salons/${id}`,
        ogImage: place.coverPhoto || undefined,
      });
    case "lodging":
      return buildMetadata({
        title: `${name} | ${district}寵物寄養 | PetWell HK`,
        description: `${name}位於${district}。地址：${address}。查看寄養服務與評價。`,
        keywords: `${name},${district}寵物寄養,香港寵物酒店`,
        path: `/lodging/${id}`,
        ogImage: place.coverPhoto || undefined,
      });
    case "mall":
      return buildMetadata({
        title: `${name} | ${district}寵物友善商場 | PetWell HK`,
        description: `${name}位於${district}。地址：${address}。查看寵物政策與附近友善餐廳。`,
        keywords: `${name},${district}寵物友善商場,帶狗商場`,
        path: `/malls/${id}`,
        ogImage: place.coverPhoto || undefined,
      });
    case "homeVisit":
      return buildMetadata({
        title: `${name}｜香港寵物上門服務｜PetWell HK`,
        description: `${name}提供寵物上門服務${district ? `（${district}）` : ""}。${address ? `地址：${address}。` : ""}查看服務範圍同聯絡方式。`,
        keywords: `${name},寵物上門,${district}上門獸醫,home visit`,
        path: `/home-visits/${id}`,
        ogImage: place.coverPhoto || undefined,
      });
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
