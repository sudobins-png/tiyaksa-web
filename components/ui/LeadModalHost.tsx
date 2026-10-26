'use client';

import { LeadModal } from '@/components/ui/LeadModal';
import { useLeadModalStore } from '@/stores/leadModalStore';

/** Mounted once at the root layout — see stores/leadModalStore.ts. */
export function LeadModalHost() {
  const { open, source, close } = useLeadModalStore();
  if (!open || !source) return null;
  return <LeadModal onClose={close} source={source} />;
}
