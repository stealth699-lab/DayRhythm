import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { createMark, emptyData, loadData, saveData, type AppData, type CalendarChoice, type DayMark } from '@/services/storageService';
import { dateKey, type CalendarView, type DayKind } from '@/services/dateService';
import { fetchHolidays } from '@/services/holidayService';
import { listDeviceCalendars, synchronizeCalendar } from '@/services/deviceCalendarService';

interface CalendarContextValue {
  data: AppData; ready: boolean; busy: boolean; error: string; holidayError: string; holidayBusy: boolean;
  focusDate: Date; view: CalendarView; setFocusDate: (date: Date) => void; setView: (view: CalendarView) => void;
  saveMark: (date: string, kind: DayKind, note: string) => Promise<void>; removeMark: (date: string) => Promise<void>;
  setTheme: (theme: AppData['theme']) => void; sync: () => Promise<void>; refreshHolidays: () => Promise<void>;
  discoverCalendars: () => Promise<CalendarChoice[]>; chooseCalendar: (calendar: CalendarChoice) => Promise<void>; disconnect: () => Promise<void>;
}
export const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);
export function CalendarProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [holidayError, setHolidayError] = useState('');
  const [holidayBusy, setHolidayBusy] = useState(false);
  const [focusDate, setFocusDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const dataRef = useRef(data);
  const yearRef = useRef(focusDate.getFullYear());
  yearRef.current = focusDate.getFullYear();
  const busyRef = useRef(false);
  const holidayLock = useRef(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);
  const commit = useCallback(async (change: (current: AppData) => AppData) => {
    const next = change(dataRef.current);
    dataRef.current = next;
    if (mounted.current) setData(next);
    const task = saveQueue.current.catch(() => undefined).then(() => saveData(next));
    saveQueue.current = task;
    try { await task; } catch { throw new Error('Не удалось сохранить данные на устройстве. Освободите место и повторите действие.'); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    loadData().then(saved => { if (mounted.current) { dataRef.current = saved; setData(saved); setReady(true); } }).catch(() => { if (mounted.current) { setError('Не удалось прочитать сохранённые данные. Проверьте доступность хранилища устройства.'); setReady(true); } });
    return () => { mounted.current = false; };
  }, []);
  const sync = useCallback(async () => {
    if (busyRef.current || !dataRef.current.calendar) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      await synchronizeCalendar(dataRef.current, yearRef.current, async (marks, deleted) => { await commit(current => ({ ...current, marks, deleted })); });
      await commit(current => ({ ...current, lastSync: new Date().toISOString() }));
    } catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : 'Не удалось синхронизировать календарь.'); }
    finally { busyRef.current = false; if (mounted.current) setBusy(false); }
  }, [commit]);
  const refreshHolidays = useCallback(async () => {
    if (holidayLock.current) return;
    const year = yearRef.current;
    holidayLock.current = true; setHolidayBusy(true); setHolidayError('');
    try { const holidays = await fetchHolidays(year); await commit(current => ({ ...current, holidays: { ...current.holidays, [year]: holidays } })); }
    catch (err) { if (mounted.current) setHolidayError(err instanceof Error ? err.message : 'Праздники России временно недоступны.'); }
    finally { holidayLock.current = false; if (mounted.current) setHolidayBusy(false); }
  }, [commit]);
  const focusYear = focusDate.getFullYear();
  useEffect(() => {
    if (!ready) return;
    const cached = dataRef.current.holidays[focusYear];
    if (!cached || Date.now() - new Date(cached.updated).getTime() > 86400000) void refreshHolidays();
  }, [ready, focusYear, refreshHolidays]);
  useEffect(() => {
    if (!ready || Platform.OS === 'web' || !data.calendar) return;
    void sync();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void sync(); });
    const interval = setInterval(() => { if (AppState.currentState === 'active') void sync(); }, 60000);
    return () => { subscription.remove(); clearInterval(interval); };
  }, [ready, data.calendar?.id, focusYear, sync]);
  const saveMark = useCallback(async (date: string, kind: DayKind, note: string) => {
    if (busyRef.current) throw new Error('Дождитесь завершения синхронизации.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || note.length > 280) throw new Error('Проверьте дату и длину заметки.');
    setError('');
    await commit(current => {
      const existing = current.marks.find(mark => mark.date === date);
      const mark = existing ? { ...existing, kind, note: note.trim(), dirty: true } : createMark(date, kind, note.trim());
      return { ...current, marks: [...current.marks.filter(item => item.date !== date), mark] };
    });
    if (dataRef.current.calendar) void sync();
  }, [commit, sync]);
  const removeMark = useCallback(async (date: string) => {
    if (busyRef.current) throw new Error('Дождитесь завершения синхронизации.');
    await commit(current => {
      const mark = current.marks.find(item => item.date === date);
      const deleted = mark?.eventId && mark.calendarId ? [...current.deleted, { eventId: mark.eventId, calendarId: mark.calendarId, date: mark.date }] : current.deleted;
      return { ...current, marks: current.marks.filter(item => item.date !== date), deleted };
    });
    if (dataRef.current.calendar) void sync();
  }, [commit, sync]);
  const setTheme = useCallback((theme: AppData['theme']) => { void commit(current => ({ ...current, theme })).catch(err => setError(String(err))); }, [commit]);
  const discoverCalendars = useCallback(async () => { if (busyRef.current) throw new Error('Дождитесь завершения синхронизации.'); return listDeviceCalendars(); }, []);
  const chooseCalendar = useCallback(async (calendar: CalendarChoice) => {
    if (busyRef.current) throw new Error('Дождитесь завершения синхронизации.');
    await commit(current => ({ ...current, calendar, lastSync: null }));
    await sync();
  }, [commit, sync]);
  const disconnect = useCallback(async () => {
    if (busyRef.current) throw new Error('Дождитесь завершения синхронизации.');
    await commit(current => ({ ...current, calendar: null, lastSync: null })); setError('');
  }, [commit]);
  return <CalendarContext.Provider value={{ data, ready, busy, error, holidayError, holidayBusy, focusDate, view, setFocusDate, setView, saveMark, removeMark, setTheme, sync, refreshHolidays, discoverCalendars, chooseCalendar, disconnect }}>{children}</CalendarContext.Provider>;
}
