import { create } from 'zustand';
import type { LeadSource } from '@/lib/config/leadSources';

interface QuizStore {
  open: boolean;
  source: LeadSource | undefined;
  openQuiz: (source: LeadSource) => void;
  close: () => void;
}

/**
 * Single shared instance of the quiz popup — Header, Hero and Pricing all
 * trigger the same modal through this store instead of each mounting its
 * own <QuizModal> (ExitIntentPromo reads `open` from here too, so it won't
 * pop its own promo modal on top of an already-open quiz popup, but it
 * opens PromoModal directly rather than through this store). Two
 * independent local `useState`s could
 * both be true at once (e.g. Header's CTA opens its copy while Hero's is
 * already open), stacking two popups — impossible once there's only one
 * `open` flag for all of them to share.
 */
export const useQuizStore = create<QuizStore>((set) => ({
  open: false,
  source: undefined,
  openQuiz: (source) => set({ open: true, source }),
  close: () => set({ open: false }),
}));
