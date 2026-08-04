import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dog, Sparkles, Stethoscope, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChristmasEventList from './ChristmasEventList';

type Answer = 'a' | 'b';
type MbtiType = string; // e.g., 'ESTJ', 'ISFP', etc.
type Personality = 'party' | 'warm' | 'hea';

interface Question {
  id: number;
  question: string;
  options: {
    a: string;
    b: string;
  };
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
}

const questions: Question[] = [
  // Part 1: E vs I (Q1-Q4)
  {
    id: 1,
    question: '在屋苑樓下或電梯大堂遇到鄰居或其他狗狗時，你的狗狗通常會：',
    options: {
      a: '興奮地擺尾，想衝過去聞對方或打招呼',
      b: '躲在主人腳後，或者無視對方，只想快點回家或離開',
    },
    dimension: 'EI',
  },
  {
    id: 2,
    question: '帶去西九龍海濱長廊或彭福公園放電時：',
    options: {
      a: '滿場飛，主動找其他狗狗玩追逐戰',
      b: '只喜歡自己聞草地，或者只跟著主人走，對其他狗興趣缺缺',
    },
    dimension: 'EI',
  },
  {
    id: 3,
    question: '當家裡有客人（例如親戚朋友上門拜年）來訪時：',
    options: {
      a: '熱情如火，甚至會撲人、拿玩具出來獻寶',
      b: '吠兩聲警告，然後回自己窩裡睡覺，或者保持安全距離觀察',
    },
    dimension: 'EI',
  },
  {
    id: 4,
    question: '在香港繁忙的街道散步（如旺角、銅鑼灣），面對噪音和人流：',
    options: {
      a: '表現淡定，甚至對路人好奇，想去聞別人的購物袋',
      b: '表現緊張，尾巴下垂，想快步通過或甚至不敢行',
    },
    dimension: 'EI',
  },
  // Part 2: S vs N (Q5-Q8)
  {
    id: 5,
    question: '當你拿出零食但還沒給牠時：',
    options: {
      a: '牠只盯著你手上的零食，口水直流，完全被食物控制（專注當下實物）',
      b: '牠會看你的眼神，嘗試猜測你要牠做什麼動作才給吃（思考與聯想）',
    },
    dimension: 'SN',
  },
  {
    id: 6,
    question: '關於散步路線：',
    options: {
      a: '牠喜歡走同一條路，聞同一個消防喉或燈柱（習慣與感官）',
      b: '牠喜歡探索新路，如果走錯路或去新地方會特別興奮（探索與好奇）',
    },
    dimension: 'SN',
  },
  {
    id: 7,
    question: '狗狗對於「尋寶遊戲」（把零食藏在玩具或布裡）的反應：',
    options: {
      a: '用蠻力咬開、抓開，或者聞不到就放棄（直接行動）',
      b: '會用鼻子頂、用腳撥，甚至觀察機關怎麼開，很會動腦筋（解決問題）',
    },
    dimension: 'SN',
  },
  {
    id: 8,
    question: '牠是否擁有「第六感」？（例如打風落雨前，或你心情不好時）：',
    options: {
      a: '沒什麼感覺，照樣吃喝拉撒，除非雷聲嚇到牠',
      b: '非常敏感，天氣變壞前會不安，你傷心時會主動過來安慰',
    },
    dimension: 'SN',
  },
  // Part 3: T vs F (Q9-Q11)
  {
    id: 9,
    question: '當狗狗做錯事（例如咬爛拖鞋、隨地大小便）被你責罵時：',
    options: {
      a: '一臉「我不知道你在說什麼」或倔強不理你，甚至頂嘴（自我中心：咬東西很爽）',
      b: '立刻露出飛機耳、無辜眼，甚至翻肚肚求原諒（情感導向：不想主人生氣）',
    },
    dimension: 'TF',
  },
  {
    id: 10,
    question: '訓練新指令（如 Hand Hand、Sit）時：',
    options: {
      a: '只要有零食就肯做，沒零食就不理你（利益交換）',
      b: '為了得到你的摸摸或誇獎就會努力做，很想討好你（關係導向）',
    },
    dimension: 'TF',
  },
  {
    id: 11,
    question: '關於獨立性：',
    options: {
      a: '很有個性，你在家時牠也可以自己在另一個房間玩或睡覺',
      b: '像「貼身藥膏」，你在廁所牠都要在門口等，極度需要陪伴',
    },
    dimension: 'TF',
  },
  // Part 4: J vs P (Q12-Q15)
  {
    id: 12,
    question: '關於吃飯時間：',
    options: {
      a: '體內有時鐘，時間一到（例如每晚 7 點）準時催你放飯，晚一分鐘都不行',
      b: '比較隨意，你晚點餵也沒關係，或者放了飯也不急著馬上吃完',
    },
    dimension: 'JP',
  },
  {
    id: 13,
    question: '睡覺的地方：',
    options: {
      a: '有固定的「寶座」，一定要睡在自己的床或特定的沙發角',
      b: '隨處睡，地板、門口、你的床、甚至奇怪的角落都能睡著',
    },
    dimension: 'JP',
  },
  {
    id: 14,
    question: '散步時的表現：',
    options: {
      a: '很有規律，通常在固定的地點上廁所，走完流程就回家',
      b: '隨心所欲，今天想衝這裡，明天想停那裡，完全看心情，很難預測',
    },
    dimension: 'JP',
  },
  {
    id: 15,
    question: '對於突發狀況（例如突然要出門、突然有快遞按門鈴）：',
    options: {
      a: '會非常警惕，覺得日常秩序被破壞，需要時間平復',
      b: '馬上適應，覺得有新樂子，反應很快且靈活',
    },
    dimension: 'JP',
  },
];

// MBTI personality data with Hong Kong themed descriptions
const mbtiData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  traits: string[];
  emoji: string;
  color: string;
}> = {
  ESTJ: {
    title: '總經理狗狗',
    subtitle: 'ESTJ - 屋苑糾察隊長',
    description: '你嘅狗狗係天生嘅領袖！佢喜歡管事，堅持散步路線，對陌生狗狗有威嚴。係屋苑裡嘅糾察隊長，所有事都要按規矩嚟！',
    traits: ['有威嚴', '守規矩', '有領導力', '準時控'],
    emoji: '👔',
    color: 'from-slate-600 to-slate-800',
  },
  ESTP: {
    title: '冒險家狗狗',
    subtitle: 'ESTP - 街頭探險王',
    description: '你嘅狗狗係天生嘅冒險家！佢膽大心細，散步時周圍探索，對任何新鮮事物都充滿好奇，係街頭探險嘅王者！',
    traits: ['膽大', '愛冒險', '反應快', '好奇心強'],
    emoji: '🏄',
    color: 'from-orange-500 to-red-500',
  },
  ESFJ: {
    title: '管家狗狗',
    subtitle: 'ESFJ - 熱情大使',
    description: '你嘅狗狗係屋企嘅熱情大使！佢超鍾意招呼客人，對每個人都充滿愛心，係真正嘅社交達人，識得照顧每個人嘅感受！',
    traits: ['熱情', '愛照顧人', '社交達人', '貼心'],
    emoji: '🤗',
    color: 'from-pink-400 to-rose-500',
  },
  ESFP: {
    title: '表演家狗狗',
    subtitle: 'ESFP - 派對明星',
    description: '你嘅狗狗係天生嘅表演者！佢最鍾意做嘢逗人開心，人多嘅場合係佢嘅舞台，西九公園嘅交際花，見狗就玩，常常興奮過頭！',
    traits: ['愛表演', '開朗', '交際花', '活力充沛'],
    emoji: '🎭',
    color: 'from-amber-400 to-orange-500',
  },
  ENTJ: {
    title: '指揮官狗狗',
    subtitle: 'ENTJ - 狗界 CEO',
    description: '你嘅狗狗係天生嘅指揮官！佢聰明、有計劃、識得點樣達到目的。散步時佢話事，係狗界嘅 CEO！',
    traits: ['有策略', '領導型', '聰明', '目標為本'],
    emoji: '👑',
    color: 'from-purple-600 to-indigo-700',
  },
  ENTP: {
    title: '發明家狗狗',
    subtitle: 'ENTP - 百厭星',
    description: '你嘅狗狗非常聰明但百厭！佢會自己開門、偷食，散步時總想掙脫繩子去探險。係狗界嘅發明家，永遠有新搞作！',
    traits: ['超聰明', '百厭', '愛探索', '創意多'],
    emoji: '💡',
    color: 'from-cyan-500 to-blue-600',
  },
  ENFJ: {
    title: '導師狗狗',
    subtitle: 'ENFJ - 暖心領袖',
    description: '你嘅狗狗係天生嘅導師！佢唔單止自己乖，仲會帶其他狗狗玩。對人對狗都充滿愛心，係狗公園嘅暖心領袖！',
    traits: ['有愛心', '識照顧', '有魅力', '天生領袖'],
    emoji: '🌟',
    color: 'from-emerald-400 to-teal-500',
  },
  ENFP: {
    title: '公關狗狗',
    subtitle: 'ENFP - 陽光社交王',
    description: '你嘅狗狗係西九龍公園嘅交際花！見狗就玩，見人就 Friend，常常興奮過頭，回家後像斷電一樣。熱情到爆！',
    traits: ['超熱情', '愛交朋友', '創意多', '樂觀'],
    emoji: '🎉',
    color: 'from-yellow-400 to-amber-500',
  },
  ISTJ: {
    title: '公務員狗狗',
    subtitle: 'ISTJ - 準時乖寶寶',
    description: '你嘅狗狗係真正嘅公務員！準時吃飯，準時大便，不喜歡驚喜，忠誠但表情嚴肅嘅乖寶寶。一切都要按規矩嚟！',
    traits: ['守規矩', '準時', '忠誠', '可靠'],
    emoji: '📋',
    color: 'from-gray-500 to-gray-700',
  },
  ISTP: {
    title: '技師狗狗',
    subtitle: 'ISTP - 冷靜觀察者',
    description: '你嘅狗狗係冷靜嘅技師！佢獨立、識得解決問題，唔會大驚小怪，靜靜地觀察一切，然後用最聰明嘅方法達到目的！',
    traits: ['冷靜', '獨立', '識解難', '低調'],
    emoji: '🔧',
    color: 'from-zinc-500 to-zinc-700',
  },
  ISFJ: {
    title: '守護者狗狗',
    subtitle: 'ISFJ - 忠心小棉襖',
    description: '你嘅狗狗係真正嘅守護者！佢溫柔、忠誠、超級貼心，最鍾意陪住你，係你嘅忠心小棉襖，永遠默默守護你！',
    traits: ['忠誠', '溫柔', '貼心', '守護型'],
    emoji: '🛡️',
    color: 'from-sky-400 to-blue-500',
  },
  ISFP: {
    title: '藝術家狗狗',
    subtitle: 'ISFP - 文青小清新',
    description: '你嘅狗狗係真正嘅藝術家！在家安靜，出門隨性，有點膽小但對主人極度溫柔，喜歡在冷氣房發呆，係狗界嘅文青！',
    traits: ['文靜', '敏感', '溫柔', '愛美'],
    emoji: '🎨',
    color: 'from-rose-300 to-pink-400',
  },
  INTJ: {
    title: '策略家狗狗',
    subtitle: 'INTJ - 高冷學霸',
    description: '你嘅狗狗係狗界嘅策略家！佢超級聰明，對人對狗都比較高冷，但內心有自己嘅一套計劃，係真正嘅高冷學霸！',
    traits: ['高冷', '聰明', '有計劃', '獨立'],
    emoji: '🧠',
    color: 'from-indigo-600 to-purple-700',
  },
  INTP: {
    title: '學者狗狗',
    subtitle: 'INTP - 思考者',
    description: '你嘅狗狗係狗界嘅學者！佢好似成日都喺度諗嘢，對新事物充滿興趣，但又保持距離觀察，係安靜嘅思考者！',
    traits: ['愛思考', '好奇', '安靜', '分析型'],
    emoji: '🤔',
    color: 'from-violet-500 to-purple-600',
  },
  INFJ: {
    title: '心靈導師狗狗',
    subtitle: 'INFJ - 通靈系暖男',
    description: '你嘅狗狗有「讀心術」！佢超級敏感，你開心佢開心，你傷心佢安慰你。雖然內向，但係你嘅心靈 soulmate！',
    traits: ['敏感', '有同理心', '安靜', '忠誠'],
    emoji: '🔮',
    color: 'from-fuchsia-500 to-purple-600',
  },
  INFP: {
    title: '夢想家狗狗',
    subtitle: 'INFP - 浪漫小天使',
    description: '你嘅狗狗係純真嘅夢想家！佢溫柔、敏感、有自己嘅小世界，最鍾意安靜地依偎住你，係你嘅浪漫小天使！',
    traits: ['溫柔', '敏感', '浪漫', '純真'],
    emoji: '🦋',
    color: 'from-pink-400 to-fuchsia-500',
  },
};

// Map MBTI to personality for event recommendations
const mbtiToPersonality = (mbti: MbtiType): Personality => {
  // Extroverts with high energy → party
  // Introverts who are feeling-oriented → warm
  // Introverts who are thinking-oriented or perceiving → hea
  const partyTypes = ['ESFP', 'ENFP', 'ESTP', 'ENTP'];
  const heaTypes = ['ISTP', 'INTP', 'INTJ', 'ISFP', 'INFP'];
  
  if (partyTypes.includes(mbti)) return 'party';
  if (heaTypes.includes(mbti)) return 'hea';
  return 'warm';
};

// Shuffle function using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface DogMbtiQuizProps {
  onResultChange?: (hasResult: boolean) => void;
}

const DogMbtiQuiz = ({ onResultChange }: DogMbtiQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [mbtiResult, setMbtiResult] = useState<MbtiType | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [loadingTimeLeft, setLoadingTimeLeft] = useState(0);
  const [calculatedMbti, setCalculatedMbti] = useState<string | null>(null);
  
  // Vet inquiry modal state
  const [showVetModal, setShowVetModal] = useState(false);
  const [vetInquiryStep, setVetInquiryStep] = useState<'ask' | 'inquiry' | 'contact' | 'success'>('ask');
  const [vetInquiry, setVetInquiry] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const totalQuestions = questions.length;

  // Pre-shuffle options for display (A/B order)
  const shuffledOptions = useMemo(() => {
    return questions.map((q) => {
      const options = [
        { key: 'a' as Answer, text: q.options.a },
        { key: 'b' as Answer, text: q.options.b },
      ];
      return shuffleArray(options);
    });
  }, []);

  // Countdown timer during loading
  useEffect(() => {
    if (isCalculating && loadingTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLoadingTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCalculating && loadingTimeLeft === 0 && calculatedMbti) {
      setIsCalculating(false);
      setMbtiResult(calculatedMbti);
    }
  }, [isCalculating, loadingTimeLeft, calculatedMbti]);

  // Notify parent when result changes
  useEffect(() => {
    onResultChange?.(!!mbtiResult);
  }, [mbtiResult, onResultChange]);

  const handleAnswer = (answer: Answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: Answer[]) => {
    // Random loading time between 10-20 seconds
    const randomTime = Math.floor(Math.random() * 11) + 10;
    setLoadingTimeLeft(randomTime);
    setIsCalculating(true);
    
    // Count scores for each dimension
    let eCount = 0, iCount = 0;
    let sCount = 0, nCount = 0;
    let tCount = 0, fCount = 0;
    let jCount = 0, pCount = 0;

    finalAnswers.forEach((answer, index) => {
      const question = questions[index];
      
      if (question.dimension === 'EI') {
        if (answer === 'a') eCount++;
        else iCount++;
      } else if (question.dimension === 'SN') {
        if (answer === 'a') sCount++;
        else nCount++;
      } else if (question.dimension === 'TF') {
        if (answer === 'a') tCount++;
        else fCount++;
      } else if (question.dimension === 'JP') {
        if (answer === 'a') jCount++;
        else pCount++;
      }
    });

    // Determine each letter
    const e_or_i = eCount > iCount ? 'E' : 'I';
    const s_or_n = sCount > nCount ? 'S' : 'N';
    
    // T/F tie-breaker: use Q10 (index 9)
    let t_or_f: string;
    if (tCount > fCount) {
      t_or_f = 'T';
    } else if (fCount > tCount) {
      t_or_f = 'F';
    } else {
      t_or_f = finalAnswers[9] === 'a' ? 'T' : 'F';
    }
    
    const j_or_p = jCount > pCount ? 'J' : 'P';
    const mbti = `${e_or_i}${s_or_n}${t_or_f}${j_or_p}`;
    
    setCalculatedMbti(mbti);
  };

  const handleVetInquirySubmit = async () => {
    if (!vetInquiry.trim()) {
      toast({ title: '請輸入你嘅問題', variant: 'destructive' });
      return;
    }
    setVetInquiryStep('contact');
  };

  const handleContactSubmit = async () => {
    if (!ownerName.trim() || !ownerEmail.trim() || !ownerPhone.trim()) {
      toast({ title: '請填寫所有資料', variant: 'destructive' });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerEmail)) {
      toast({ title: '請輸入有效嘅電郵地址', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('vet_inquiries').insert({
        inquiry: vetInquiry.trim(),
        owner_name: ownerName.trim(),
        email: ownerEmail.trim(),
        phone_number: ownerPhone.trim(),
        mbti_result: calculatedMbti || mbtiResult,
      });
      
      if (error) throw error;
      
      setVetInquiryStep('success');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({ title: '提交失敗，請稍後再試', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeVetModal = () => {
    setShowVetModal(false);
    setVetInquiryStep('ask');
    setVetInquiry('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPhone('');
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setMbtiResult(null);
    setIsCalculating(false);
    setLoadingTimeLeft(0);
    setCalculatedMbti(null);
  };

  // Modal JSX (rendered at the end, outside conditionals)
  const vetModalContent = (
    <Dialog open={showVetModal} onOpenChange={(open) => { if (!open) closeVetModal(); }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <button 
          onClick={closeVetModal}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <Stethoscope className="w-5 h-5" />
            {vetInquiryStep === 'success' ? '已收到你嘅問題！' : '免費獸醫諮詢'}
          </DialogTitle>
        </DialogHeader>

        {vetInquiryStep === 'ask' && (
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              有任何關於毛孩健康嘅問題？我哋嘅專業獸醫團隊會透過 WhatsApp 或電郵回覆你！
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setVetInquiryStep('inquiry')} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                我想問問題
              </Button>
              <Button onClick={closeVetModal} variant="outline" className="flex-1">
                暫時唔需要
              </Button>
            </div>
          </div>
        )}

        {vetInquiryStep === 'inquiry' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inquiry">你想問咩？</Label>
              <Textarea
                id="inquiry"
                placeholder="例如：我隻狗狗最近食慾唔好，有咩原因？"
                value={vetInquiry}
                onChange={(e) => setVetInquiry(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleVetInquirySubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                下一步
              </Button>
              <Button onClick={() => setVetInquiryStep('ask')} variant="outline" className="flex-1">
                返回
              </Button>
            </div>
          </div>
        )}

        {vetInquiryStep === 'contact' && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              請留低你嘅聯絡資料，我哋會透過 WhatsApp 或電郵回覆你！
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">稱呼</Label>
                <Input
                  id="name"
                  placeholder="你嘅名"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">電郵</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話號碼（WhatsApp）</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9XXX XXXX"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleContactSubmit} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '提交問題'}
              </Button>
              <Button onClick={() => setVetInquiryStep('inquiry')} variant="outline" className="flex-1" disabled={isSubmitting}>
                返回
              </Button>
            </div>
          </div>
        )}

        {vetInquiryStep === 'success' && (
          <div className="space-y-4 py-4 text-center">
            <div className="text-5xl">✅</div>
            <p className="text-foreground font-medium">
              多謝你嘅查詢！
            </p>
            <p className="text-muted-foreground text-sm">
              我哋嘅獸醫團隊會盡快透過 WhatsApp 或電郵回覆你。
            </p>
            <Button onClick={closeVetModal} className="w-full bg-emerald-600 hover:bg-emerald-700">
              關閉
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Render content based on state
  const renderContent = () => {
    // Calculating animation
    if (isCalculating) {
      return (
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
            <CardContent className="p-5 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6">
              <div className="flex justify-center items-center gap-3 sm:gap-4">
                <Dog className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <Dog className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  分析緊狗狗 MBTI...
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg">
                  🐶 正在計算你狗狗嘅性格類型 🐶
                </p>
              </div>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
              
              {/* Vet Inquiry Prompt */}
              <div className="pt-4 sm:pt-6 border-t border-border">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-semibold text-base sm:text-lg">等緊？不如問問獸醫！</span>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    PetWell 提供 <span className="font-bold text-foreground">免費獸醫諮詢</span>，有任何關於毛孩健康嘅問題都可以問！
                  </p>
                  <Button 
                    onClick={() => setShowVetModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    免費問獸醫
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Result page
    if (mbtiResult) {
      const data = mbtiData[mbtiResult];
      const personality = mbtiToPersonality(mbtiResult);
      
      return (
        <div className="animate-in fade-in-50 duration-700">
          {/* Hero Result Section */}
          <div className={`bg-gradient-to-br ${data.color} py-8 sm:py-12 md:py-16 -mx-4 px-4 md:-mx-0 md:rounded-2xl mb-6 sm:mb-8`}>
            <div className="max-w-3xl mx-auto text-center text-white">
              {/* MBTI Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">{data.emoji}</span>
                <span className="font-bold text-base sm:text-lg">{mbtiResult}</span>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2">
                {data.title}
              </h2>
              <p className="text-base sm:text-xl md:text-2xl opacity-90 mb-4 sm:mb-6">{data.subtitle}</p>
              
              {/* Traits */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                {data.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-lg md:text-xl leading-relaxed opacity-95 max-w-2xl mx-auto px-2">
                {data.description}
              </p>
            </div>
          </div>

          {/* Transition text */}
          <div className="text-center mb-6 sm:mb-8 px-2">
            <p className="text-primary font-semibold text-sm sm:text-lg">
              根據你狗狗嘅 MBTI，我哋為你揀選咗最適合嘅活動
            </p>
          </div>

          {/* Event List - now integrated */}
          <div>
            <ChristmasEventList 
              mbtiResult={personality} 
              middleContent={
                <div className="max-w-xl mx-auto mt-8 sm:mt-10 mb-8 sm:mb-10">
                  <Card className="border-2 border-dashed border-muted-foreground/30">
                    <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        快啲 Share 俾朋友！睇吓大家狗狗適合去邊個活動一齊玩 🐕🎄
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                        <Button 
                          onClick={restart} 
                          variant="outline"
                          className="gap-2"
                        >
                          <Dog className="w-4 h-4" />
                          再測一次
                        </Button>
                        <Button 
                          onClick={async () => {
                            // Track share click
                            await supabase.from('mbti_share_clicks').insert({
                              mbti_result: mbtiResult,
                              source: 'christmas-dog-mbti-2025'
                            });
                            
                            if (navigator.share) {
                              navigator.share({
                                title: `我嘅狗狗係 ${mbtiResult} ${data.title}！`,
                                text: `🐶 我嘅狗狗係 ${mbtiResult} ${data.title}！快啲測試你狗狗 MBTI 再決定聖誕倒數去邊度慶祝！\n\n（🎄內附： 真。寵物友善餐廳 ｜ ✅ PetWell 科大初創已致電確認）`,
                                url: window.location.href,
                              });
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                            }
                          }}
                          className="gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          分享結果
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              }
            />
          </div>
        </div>
      );
    }

    // Quiz questions
    const question = questions[currentQuestion];

    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Progress bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              問題 {currentQuestion + 1} / {totalQuestions}
            </span>
            <span className="text-xs sm:text-sm font-medium text-primary">
              {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <Card className="border-2 border-border animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg md:text-2xl font-bold text-foreground leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-2 sm:space-y-3">
              {shuffledOptions[currentQuestion].map((option, index) => (
                <Button
                  key={option.key}
                  onClick={() => handleAnswer(option.key)}
                  variant="outline"
                  className="w-full text-left h-auto min-h-[60px] py-3 sm:py-4 md:py-5 px-3 sm:px-4 md:px-6 justify-start hover:bg-primary/10 hover:border-primary transition-all duration-300 whitespace-normal"
                >
                  <span className="flex items-start gap-2 sm:gap-3 w-full">
                    <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base leading-relaxed text-left break-words flex-1">
                      {option.text}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {vetModalContent}
    </>
  );
};

export default DogMbtiQuiz;
