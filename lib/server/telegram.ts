import { ProxyAgent, fetch as undiciFetch, type RequestInit } from 'undici';

/**
 * fetch() for the Telegram Bot API, routed through TELEGRAM_PROXY_URL when set.
 *
 * The production VPS is hosted in Russia; outbound TCP to Telegram's IP range
 * (149.154.160.0/20) is silently dropped there — confirmed with a raw TCP
 * connect test, not a code or credentials issue. Every real lead was failing
 * to reach the channel as a result. TELEGRAM_PROXY_URL points at an HTTP
 * relay (Privoxy) on a Netherlands VPS the user already runs, firewalled to
 * accept connections only from the production VPS's IP. Server-side only —
 * lib/server/ is never imported by client components.
 *
 * Falls back to a direct connection when the env var is unset, so local dev
 * (which isn't behind the same block) needs no proxy.
 */
const proxyUrl = process.env.TELEGRAM_PROXY_URL;
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

export function telegramFetch(url: string, init?: RequestInit) {
  return undiciFetch(url, dispatcher ? { ...init, dispatcher } : init);
}
