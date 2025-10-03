import { Stack } from 'expo-router';
import { AuthProvider } from '../src/services/AuthProvider';
import { DatabaseProvider } from '../src/services/DatabaseProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack>
      </DatabaseProvider>
    </AuthProvider>
  );
}