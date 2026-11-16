import { useMemo, useState } from 'react';
import { useCalendar } from './useCalendar';
import type { DayKind } from '@/services/dateService';
export function useMarkedDays() {
  const { data } = useCalendar();
  const [filter, setFilter] = useState<DayKind | 'all'>('all');
  const [ascending, setAscending] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const marks = useMemo(() => data.marks.filter(mark => filter === 'all' || mark.kind === filter).sort((a, b) => ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)), [data.marks, filter, ascending]);
  return { total: data.marks.length, marks, filter, setFilter, ascending, toggleSort: () => setAscending(value => !value), editing, setEditing };
}
