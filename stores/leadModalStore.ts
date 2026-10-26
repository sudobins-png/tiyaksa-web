import { create } from 'zustand';
import type { LeadSource } from '@/lib/config/leadSources';

interface LeadModalStore {
  open: boolean;
  source: LeadSource | undefined;
  openLead: (source: LeadSource) => void;
  close: () => void;
}

/**
 * Single shared instance of the small contact form (LeadModal), same idea as
 * quizStore: Header, Hero and Pricing all open it through here and it is
 * mounted once in the root layout (LeadModalHost). It can't live inside the
 * Header — that sets `backdropFilter`, which makes the modal's `fixed
 * inset-0` resolve against the header's own box instead of the viewport.
 */
export const useLeadModalStore = create<LeadModalStore>((set) => ({
  open: false,
  source: undefined,
  openLead: (source) => set({ open: true, source }),
  close: () => set({ open: false }),
}));
