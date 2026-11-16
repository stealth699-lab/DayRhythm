import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useCalendar';
import { spacing, typeScale } from '@/constants/theme';
export function TabLayout() {
  const insets = useSafeAreaInsets(); const { colors } = useTheme();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.subtle, tabBarLabelStyle: { fontSize: typeScale.caption, fontWeight: '600', marginTop: spacing.xs }, tabBarStyle: { height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }), paddingTop: spacing.sm, paddingBottom: Platform.select({ ios: insets.bottom + spacing.sm, android: insets.bottom + spacing.sm, default: spacing.sm }), paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 } }}><Tabs.Screen name="index" options={{ title: 'Календарь', tabBarIcon: ({ color, size }) => <Feather name="calendar" color={color} size={size} /> }} /><Tabs.Screen name="days" options={{ title: 'Мои дни', tabBarIcon: ({ color, size }) => <Feather name="grid" color={color} size={size} /> }} /><Tabs.Screen name="settings" options={{ title: 'Настройки', tabBarIcon: ({ color, size }) => <Feather name="sliders" color={color} size={size} /> }} /></Tabs>;
}
export default TabLayout;
