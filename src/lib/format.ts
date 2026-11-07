/** Formatting helpers. Pure module. */

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

export function formatDate(date: Date, locale = 'en-US', style: 'long' | 'short' = 'long'): string {
  const key = `${locale}:${style}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: style === 'long' ? 'long' : 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    dateFormatters.set(key, formatter);
  }
  return formatter.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
