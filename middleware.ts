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

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isPageNavigation(pathname)) {
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
