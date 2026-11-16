import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { useTheme } from '@/hooks/useCalendar';
function ThemedNavigator() {
  const { dark, colors } = useTheme();
  return <><StatusBar style={dark ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="index" /><Stack.Screen name="(tabs)" /></Stack></>;
}
export function RootLayout() { return <AlertProvider><SafeAreaProvider><CalendarProvider><ThemedNavigator /></CalendarProvider></SafeAreaProvider></AlertProvider>; }
export default RootLayout;
