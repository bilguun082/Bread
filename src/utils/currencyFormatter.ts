/**
 * Төгрөгийн дүнг мянгатын таслалтай, '₮' тэмдэгттэй форматлана.
 * Жишээ нь: 45000 -> "45,000₮"
 */
export function formatTugrik(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0₮';
  }
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('mn-MN')}₮`;
}

/**
 * Оруулсан текстийг цэвэр тоо болгох
 */
export function parseTugrikInput(val: string): number {
  const cleaned = val.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
