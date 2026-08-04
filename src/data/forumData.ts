export interface Comment {
  author: string;
  avatar: string;
  time: string;
  content: string;
}

export interface Post {
  id: number;
  author: string;
  avatar: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  comments: Comment[];
}

export const forumPosts: Post[] = [
  {
    id: 1,
    author: "陳小姐",
    avatar: "👩",
    time: "2小時前",
    title: "尖沙咀有邊間獸醫診所比較好？",
    content: "我隻貓貓最近唔太肯食嘢，想搵間好嘅獸醫診所檢查下，有冇人推薦尖沙咀附近嘅？",
    likes: 12,
    comments: [
      {
        author: "王生",
        avatar: "👨",
        time: "1小時前",
        content: "我推薦尖沙咀寵愛動物醫院，醫生好細心，收費都合理！"
      },
      {
        author: "李太太",
        avatar: "👵",
        time: "30分鐘前",
        content: "我都係帶我隻狗去嗰度，醫生真係好有耐性，推薦！"
      }
    ]
  },
  {
    id: 2,
    author: "張先生",
    avatar: "🧔",
    time: "5小時前",
    title: "上門寵物美容師推薦",
    content: "我隻狗好驚去美容店，想搵上門寵物美容師，大家有冇好介紹？",
    likes: 8,
    comments: [
      {
        author: "黃小姐",
        avatar: "👩‍🦱",
        time: "4小時前",
        content: "我一直都用PetWell搵上門美容師，可以睇到評價同價錢，好方便！"
      },
      {
        author: "林生",
        avatar: "👨‍💼",
        time: "3小時前",
        content: "我都係用PetWell，啲美容師都好專業，而且可以直接預約！"
      }
    ]
  },
  {
    id: 3,
    author: "劉太太",
    avatar: "👩‍🦳",
    time: "1天前",
    title: "貓貓打針記錄點樣整理？",
    content: "我隻貓貓去咗幾間唔同診所打針，針卡成日唔見，有咩好方法可以整理佢哋嘅健康記錄？",
    likes: 15,
    comments: [
      {
        author: "何小姐",
        avatar: "👩‍⚕️",
        time: "1天前",
        content: "我用PetWell App記錄，可以影低針卡同診症紀錄，永久保存唔怕唔見！"
      },
      {
        author: "吳生",
        avatar: "👨‍⚕️",
        time: "20小時前",
        content: "呢個App真係好好用，我全部寵物嘅健康記錄都係度，轉獸醫都唔驚講漏嘢！"
      },
      {
        author: "鄭小姐",
        avatar: "👧",
        time: "18小時前",
        content: "仲可以設定提醒功能，下次打針日期都唔會錯過！"
      }
    ]
  }
];