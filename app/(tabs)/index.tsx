import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDatabase } from '../../src/services/DatabaseProvider';

export default function HomeScreen() {
  const { isInitialized, error } = useDatabase();
  const router = useRouter(); // ✅ Hook do router

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.errorTitle}>❌ Erro no Banco</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.title}>🛒 CompraCerta</Text>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Inicializando banco de dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4CAF50" />
      
      <Text style={styles.title}>🛒 CompraCerta</Text>
      <Text style={styles.subtitle}>Sua lista de compras inteligente</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Sistema Pronto!</Text>
        <Text style={styles.cardText}>Banco de dados: OK ✅</Text>
        <Text style={styles.cardText}>Expo Router: OK ✅</Text>
        <Text style={styles.cardText}>SQLite: OK ✅</Text>
      </View>

      <View style={styles.menu}>
        <Text style={styles.menuItem}>📝 Criar Nova Lista</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/lists')}
        >
          <Text style={styles.menuItemText}>📋 Minhas Listas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/history')}
        >
          <Text style={styles.menuItemText}>📊 Histórico de Compras</Text>
        </TouchableOpacity>
        <Text style={styles.menuItem}>⚙️ Configurações</Text>
      </View>

      {/* ✅ BOTÃO DE LOGIN CORRETO */}
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.loginButtonText}>🔐 Fazer Login</Text>
      </TouchableOpacity>

      <Text style={styles.next}>
        Próximo: Implementar autenticação
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  menu: {
    width: '100%',
    marginBottom: 30,
  },
  menuItem: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  next: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 20,
    color: '#666',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});