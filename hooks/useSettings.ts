import { useState } from 'react';
import { useCalendar } from './useCalendar';
import { useAlert } from '@/template';
import type { CalendarChoice } from '@/services/storageService';
export function useSettings() {
  const app = useCalendar();
  const { showAlert } = useAlert();
  const [choices, setChoices] = useState<CalendarChoice[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const connect = async () => {
    setDiscovering(true);
    try { const calendars = await app.discoverCalendars(); if (!calendars.length) showAlert('Нет календарей для записи', 'Добавьте Google-аккаунт или другой календарь в настройках телефона и включите синхронизацию календаря.'); else { setChoices(calendars); setPickerOpen(true); } }
    catch (err) { showAlert('Календарь телефона', err instanceof Error ? err.message : 'Не удалось получить календари.'); }
    finally { setDiscovering(false); }
  };
  const select = async (calendar: CalendarChoice) => {
    setPickerOpen(false);
    try { await app.chooseCalendar(calendar); } catch (err) { showAlert('Не удалось подключить', String(err)); }
  };
  const disconnect = () => showAlert('Отключить синхронизацию?', 'Отметки останутся на устройстве. Уже созданные события в календаре телефона не удалятся.', [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Отключить', onPress: () => { void app.disconnect().catch(err => showAlert('Не удалось отключить', String(err))); } },
  ]);
  return { ...app, choices, pickerOpen, closePicker: () => setPickerOpen(false), discovering, connect, select, disconnectCalendar: disconnect };
}
