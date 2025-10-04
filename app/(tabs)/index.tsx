import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/services/AuthProvider';
import { listService } from '../../src/services/listService';

interface Statistics {
  activeLists: number;
  totalSaved: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Statistics>({ activeLists: 0, totalSaved: 0 });
  const [loading, setLoading] = useState(true);

  const loadStatistics = async () => {
    if (!user) return;
    
    try {
      const userLists = await listService.getUserLists(user.id);
      
      // Calcular estatísticas
      const activeLists = userLists.filter(list => list.status === 'active').length;
      
      const totalSaved = userLists
        .filter(list => list.status === 'completed' && list.final_amount && list.total_amount)
        .reduce((total, list) => {
          const saved = list.total_amount - list.final_amount!;
          return total + (saved > 0 ? saved : 0);
        }, 0);

      setStats({
        activeLists,
        totalSaved
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: useEffect deve vir ANTES de qualquer retorno condicional
  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user?.id]);

  // Se não tem usuário, mostrar loading (será redirecionado pelo _layout)
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Verificando autenticação...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`.replace('.', ',');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 CompraCerta</Text>
        <Text style={styles.subtitle}>Bem-vindo, {user?.name}! 👋</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Principal */}
      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/lists')}
        >
          <Text style={styles.menuItemText}>📋 Minhas Listas</Text>
          <Text style={styles.menuItemDescription}>Gerencie suas listas de compras</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/history')}
        >
          <Text style={styles.menuItemText}>📊 Histórico</Text>
          <Text style={styles.menuItemDescription}>Veja suas compras finalizadas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.newListButton]}
          onPress={() => router.push('/list-create')}
        >
          <Text style={styles.newListButtonText}>➕ Nova Lista</Text>
          <Text style={styles.newListButtonDescription}>Crie uma nova lista de compras</Text>
        </TouchableOpacity>
      </View>

      {/* Estatísticas Rápidas */}
      <View style={styles.stats}>
        <Text style={styles.statsTitle}>📈 Suas Estatísticas</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Carregando estatísticas...</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.activeLists}</Text>
              <Text style={styles.statLabel}>Listas Ativas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{formatCurrency(stats.totalSaved)}</Text>
              <Text style={styles.statLabel}>Total Economizado</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  newListButton: {
    backgroundColor: '#4CAF50',
  },
  newListButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  newListButtonDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  stats: {
    padding: 20,
    paddingTop: 0,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
});