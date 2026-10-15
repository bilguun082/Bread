/**
 * Өнөөдрийн огноог 'YYYY-MM-DD' форматаар буцаана.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Огноог Монгол хэлээр уншихад ойлгомжтой форматлах (жишээ: 2026-09-22 11:45)
 */
export function formatReadableDateTime(isoStringOrDate?: string | Date | null): string {
  if (!isoStringOrDate) return '';
  const d = new Date(isoStringOrDate);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

const WEEKDAYS_MN = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

/**
 * Огноо ба гаригийн нэрээр форматлах (жишээ: 2026.09.22 (Мягмар))
 */
export function formatReadableDateWithDay(isoStringOrDate?: string | Date | null): string {
  if (!isoStringOrDate) return '';
  const d = new Date(isoStringOrDate);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dayName = WEEKDAYS_MN[d.getDay()];

  return `${year}.${month}.${day} (${dayName})`;
}
