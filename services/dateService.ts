export type DayKind = 'weekend' | 'leave' | 'paid';
export type CalendarView = 'year' | 'month' | 'week';
export const kindLabels: Record<DayKind, string> = { weekend: 'Выходной', leave: 'Отгул', paid: 'Оплачиваемый' };
export const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const weekNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export function dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function parseDate(key: string): Date { const [year, month, day] = key.split('-').map(Number); return new Date(year, month - 1, day, 12); }
export function addDays(date: Date, days: number): Date { const next = new Date(date); next.setDate(next.getDate() + days); return next; }
export function weekStart(date: Date): Date { return addDays(date, -((date.getDay() + 6) % 7)); }
export function monthCells(date: Date): Date[] { const first = new Date(date.getFullYear(), date.getMonth(), 1, 12); const start = weekStart(first); return Array.from({ length: 42 }, (_, index) => addDays(start, index)); }
export function prettyDate(key: string): string { return parseDate(key).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
export function dayStatus(date: Date, calendar?: string): number | undefined {
  if (!calendar) return undefined;
  const index = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 1)) / 86400000);
  return Number(calendar[index]);
}
export function isNonWorking(date: Date, calendar?: string): boolean { const status = dayStatus(date, calendar); return status === undefined ? date.getDay() === 0 || date.getDay() === 6 : status === 1; }
