import { executeQuery, executeUpdate } from './database';
import { ListItem, ShoppingList } from './types';

export const listService = {
  // Criar nova lista
  async createList(userId: number, name: string): Promise<number> {
    try {
      const listId = await executeUpdate(
        'INSERT INTO shopping_lists (user_id, name) VALUES (?, ?)',
        [userId, name]
      );
      return listId;
    } catch (error) {
      console.log('❌ Erro ao criar lista:', error);
      return 0;
    }
  },

  // Buscar listas do usuário
  async getUserLists(userId: number): Promise<ShoppingList[]> {
    try {
      const lists = await executeQuery<ShoppingList>(
        `SELECT * FROM shopping_lists 
         WHERE user_id = ? 
         ORDER BY created_at DESC`,
        [userId]
      );
      return lists;
    } catch (error) {
      console.log('❌ Erro ao buscar listas:', error);
      return [];
    }
  },

  // Buscar lista específica
  async getListById(listId: number): Promise<ShoppingList | null> {
    try {
      const lists = await executeQuery<ShoppingList>(
        'SELECT * FROM shopping_lists WHERE id = ?',
        [listId]
      );
      return lists.length > 0 ? lists[0] : null;
    } catch (error) {
      console.log('❌ Erro ao buscar lista:', error);
      return null;
    }
  },

  // Atualizar lista
  async updateList(listId: number, updates: Partial<ShoppingList>): Promise<boolean> {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      
      if (fields.length === 0) return false;

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await executeUpdate(
        `UPDATE shopping_lists SET ${setClause} WHERE id = ?`,
        [...values, listId]
      );
      
      return true;
    } catch (error) {
      console.log('❌ Erro ao atualizar lista:', error);
      return false;
    }
  },

  // Deletar lista
  async deleteList(listId: number): Promise<boolean> {
    try {
      // Primeiro deletar os itens da lista
      await executeUpdate(
        'DELETE FROM list_items WHERE list_id = ?',
        [listId]
      );
      
      // Depois deletar a lista
      await executeUpdate(
        'DELETE FROM shopping_lists WHERE id = ?',
        [listId]
      );
      
      return true;
    } catch (error) {
      console.log('❌ Erro ao deletar lista:', error);
      return false;
    }
  },

  // Finalizar lista (compara valor estimado vs real)
  async completeList(listId: number, finalAmount: number): Promise<boolean> {
    try {
      const success = await this.updateList(listId, {
        status: 'completed',
        final_amount: finalAmount,
        completed_at: new Date().toISOString()
      });
      
      return success;
    } catch (error) {
      console.log('❌ Erro ao finalizar lista:', error);
      return false;
    }
  }
};

// Funções auxiliares (não exportadas)
const getListIdFromItem = async (itemId: number): Promise<number | null> => {
  try {
    const items = await executeQuery<{ list_id: number }>(
      'SELECT list_id FROM list_items WHERE id = ?',
      [itemId]
    );
    return items.length > 0 ? items[0].list_id : null;
  } catch (error) {
    return null;
  }
};

const updateListTotal = async (listId: number): Promise<void> => {
  try {
    const result = await executeQuery<{ total: number }>(
      'SELECT SUM(total) as total FROM list_items WHERE list_id = ?',
      [listId]
    );
    
    const totalAmount = result[0]?.total || 0;
    
    await executeUpdate(
      'UPDATE shopping_lists SET total_amount = ? WHERE id = ?',
      [totalAmount, listId]
    );
  } catch (error) {
    console.log('❌ Erro ao atualizar total da lista:', error);
  }
};

export const itemService = {
  // Adicionar item à lista
  async addItemToList(
    listId: number, 
    name: string, 
    quantity: number = 1, 
    unit?: string, 
    unitPrice: number = 0
  ): Promise<number> {
    try {
      const total = quantity * unitPrice;
      
      const itemId = await executeUpdate(
        `INSERT INTO list_items 
         (list_id, name, quantity, unit, unit_price, total) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [listId, name, quantity, unit, unitPrice, total]
      );
      
      // Atualizar total da lista
      await updateListTotal(listId);
      
      return itemId;
    } catch (error) {
      console.log('❌ Erro ao adicionar item:', error);
      return 0;
    }
  },

  // Buscar itens da lista
  async getListItems(listId: number): Promise<ListItem[]> {
    try {
      const items = await executeQuery<ListItem>(
        `SELECT * FROM list_items 
         WHERE list_id = ? 
         ORDER BY created_at ASC`,
        [listId]
      );
      return items;
    } catch (error) {
      console.log('❌ Erro ao buscar itens:', error);
      return [];
    }
  },

  // Atualizar item
  async updateItem(
    itemId: number, 
    updates: Partial<ListItem>
  ): Promise<boolean> {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      
      if (fields.length === 0) return false;

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await executeUpdate(
        `UPDATE list_items SET ${setClause} WHERE id = ?`,
        [...values, itemId]
      );
      
      // Se quantidade ou preço mudaram, recalcular total
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const items = await executeQuery<ListItem>(
          'SELECT * FROM list_items WHERE id = ?',
          [itemId]
        );
        
        if (items.length > 0) {
          const item = items[0];
          const newTotal = item.quantity * item.unit_price;
          await executeUpdate(
            'UPDATE list_items SET total = ? WHERE id = ?',
            [newTotal, itemId]
          );
        }
        
        // Atualizar total da lista
        const listId = await getListIdFromItem(itemId);
        if (listId) {
          await updateListTotal(listId);
        }
      }
      
      return true;
    } catch (error) {
      console.log('❌ Erro ao atualizar item:', error);
      return false;
    }
  },

  // Marcar/desmarcar item como comprado
  async toggleItemChecked(itemId: number, isChecked: boolean): Promise<boolean> {
    try {
      await executeUpdate(
        'UPDATE list_items SET is_checked = ? WHERE id = ?',
        [isChecked, itemId]
      );
      return true;
    } catch (error) {
      console.log('❌ Erro ao marcar item:', error);
      return false;
    }
  },

  // Deletar item
  async deleteItem(itemId: number): Promise<boolean> {
    try {
      const listId = await getListIdFromItem(itemId);
      
      await executeUpdate(
        'DELETE FROM list_items WHERE id = ?',
        [itemId]
      );
      
      if (listId) {
        await updateListTotal(listId);
      }
      
      return true;
    } catch (error) {
      console.log('❌ Erro ao deletar item:', error);
      return false;
    }
  }
};