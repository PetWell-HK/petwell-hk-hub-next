import { useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: object | object[];
  faqItems?: FAQItem[];
  howToSteps?: { name: string; description: string; steps: HowToStep[] };
  speakableSelectors?: string[];
  // Article-specific meta tags (used when ogType === 'article')
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
}

const BASE_URL = 'https://petwellhk.com';
const DEFAULT_OG_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/JHL1szBw74V1hbPrOlIVhZq067C3/social-images/social-1759652520246-PetWell Logo (Instagram Post).png';

function resolveOgImageUrl(image?: string | null): string {
  if (!image || typeof image !== 'string') return DEFAULT_OG_IMAGE;
  const trimmed = image.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${BASE_URL}${trimmed}`;
  // Bare S3 keys are not scrapeable without a signed URL — fall back.
  return DEFAULT_OG_IMAGE;
}

// Store original meta values for cleanup
let originalTitle = '';
let originalDescription = '';

export const useSEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  structuredData,
  faqItems,
  howToSteps,
  speakableSelectors,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
}: SEOProps) => {
  useEffect(() => {
    // Store original values on first run
    if (!originalTitle) {
      originalTitle = document.title;
    }
    
    // Set document title
    document.title = title;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    const prevDescription = metaDescription.getAttribute('content') || '';
    if (!originalDescription) originalDescription = prevDescription;
    metaDescription.setAttribute('content', description);
    
    // Update or create meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }
    
    // Update OG tags
    const resolvedOgImage = resolveOgImageUrl(ogImage);
    updateOGTag('og:title', title);
    updateOGTag('og:description', description);
    updateOGTag('og:image', resolvedOgImage);
    updateOGTag('og:image:secure_url', resolvedOgImage);
    updateOGTag('og:type', ogType);
    updateOGTag('og:site_name', 'PetWell HK');
    updateOGTag('og:locale', 'zh_HK');
    if (canonicalUrl) {
      updateOGTag('og:url', canonicalUrl);
    }

    // Article-specific Open Graph tags
    if (ogType === 'article') {
      if (articlePublishedTime) updateOGTag('article:published_time', articlePublishedTime);
      if (articleModifiedTime) updateOGTag('article:modified_time', articleModifiedTime);
      if (articleAuthor) updateOGTag('article:author', articleAuthor);
      if (articleSection) updateOGTag('article:section', articleSection);
      if (articleTags && articleTags.length > 0) {
        // Remove existing article:tag tags then re-add
        document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
        articleTags.forEach(tag => {
          const tagMeta = document.createElement('meta');
          tagMeta.setAttribute('property', 'article:tag');
          tagMeta.setAttribute('content', tag);
          document.head.appendChild(tagMeta);
        });
      }
    }
    
    // Update Twitter cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', resolvedOgImage);
    updateMetaTag('twitter:site', '@PetWellHK');
    
    // Set canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }

    // Add hreflang tags for i18n
    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(el => el.remove());

    if (canonicalUrl) {
      // Add hreflang for Traditional Chinese (Hong Kong) - primary language
      const hreflangZh = document.createElement('link');
      hreflangZh.setAttribute('rel', 'alternate');
      hreflangZh.setAttribute('hreflang', 'zh-HK');
      hreflangZh.setAttribute('href', canonicalUrl);
      document.head.appendChild(hreflangZh);

      // Add hreflang for English
      const hreflangEn = document.createElement('link');
      hreflangEn.setAttribute('rel', 'alternate');
      hreflangEn.setAttribute('hreflang', 'en');
      hreflangEn.setAttribute('href', canonicalUrl);
      document.head.appendChild(hreflangEn);

      // Add x-default (fallback)
      const hreflangDefault = document.createElement('link');
      hreflangDefault.setAttribute('rel', 'alternate');
      hreflangDefault.setAttribute('hreflang', 'x-default');
      hreflangDefault.setAttribute('href', canonicalUrl);
      document.head.appendChild(hreflangDefault);
    }
    
    // Build combined structured data array
    const structuredDataArray: object[] = [];
    
    // Add main structured data (single schema or array of schemas)
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        structuredDataArray.push(...structuredData);
      } else {
        structuredDataArray.push(structuredData);
      }
    }
    
    // Add FAQPage schema if faqItems provided
    if (faqItems && faqItems.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };
      structuredDataArray.push(faqSchema);
    }
    
    // Add HowTo schema if howToSteps provided
    if (howToSteps) {
      const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": howToSteps.name,
        "description": howToSteps.description,
        "step": howToSteps.steps.map((step, index) => ({
          "@type": "HowToStep",
          "position": index + 1,
          "name": step.name,
          "text": step.text
        }))
      };
      structuredDataArray.push(howToSchema);
    }
    
    // Add Speakable schema if selectors provided
    if (speakableSelectors && speakableSelectors.length > 0) {
      const speakableSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": speakableSelectors
        }
      };
      structuredDataArray.push(speakableSchema);
    }
    
    // Add structured data scripts
    const scriptElements: HTMLScriptElement[] = [];
    
    // Remove existing structured data first
    const existing = document.getElementById('seo-structured-data');
    if (existing) existing.remove();
    
    if (structuredDataArray.length > 0) {
      const scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.text = JSON.stringify(structuredDataArray.length === 1 ? structuredDataArray[0] : structuredDataArray);
      scriptElement.id = 'seo-structured-data';
      document.head.appendChild(scriptElement);
      scriptElements.push(scriptElement);
    }
    
    // Cleanup on unmount
    return () => {
      if (originalTitle) {
        document.title = originalTitle;
      }
      scriptElements.forEach(el => el.remove());
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, structuredData, faqItems, howToSteps, speakableSelectors, articlePublishedTime, articleModifiedTime, articleAuthor, articleSection, articleTags]);
};

function updateOGTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function updateMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default useSEO;
