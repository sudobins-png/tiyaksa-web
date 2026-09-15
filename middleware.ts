import { NextRequest, NextResponse } from 'next/server';

// Поведенческая накрутка на tiyaksa.ru: боты с ротирующихся IP (замечены на
// OVH, Google Cloud, VDSina и других хостингах) имитируют полноценный визит —
// заходят на страницу блога и "переходят" по 5-15 разных статей за 1-5 секунд
// с правдоподобными referrer-цепочками, чтобы выглядеть как органический
// визит в Яндекс.Метрике. Человек физически не может прочитать и решить
// кликнуть с такой скоростью — это провайдеро-независимый признак бота,
// в отличие от блокировки по IP/ASN, которую легко обойти сменой хостинга.
const WINDOW_MS = 4000;
const MAX_NAVIGATIONS_PER_WINDOW = 4;

const recentHits = new Map<string, number[]>();

// Уважаемые краулеры не долбят по 10 страниц в секунду с одного IP —
// но на всякий случай не мешаем им по User-Agent.
const TRUSTED_BOT_UA = /googlebot|yandexbot|bingbot|mail\.ru_bot|vkrobot|yadirectbot|duckduckbot/i;

function isPageNavigation(pathname: string): boolean {
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) return false;
  if (/\.[a-z0-9]+$/i.test(pathname)) return false; // расширение файла — это ассет, не переход по странице
  return true;
}

// Next.js сам фоново предзагружает данные всех ссылок, видимых на экране
// (<Link prefetch>) — на странице с 5-6 ссылками это тут же даёт 5-6 запросов
// за миллисекунды с одного IP и ошибочно выглядит как всплеск бота. Проверено
// на реальном трафике: 249 из 370 срабатываний лимита за первые 3 дня были
// именно такими предзагрузками у настоящих посетителей, включая владельца
// сайта. Такие запросы не могут быть кликами человека и никогда не участвуют
// в счётчике — а настоящие боты, пойманные раньше (OVH и др.), делают простые
// полные GET без этих Next.js-заголовков, так что дыры это не открывает.
function isPrefetch(req: NextRequest): boolean {
  if (req.headers.get('next-router-prefetch') === '1') return true;
  if (req.headers.get('rsc') === '1') return true;
  if (req.nextUrl.searchParams.has('_rsc')) return true;
  if (req.headers.get('purpose') === 'prefetch') return true;
  return false;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isPageNavigation(pathname) || isPrefetch(req)) {
    return NextResponse.next();
  }

  const ua = req.headers.get('user-agent') || '';
  if (TRUSTED_BOT_UA.test(ua)) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const hits = (recentHits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);

  if (hits.length > MAX_NAVIGATIONS_PER_WINDOW) {
    recentHits.set(ip, hits);
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  if (hits.length === 0) {
    recentHits.delete(ip);
  } else {
    recentHits.set(ip, hits);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
