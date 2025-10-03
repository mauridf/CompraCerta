import * as SQLite from 'expo-sqlite';

// Abrir/Criar banco de dados - FORMA CORRETA para versões recentes
const db = SQLite.openDatabaseSync('compracerta.db');

// Inicializar tabelas
export const initDatabase = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      // Executar todas as criações de tabela em uma transação
      db.withTransactionAsync(async () => {
        // Tabela de usuários
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ Tabela users criada com sucesso');

        // Tabela de listas de compras
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS shopping_lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            total_amount REAL DEFAULT 0,
            final_amount REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        `);
        console.log('✅ Tabela shopping_lists criada com sucesso');

        // Tabela de itens das listas
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS list_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            quantity REAL DEFAULT 1,
            unit TEXT,
            unit_price REAL DEFAULT 0,
            total REAL DEFAULT 0,
            is_checked BOOLEAN DEFAULT FALSE,
            barcode TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (list_id) REFERENCES shopping_lists(id)
          );
        `);
        console.log('✅ Tabela list_items criada com sucesso');

        // Tabela de histórico de preços (opcional)
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS barcode_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT NOT NULL,
            unit_price REAL NOT NULL,
            date_seen DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ Tabela barcode_prices criada com sucesso');
      });

      console.log('🎉 Todas as tabelas criadas com sucesso!');
      resolve(true);
    } catch (error) {
      console.log('❌ Erro ao criar tabelas:', error);
      reject(error);
    }
  });
};

// Função para executar queries SELECT
export const executeQuery = async <T>(query: string, params: any[] = []): Promise<T[]> => {
  try {
    const result = await db.getAllAsync(query, params);
    return result as T[];
  } catch (error) {
    console.log('❌ Erro ao executar query:', error);
    return [];
  }
};

// Função para executar INSERT, UPDATE, DELETE
export const executeUpdate = async (query: string, params: any[] = []): Promise<number> => {
  try {
    await db.runAsync(query, params);
    
    // Para INSERT, retornar o último ID inserido
    if (query.trim().toUpperCase().startsWith('INSERT')) {
      const result = await db.getFirstAsync('SELECT last_insert_rowid() as id');
      return (result as any)?.id || 0;
    }
    
    // Para UPDATE/DELETE, retornar rows affected
    return 1;
  } catch (error) {
    console.log('❌ Erro ao executar update:', error);
    return 0;
  }
};

export default db;