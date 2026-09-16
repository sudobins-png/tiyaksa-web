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
// за миллисекунды с одного IP и ошибочно выглядит как всплеск бота.
//
// Первая попытка отличать такие запросы по заголовкам Next.js
// (Next-Router-Prefetch, Rsc, параметр _rsc) не сработала: начиная с патча
// для CVE-2025-29927 (обход middleware через подделку внутренних заголовков
// роутинга) Next.js сам вырезает эти заголовки/параметр ещё до того, как
// они попадают в middleware — проверено на проде через временный
// диагностический вывод, значение всегда приходит пустым, даже когда
// заголовок точно доходит до сервера (подтверждено логами Traefik).
//
// Используем вместо этого Sec-Fetch-Dest — стандартный заголовок Fetch
// Metadata, который выставляет сам браузер, а не фреймворк, и Next.js его
// не трогает. У настоящей навигации по странице он равен "document",
// у фонового fetch/prefetch — "empty" (подтверждено на реальном трафике).
function isBackgroundFetch(req: NextRequest): boolean {
  const dest = req.headers.get('sec-fetch-dest');
  return dest !== null && dest !== 'document';
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isPageNavigation(pathname) || isBackgroundFetch(req)) {
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
