import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Local, append-only record of every real lead submitted through the site —
 * independent of whether the Telegram delivery itself succeeded.
 *
 * Before this, a lead's name/phone/message existed only in the request's
 * memory for the duration of the handler: if the Telegram send failed (as it
 * did for several days in August — the VPS's network silently drops outbound
 * to Telegram's IP range, see lib/server/telegram.ts), the data was gone the
 * moment the response went out, and only the *error* was logged, never the
 * lead. This gives every submission a durable copy on disk regardless of
 * delivery outcome, so a future delivery hiccup is recoverable instead of a
 * silent loss.
 *
 * LEAD_LOG_DIR must be a mounted volume — the container's own filesystem is
 * discarded on every redeploy. See docker-compose.yml's `volumes:` entry.
 */
const LOG_DIR = process.env.LEAD_LOG_DIR || '/app/data';
const LOG_FILE = join(LOG_DIR, 'leads.jsonl');

export interface LeadLogEntry {
  route: 'lead' | 'estimate';
  source: string;
  name: string;
  phone: string;
  message?: string;
  params?: string;
  utm?: string;
  /** Filename only — never the file's bytes. */
  file?: string;
  delivered: boolean;
  error?: string;
}

/**
 * Best-effort append; a logging failure (disk full, permissions) must never
 * break the actual submission response, so every error here is swallowed
 * after a single console.error rather than propagated.
 */
export async function appendLeadLog(entry: LeadLogEntry): Promise<void> {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
    await appendFile(LOG_FILE, line + '\n', 'utf8');
  } catch (err) {
    console.error('[leadLog] failed to write:', err);
  }
}
