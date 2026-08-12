import Image from 'next/image';

const PHOTOS = Array.from({ length: 17 }, (_, i) => `/case/${i + 1}.jpg`);

const SPECS = [
  { icon: 'type',  label: 'Вид ремонта', value: 'Дизайнерский' },
  { icon: 'area',  label: 'Площадь',     value: '96 м²'        },
  { icon: 'rooms', label: 'Кол-во комнат', value: '3'          },
];

export function CaseSection() {
  return (
    <section className="bg-[#f5f5f5] py-12 sm:py-16">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[13px] text-[#888] font-medium tracking-wide text-center mb-3">
            Объект №168
          </p>
          <h2 className="font-extrabold text-[26px] sm:text-[38px] text-ink leading-tight tracking-tight text-center uppercase mb-5">
            Ремонт квартиры на наб. канала Грибоедова в Петербурге
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#444] leading-relaxed text-center max-w-[680px] mx-auto mb-8">
            Ремонт квартиры в Санкт-Петербурге с меблировкой и изготовлением мебели, с интерьером в стиле неоклассика, с прихожей, гардеробом, кухней-гостиной, спальней, кабинетом и санузлом.
          </p>

          {/* Specs */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {SPECS.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[10px] bg-[#ddd8cc] flex items-center justify-center shrink-0">
                  <SpecIcon type={s.icon} />
                </div>
                <div>
                  <p className="text-[12px] text-[#888] leading-none">{s.label}:</p>
                  <p className="font-bold text-[15px] text-ink leading-tight mt-[2px]">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo grid */}
        <div className="flex flex-col gap-3">

          {/* Row 1: full width */}
          <PhotoItem src={PHOTOS[0]} priority />

          {/* Row 2: 3 cols */}
          <div className="grid grid-cols-3 gap-3">
            {PHOTOS.slice(1, 4).map((src) => <PhotoItem key={src} src={src} ratio="aspect-[4/3]" />)}
          </div>

          {/* Row 3: full width */}
          <PhotoItem src={PHOTOS[4]} />

          {/* Row 4: 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            {PHOTOS.slice(5, 7).map((src) => <PhotoItem key={src} src={src} ratio="aspect-[3/2]" />)}
          </div>

          {/* Row 5: 3 cols */}
          <div className="grid grid-cols-3 gap-3">
            {PHOTOS.slice(7, 10).map((src) => <PhotoItem key={src} src={src} ratio="aspect-[4/3]" />)}
          </div>

          {/* Row 6: full width */}
          <PhotoItem src={PHOTOS[10]} />

          {/* Row 7: 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            {PHOTOS.slice(11, 13).map((src) => <PhotoItem key={src} src={src} ratio="aspect-[3/2]" />)}
          </div>

          {/* Row 8: 3 cols */}
          <div className="grid grid-cols-3 gap-3">
            {PHOTOS.slice(13, 16).map((src) => <PhotoItem key={src} src={src} ratio="aspect-[4/3]" />)}
          </div>

          {/* Row 9: full width */}
          <PhotoItem src={PHOTOS[16]} />
        </div>
      </div>
    </section>
  );
}

function PhotoItem({
  src,
  ratio = 'aspect-[16/9]',
  priority = false,
}: {
  src: string;
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative w-full ${ratio} rounded-[12px] overflow-hidden bg-[#ddd]`}>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 1080px"
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}

function SpecIcon({ type }: { type: string }) {
  if (type === 'type') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
  if (type === 'area') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3h18v18H3z" /><path d="M3 9h18M9 3v18" />
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  );
}
