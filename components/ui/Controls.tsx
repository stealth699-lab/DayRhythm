import { memo, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useCalendar';
import { radius, spacing, typeScale, type ThemeColors } from '@/constants/theme';
export type IconName = keyof typeof Feather.glyphMap;
interface ButtonProps { label: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean; loading?: boolean; }
export const Button = memo(function Button({ label, onPress, icon, secondary = false, disabled = false, loading = false }: ButtonProps) {
  const { colors } = useTheme(); const styles = useMemo(() => makeStyles(colors), [colors]);
  const ink = secondary ? colors.primary : colors.onPrimary;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading }} onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, secondary ? styles.secondary : null, { opacity: disabled || loading ? 0.55 : pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}>{loading ? <ActivityIndicator color={ink} /> : icon ? <Feather name={icon} size={18} color={ink} /> : null}<Text style={[styles.buttonText, { color: ink }]}>{label}</Text></Pressable>;
});
interface IconButtonProps { icon: IconName; label: string; onPress: () => void; disabled?: boolean; }
export const IconButton = memo(function IconButton({ icon, label, onPress, disabled = false }: IconButtonProps) {
  const { colors } = useTheme(); const styles = useMemo(() => makeStyles(colors), [colors]);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.iconButton, { opacity: disabled ? 0.4 : pressed ? 0.55 : 1 }]}><Feather name={icon} size={20} color={colors.text} /></Pressable>;
});
interface ErrorBannerProps { message: string; }
export function ErrorBanner({ message }: ErrorBannerProps) {
  const { colors } = useTheme(); const styles = useMemo(() => makeStyles(colors), [colors]);
  if (!message) return null;
  return <View accessibilityRole="alert" style={styles.error}><Feather name="alert-circle" size={18} color={colors.danger} /><Text style={styles.errorText}>{message}</Text></View>;
}
interface SectionLabelProps { text: string; }
export function SectionLabel({ text }: SectionLabelProps) { const { colors } = useTheme(); return <Text style={[base.sectionLabel, { color: colors.subtle }]}>{text}</Text>; }
const base = StyleSheet.create({ sectionLabel: { fontSize: typeScale.caption, fontWeight: '700', letterSpacing: 1.5, marginTop: spacing.lg, marginBottom: spacing.md, includeFontPadding: false } });
function makeStyles(c: ThemeColors) { return StyleSheet.create({
  button: { minHeight: 52, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.sm, backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  secondary: { backgroundColor: c.primarySoft }, buttonText: { fontSize: typeScale.body, fontWeight: '600', includeFontPadding: false },
  iconButton: { width: 44, height: 48, borderRadius: radius.sm, backgroundColor: c.inset, alignItems: 'center', justifyContent: 'center' },
  error: { backgroundColor: c.weekendSoft, padding: spacing.md, borderRadius: radius.sm, flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.sm, alignItems: 'flex-start' },
  errorText: { flex: 1, color: c.danger, fontSize: typeScale.small, lineHeight: 22 },
}); }
