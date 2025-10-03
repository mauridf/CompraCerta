import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { listService } from '../../src/services/listService';
import { ShoppingList } from '../../src/services/types';

export default function HistoryScreen() {
    const router = useRouter();
    const [completedLists, setCompletedLists] = useState<ShoppingList[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCompletedLists = async () => {
        try {
            // Buscar todas as listas do usuário (ID temporário 1)
            const allLists = await listService.getUserLists(1);
            // Filtrar apenas as listas finalizadas
            const completed = allLists.filter(list => list.status === 'completed');
            setCompletedLists(completed);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar o histórico');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCompletedLists();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadCompletedLists();
    };

    const handleListPress = (list: ShoppingList) => {
        router.push(`/list-items?id=${list.id}&name=${encodeURIComponent(list.name)}`);
    };

    const handleReuseList = (list: ShoppingList) => {
        Alert.alert(
            'Reutilizar Lista',
            `Deseja criar uma nova lista baseada em "${list.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Reutilizar', 
                    onPress: async () => {
                        try {
                            // Criar nova lista com mesmo nome + "(Cópia)"
                            const newListId = await listService.createList(1, `${list.name} (Cópia)`);
                            
                            if (newListId > 0) {
                                Alert.alert('Sucesso', 'Lista reutilizada com sucesso!', [
                                    { 
                                        text: 'Ver Lista', 
                                        onPress: () => router.push(`/list-items?id=${newListId}&name=${encodeURIComponent(list.name + ' (Cópia)')}`)
                                    },
                                    { 
                                        text: 'Continuar', 
                                        style: 'cancel'
                                    }
                                ]);
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível reutilizar a lista');
                        }
                    }
                }
            ]
        );
    };

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2)}`.replace('.', ',');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const calculateTotalSavings = () => {
        return completedLists.reduce((total, list) => {
            if (list.final_amount && list.final_amount <= list.total_amount) {
                return total + (list.total_amount - list.final_amount);
            }
            return total;
        }, 0);
    };

    const calculateTotalOverspent = () => {
        return completedLists.reduce((total, list) => {
            if (list.final_amount && list.final_amount > list.total_amount) {
                return total + (list.final_amount - list.total_amount);
            }
            return total;
        }, 0);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="dark-content" />
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Histórico de Compras</Text>
                <Text style={styles.subtitle}>
                    {completedLists.length} compra{completedLists.length !== 1 ? 's' : ''} finalizada{completedLists.length !== 1 ? 's' : ''}
                </Text>

                {/* Estatísticas */}
                {completedLists.length > 0 && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatCurrency(calculateTotalSavings())}</Text>
                            <Text style={styles.statLabel}>Economia Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, styles.overspent]}>
                                {formatCurrency(calculateTotalOverspent())}
                            </Text>
                            <Text style={styles.statLabel}>Excedido Total</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Lista de Compras Finalizadas */}
            <FlatList
                data={completedLists}
                keyExtractor={(item) => item.id.toString()}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma compra finalizada</Text>
                        <Text style={styles.emptySubtext}>
                            Suas compras finalizadas aparecerão aqui
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.listCard}>
                        <TouchableOpacity onPress={() => handleListPress(item)}>
                            <View style={styles.listHeader}>
                                <Text style={styles.listName}>{item.name}</Text>
                                <Text style={styles.listDate}>
                                    {formatDate(item.completed_at || item.created_at)}
                                </Text>
                            </View>

                            <View style={styles.priceComparison}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Estimado:</Text>
                                    <Text style={styles.estimatedPrice}>
                                        {formatCurrency(item.total_amount)}
                                    </Text>
                                </View>
                                
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Pago:</Text>
                                    <Text style={styles.finalPrice}>
                                        {formatCurrency(item.final_amount || 0)}
                                    </Text>
                                </View>

                                {item.final_amount && (
                                    <View style={styles.differenceContainer}>
                                        <Text style={[
                                            styles.differenceText,
                                            item.final_amount <= item.total_amount ? styles.savings : styles.overspent
                                        ]}>
                                            {item.final_amount <= item.total_amount ? '✓ Economizou: ' : '✗ Excedeu: '}
                                            {formatCurrency(Math.abs(item.final_amount - item.total_amount))}
                                        </Text>
                                        <Text style={styles.percentageText}>
                                            {((Math.abs(item.final_amount - item.total_amount) / item.total_amount) * 100).toFixed(1)}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Botões de Ação */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity 
                                style={styles.viewButton}
                                onPress={() => handleListPress(item)}
                            >
                                <Text style={styles.viewButtonText}>Ver Detalhes</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.reuseButton}
                                onPress={() => handleReuseList(item)}
                            >
                                <Text style={styles.reuseButtonText}>Reutilizar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
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
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
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
        color: '#4CAF50',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    listName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 12,
    },
    listDate: {
        fontSize: 14,
        color: '#666',
    },
    priceComparison: {
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    estimatedPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    finalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    differenceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    differenceText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    percentageText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    savings: {
        color: '#4CAF50',
    },
    overspent: {
        color: '#F44336',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    viewButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#2196F3',
        borderRadius: 6,
        alignItems: 'center',
    },
    viewButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    reuseButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#FF9800',
        borderRadius: 6,
        alignItems: 'center',
    },
    reuseButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
});