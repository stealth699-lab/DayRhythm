import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCalendar, useTheme } from '@/hooks/useCalendar';
import { IconButton } from '@/components/ui/Controls';
import { spacing, typeScale, type ThemeColors } from '@/constants/theme';
interface ScreenProps { children: ReactNode; }
export function Screen({ children }: ScreenProps) {
  const { colors } = useTheme(); const { ready } = useCalendar(); const styles = useMemo(() => makeStyles(colors), [colors]);
  return <SafeAreaView edges={['top']} style={styles.safe}><View style={styles.content}>{ready ? children : <View style={styles.loader}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>Загружаем ваши дни…</Text></View>}</View></SafeAreaView>;
}
interface PageHeaderProps { subtitle?: string; }
export function PageHeader({ subtitle = 'ЛИЧНЫЙ КАЛЕНДАРЬ' }: PageHeaderProps) {
  const { colors, dark } = useTheme(); const { setTheme } = useCalendar(); const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={styles.header}><View style={styles.brand}><View style={styles.brandIcon}><Feather name="calendar" size={22} color={colors.primary} /></View><View><Text style={styles.brandTitle}>Мой ритм</Text><Text style={styles.subtitle}>{subtitle}</Text></View></View><IconButton icon={dark ? 'sun' : 'moon'} label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} onPress={() => setTheme(dark ? 'light' : 'dark')} /></View>;
}
function makeStyles(c: ThemeColors) { return StyleSheet.create({ safe: { flex: 1, backgroundColor: c.background }, content: { flex: 1, width: '100%', maxWidth: 960, alignSelf: 'center' }, loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }, loadingText: { color: c.subtle, fontSize: typeScale.body }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg, gap: spacing.sm }, brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, brandIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.primarySoft, justifyContent: 'center', alignItems: 'center' }, brandTitle: { color: c.text, fontWeight: '700', fontSize: typeScale.section, includeFontPadding: false }, subtitle: { color: c.subtle, fontSize: 9, letterSpacing: 1.7, marginTop: spacing.xs, fontWeight: '600' } }); }
