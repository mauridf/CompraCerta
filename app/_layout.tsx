import { Stack } from 'expo-router';
import { DatabaseProvider } from '../src/services/DatabaseProvider';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: 'CompraCerta'
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Login',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            title: 'Cadastro',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </DatabaseProvider>
  );
}