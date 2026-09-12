export function formatPrice(kopecks: number): string {
  const rubles = kopecks / 100;
  const isWhole = kopecks % 100 === 0;
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(rubles);
  return `${formatted.replace(/\s/g, '\u00A0')}\u00A0₽`;
}
