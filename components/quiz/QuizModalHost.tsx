'use client';

import { QuizModal } from './QuizModal';
import { useQuizStore } from '@/stores/quizStore';

/**
 * Mounted once at the root layout — every trigger (Header, Hero, Pricing)
 * opens this same instance via useQuizStore rather than rendering its own
 * <QuizModal>. Also sidesteps a positioning bug: mounting
 * QuizModal inside <Header> (which sets `backdropFilter` for its glass
 * effect) made the modal's `fixed inset-0` resolve against the header's own
 * box instead of the viewport — `backdrop-filter` on an ancestor creates a
 * new containing block for fixed descendants, same as `transform` does.
 * Rendering it here, outside any filtered/transformed ancestor, avoids that.
 */
export function QuizModalHost() {
  const { open, source, close } = useQuizStore();
  if (!open || !source) return null;
  return <QuizModal onClose={close} source={source} />;
}
