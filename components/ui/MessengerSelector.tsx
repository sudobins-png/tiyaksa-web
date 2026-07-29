'use client';

export type MessengerType = 'phone' | 'telegram' | 'max';

export const MESSENGERS: { id: MessengerType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'phone', label: 'Телефон',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6.5 3C6.5 3 5 3 4 4.5C3 6 3.5 8 5 10C6.5 12 9 14.5 11 16C13 17.5 15 18 16.5 17C18 16 18 14.5 18 14.5L15.5 12L13.5 13.5C13.5 13.5 11.5 12.5 10 11C8.5 9.5 7.5 7.5 7.5 7.5L9 5.5L6.5 3Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'telegram', label: 'Telegram',
    icon: (
      <svg width="20" height="20" viewBox="0 0 240 240" aria-hidden>
        <circle cx="120" cy="120" r="120" fill="#2CA5E0" />
        <path fill="#fff" d="M54.3,118.8c35-15.2,58.3-25.3,70-30.2c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z" />
      </svg>
    ),
  },
  {
    id: 'max', label: 'Max',
    icon: (
      <svg width="20" height="20" viewBox="0 0 720 720" aria-hidden>
        <path fill="currentColor" d="M350.4,9.6C141.8,20.5,4.1,184.1,12.8,390.4c3.8,90.3,40.1,168,48.7,253.7,2.2,22.2-4.2,49.6,21.4,59.3,31.5,11.9,79.8-8.1,106.2-26.4,9-6.1,17.6-13.2,24.2-22,27.3,18.1,53.2,35.6,85.7,43.4,143.1,34.3,299.9-44.2,369.6-170.3C799.6,291.2,622.5-4.6,350.4,9.6h0ZM269.4,504c-11.3,8.8-22.2,20.8-34.7,27.7-18.1,9.7-23.7-.4-30.5-16.4-21.4-50.9-24-137.6-11.5-190.9,16.8-72.5,72.9-136.3,150-143.1,78-6.9,150.4,32.7,183.1,104.2,72.4,159.1-112.9,316.2-256.4,218.6h0Z" />
      </svg>
    ),
  },
];

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '');
  const d = digits.slice(0, 10);
  if (d.length === 0) return '';
  let out = '+7';
  if (d.length > 0) out += ' (' + d.slice(0, 3);
  if (d.length >= 3) out += ') ';
  if (d.length > 3) out += d.slice(3, 6);
  if (d.length >= 6) out += '-';
  if (d.length > 6) out += d.slice(6, 8);
  if (d.length >= 8) out += '-';
  if (d.length > 8) out += d.slice(8, 10);
  return out;
}

export function formatContact(raw: string, messenger: MessengerType): string {
  if (messenger === 'telegram' && (raw.startsWith('@') || (raw.length > 0 && !/^\+?\d/.test(raw)))) {
    return raw;
  }
  return formatPhone(raw);
}

interface MessengerSelectorProps {
  value: MessengerType | null;
  onChange: (m: MessengerType) => void;
  size?: 'sm' | 'md';
}

export function MessengerSelector({ value, onChange, size = 'md' }: MessengerSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MESSENGERS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={[
            'flex flex-col items-center gap-1.5 rounded-[12px] border-2 transition-all duration-150 cursor-pointer',
            size === 'sm' ? 'py-3' : 'py-4',
            value === m.id
              ? 'border-grove bg-[#edf5ed] text-forest'
              : 'border-[#eef1ee] bg-site text-ink hover:border-grove hover:bg-[#edf5ed]',
          ].join(' ')}
        >
          {m.icon}
          <span className="font-semibold text-[12px]">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
