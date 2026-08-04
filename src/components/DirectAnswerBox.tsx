import { Card } from "@/components/ui/card";

interface DirectAnswerBoxProps {
  question: string;
  answer: string;
  className?: string;
  hidden?: boolean;
}

const DirectAnswerBox = ({ question, answer, className = "", hidden = false }: DirectAnswerBoxProps) => {
  return (
    <Card className={`${hidden ? 'seo-hidden' : ''} p-6 bg-primary/5 border-primary/20 ${className}`}>
      <h2 className="font-bold text-lg mb-2 hero-summary">{question}</h2>
      <p className="text-muted-foreground faq-answer">{answer}</p>
    </Card>
  );
};

export default DirectAnswerBox;
