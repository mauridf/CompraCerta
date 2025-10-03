import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/services/AuthProvider';

import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: '#666',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Listas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}