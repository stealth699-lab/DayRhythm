import { useEffect, useState } from 'react';
import { useCalendar } from './useCalendar';
import { useAlert } from '@/template';
import type { DayKind } from '@/services/dateService';
export function useDayEditor(date: string, onClose: () => void) {
  const { data, saveMark, removeMark, busy } = useCalendar();
  const { showAlert } = useAlert();
  const existing = data.marks.find(mark => mark.date === date);
  const [kind, setKind] = useState<DayKind>('leave');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setKind(existing?.kind || 'leave'); setNote(existing?.note || ''); setError(''); }, [date, existing?.kind, existing?.note]);
  const save = async () => {
    if (saving || busy) return;
    setSaving(true); setError('');
    try { await saveMark(date, kind, note); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Не удалось сохранить отметку.'); }
    finally { setSaving(false); }
  };
  const remove = () => showAlert('Удалить отметку?', 'Она также будет удалена из подключённого календаря при следующей синхронизации. Другие события не изменятся.', [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Удалить', style: 'destructive', onPress: () => { setSaving(true); void removeMark(date).then(onClose).catch(err => setError(err instanceof Error ? err.message : 'Не удалось удалить отметку.')).finally(() => setSaving(false)); } },
  ]);
  return { kind, setKind, note, setNote, saving, error, save, remove, existing, disabled: saving || busy };
}
