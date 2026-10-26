import type { Metadata } from 'next';
import { OG_IMAGES, pageMetadata } from '@/lib/seo/metadata';
import { CommercialPage } from '@/components/sections/CommercialPage';
import { ApartmentPriceTable } from '@/components/sections/ApartmentPriceTable';
import { InfoCards } from '@/components/sections/InfoCards';
import { LEAD_SOURCES } from '@/lib/config/leadSources';
import { portfolioItems } from '@/data/content';
import { materialsFaq, priceFor, rateOf, ratePerSqm, termsAnswer } from '@/lib/utils/apartmentPricing';

const PATH = '/remont-trekhkomnatnoy-kvartiry-spb';
/** Typical three-room apartment areas in St Petersburg housing stock. */
const AREAS = [75, 90] as const;
// The 124 m² three-room design case from the portfolio, shown as the case gallery.
const CASE = portfolioItems[0];

const CONSIDERATIONS = [
  {
    title: 'Несколько санузлов',
    text: 'В трёшке часто два санузла или санузел плюс постирочная. Больше мокрых зон — больше гидроизоляции и разводки, поэтому закладываем их в смету сразу, а не по ходу.',
  },
  {
    title: 'Тёплые полы',
    text: 'На большой площади тёплый пол в ванной, на кухне или во всей квартире — частый запрос. Решаем на этапе проекта, чтобы учесть стяжку, мощность и электрику.',
  },
  {
    title: 'Кабинет или гостевая',
    text: 'Третья комната — кабинет, гостевая или вторая детская. Для кабинета закладываем розетки и свет под рабочее место, для детской — шумоизоляцию.',
  },
  {
    title: 'Электрика с запасом',
    text: 'Больше комнат — больше техники и линий. Проектируем электрику с запасом по мощности и отдельными автоматами на мокрые зоны и кухню.',
  },
  {
    title: 'Дизайн-проект',
    text: 'В большой квартире без проекта легко потерять единый стиль. Дизайнер собирает концепцию, а прораб ведёт объект строго по ней — каждое отклонение согласуется с вами.',
  },
  {
    title: 'Сроки и этапы',
    text: 'Большая площадь — больше этапов. Каждый закрывается актом, сроки фиксируются в договоре, а видеоотчёт каждую неделю показывает, где объект сейчас.',
  },
] as const;

const FAQ_ITEMS = [
  {
    q: 'Сколько стоит ремонт трёхкомнатной квартиры в СПб?',
    a: `Косметический — от ${ratePerSqm('Косметический')}/м², капитальный — от ${ratePerSqm('Капитальный')}/м², дизайнерский — от ${ratePerSqm('Дизайнерский')}/м². Для трёшки на ${AREAS[0]} м² капитальный ремонт — от ${priceFor('Капитальный', AREAS[0])}, дизайнерский — от ${priceFor('Дизайнерский', AREAS[0])}. Материалы считаются отдельно, точная сумма — после бесплатного замера.`,
  },
  {
    q: 'Сколько длится ремонт трёхкомнатной квартиры?',
    a: `${termsAnswer()} Например, дизайнерский ремонт трёшки на ${CASE.area} занял ${CASE.term}.`,
  },
  {
    q: 'Нужен ли дизайн-проект?',
    a: 'Для капитального ремонта большой квартиры — желательно: он фиксирует планировку, электрику и материалы до старта. Для дизайнерского ремонта проект входит в работу.',
  },
  {
    q: 'Можно ли жить в квартире во время ремонта?',
    a: 'В трёхкомнатной квартире часто можно: работаем поэтапно, изолируя зоны. На замере оценим, насколько это удобно именно для вашего объекта.',
  },
  materialsFaq,
] as const;

export const metadata: Metadata = pageMetadata({
  title: 'Ремонт трёхкомнатной квартиры в СПб под ключ — цены и сроки | ТиЯКСа.Ремонт',
  description: `Ремонт трёхкомнатной квартиры в Санкт-Петербурге: цены для ${AREAS[0]}–${AREAS[1]} м² по трём видам ремонта, сроки, кейс дизайнерского ремонта на ${CASE.area}. Фиксированная смета, гарантия 3 года.`,
  path: PATH,
  image: OG_IMAGES.case124,
});

export default function Page() {
  return (
    <CommercialPage
      path={PATH}
      h1="Ремонт трёхкомнатной квартиры в Санкт-Петербурге"
      serviceName="Ремонт трёхкомнатной квартиры"
      serviceDescription={`Ремонт трёхкомнатной квартиры в Санкт-Петербурге под ключ: косметический, капитальный или дизайнерский, от ${ratePerSqm('Косметический')}/м². Несколько санузлов, тёплые полы, дизайн-проект, фиксированная смета, гарантия 3 года.`}
      priceFrom={rateOf('Косметический')}
      extraSections={
        <>
          <ApartmentPriceTable
            heading="Сколько стоит ремонт трёхкомнатной квартиры"
            subtitle={`Ориентир для типовых трёшек на ${AREAS[0]} и ${AREAS[1]} м²`}
            areas={AREAS}
          />
          <InfoCards
            heading="Что важно в ремонте трёшки"
            subtitle="Большая площадь — больше систем, которые нужно спланировать до старта"
            items={CONSIDERATIONS}
            columns={3}
          />
        </>
      }
      segmentCase={{
        eyebrow: 'Пример объекта',
        heading: `Дизайнерский ремонт трёхкомнатной квартиры ${CASE.area}`,
        subtitle: `${CASE.term} от старта до сдачи, ${CASE.pricePerSqm} — работа по дизайн-проекту с единым стилем во всех комнатах.`,
        item: CASE,
      }}
      calculatorHeading="Рассчитать ремонт трёхкомнатной квартиры"
      calculatorSource={LEAD_SOURCES.landingThreeRoom}
      faqItems={FAQ_ITEMS}
    >
      <h2>Большая квартира — больше решений до старта</h2>
      <p>
        В трёхкомнатной квартире ремонт — это уже несколько проектов в одном: спальня, детская или кабинет, гостиная, кухня и часто не один санузел. Чем больше площадь, тем дороже ошибка в планировке или электрике, поэтому всё решаем до старта — в смете или дизайн-проекте — и фиксируем в договоре вместе со сроками.
      </p>
      <p>
        Делаем <a href="/remont-kosmeticheskiy-spb">косметический</a> и <a href="/remont-kapitalnyy-spb">капитальный ремонт</a>, в <a href="/remont-novostroyki-spb">новостройках</a> и во <a href="/remont-vtorichki-spb">вторичке</a>; подробнее о формате с дизайнером — на странице <a href="/remont-dizainerskiy-spb">дизайнерского ремонта</a>.
      </p>
    </CommercialPage>
  );
}
