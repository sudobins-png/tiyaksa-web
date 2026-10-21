import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { reviews } from '@/data/content';
import { remoteAudience, remoteCase, remoteControl, remoteSteps } from '@/data/remote';

/**
 * The blocks unique to /udalenny-remont-kvartir-spb, rendered between the
 * intro and the shared trust sections of CommercialPage. Visual language
 * follows HowWeWork (numbered timeline) and WhyUs (cards).
 */
export function RemoteLanding() {
  return (
    <>
      <RemoteAudience />
      <RemoteSteps />
      <RemoteControl />
      <RemoteCase />
    </>
  );
}

function RemoteAudience() {
  return (
    <section className="bg-white border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading className="mb-8 md:mb-12">Кому подходит удалённый ремонт</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {remoteAudience.map((item) => (
            <div key={item.title} className="rounded-2xl bg-[#f8faf8] px-6 py-5">
              <h3 className="m-0 font-bold text-[18px] text-ink leading-snug">{item.title}</h3>
              <p className="m-0 mt-2 text-[15px] text-muted leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RemoteSteps() {
  return (
    <section className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading
          className="mb-10 md:mb-12"
          subtitle="От первого звонка до ключей — без обязательных поездок в Петербург"
        >
          Как проходит удалённый ремонт
        </SectionHeading>

        <ol className="m-0 p-0 list-none flex flex-col">
          {remoteSteps.map((step, i) => {
            const isLast = i === remoteSteps.length - 1;
            return (
              <li key={step.num} className="flex gap-5 md:gap-8">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-11 h-11 rounded-[12px] flex items-center justify-center font-extrabold text-[15px] bg-[#f0f4f0] text-forest">
                    {step.num}
                  </div>
                  {!isLast && <div className="w-[2px] flex-1 my-2 bg-[#e2e8e2]" style={{ minHeight: '24px' }} />}
                </div>
                <div className="pb-8 flex-1">
                  <div className="rounded-2xl px-5 py-4 bg-white">
                    <h3 className="m-0 font-bold text-[16px] text-ink leading-snug">{step.title}</h3>
                    <p className="m-0 mt-[6px] text-[14px] text-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function RemoteControl() {
  return (
    <section className="bg-forest">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading tone="light" className="mb-8 md:mb-12" subtitle="Шесть инструментов, которые заменяют поездки на объект">
          Как вы контролируете ремонт из другого города
        </SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {remoteControl.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white/[0.06] border border-white/10 px-6 py-5">
              <h3 className="m-0 font-bold text-[18px] text-white leading-snug">{item.title}</h3>
              <p className="m-0 mt-2 text-[15px] text-white/70 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RemoteCase() {
  const review = reviews.find((r) => r.name === remoteCase.reviewName);
  if (!review) return null;

  return (
    <section className="bg-white border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading eyebrow={remoteCase.eyebrow} className="mb-8 md:mb-12">
          {remoteCase.heading}
        </SectionHeading>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-10 items-start">
          <dl className="m-0 rounded-2xl bg-[#f8faf8] px-6 py-5 flex flex-col gap-4">
            {remoteCase.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">{fact.label}</dt>
                <dd className="m-0 mt-1 font-bold text-[17px] text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <figure className="m-0 rounded-2xl border border-[#eef1ee] px-6 py-6 md:px-8">
            <blockquote className="m-0 text-[16px] text-ink leading-relaxed">«{review.text}»</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              {review.photo ? (
                <Image src={review.photo} alt="" width={44} height={44} className="rounded-full object-cover w-11 h-11" />
              ) : null}
              <span className="font-bold text-[15px] text-ink">{review.name}, Самара</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
