import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions } from 'react-native';
import { useCalendar } from './useCalendar';
import { addDays, dateKey, monthCells, monthNames, weekStart, type CalendarView } from '@/services/dateService';
export function useLayoutWidth() {
  const [width, setWidth] = useState(375);
  useEffect(() => { const update = () => setWidth(Math.max(320, Dimensions.get('window').width || 375)); update(); const listener = Dimensions.addEventListener('change', update); return () => listener.remove(); }, []);
  return width;
}
export function useCalendarScreen() {
  const app = useCalendar();
  const { focusDate, view, setFocusDate, setView, data } = app;
  const [editorOpen, setEditorOpen] = useState(false);
  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const marks = useMemo(() => Object.fromEntries(data.marks.map(mark => [mark.date, mark])), [data.marks]);
  const monthMarks = useMemo(() => data.marks.filter(mark => mark.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)), [data.marks, year, month]);
  const counts = useMemo(() => ({ leave: monthMarks.filter(mark => mark.kind === 'leave').length, paid: monthMarks.filter(mark => mark.kind === 'paid').length, weekend: monthMarks.filter(mark => mark.kind === 'weekend').length }), [monthMarks]);
  const cells = useMemo(() => monthCells(focusDate), [year, month]);
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart(focusDate), index)), [dateKey(focusDate)]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => new Date(year, index, 1, 12)), [year]);
  const navigate = useCallback((direction: number) => {
    const next = view === 'week' ? addDays(focusDate, direction * 7) : new Date(year + (view === 'year' ? direction : 0), month + (view === 'month' ? direction : 0), 1, 12);
    if (next.getFullYear() >= 2000 && next.getFullYear() <= 2100) setFocusDate(next);
  }, [focusDate, view, year, month, setFocusDate]);
  const select = useCallback((date: Date) => { if (date.getFullYear() >= 2000 && date.getFullYear() <= 2100) setFocusDate(date); }, [setFocusDate]);
  const selectMonth = useCallback((date: Date) => { setFocusDate(date); setView('month'); }, [setFocusDate, setView]);
  const title = view === 'year' ? String(year) : view === 'week' ? `${week[0].getDate()}–${week[6].getDate()} ${week[0].getMonth() === week[6].getMonth() ? monthNames[month].toLowerCase() : `${monthNames[week[0].getMonth()].toLowerCase()} / ${monthNames[week[6].getMonth()].toLowerCase()}`}` : `${monthNames[month]} ${year}`;
  return { ...app, marks, counts, cells, week, months, title, select, selectMonth, navigate, editorOpen, openEditor: () => setEditorOpen(true), closeEditor: () => setEditorOpen(false), today: () => setFocusDate(new Date()), selected: dateKey(focusDate), holidayData: data.holidays[year]?.data };
}
