import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DayKind } from './dateService';
export interface DayMark { id: string; date: string; kind: DayKind; note: string; dirty: boolean; eventId?: string; calendarId?: string; }
export interface CalendarChoice { id: string; title: string; account: string; }
export interface DeletedMark { eventId: string; calendarId: string; date: string; }
export interface AppData { marks: DayMark[]; deleted: DeletedMark[]; theme: 'light' | 'dark'; calendar: CalendarChoice | null; lastSync: string | null; holidays: Record<string, { data: string; updated: string }>; }
export const emptyData: AppData = { marks: [], deleted: [], theme: 'light', calendar: null, lastSync: null, holidays: {} };
const storageKey = 'evche-calendar-v1';
export async function loadData(): Promise<AppData> { const raw = await AsyncStorage.getItem(storageKey); if (!raw) return emptyData; const parsed = JSON.parse(raw); return { ...emptyData, ...parsed, marks: Array.isArray(parsed.marks) ? parsed.marks : [], deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [] }; }
export async function saveData(data: AppData): Promise<void> { await AsyncStorage.setItem(storageKey, JSON.stringify(data)); }
export function createMark(date: string, kind: DayKind, note: string): DayMark { return { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`, date, kind, note, dirty: true }; }
