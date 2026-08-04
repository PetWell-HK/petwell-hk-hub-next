export interface Review {
  id: string;
  rating: number;
  author: string;
  content: string;
  date: string;
  avatar?: string;
}

export interface Clinic {
  id: string;
  name: string;
  region: "Kowloon" | "Hong Kong" | "New Territories" | "Others";
  address: string;
  phone: string;
  rating: number;
  totalReviews: number;
  services: string[];
  image?: string;
  hasData: boolean;
  reviews: Review[];
}

export const clinics: Clinic[] = [
  {
    id: "aic-clinic",
    name: "鴨脷洲獸醫診所",
    region: "Hong Kong",
    address: "香港鴨脷洲利枝道 138 號 1 號舖",
    phone: "2548 7100",
    rating: 4.3,
    totalReviews: 24,
    hasData: true,
    services: [
      "身體檢查及健康諮詢",
      "絕育手術",
      "狗牌和預防疫苗",
      "牙齒保健",
      "預防醫學",
      "寵物出境健康證明文件",
      "安樂死和善終",
      "全面的血液檢查",
      "超聲波檢查",
      "X光檢查",
      "多普勒血壓測",
      "眼壓測量",
      "大小便檢驗",
      "院內外皮膚診斷測試",
      "獸醫處方及配方狗糧",
      "寵物營養保健品",
      "寵物醫療護理用品",
      "防蟲及杜蟲用品",
      "隔離病房"
    ],
    reviews: [
      {
        id: "r1",
        rating: 4,
        author: "中西醫獸醫",
        content: "冇診過鴨脷洲呢邊誤打誤撞都遇到好醫生 🐶 新店夠大，等睇醫生嗰時唔會好迫",
        date: "2024-09-15",
      },
      {
        id: "r2",
        rating: 5,
        author: "值得信賴嘅獸醫",
        content: "貓貓小便有血,醫生解釋得好詳細點解要驗小便,超聲波…環境乾淨。醫生姑娘十分專業",
        date: "2024-09-10",
      },
      {
        id: "r3",
        rating: 5,
        author: "Nice vet experience",
        content: "Nice staffs, doctor is very gentle to my cat to make sure she is not being overwhelmed",
        date: "2024-08-28",
      },
      {
        id: "r4",
        rating: 5,
        author: "好好既醫院",
        content: "今次到甩甩絕育 醫生順便幫佢檢查身體",
        date: "2024-08-20",
      },
      {
        id: "r5",
        rating: 4,
        author: "專業醫生",
        content: "醫生好有耐性，解釋得好清楚，狗狗都好乖",
        date: "2024-08-15",
      }
    ]
  },
  {
    id: "kowloon-vet",
    name: "九龍城獸醫診所",
    region: "Kowloon",
    address: "九龍九龍城侯王道 56 號",
    phone: "2718 2288",
    rating: 4.6,
    totalReviews: 18,
    hasData: true,
    services: [
      "全面身體檢查",
      "疫苗接種",
      "手術服務",
      "牙科護理",
      "緊急治療",
      "住院服務"
    ],
    reviews: [
      {
        id: "r6",
        rating: 5,
        author: "貓奴一名",
        content: "醫生好細心，解釋得好詳盡，貓貓都唔驚",
        date: "2024-09-18",
      },
      {
        id: "r7",
        rating: 5,
        author: "狗主推薦",
        content: "價錢合理，醫生專業，環境乾淨整潔",
        date: "2024-09-05",
      },
      {
        id: "r8",
        rating: 4,
        author: "寵物主人",
        content: "服務態度好，但等候時間較長",
        date: "2024-08-22",
      },
      {
        id: "r9",
        rating: 5,
        author: "滿意顧客",
        content: "醫生好有愛心，寵物都感受到",
        date: "2024-08-10",
      }
    ]
  },
  {
    id: "sha-tin-clinic",
    name: "沙田動物醫院",
    region: "New Territories",
    address: "新界沙田沙田正街 28-30 號",
    phone: "2605 8833",
    rating: 4.7,
    totalReviews: 32,
    hasData: true,
    services: [
      "24小時急診服務",
      "專科轉介",
      "影像診斷",
      "化驗服務",
      "寵物美容",
      "寵物用品"
    ],
    reviews: [
      {
        id: "r10",
        rating: 5,
        author: "急症救星",
        content: "半夜貓貓突然不適，好彩有24小時服務，醫生即刻處理",
        date: "2024-09-20",
      },
      {
        id: "r11",
        rating: 5,
        author: "專業團隊",
        content: "設備先進，醫生專業，價錢雖然貴啲但值得",
        date: "2024-09-12",
      },
      {
        id: "r12",
        rating: 4,
        author: "滿意的服務",
        content: "環境舒適，醫生有耐性，會繼續光顧",
        date: "2024-09-01",
      },
      {
        id: "r13",
        rating: 5,
        author: "推薦",
        content: "醫生好有經驗，狗狗做手術好成功",
        date: "2024-08-25",
      }
    ]
  },
  {
    id: "tsim-sha-tsui-vet",
    name: "尖沙咀寵物診所",
    region: "Kowloon",
    address: "九龍尖沙咀金馬倫道 48 號",
    phone: "2366 8989",
    rating: 4.4,
    totalReviews: 15,
    hasData: true,
    services: [
      "一般診症",
      "疫苗注射",
      "微晶片植入",
      "寵物護理諮詢"
    ],
    reviews: [
      {
        id: "r14",
        rating: 5,
        author: "方便快捷",
        content: "位置方便，預約容易，醫生態度好",
        date: "2024-09-16",
      },
      {
        id: "r15",
        rating: 4,
        author: "不錯的選擇",
        content: "價錢合理，服務專業",
        date: "2024-09-08",
      },
      {
        id: "r16",
        rating: 4,
        author: "推薦診所",
        content: "醫生好用心，寵物都好信任佢",
        date: "2024-08-30",
      }
    ]
  },
  {
    id: "tuen-mun-animal",
    name: "屯門動物診所",
    region: "New Territories",
    address: "新界屯門屯隆街 2-8 號",
    phone: "2466 2233",
    rating: 4.5,
    totalReviews: 21,
    hasData: true,
    services: [
      "一般門診",
      "手術服務",
      "寵物美容",
      "寄宿服務"
    ],
    reviews: [
      {
        id: "r17",
        rating: 5,
        author: "屯門居民",
        content: "住附近好方便，醫生有愛心，價錢公道",
        date: "2024-09-14",
      },
      {
        id: "r18",
        rating: 4,
        author: "好醫生",
        content: "醫生細心，解釋清楚，寵物都唔驚",
        date: "2024-09-03",
      },
      {
        id: "r19",
        rating: 5,
        author: "滿意顧客",
        content: "服務態度好，環境整潔，會再嚟",
        date: "2024-08-18",
      }
    ]
  },
  {
    id: "central-vet",
    name: "中環獸醫中心",
    region: "Hong Kong",
    address: "香港中環德輔道中 123 號",
    phone: "2523 4567",
    rating: 4.8,
    totalReviews: 45,
    hasData: true,
    services: [
      "高級健康檢查",
      "專科會診",
      "先進影像診斷",
      "24小時緊急服務",
      "寵物物理治療"
    ],
    reviews: [
      {
        id: "r20",
        rating: 5,
        author: "高質素服務",
        content: "設備一流，醫生專業，雖然貴但物有所值",
        date: "2024-09-19",
      },
      {
        id: "r21",
        rating: 5,
        author: "專業團隊",
        content: "醫生好專業，解釋好詳細，令人安心",
        date: "2024-09-11",
      },
      {
        id: "r22",
        rating: 4,
        author: "信賴的診所",
        content: "環境好，服務好，就係等候時間長咗少少",
        date: "2024-08-28",
      }
    ]
  }
];
