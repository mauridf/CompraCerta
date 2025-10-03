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
import { useAuth } from '../src/services/AuthProvider';
import { listService } from '../src/services/listService';

export default function ListCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  // Se tiver ID, é edição. Se não, é criação.
  const isEdit = !!params.id;
  const listId = params.id ? parseInt(params.id as string) : 0;
  
  const [listName, setListName] = useState(params.name as string || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) { // ✅ VERIFICAÇÃO
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    if (!listName.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome para a lista');
      return;
    }

    if (listName.length < 2) {
      Alert.alert('Erro', 'O nome da lista deve ter pelo menos 2 caracteres');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        // Editar lista existente
        const success = await listService.updateList(listId, { name: listName.trim() });
        
        if (success) {
          Alert.alert('Sucesso', 'Lista atualizada com sucesso!', [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            }
          ]);
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar a lista');
        }
      } else {
        // Criar nova lista (usando ID temporário do usuário)
        const newListId = await listService.createList(user.id, listName.trim());
        
        if (newListId > 0) {
          Alert.alert('Sucesso', 'Lista criada com sucesso!', [
            { 
              text: 'Ver Lista', 
              onPress: () => router.push(`/list-items?id=${newListId}&name=${listName.trim()}`) 
            },
            { 
              text: 'Continuar', 
              style: 'cancel',
              onPress: () => router.back()
            }
          ]);
        } else {
          Alert.alert('Erro', 'Não foi possível criar a lista');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (listName.trim() !== (params.name || '')) {
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
            {isEdit ? 'Editar Lista' : 'Nova Lista'}
          </Text>
          <Text style={styles.subtitle}>
            {isEdit 
              ? 'Atualize o nome da sua lista' 
              : 'Comece dando um nome à sua lista de compras'
            }
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome da Lista *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Compras do Mês, Supermercado, Feira..."
              value={listName}
              onChangeText={setListName}
              maxLength={50}
              autoFocus
            />
            <Text style={styles.charCount}>
              {listName.length}/50 caracteres
            </Text>
          </View>

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>💡 Sugestões de nomes:</Text>
            <Text style={styles.exampleItem}>• Compras da Semana</Text>
            <Text style={styles.exampleItem}>• Supermercado Mensal</Text>
            <Text style={styles.exampleItem}>• Feira de Verduras</Text>
            <Text style={styles.exampleItem}>• Padaria e Açougue</Text>
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
              (!listName.trim() || loading) && styles.buttonDisabled
            ]}
            onPress={handleSave}
            disabled={!listName.trim() || loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar Lista')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dicas */}
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>🎯 Dicas:</Text>
          <Text style={styles.tipItem}>
            • Use nomes descritivos para identificar facilmente
          </Text>
          <Text style={styles.tipItem}>
            • Você poderá adicionar itens depois
          </Text>
          <Text style={styles.tipItem}>
            • É possível editar o nome a qualquer momento
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
    marginBottom: 40,
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
  examples: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exampleItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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