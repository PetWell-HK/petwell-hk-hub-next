import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dog, Cat, Bird, Rabbit, Fish } from 'lucide-react';

type Answer = 'a' | 'b' | 'c' | 'd' | 'e';
type Outcome = 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile';

const outcomeMap: Record<Answer, Outcome> = {
  a: 'dog',
  b: 'cat',
  c: 'bird',
  d: 'rabbit',
  e: 'reptile',
};

const outcomeIcons: Record<Outcome, React.ReactNode> = {
  dog: <Dog className="w-20 h-20" />,
  cat: <Cat className="w-20 h-20" />,
  bird: <Bird className="w-20 h-20" />,
  rabbit: <Rabbit className="w-20 h-20" />,
  reptile: <Fish className="w-20 h-20" />,
};

const PetMatchmakerQuiz = () => {
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<Outcome | null>(null);

  const questions = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const totalQuestions = questions.length;

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
    const counts: Record<Outcome, number> = {
      dog: 0,
      cat: 0,
      bird: 0,
      rabbit: 0,
      reptile: 0,
    };

    finalAnswers.forEach((answer) => {
      const outcome = outcomeMap[answer];
      counts[outcome]++;
    });

    const maxCount = Math.max(...Object.values(counts));
    const winner = (Object.keys(counts) as Outcome[]).find(
      (key) => counts[key] === maxCount
    ) as Outcome;

    setResult(winner);
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in-50 duration-700 px-4">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardContent className="p-6 md:p-12 text-center space-y-6">
            <div className="flex justify-center text-primary animate-in zoom-in-50 duration-500">
              {outcomeIcons[result]}
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">
              {t(`petMatchmaker.outcomes.${result}.title`)}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {t(`petMatchmaker.outcomes.${result}.description`)}
            </p>
            <Button onClick={restart} size="lg" className="mt-6 w-full md:w-auto">
              {t('petMatchmaker.restart')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questionKey = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-muted-foreground">
            {t('petMatchmaker.question')} {currentQuestion + 1} {t('petMatchmaker.of')} {totalQuestions}
          </span>
          <span className="text-xs md:text-sm font-medium text-primary">
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

      <Card className="border-2 border-border animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        <CardContent className="p-5 md:p-8 space-y-6">
          <h3 className="text-lg md:text-2xl font-bold text-foreground leading-relaxed">
            {t(`petMatchmaker.questions.${questionKey}.question`)}
          </h3>

          <div className="space-y-3">
            {(['a', 'b', 'c', 'd', 'e'] as Answer[]).map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="w-full text-left h-auto py-3 md:py-4 px-4 md:px-6 justify-start hover:bg-primary/10 hover:border-primary transition-all duration-300"
              >
                <span className="text-sm md:text-base leading-relaxed">
                  {t(`petMatchmaker.questions.${questionKey}.${option}`)}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetMatchmakerQuiz;
