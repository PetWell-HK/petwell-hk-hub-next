import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  items: FAQItem[];
  className?: string;
  hidden?: boolean;
}

const FAQSection = ({ title = "常見問題", items, className = "", hidden = false }: FAQSectionProps) => {
  return (
    <section className={`${hidden ? 'seo-hidden' : ''} py-12 ${className}`} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {title}
      </h2>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {items.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`faq-${index}`}
              className="border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left font-semibold py-4 faq-question">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 faq-answer">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
