import * as SecureStore from 'expo-secure-store';
import { executeQuery, executeUpdate } from './database';
import { User } from './types';

// Simular bcrypt (como é um app local, vamos usar hash simples)
const simpleHash = (password: string): string => {
  return `hashed_${password}_${Date.now()}`;
};

export const authService = {
  // Cadastrar novo usuário
  async register(name: string, email: string, password: string): Promise<boolean> {
    try {
      const passwordHash = simpleHash(password);
      
      const userId = await executeUpdate(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, passwordHash]
      );
      
      return userId > 0;
    } catch (error) {
      console.log('❌ Erro no cadastro:', error);
      return false;
    }
  },

  // Login do usuário
  async login(email: string, password: string): Promise<User | null> {
    try {
      const users = await executeQuery<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return null;
      }

      const user = users[0];
      // Em app real, usar bcrypt.compare()
      if (user.password_hash.includes(password)) {
        // Salvar sessão
        await SecureStore.setItemAsync('userSession', JSON.stringify({
          userId: user.id,
          email: user.email
        }));
        return user;
      }

      return null;
    } catch (error) {
      console.log('❌ Erro no login:', error);
      return null;
    }
  },

  // Verificar se usuário está logado
  async getCurrentUser(): Promise<User | null> {
    try {
      const session = await SecureStore.getItemAsync('userSession');
      if (!session) return null;

      const { userId } = JSON.parse(session);
      const users = await executeQuery<User>(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      return null;
    }
  },

  // Logout
  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('userSession');
  }
};