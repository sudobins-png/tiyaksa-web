import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';
import { CommercialPage } from '@/components/sections/CommercialPage';
import { RemoteLanding } from '@/components/sections/RemoteLanding';
import { LEAD_SOURCES } from '@/lib/config/leadSources';
import { remoteFaq } from '@/data/remote';

const PATH = '/udalenny-remont-kvartir-spb';

export const metadata: Metadata = pageMetadata({
  title: 'Удалённый ремонт квартиры в СПб — без вашего присутствия | ТиЯКСа.Ремонт',
  description: 'Ремонт квартиры в Санкт-Петербурге дистанционно: договор с ЭЦП, камеры на объекте, видеоотчёт каждую неделю, онлайн-приёмка этапов. Для тех, кто живёт в другом городе.',
  path: PATH,
});

export default function Page() {
  return (
    <CommercialPage
      path={PATH}
      h1="Удалённый ремонт квартиры в Санкт-Петербурге"
      serviceName="Удалённый ремонт квартиры"
      serviceDescription="Ремонт квартиры в Санкт-Петербурге без присутствия заказчика: электронный договор с ЭЦП, онлайн-камеры на объекте, еженедельный видеоотчёт, фото скрытых работ, дистанционная приёмка этапов. Фиксированная смета, гарантия 3 года."
      extraSections={<RemoteLanding />}
      // «Как вы контролируете ремонт из другого города» already covers the
      // same ground (manager load, fixed price, video reports, remote
      // acceptance) in remote-specific terms.
      showWhyUs={false}
      calculatorHeading="Рассчитать удалённый ремонт"
      calculatorSource={LEAD_SOURCES.landingRemote}
      faqItems={remoteFaq}
    >
      <h2>Ремонт в Петербурге, пока вы в другом городе</h2>
      <p>
        Квартира в Санкт-Петербурге, а вы живёте в Москве, Самаре или за границей — и прилетать каждую неделю, чтобы проверить бригаду, не готовы. Мы ведём такой ремонт полностью дистанционно: договор подписывается онлайн, на объекте работают камеры, раз в неделю приходит видеоотчёт, а каждый этап вы принимаете по видеосвязи. Приезжать не обязательно ни разу.
      </p>
      <p>
        Подходит для любого вида работ — <a href="/remont-kosmeticheskiy-spb">косметического</a>, <a href="/remont-kapitalnyy-spb">капитального</a> или <a href="/remont-dizainerskiy-spb">дизайнерского ремонта</a>, в <a href="/remont-novostroyki-spb">новостройке</a> и во <a href="/remont-vtorichki-spb">вторичке</a>.
      </p>
    </CommercialPage>
  );
}
