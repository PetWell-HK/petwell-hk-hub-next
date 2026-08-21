import { useState, useEffect } from 'react';
import AppLink from "@/components/AppLink";
import { ChevronRight, Truck, Crown } from 'lucide-react';

const banners = [
  {
    id: 'member',
    icon: Crown,
    text: 'PetWell 會員享 9 折優惠',
    linkText: '了解更多',
    link: '/petwell-member',
    bgClass: 'bg-orange-100',
    textClass: 'text-primary',
  },
  {
    id: 'shipping',
    icon: Truck,
    text: '滿 HK$200 免運費',
    linkText: '',
    link: '',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
];

const PromoBannerRotator = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentBanner = banners[currentIndex];
  const Icon = currentBanner.icon;

  return (
    <div className="fixed top-[72px] left-0 right-0 z-40 overflow-hidden h-10">
      <div
        className={`absolute inset-0 flex items-center justify-center px-4 py-2 transition-all duration-300 ${
          currentBanner.bgClass
        } ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${currentBanner.textClass}`} />
          <span className={`text-sm font-medium ${currentBanner.textClass}`}>
            {currentBanner.text}
          </span>
          {currentBanner.link && (
            <AppLink
              href={currentBanner.link}
              className="text-sm font-semibold text-white bg-primary px-2 py-0.5 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-0.5"
            >
              {currentBanner.linkText}
              <ChevronRight className="w-3 h-3" />
            </AppLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoBannerRotator;
