import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase } from './database';

interface DatabaseContextType {
  isInitialized: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        console.log('🔄 Inicializando banco de dados...');
        const success = await initDatabase();
        
        if (success) {
          setIsInitialized(true);
          console.log('✅ Banco de dados inicializado!');
        } else {
          setError('Falha ao inicializar banco de dados');
        }
      } catch (err) {
        console.log('❌ Erro no banco:', err);
        setError('Erro: ' + (err as Error).message);
      }
    };

    initializeDB();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};