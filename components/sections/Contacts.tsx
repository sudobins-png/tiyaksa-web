import { siteConfig } from '@/data/content';

/**
 * Same Yandex constructor as the embed script, but as a map-widget iframe.
 * The script form hardcodes width=1043/height=646, which overflows a 375px
 * screen; the iframe fills whatever box we give it.
 *
 * `ll`/`z` override the view the constructor was saved with: its centre sits
 * at 30.3164 while the placemark is at 30.2715, so on a wide frame the pin
 * merely drifts left, but in a 327px-wide one it falls off the edge entirely.
 * Centring on the placemark keeps it visible at every width — on desktop it
 * lands well clear of the card that overlays the right-hand side.
 */
const PLACEMARK = '30.271473%2C59.945938';
const MAP_SRC =
  'https://yandex.ru/map-widget/v1/?um=constructor%3Ae2cf80aa2d17b1a1ce1fc1c8d6edaaea6045f4220d5fb90444df48c773150030' +
  `&source=constructor&lang=ru_RU&ll=${PLACEMARK}&z=15`;

export function Contacts() {
  return (
    <section id="contacts" className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <div className="relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-forest-dark">
          {/* Map */}
          <iframe
            src={MAP_SRC}
            title="Карта — как нас найти"
            loading="lazy"
            className="block w-full h-[300px] md:h-[620px] border-0"
          />

          {/* Card — overlays the map from md up, stacks under it on mobile */}
          <div className="md:absolute md:top-6 md:right-6 md:bottom-6 md:w-[430px] md:rounded-[20px] bg-forest-dark p-6 md:p-8 md:overflow-y-auto">
            <h2 className="m-0 font-bold text-white leading-tight tracking-[-0.01em]" style={{ fontSize: 'clamp(26px,3vw,38px)' }}>
              Наши контакты
            </h2>
            <p className="m-0 mt-3 text-[15px] md:text-[16px] leading-relaxed text-white/70">
              Мы на связи, чтобы обсудить ваш объект, показать кейсы и предложить лучший сценарий ремонта
            </p>

            <h3 className="m-0 mt-7 mb-4 font-bold text-[20px] md:text-[22px] text-white">Связь с нами</h3>

            <ul className="list-none m-0 p-0 flex flex-col gap-3.5">
              <li>
                <a href={siteConfig.phoneHref} className="flex items-center gap-3 text-white hover:text-gold transition-colors">
                  <span className="shrink-0 w-9 h-9 rounded-[10px] bg-grove flex items-center justify-center">
                    <IconPhone />
                  </span>
                  <span className="font-semibold text-[17px] md:text-[19px]">{siteConfig.phone}</span>
                </a>
              </li>

              <li>
                <a href={siteConfig.consultantPhoneHref} className="flex items-center gap-3 text-white hover:text-gold transition-colors">
                  <span className="shrink-0 w-9 h-9 rounded-[10px] bg-grove flex items-center justify-center">
                    <IconPhone />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-[17px] md:text-[19px]">{siteConfig.consultantPhone}</span>
                    <span className="block text-[12px] text-white/50">{siteConfig.consultantLabel}</span>
                  </span>
                </a>
              </li>

              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-white hover:text-gold transition-colors">
                  <span className="shrink-0 w-9 h-9 rounded-[10px] bg-white/10 flex items-center justify-center">
                    <IconMail />
                  </span>
                  <span className="font-semibold text-[16px] md:text-[17px] break-all">{siteConfig.email}</span>
                </a>
              </li>
            </ul>

            <div className="mt-7 pt-6 border-t border-white/15">
              <h3 className="m-0 mb-3 font-bold text-[20px] md:text-[22px] text-white">Где мы работаем</h3>
              <p className="m-0 text-[15px] md:text-[16px] text-white/70 leading-relaxed">{siteConfig.address}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IconPhone() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4.5 2C4.5 2 3 2 2 3.5C1 5 1.5 7 3 9C4.5 11 7 13.5 9 15C11 16.5 13 17 14.5 16C16 15 16 13.5 16 13.5L13.5 11L11.5 12.5C11.5 12.5 9.5 11.5 8 10C6.5 8.5 5.5 6.5 5.5 6.5L7 4.5L4.5 2Z" fill="#fff" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}
