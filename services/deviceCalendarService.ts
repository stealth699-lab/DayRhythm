import { Platform } from 'react-native';
import { addDays, dateKey, kindLabels, parseDate, type DayKind } from './dateService';
import type { AppData, CalendarChoice, DayMark } from './storageService';

const prefix = 'EVCHE_DAY|';
async function calendarApi() {
  if (Platform.OS === 'web') throw new Error('Календарь телефона доступен только в установленном приложении на iOS или Android. В браузере отметки сохраняются локально.');
  try { return await import('expo-calendar'); } catch { throw new Error('Эта сборка не содержит модуль календаря. Скачайте новую сборку приложения с разрешениями календаря.'); }
}
async function permission(request: boolean) {
  const api = await calendarApi();
  const result = request ? await api.requestCalendarPermissionsAsync() : await api.getCalendarPermissionsAsync();
  if (result.status !== 'granted') throw new Error('Разрешите полный доступ к календарю в настройках телефона, чтобы читать и изменять отметки.');
  return api;
}
export async function listDeviceCalendars(): Promise<CalendarChoice[]> {
  const api = await permission(true);
  const calendars = await api.getCalendarsAsync(api.EntityTypes.EVENT);
  return calendars.filter(calendar => calendar.allowsModifications).map(calendar => ({ id: calendar.id, title: calendar.title, account: calendar.source?.name || calendar.ownerAccount || 'Календарь устройства' }));
}
function parseOwned(event: { id: string; notes?: string; title: string; startDate: string | Date; allDay: boolean }, calendarId: string): DayMark | null {
  const match = event.notes?.match(/EVCHE_DAY\|([a-zA-Z0-9]+)\|(weekend|leave|paid)/);
  if (!match || !event.allDay) return null;
  const titleKind = (Object.keys(kindLabels) as DayKind[]).find(kind => event.title === kindLabels[kind] || event.title === `${kindLabels[kind]} · EvChe`);
  const raw = event.startDate;
  const date = typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : dateKey(new Date(raw));
  const year = Number(date.slice(0, 4));
  if (year < 2000 || year > 2100) throw new Error('Отметка в календаре телефона перемещена за диапазон 2000–2100. Исправьте её дату перед синхронизацией.');
  return { id: match[1], date, kind: titleKind || match[2] as DayKind, note: (event.notes || '').replace(/EVCHE_DAY\|[a-zA-Z0-9]+\|(weekend|leave|paid)\n?/, '').trim(), eventId: event.id, calendarId, dirty: false };
}
export async function synchronizeCalendar(snapshot: AppData, year: number, checkpoint: (marks: DayMark[], deleted: AppData['deleted']) => Promise<void>): Promise<{ marks: DayMark[]; deleted: AppData['deleted'] }> {
  if (!snapshot.calendar) throw new Error('Сначала выберите календарь телефона.');
  const api = await permission(false);
  const calendarId = snapshot.calendar.id;
  const calendars = await api.getCalendarsAsync(api.EntityTypes.EVENT);
  if (!calendars.some(calendar => calendar.id === calendarId && calendar.allowsModifications)) throw new Error('Выбранный календарь недоступен для записи. Подключите другой в настройках.');
  const years = new Set([Math.max(2000, year - 1), year, Math.min(2100, year + 1), ...snapshot.marks.map(mark => Number(mark.date.slice(0, 4))), ...snapshot.deleted.map(mark => Number(mark.date.slice(0, 4)))]);
  const remoteByEvent = new Map<string, DayMark>();
  for (const targetYear of [...years].sort()) {
    const events = await api.getEventsAsync([calendarId], new Date(targetYear, 0, 1), new Date(targetYear + 1, 0, 1));
    for (const event of events) { const mark = parseOwned(event, calendarId); if (mark) remoteByEvent.set(event.id, mark); }
  }
  // A moved event may be outside the scanned years. Resolve its ID before treating it as deleted.
  for (const local of snapshot.marks.filter(mark => mark.calendarId === calendarId && mark.eventId && !remoteByEvent.has(mark.eventId))) {
    try { const event = await api.getEventAsync(local.eventId!); if (event && event.calendarId === calendarId) { const owned = parseOwned(event, calendarId); if (owned) remoteByEvent.set(event.id, owned); } }
    catch (error) { if (!/not found|could not find|could not be found|does not exist|no event|not exist/i.test(String(error))) throw new Error('Не удалось проверить удалённую отметку. Повторите синхронизацию; локальные данные сохранены.'); }
  }
  let marks = [...snapshot.marks];
  let deleted = [...snapshot.deleted];
  const removedIds = new Set(deleted.filter(item => item.calendarId === calendarId).map(item => item.eventId));
  const remoteById = new Map([...remoteByEvent.values()].filter(mark => !removedIds.has(mark.eventId!)).map(mark => [mark.id, mark]));
  const candidate = marks.map(mark => {
    if (mark.dirty || mark.calendarId !== calendarId || !mark.eventId) return mark;
    return remoteById.get(mark.id) || null;
  }).filter((mark): mark is DayMark => mark !== null);
  for (const remote of remoteById.values()) {
    if (!candidate.some(mark => mark.id === remote.id)) candidate.push(remote);
  }
  if (new Set(candidate.map(mark => mark.date)).size !== candidate.length) throw new Error('На одну дату приходятся разные отметки. Разведите их по датам в календаре телефона или удалите лишнюю отметку в приложении.');
  marks = candidate;
  await checkpoint(marks, deleted);
  for (const item of [...deleted]) {
    if (item.calendarId !== calendarId) continue;
    // Never modify ordinary phone events, even if an operating system reuses an ID.
    if (remoteByEvent.has(item.eventId)) await api.deleteEventAsync(item.eventId);
    deleted = deleted.filter(entry => !(entry.eventId === item.eventId && entry.calendarId === calendarId));
    await checkpoint(marks, deleted);
  }
  for (const local of [...marks]) {
    const remote = remoteById.get(local.id);
    if (!local.dirty && local.calendarId === calendarId && remote) continue;
    const startDate = parseDate(local.date); startDate.setHours(0, 0, 0, 0);
    const event = { title: `${kindLabels[local.kind]} · EvChe`, startDate, endDate: addDays(startDate, 1), allDay: true, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, notes: `${prefix}${local.id}|${local.kind}\n${local.note}` };
    let eventId: string;
    if (remote?.eventId) { await api.updateEventAsync(remote.eventId, event); eventId = remote.eventId; }
    else eventId = await api.createEventAsync(calendarId, event);
    marks = marks.map(mark => mark.id === local.id ? { ...mark, eventId, calendarId, dirty: false } : mark);
    await checkpoint(marks, deleted);
  }
  return { marks, deleted };
}
