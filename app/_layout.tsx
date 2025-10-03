import { Stack } from 'expo-router';
import { AuthProvider } from '../src/services/AuthProvider';
import { DatabaseProvider } from '../src/services/DatabaseProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="list-create" options={{ headerShown: false }} />
          <Stack.Screen name="list-items" options={{ headerShown: false }} />
          <Stack.Screen name="item-create" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ headerShown: false }} />
        </Stack>
      </DatabaseProvider>
    </AuthProvider>
  );
}