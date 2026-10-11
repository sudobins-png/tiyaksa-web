import Anthropic from '@anthropic-ai/sdk';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

/**
 * The production VPS sits in Russia and can't reach api.anthropic.com
 * directly, so — like lib/server/telegram.ts — traffic goes through an HTTP
 * proxy when ANTHROPIC_PROXY_URL is set. Unset falls back to a direct
 * connection (local dev). Server-side only.
 */
let client: Anthropic | null = null;

export function getAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  if (!client) {
    const proxyUrl = process.env.ANTHROPIC_PROXY_URL;
    const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
    client = new Anthropic({
      apiKey,
      maxRetries: 1,
      timeout: 90_000,
      ...(dispatcher && {
        fetch: ((url: unknown, init: unknown) =>
          undiciFetch(url as string, { ...(init as object), dispatcher })) as unknown as typeof fetch,
      }),
    });
  }
  return client;
}

// Cost knob: swap for claude-sonnet-5-5 / claude-haiku-5-5 via env without a redeploy of code.
export const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL || 'claude-opus-5-5';

// The server-side refusal fallback is only offered on these models.
const FALLBACK_MODELS = ['claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5'];
export const SUPPORTS_FALLBACKS = FALLBACK_MODELS.includes(ASSISTANT_MODEL);
