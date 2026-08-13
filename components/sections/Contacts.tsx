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

const PHONES = [
  { value: siteConfig.phone,           href: siteConfig.phoneHref,           label: null },
  { value: siteConfig.consultantPhone, href: siteConfig.consultantPhoneHref, label: siteConfig.consultantLabel },
];

export function Contacts() {
  return (
    <section id="contacts" className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <div className="relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-forest">
          {/* Map */}
          <iframe
            src={MAP_SRC}
            title="Карта — как нас найти"
            loading="lazy"
            className="block w-full h-[300px] md:h-[620px] border-0"
          />

          {/* Card — overlays the map from md up, stacks under it on mobile */}
          <div className="md:absolute md:top-6 md:right-6 md:bottom-6 md:w-[430px] md:rounded-[20px] bg-forest p-6 md:p-8 md:overflow-y-auto">
            <h2 className="m-0 font-bold text-white leading-tight tracking-[-0.01em]" style={{ fontSize: 'clamp(26px,3vw,38px)' }}>
              Наши контакты
            </h2>
            <p className="m-0 mt-3 text-[15px] md:text-[16px] leading-relaxed text-white/70">
              Мы на связи, чтобы обсудить ваш объект, показать кейсы и предложить лучший сценарий ремонта
            </p>

            <h3 className="m-0 mt-7 mb-4 font-bold text-[20px] md:text-[22px] text-white">Связь с нами</h3>

            <ul className="list-none m-0 p-0 flex flex-col gap-5">
              {PHONES.map((p) => (
                <li key={p.href}>
                  <a href={p.href} className="flex items-center gap-3 text-white hover:text-gold transition-colors">
                    <span className="shrink-0 w-9 h-9 rounded-[10px] bg-gold flex items-center justify-center">
                      <IconPhone />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-[17px] md:text-[19px]">{p.value}</span>
                      {p.label && <span className="block text-[12px] text-white/50">{p.label}</span>}
                    </span>
                  </a>

                  {/* Same number is reachable in these messengers */}
                  <div className="mt-2 ml-12 flex items-center gap-2">
                    <span className="text-[11px] text-white/45">Пишите:</span>
                    <IconWhatsApp />
                    <IconTelegram />
                    <IconMax />
                  </div>
                </li>
              ))}

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
              <h3 className="m-0 mb-3 font-bold text-[20px] md:text-[22px] text-white">Режим работы</h3>
              <address className="not-italic text-[15px] md:text-[16px] text-white/70 leading-relaxed">
                {siteConfig.address}
                <span className="block">{siteConfig.addressNote}</span>
              </address>
              <p className="m-0 mt-4 text-[15px] md:text-[16px] text-white/70 leading-relaxed">
                {siteConfig.workingHours}
              </p>
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
      <path d="M4.5 2C4.5 2 3 2 2 3.5C1 5 1.5 7 3 9C4.5 11 7 13.5 9 15C11 16.5 13 17 14.5 16C16 15 16 13.5 16 13.5L13.5 11L11.5 12.5C11.5 12.5 9.5 11.5 8 10C6.5 8.5 5.5 6.5 5.5 6.5L7 4.5L4.5 2Z" fill="#1A1D1A" />
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

// Brand marks — the literal hexes are the messengers' own colours, not design tokens.
function IconWhatsApp() {
  return (
    <span className="w-[22px] h-[22px] rounded-[6px] bg-[#25D366] flex items-center justify-center" title="WhatsApp">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-label="WhatsApp" role="img">
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.06s.89 2.39 1.01 2.55c.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </span>
  );
}

function IconTelegram() {
  return (
    <span className="w-[22px] h-[22px] rounded-[6px] bg-[#2AABEE] flex items-center justify-center" title="Telegram">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-label="Telegram" role="img">
        <path d="M21.6 4.2 2.9 11.4c-.9.35-.9 1.62.01 1.95l4.6 1.66 1.77 5.3c.24.7 1.14.87 1.62.31l2.5-2.86 4.7 3.45c.6.44 1.45.11 1.6-.62l3.1-14.7c.16-.77-.6-1.4-1.2-1.69Zm-3.5 3.1-7.9 6.9c-.2.18-.32.42-.35.68l-.27 2.4-1.3-3.9 9.82-6.08Z" />
      </svg>
    </span>
  );
}

function IconMax() {
  return (
    <span
      className="h-[22px] px-1.5 rounded-[6px] bg-white/15 flex items-center justify-center font-bold text-[10px] tracking-wide text-white"
      title="MAX"
    >
      MAX
    </span>
  );
}
