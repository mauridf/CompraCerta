import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../src/services/AuthProvider';
import LoadingScreen from './loading';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    console.log('Usuário:', user ? 'Logado' : 'Não logado');
    console.log('Segmento atual:', segments[0]);

    // Se não está na tela de login e não tem usuário, redirecionar para login
    if (!user && segments[0] !== 'login' && segments[0] !== 'register') {
      console.log('Redirecionando para login...');
      router.replace('/login');
    }
    
    // Se está logado e está na tela de login, redirecionar para home
    if (user && (segments[0] === 'login' || segments[0] === 'register')) {
      console.log('Redirecionando para home...');
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="list-create" options={{ headerShown: false }} />
      <Stack.Screen name="list-items" options={{ headerShown: false }} />
      <Stack.Screen name="item-create" options={{ headerShown: false }} />
      <Stack.Screen name="barcode-scanner" options={{ headerShown: false }} />
    </Stack>
  );
}