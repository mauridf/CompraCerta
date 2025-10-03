import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { itemService, listService } from '../src/services/listService';
import { ListItem, ShoppingList } from '../src/services/types';

export default function ListItemsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const listId = parseInt(params.id as string);
    const listName = params.name as string;

    const [list, setList] = useState<ShoppingList | null>(null);
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadListData = async () => {
        try {
            const [listData, listItems] = await Promise.all([
                listService.getListById(listId),
                itemService.getListItems(listId)
            ]);
            
            setList(listData);
            setItems(listItems);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os itens da lista');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (listId) {
                loadListData();
            }
        }, [listId])
    );

    const handleAddItem = () => {
        if (list?.status === 'completed') {
            Alert.alert('Lista Finalizada', 'Esta lista já foi finalizada. Reative-a para fazer alterações.');
            return;
        }
        router.push(`/item-create?listId=${listId}&listName=${encodeURIComponent(listName)}`);
    };

    const handleToggleItem = async (itemId: number, isChecked: boolean) => {
        if (list?.status === 'completed') {
            Alert.alert('Lista Finalizada', 'Esta lista já foi finalizada. Reative-a para fazer alterações.');
            return;
        }
        
        try {
            const success = await itemService.toggleItemChecked(itemId, !isChecked);
            if (success) {
                setItems(items.map(item => 
                    item.id === itemId ? { ...item, is_checked: !isChecked } : item
                ));
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o item');
        }
    };

    const handleEditItem = (item: ListItem) => {
        if (list?.status === 'completed') {
            Alert.alert('Lista Finalizada', 'Esta lista já foi finalizada. Reative-a para fazer alterações.');
            return;
        }
        
        Alert.alert(
            'Editar Item',
            `Deseja editar "${item.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Editar', 
                    onPress: () => {
                        router.push(`/item-create?listId=${listId}&listName=${encodeURIComponent(listName)}&item=${JSON.stringify(item)}`);
                    }
                }
            ]
        );
    };

    const handleEditList = () => {
        router.push(`/list-create?id=${listId}&name=${listName}`);
    };

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2)}`.replace('.', ',');
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + item.total, 0);
    };

    const handleCompleteList = () => {
        if (items.length === 0) {
            Alert.alert('Lista Vazia', 'Adicione itens antes de finalizar a compra');
            return;
        }

        const totalEstimated = calculateTotal();
        
        // ✅ AGORA FUNCIONANDO: Alert.prompt com tipo correto
        Alert.prompt(
            'Finalizar Compra',
            `Total estimado: ${formatCurrency(totalEstimated)}\n\nDigite o valor real pago no caixa:`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Finalizar',
                    onPress: (finalAmount) => {
                        if (!finalAmount) {
                            Alert.alert('Erro', 'Por favor, digite o valor pago');
                            return;
                        }

                        const paidAmount = parseFloat(finalAmount.replace(',', '.'));
                        if (isNaN(paidAmount) || paidAmount <= 0) {
                            Alert.alert('Erro', 'Digite um valor válido');
                            return;
                        }

                        // Função assíncrona separada
                        const completePurchase = async () => {
                            try {
                                const success = await listService.completeList(listId, paidAmount);
                                if (success) {
                                    Alert.alert(
                                        'Sucesso!', 
                                        `Compra finalizada!\n\nEstimado: ${formatCurrency(totalEstimated)}\nPago: ${formatCurrency(paidAmount)}\nDiferença: ${formatCurrency(paidAmount - totalEstimated)}`,
                                        [
                                            { 
                                                text: 'OK', 
                                                onPress: () => {
                                                    loadListData(); // Recarrega os dados
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    Alert.alert('Erro', 'Não foi possível finalizar a compra');
                                }
                            } catch (error) {
                                console.error('Erro ao finalizar:', error);
                                Alert.alert('Erro', 'Ocorreu um erro ao finalizar a compra');
                            }
                        };

                        completePurchase();
                    },
                },
            ],
            'plain-text',
            '',
            'numeric'
        );
    };

    const handleReactivateList = async () => {
        Alert.alert(
            'Reativar Lista',
            'Deseja reativar esta lista para edição?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Reativar', 
                    onPress: async () => {
                        try {
                            const updateData: Partial<ShoppingList> = {
                                status: 'active',
                                final_amount: undefined,
                                completed_at: undefined
                            };
                            
                            const success = await listService.updateList(listId, updateData);
                            
                            if (success) {
                                loadListData();
                                Alert.alert('Sucesso', 'Lista reativada com sucesso');
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível reativar a lista');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar barStyle="dark-content" />
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Carregando itens...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.headerActions}>
                        {list?.status === 'active' ? (
                            <TouchableOpacity onPress={handleCompleteList} style={styles.completeButton}>
                                <Text style={styles.completeButtonText}>Finalizar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleReactivateList} style={styles.reactivateButton}>
                                <Text style={styles.reactivateButtonText}>Reativar</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity onPress={handleEditList} style={styles.editButton}>
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <Text style={styles.title}>{listName}</Text>
                
                <View style={styles.statusContainer}>
                    <Text style={styles.subtitle}>
                        {items.length} item{items.length !== 1 ? 's' : ''} • Total: {formatCurrency(calculateTotal())}
                    </Text>
                    
                    {list?.status === 'completed' && list.final_amount && (
                        <View style={styles.completedInfo}>
                            <Text style={styles.completedText}>
                                ✅ Finalizada • Pago: {formatCurrency(list.final_amount)}
                            </Text>
                            <Text style={[
                                styles.differenceText,
                                list.final_amount <= calculateTotal() ? styles.savings : styles.overspent
                            ]}>
                                {list.final_amount <= calculateTotal() ? '✓ Economia: ' : '✗ Excedeu: '}
                                {formatCurrency(Math.abs(list.final_amount - calculateTotal()))}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Instrução para editar itens */}
                {items.length > 0 && list?.status === 'active' && (
                    <Text style={styles.instruction}>
                        💡 Toque longo em um item para editar • Toque para marcar/desmarcar
                    </Text>
                )}
            </View>

            {/* Lista de Itens */}
            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum item na lista</Text>
                        <Text style={styles.emptySubtext}>
                            Adicione itens para começar sua compra!
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={[
                            styles.itemCard,
                            item.is_checked && styles.checkedItem
                        ]}
                        onPress={() => handleToggleItem(item.id, item.is_checked)}
                        onLongPress={() => handleEditItem(item)}
                    >
                        <View style={styles.itemLeft}>
                            <View style={[
                                styles.checkbox,
                                item.is_checked && styles.checkedCheckbox
                            ]}>
                                {item.is_checked && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            
                            <View style={styles.itemInfo}>
                                <Text style={[
                                    styles.itemName,
                                    item.is_checked && styles.checkedText
                                ]}>
                                    {item.name}
                                </Text>
                                
                                <Text style={styles.itemDetails}>
                                    {item.quantity} {item.unit || 'un'}
                                    {item.unit_price > 0 && ` • ${formatCurrency(item.unit_price)}`}
                                </Text>
                            </View>
                        </View>

                        <Text style={[
                            styles.itemTotal,
                            item.is_checked && styles.checkedText
                        ]}>
                            {formatCurrency(item.total)}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Botão Flutuante */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={handleAddItem}
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 20,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    reactivateButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    reactivateButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 8,
    },
    editButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    statusContainer: {
        marginTop: 8,
    },
    completedInfo: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    completedText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
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
    instruction: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    itemCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    checkedItem: {
        backgroundColor: '#F8F9FA',
        opacity: 0.7,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#DDD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkedCheckbox: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkmark: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    checkedText: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
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
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    fabText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});