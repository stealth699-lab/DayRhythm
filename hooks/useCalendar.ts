import { useContext } from 'react';
import { CalendarContext } from '@/contexts/CalendarContext';
import { palette } from '@/constants/theme';
export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendar must be used within CalendarProvider');
  return context;
}
export function useTheme() { const { data } = useCalendar(); return { colors: palette[data.theme], dark: data.theme === 'dark' }; }
