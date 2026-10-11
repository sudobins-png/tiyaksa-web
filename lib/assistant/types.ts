// Option labels mirror QuizInline/QuizModal exactly: /api/lead and the
// /offer/ page match on these literal strings (area buckets, "Вторич…" for
// the price multiplier, "Да, уже есть" for the design-project discount).
export const OBJECT_TYPES = [
  'Новостройка',
  'Вторичное жильё',
  'Загородный дом',
  'Офис / коммерция',
  'Комната / студия',
  'Кухня',
] as const;
export const ROOMS = ['1 комната', '2 комнаты', '3 комнаты', 'Более 3-х комнат'] as const;
export const STYLES = ['Более классическим', 'Баланс', 'Более современным'] as const;
export const TONES = ['Тёмные', 'Баланс', 'Светлые'] as const;
export const DESIGN_STATES = ['Да, уже есть', 'Нет, нужно разработать', 'Хочу без проекта'] as const;
export const REPAIR_TYPES = ['Косметический', 'Капитальный', 'Дизайнерский'] as const;

export const NO_ROOMS_TYPES: readonly string[] = ['Офис / коммерция', 'Комната / студия', 'Кухня'];

export type ObjectType = (typeof OBJECT_TYPES)[number];
export type RoomsOption = (typeof ROOMS)[number];
export type StyleOption = (typeof STYLES)[number];
export type ToneOption = (typeof TONES)[number];
export type DesignState = (typeof DESIGN_STATES)[number];
export type RepairType = (typeof REPAIR_TYPES)[number];

export interface AssistantPreferences {
  aptType?: ObjectType;
  rooms?: RoomsOption;
  areaSqm?: number;
  interiorStyle?: StyleOption;
  colorTone?: ToneOption;
  hasDesign?: DesignState;
  repairType?: RepairType;
  notes?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** What the "personal estimate" card submits to /api/lead. */
export interface OfferDraft {
  aptType: string;
  area: string;
  rooms?: string;
  interiorStyle?: string;
  colorTone?: string;
  hasDesign?: string;
  repairType?: string;
  summary: string;
}

export const HANDOFF_REASONS = ['asked_human', 'complaint', 'negotiation', 'complex_object', 'unknown_answer', 'other'] as const;
export type HandoffReason = (typeof HANDOFF_REASONS)[number];

export const HANDOFF_REASON_LABELS: Record<HandoffReason, string> = {
  asked_human: 'Клиент просит человека',
  complaint: 'Жалоба или недовольство',
  negotiation: 'Торг, скидка, рассрочка',
  complex_object: 'Сложный объект — нужна оценка человеком',
  unknown_answer: 'Бот не смог ответить',
  other: 'Другое',
};

/** What the "talk to Lev" card hands over. */
export interface HandoffDraft {
  reason: HandoffReason;
  summary: string;
}

/** Lev's own Telegram account — the human the chat can switch to. */
export const MANAGER_TELEGRAM = 'LevAndreevih';

/** One line of the NDJSON stream /api/assistant returns. */
export type AssistantEvent =
  | { t: 'text'; v: string }
  | { t: 'prefs'; v: AssistantPreferences }
  | { t: 'offer'; v: OfferDraft }
  | { t: 'handoff'; v: HandoffDraft }
  | { t: 'done' }
  | { t: 'error'; v: string };

/** Same six buckets as the quiz's area step. */
export function areaBucket(areaSqm: number): string {
  if (areaSqm < 30) return 'До 30 м²';
  if (areaSqm < 50) return '30–50 м²';
  if (areaSqm < 70) return '50–70 м²';
  if (areaSqm < 100) return '70–100 м²';
  if (areaSqm < 150) return '100–150 м²';
  return '150 м² и выше';
}

export const MAX_HISTORY_MESSAGES = 20;
export const MAX_MESSAGE_CHARS = 1000;
