import { FunctionsHttpError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/template';
export async function fetchHolidays(year: number): Promise<{ data: string; updated: string }> {
  const { data, error } = await getSupabaseClient().functions.invoke('russian-calendar', { body: { year } });
  if (error) {
    let message = error.message;
    if (error instanceof FunctionsHttpError) { try { const text = await error.context.text(); const body = JSON.parse(text); message = body.error || text || message; } catch { /* Retain the original error. */ } }
    throw new Error(message);
  }
  if (!data || typeof data.data !== 'string' || !/^[012]+$/.test(data.data)) throw new Error('Источник вернул некорректные данные.');
  return data;
}
