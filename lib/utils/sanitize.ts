/** Strips control characters and collapses runs of spaces/tabs, but keeps
 *  newlines (\u000A) intact — see {@link cleanLine} for the variant that
 *  also removes those. Shared by every API route that echoes client-supplied
 *  text into a Telegram message.
 *
 *  Use this only for genuinely multi-line fields (a free-text comment). A
 *  caller that reuses it for a single-line field (name, source, a UTM tag)
 *  lets an embedded newline forge an extra line in the report — e.g.
 *  `utm_source=evil` + newline + `Источник: fake-admin-override` renders as
 *  two lines, the second one impersonating a real field. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Like {@link cleanText}, but also collapses newlines into a single space —
 *  for any field that must stay one line: name, phone, source,
 *  aptType/workType/area, a UTM tag. UTM values in particular are
 *  attacker-controlled (they come straight from a URL query string) and must
 *  not be able to inject a fake line into the Telegram message. */
export function cleanLine(value: unknown, max: number): string {
  return cleanText(value, max).replace(/\s+/g, ' ').trim();
}
