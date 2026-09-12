// Maps the quiz's own option labels to the shorter phrasing used in the
// human-readable summary line (offer page + the manager's ready-to-send
// message) — see QuizInline.tsx/QuizModal.tsx's STYLE_OPTIONS/DESIGN_OPTIONS
// for the source labels.
const STYLE_LABELS: Record<string, string> = {
  'Более классическим': 'классический',
  'Баланс': 'баланс',
  'Более современным': 'современный',
};

const DESIGN_LABELS: Record<string, string> = {
  'Да, уже есть': 'дизайн-проект есть',
  'Нет, нужно разработать': 'нужен дизайн-проект',
  'Хочу без проекта': 'без дизайн-проекта',
};

export interface OfferSummaryInput {
  aptType: string;
  rooms?: string;
  area: string;
  interiorStyle?: string;
  hasDesign?: string;
}

/** "Новостройка · 1 комната · 30–50 м² · стиль «баланс» · дизайн-проект есть" —
 *  deliberately leaves out colorTone, matching the ticket's own summary
 *  fields (объект/комнаты/площадь/стиль/дизайн-проект). */
export function buildOfferSummaryLine(offer: OfferSummaryInput): string {
  const style = offer.interiorStyle
    ? (STYLE_LABELS[offer.interiorStyle] ?? offer.interiorStyle.toLowerCase())
    : '';
  const design = offer.hasDesign ? (DESIGN_LABELS[offer.hasDesign] ?? offer.hasDesign) : '';

  return [
    offer.aptType,
    offer.rooms,
    offer.area,
    style && `стиль «${style}»`,
    design,
  ].filter(Boolean).join(' · ');
}
