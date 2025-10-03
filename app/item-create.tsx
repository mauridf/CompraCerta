import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { itemService, listService } from '../src/services/listService';
import { ListItem } from '../src/services/types';

export default function ItemCreateScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const listId = parseInt(params.listId as string);
    const listName = params.listName as string;
    const editItem = params.item ? JSON.parse(params.item as string) as ListItem : null;
    
    const isEdit = !!editItem;

    const [name, setName] = useState(editItem?.name || '');
    const [quantity, setQuantity] = useState(editItem?.quantity?.toString() || '1');
    const [unit, setUnit] = useState(editItem?.unit || '');
    const [unitPrice, setUnitPrice] = useState(editItem?.unit_price?.toString() || '0');
    const [loading, setLoading] = useState(false);

    // Calcular total automaticamente
    const calculateTotal = () => {
        const qty = parseFloat(quantity) || 0;
        const price = parseFloat(unitPrice) || 0;
        return qty * price;
    };

    const handleSave = async () => {
        // ✅ VERIFICAÇÃO ADICIONADA: Lista finalizada
        if (isEdit) {
            try {
                const currentList = await listService.getListById(listId);
                if (currentList?.status === 'completed') {
                    Alert.alert('Lista Finalizada', 'Esta lista já foi finalizada e não pode ser editada.');
                    setLoading(false);
                    return;
                }
            } catch (error) {
                // Continua normalmente se não conseguir verificar
            }
        }

        // Validações
        if (!name.trim()) {
            Alert.alert('Erro', 'Por favor, digite o nome do item');
            return;
        }

        if (!quantity || parseFloat(quantity) <= 0) {
            Alert.alert('Erro', 'A quantidade deve ser maior que zero');
            return;
        }

        const qty = parseFloat(quantity);
        const price = parseFloat(unitPrice) || 0;

        if (price < 0) {
            Alert.alert('Erro', 'O preço não pode ser negativo');
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                // Editar item existente
                const updateData: Partial<ListItem> = {
                    name: name.trim(),
                    quantity: qty,
                    unit_price: price
                };
                
                // Só adiciona unit se não for vazio
                if (unit.trim()) {
                    updateData.unit = unit.trim();
                }

                const success = await itemService.updateItem(editItem.id, updateData);

                if (success) {
                    Alert.alert('Sucesso', 'Item atualizado com sucesso!', [
                        { 
                            text: 'OK', 
                            onPress: () => router.back() 
                        }
                    ]);
                } else {
                    Alert.alert('Erro', 'Não foi possível atualizar o item');
                }
            } else {
                // Adicionar novo item
                const itemId = await itemService.addItemToList(
                    listId,
                    name.trim(),
                    qty,
                    unit.trim() || undefined,
                    price
                );

                if (itemId > 0) {
                    Alert.alert('Sucesso', 'Item adicionado com sucesso!', [
                        { 
                            text: 'Adicionar Outro', 
                            onPress: () => {
                                setName('');
                                setQuantity('1');
                                setUnitPrice('0');
                                setUnit('');
                            }
                        },
                        { 
                            text: 'Voltar', 
                            style: 'cancel',
                            onPress: () => router.back()
                        }
                    ]);
                } else {
                    Alert.alert('Erro', 'Não foi possível adicionar o item');
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (name !== (editItem?.name || '') || 
            quantity !== (editItem?.quantity?.toString() || '1') ||
            unit !== (editItem?.unit || '') ||
            unitPrice !== (editItem?.unit_price?.toString() || '0')) {
            Alert.alert(
                'Descartar alterações',
                'Tem certeza que deseja descartar as alterações?',
                [
                    { text: 'Continuar Editando', style: 'cancel' },
                    { 
                        text: 'Descartar', 
                        style: 'destructive',
                        onPress: () => router.back()
                    }
                ]
            );
        } else {
            router.back();
        }
    };

    const total = calculateTotal();

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {isEdit ? 'Editar Item' : 'Novo Item'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {listName}
                    </Text>
                </View>

                {/* Formulário */}
                <View style={styles.form}>
                    {/* Nome do Item */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nome do Item *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Arroz, Leite, Carne..."
                            value={name}
                            onChangeText={setName}
                            maxLength={50}
                            autoFocus
                        />
                        <Text style={styles.charCount}>
                            {name.length}/50 caracteres
                        </Text>
                    </View>

                    {/* Quantidade e Unidade */}
                    <View style={styles.row}>
                        <View style={[styles.inputContainer, styles.flex1]}>
                            <Text style={styles.label}>Quantidade *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={[styles.inputContainer, styles.flex1]}>
                            <Text style={styles.label}>Unidade</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="un, kg, L, pct..."
                                value={unit}
                                onChangeText={setUnit}
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* Preço Unitário */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Preço Unitário (R$)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0,00"
                            value={unitPrice}
                            onChangeText={setUnitPrice}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    {/* Total Calculado */}
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>
                            R$ {total.toFixed(2).replace('.', ',')}
                        </Text>
                    </View>

                    {/* Unidades Comuns */}
                    <View style={styles.unitsContainer}>
                        <Text style={styles.unitsTitle}>Unidades comuns:</Text>
                        <View style={styles.unitsRow}>
                            {['un', 'kg', 'g', 'L', 'ml', 'pct', 'cx'].map((unitOption) => (
                                <TouchableOpacity
                                    key={unitOption}
                                    style={[
                                        styles.unitButton,
                                        unit === unitOption && styles.unitButtonActive
                                    ]}
                                    onPress={() => setUnit(unitOption)}
                                >
                                    <Text style={[
                                        styles.unitButtonText,
                                        unit === unitOption && styles.unitButtonTextActive
                                    ]}>
                                        {unitOption}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Botões */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.button, 
                            styles.saveButton,
                            (!name.trim() || !quantity || loading) && styles.buttonDisabled
                        ]}
                        onPress={handleSave}
                        disabled={!name.trim() || !quantity || loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Adicionar')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Dicas */}
                <View style={styles.tips}>
                    <Text style={styles.tipsTitle}>💡 Dicas:</Text>
                    <Text style={styles.tipItem}>
                        • Use unidades padrão como kg, L, un para facilitar
                    </Text>
                    <Text style={styles.tipItem}>
                        • O preço pode ser preenchido depois durante a compra
                    </Text>
                    <Text style={styles.tipItem}>
                        • O total é calculado automaticamente
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    flex1: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#E8F5E8',
        borderRadius: 8,
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    unitsContainer: {
        marginTop: 20,
    },
    unitsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    unitsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    unitButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    unitButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    unitButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    unitButtonTextActive: {
        color: 'white',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tips: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    tipItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
});