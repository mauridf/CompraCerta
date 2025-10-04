import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../src/services/AuthProvider';
import { listService } from '../../src/services/listService';
import { ShoppingList } from '../../src/services/types';

export default function ListsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ CORREÇÃO: useCallback para evitar recriações desnecessárias
  const loadLists = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Carregando listas para usuário:', user.id);
      const userLists = await listService.getUserLists(user.id);
      console.log('Listas carregadas:', userLists.length);
      setLists(userLists);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as listas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]); // ✅ Dependência correta

  // ✅ CORREÇÃO: useFocusEffect com useCallback
  useFocusEffect(
    useCallback(() => {
      console.log('Tela de listas em foco - carregando...');
      loadLists();
    }, [loadLists]) // ✅ Agora depende da função loadLists memoizada
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadLists();
  };

  const handleCreateList = () => {
    router.push('/list-create');
  };

  const handleListPress = (list: ShoppingList) => {
    router.push(`/list-items?id=${list.id}&name=${encodeURIComponent(list.name)}`);
  };

  const handleDeleteList = (listId: number, listName: string) => {
    Alert.alert(
      'Excluir Lista',
      `Tem certeza que deseja excluir "${listName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await performDelete(listId);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a lista');
            }
          }
        }
      ]
    );
  };

  const performDelete = async (listId: number) => {
    const success = await listService.deleteList(listId);
    if (success) {
      setLists(prevLists => prevLists.filter(list => list.id !== listId));
      Alert.alert('Sucesso', 'Lista excluída com sucesso');
    } else {
      Alert.alert('Erro', 'Não foi possível excluir a lista');
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`.replace('.', ',');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // ✅ CORREÇÃO: Estado de loading melhor tratado
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando listas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Listas</Text>
        <Text style={styles.subtitle}>
          {lists.length} lista{lists.length !== 1 ? 's' : ''} encontrada{lists.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de Listas */}
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma lista encontrada</Text>
            <Text style={styles.emptySubtext}>
              Crie sua primeira lista de compras!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.listCard}
            onPress={() => handleListPress(item)}
          >
            <View style={styles.listHeader}>
              <Text style={styles.listName}>{item.name}</Text>
              <View style={[
                styles.statusBadge,
                item.status === 'completed' ? styles.completedBadge : styles.activeBadge
              ]}>
                <Text style={styles.statusText}>
                  {item.status === 'completed' ? 'Finalizada' : 'Ativa'}
                </Text>
              </View>
            </View>

            <View style={styles.listDetails}>
              <Text style={styles.listDate}>
                Criada em: {formatDate(item.created_at)}
              </Text>
              
              {item.status === 'completed' && item.completed_at && (
                <Text style={styles.listDate}>
                  Finalizada em: {formatDate(item.completed_at)}
                </Text>
              )}

              <View style={styles.priceContainer}>
                <Text style={styles.totalText}>
                  Total: {formatCurrency(item.total_amount)}
                </Text>
                
                {item.status === 'completed' && item.final_amount && (
                  <Text style={styles.finalText}>
                    Pago: {formatCurrency(item.final_amount)}
                  </Text>
                )}
              </View>
            </View>

            {item.status === 'completed' && item.final_amount && (
              <View style={styles.differenceContainer}>
                <Text style={[
                  styles.differenceText,
                  item.final_amount <= item.total_amount ? styles.savings : styles.overspent
                ]}>
                  {item.final_amount <= item.total_amount ? '✓ Economia: ' : '✗ Excedeu: '}
                  {formatCurrency(Math.abs(item.final_amount - item.total_amount))}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteList(item.id, item.name)}
            >
              <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Botão Flutuante */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleCreateList}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  completedBadge: {
    backgroundColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listDetails: {
    marginBottom: 8,
  },
  listDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  finalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  differenceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  differenceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  savings: {
    color: '#4CAF50',
  },
  overspent: {
    color: '#F44336',
  },
  deleteButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});