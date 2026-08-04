export interface VolunteerEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  duration: string;
  spotsAvailable: number;
  description: string;
  requirements: string[];
}

export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  donorsCount: number;
  endDate: string;
  imageUrl?: string;
}

export interface NGO {
  id: string;
  name: string;
  nameEn: string;
  region: "Kowloon" | "Hong Kong" | "New Territories" | "All Regions";
  address: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  descriptionEn: string;
  mission: string;
  missionEn: string;
  services: string[];
  servicesEn: string[];
  donationCampaigns: DonationCampaign[];
  volunteerEvents: VolunteerEvent[];
  logo?: string;
  established?: string;
}

export const ngos: NGO[] = [
  {
    id: "spca-hk",
    name: "香港愛護動物協會",
    nameEn: "SPCA Hong Kong",
    region: "All Regions",
    address: "香港灣仔軒尼詩道 15 號",
    phone: "2802 0501",
    email: "info@spca.org.hk",
    website: "https://www.spca.org.hk",
    description: "香港愛護動物協會致力於防止虐待動物，推廣善待動物的意識，並為無家可歸的動物尋找愛心家庭。",
    descriptionEn: "SPCA Hong Kong is dedicated to preventing cruelty to animals, promoting kindness, and finding homes for homeless animals.",
    mission: "透過教育、倡議和直接動物福利工作，建立一個尊重和保護所有動物的社會。",
    missionEn: "To build a society that respects and protects all animals through education, advocacy, and direct animal welfare work.",
    services: [
      "動物領養服務",
      "動物拯救及緊急救援",
      "獸醫診所服務",
      "社區外展計劃",
      "教育講座及工作坊"
    ],
    servicesEn: [
      "Animal Adoption Services",
      "Animal Rescue & Emergency Response",
      "Veterinary Clinic Services",
      "Community Outreach Programs",
      "Educational Talks & Workshops"
    ],
    established: "1903",
    donationCampaigns: [
      {
        id: "spca-winter-fund",
        title: "冬季關懷基金",
        description: "為流浪動物提供溫暖的冬季庇護和醫療照顧",
        goalAmount: 500000,
        currentAmount: 352000,
        donorsCount: 428,
        endDate: "2025-12-31"
      },
      {
        id: "spca-medical-fund",
        title: "緊急醫療基金",
        description: "支持受傷和生病動物的緊急治療",
        goalAmount: 300000,
        currentAmount: 198000,
        donorsCount: 256,
        endDate: "2025-12-31"
      }
    ],
    volunteerEvents: [
      {
        id: "spca-walk-dogs",
        title: "週末遛狗義工",
        date: "2025-12-07",
        location: "SPCA 灣仔中心",
        duration: "2小時",
        spotsAvailable: 8,
        description: "陪伴庇護所的狗狗散步，給予牠們運動和社交的機會",
        requirements: ["18歲或以上", "有遛狗經驗", "需要參加簡介會"]
      },
      {
        id: "spca-cat-care",
        title: "貓咪照顧義工",
        date: "2025-12-14",
        location: "SPCA 灣仔中心",
        duration: "3小時",
        spotsAvailable: 5,
        description: "協助照顧貓舍的貓咪，包括清潔、餵食和陪玩",
        requirements: ["16歲或以上", "喜愛貓咪", "有耐性"]
      }
    ]
  },
  {
    id: "hk-dog-rescue",
    name: "香港拯救貓狗協會",
    nameEn: "Hong Kong Dog Rescue",
    region: "New Territories",
    address: "新界大埔運頭角里 15 號",
    phone: "2483 1000",
    email: "info@hkdr.org",
    website: "https://www.hkdr.org",
    description: "專注於拯救和重新安置被遺棄和虐待的狗隻，並推廣負責任的寵物飼養文化。",
    descriptionEn: "Focused on rescuing and rehoming abandoned and abused dogs, promoting responsible pet ownership.",
    mission: "為每一隻被遺棄的狗尋找充滿愛的永久家庭，並教育公眾負責任飼養的重要性。",
    missionEn: "To find loving forever homes for every abandoned dog and educate the public on responsible pet ownership.",
    services: [
      "狗隻拯救及領養",
      "寄養服務",
      "絕育手術計劃",
      "行為訓練課程",
      "社區教育活動"
    ],
    servicesEn: [
      "Dog Rescue & Adoption",
      "Foster Care Services",
      "Spay/Neuter Programs",
      "Behavioral Training",
      "Community Education"
    ],
    established: "2003",
    donationCampaigns: [
      {
        id: "hkdr-kennel-upgrade",
        title: "犬舍升級計劃",
        description: "改善犬舍設施，為狗狗提供更好的生活環境",
        goalAmount: 800000,
        currentAmount: 456000,
        donorsCount: 312,
        endDate: "2026-03-31"
      },
      {
        id: "hkdr-food-fund",
        title: "狗糧及醫療基金",
        description: "為拯救的狗隻提供優質狗糧和必要的醫療照顧",
        goalAmount: 200000,
        currentAmount: 167000,
        donorsCount: 189,
        endDate: "2025-12-31"
      }
    ],
    volunteerEvents: [
      {
        id: "hkdr-adoption-day",
        title: "領養日義工",
        date: "2025-12-08",
        location: "大埔領養中心",
        duration: "全日",
        spotsAvailable: 12,
        description: "協助舉辦領養日活動，幫助狗狗找到新家",
        requirements: ["18歲或以上", "善於溝通", "喜愛狗隻"]
      },
      {
        id: "hkdr-facility-clean",
        title: "設施清潔義工",
        date: "2025-12-15",
        location: "大埔中心",
        duration: "4小時",
        spotsAvailable: 10,
        description: "協助清潔犬舍和維護設施",
        requirements: ["16歲或以上", "不怕辛勞", "有團隊精神"]
      }
    ]
  },
  {
    id: "laa-hk",
    name: "香港群貓會",
    nameEn: "Lifelong Animal Protection Charity",
    region: "Kowloon",
    address: "九龍觀塘道 123 號",
    phone: "2338 4452",
    email: "info@laa.org.hk",
    website: "https://www.laa.org.hk",
    description: "專注於社區貓隻的絕育、放回及管理計劃，以及流浪貓的拯救和領養。",
    descriptionEn: "Specializing in Trap-Neuter-Return programs for community cats, and rescue and adoption of stray cats.",
    mission: "透過人道管理方法，減少流浪貓的數量，並改善社區貓隻的生活質素。",
    missionEn: "To reduce stray cat populations through humane management and improve the quality of life for community cats.",
    services: [
      "社區貓絕育計劃",
      "流浪貓拯救",
      "貓隻領養服務",
      "餵養者教育課程",
      "貓隻健康檢查"
    ],
    servicesEn: [
      "Community Cat TNR Program",
      "Stray Cat Rescue",
      "Cat Adoption Services",
      "Feeder Education",
      "Cat Health Checks"
    ],
    established: "2010",
    donationCampaigns: [
      {
        id: "laa-tnr-fund",
        title: "社區貓絕育基金",
        description: "支持社區貓的絕育手術和醫療照顧",
        goalAmount: 400000,
        currentAmount: 289000,
        donorsCount: 367,
        endDate: "2025-12-31"
      },
      {
        id: "laa-cat-shelter",
        title: "貓舍擴建計劃",
        description: "擴建貓舍設施，收容更多需要幫助的貓咪",
        goalAmount: 600000,
        currentAmount: 234000,
        donorsCount: 156,
        endDate: "2026-06-30"
      }
    ],
    volunteerEvents: [
      {
        id: "laa-feeding-volunteer",
        title: "社區貓餵養義工",
        date: "2025-12-10",
        location: "觀塘區多個餵養點",
        duration: "2小時",
        spotsAvailable: 6,
        description: "協助餵養社區貓並觀察牠們的健康狀況",
        requirements: ["18歲或以上", "有愛心及耐性", "願意定期參與"]
      },
      {
        id: "laa-tnr-assist",
        title: "絕育計劃助手",
        date: "2025-12-12",
        location: "觀塘中心",
        duration: "半日",
        spotsAvailable: 4,
        description: "協助進行社區貓的捕捉、絕育及放回工作",
        requirements: ["21歲或以上", "有相關經驗優先", "體力良好"]
      }
    ]
  },
  {
    id: "paw-guardian",
    name: "毛孩守護者",
    nameEn: "Paw Guardian Society",
    region: "Hong Kong",
    address: "香港西營盤德輔道西 456 號",
    phone: "2857 6688",
    email: "contact@pawguardian.hk",
    website: "https://www.pawguardian.hk",
    description: "致力於拯救被遺棄的小動物，包括兔子、天竺鼠、龍貓等，並推廣適切的小動物護理知識。",
    descriptionEn: "Dedicated to rescuing abandoned small animals including rabbits, guinea pigs, and chinchillas, promoting proper small animal care.",
    mission: "為每一隻小動物找到愛護牠們的家庭，並教育公眾正確的小動物飼養知識。",
    missionEn: "To find loving homes for every small animal and educate the public on proper small animal care.",
    services: [
      "小動物拯救及領養",
      "飼養諮詢服務",
      "小動物醫療支援",
      "教育工作坊",
      "寄養網絡"
    ],
    servicesEn: [
      "Small Animal Rescue & Adoption",
      "Care Consultation",
      "Medical Support",
      "Educational Workshops",
      "Foster Network"
    ],
    established: "2015",
    donationCampaigns: [
      {
        id: "paw-medical",
        title: "小動物醫療基金",
        description: "為被拯救的小動物提供必要的醫療照顧",
        goalAmount: 150000,
        currentAmount: 98000,
        donorsCount: 178,
        endDate: "2025-12-31"
      },
      {
        id: "paw-education",
        title: "教育推廣計劃",
        description: "舉辦學校講座和社區工作坊，推廣正確飼養知識",
        goalAmount: 80000,
        currentAmount: 52000,
        donorsCount: 94,
        endDate: "2026-03-31"
      }
    ],
    volunteerEvents: [
      {
        id: "paw-care-volunteer",
        title: "小動物照顧義工",
        date: "2025-12-09",
        location: "西營盤中心",
        duration: "3小時",
        spotsAvailable: 8,
        description: "協助照顧兔子、天竺鼠等小動物",
        requirements: ["16歲或以上", "細心有耐性", "喜愛小動物"]
      },
      {
        id: "paw-workshop-assist",
        title: "工作坊助手",
        date: "2025-12-21",
        location: "社區中心",
        duration: "2小時",
        spotsAvailable: 4,
        description: "協助舉辦小動物護理工作坊",
        requirements: ["18歲或以上", "有小動物飼養經驗", "善於溝通"]
      }
    ]
  },
  {
    id: "animals-asia",
    name: "亞洲動物基金",
    nameEn: "Animals Asia Foundation",
    region: "All Regions",
    address: "香港九龍觀塘巧明街 117 號",
    phone: "2791 2225",
    email: "hk@animalsasia.org",
    website: "https://www.animalsasia.org",
    description: "致力於終止亞洲地區的動物虐待行為，特別關注熊隻保護、貓狗福利及動物友善政策倡議。",
    descriptionEn: "Working to end animal cruelty across Asia, with focus on bear rescue, cat and dog welfare, and animal-friendly policy advocacy.",
    mission: "為亞洲的動物帶來尊嚴、尊重和喜愛，透過教育及倡議改變人們對待動物的態度。",
    missionEn: "To bring dignity, respect and love to animals across Asia through education and advocacy to change attitudes.",
    services: [
      "動物福利倡議",
      "教育及培訓計劃",
      "動物行為諮詢",
      "政策研究及推廣",
      "國際合作項目"
    ],
    servicesEn: [
      "Animal Welfare Advocacy",
      "Education & Training",
      "Animal Behavior Consultation",
      "Policy Research & Promotion",
      "International Cooperation"
    ],
    established: "1998",
    donationCampaigns: [
      {
        id: "aa-bear-rescue",
        title: "黑熊拯救計劃",
        description: "拯救養熊場的黑熊，為牠們提供終生照顧",
        goalAmount: 2000000,
        currentAmount: 1456000,
        donorsCount: 892,
        endDate: "2026-12-31"
      },
      {
        id: "aa-education",
        title: "動物友善教育基金",
        description: "在學校和社區推廣動物福利教育",
        goalAmount: 500000,
        currentAmount: 328000,
        donorsCount: 445,
        endDate: "2025-12-31"
      }
    ],
    volunteerEvents: [
      {
        id: "aa-event-support",
        title: "公眾活動支援義工",
        date: "2025-12-14",
        location: "觀塘辦公室",
        duration: "4小時",
        spotsAvailable: 15,
        description: "協助舉辦公眾教育活動和籌款活動",
        requirements: ["18歲或以上", "善於溝通", "有團隊合作精神"]
      },
      {
        id: "aa-office-help",
        title: "辦公室行政義工",
        date: "2025-12-18",
        location: "觀塘辦公室",
        duration: "3小時",
        spotsAvailable: 5,
        description: "協助文書處理、數據整理等行政工作",
        requirements: ["18歲或以上", "熟悉電腦操作", "中英文良好"]
      }
    ]
  },
  {
    id: "sai-kung-stray",
    name: "西貢流浪動物之家",
    nameEn: "Sai Kung Stray Friends",
    region: "New Territories",
    address: "新界西貢惠民路 88 號",
    phone: "2792 1122",
    email: "info@skstray.org",
    website: "https://www.skstray.org",
    description: "專注於西貢區的流浪動物救援、領養及社區動物管理工作。",
    descriptionEn: "Focusing on stray animal rescue, adoption, and community animal management in Sai Kung district.",
    mission: "建立一個人與動物和諧共處的社區，透過救援、絕育及教育減少流浪動物問題。",
    missionEn: "To build a harmonious community where humans and animals coexist through rescue, sterilization, and education.",
    services: [
      "流浪動物救援",
      "領養配對服務",
      "社區絕育計劃",
      "寄養家庭支援",
      "動物行為評估"
    ],
    servicesEn: [
      "Stray Animal Rescue",
      "Adoption Matching",
      "Community Sterilization",
      "Foster Family Support",
      "Animal Behavior Assessment"
    ],
    established: "2012",
    donationCampaigns: [
      {
        id: "skstray-facility",
        title: "收容所維護基金",
        description: "維護和改善收容所設施，為動物提供更好的生活環境",
        goalAmount: 350000,
        currentAmount: 198000,
        donorsCount: 223,
        endDate: "2026-01-31"
      },
      {
        id: "skstray-medical",
        title: "獸醫醫療支援",
        description: "支付拯救動物的醫療費用和絕育手術",
        goalAmount: 180000,
        currentAmount: 134000,
        donorsCount: 167,
        endDate: "2025-12-31"
      }
    ],
    volunteerEvents: [
      {
        id: "skstray-beach-clean",
        title: "海灘清潔日",
        date: "2025-12-07",
        location: "西貢海灘",
        duration: "3小時",
        spotsAvailable: 20,
        description: "清潔海灘垃圾，保護海岸生態和動物棲息地",
        requirements: ["12歲或以上（未成年需家長陪同）", "穿著合適服裝", "自備手套"]
      },
      {
        id: "skstray-animal-care",
        title: "動物照顧及散步義工",
        date: "2025-12-13",
        location: "西貢收容所",
        duration: "2小時",
        spotsAvailable: 10,
        description: "陪伴和照顧收容所的狗貓",
        requirements: ["16歲或以上", "喜愛動物", "有責任心"]
      }
    ]
  }
];
