import { QuizInline } from '@/components/quiz/QuizInline';
import type { LeadSource } from '@/lib/config/leadSources';

interface QuizSectionProps {
  heading?: string;
  source?: LeadSource;
}

/**
 * In-page quiz card (same QuizInline as /quiz) embedded as a section on the
 * commercial landing pages — replaces the slider Calculator there so the
 * lead-capture step is a multi-step quiz, not a popup, per feedback.
 */
export function QuizSection({ heading, source }: QuizSectionProps) {
  return (
    <section id="calc" className="bg-site">
      <div className="max-w-[640px] mx-auto px-6 py-[88px]">
        <QuizInline heading={heading} source={source} />
      </div>
    </section>
  );
}
