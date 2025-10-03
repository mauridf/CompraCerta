# 📱 CompraCerta

Aplicativo móvel para gestão de listas de compras. Permite criar, editar e reaproveitar listas, registrar itens com preços e quantidades, escanear códigos de barras e calcular o total em tempo real. Agora também permite registrar o **valor final pago no caixa**, possibilitando comparar com o valor estimado e manter histórico confiável. Focado em ser **offline-first**, simples e leve.

---

## 🚀 Tecnologias
- **React Native + Expo** (cross-platform e leve)
- **TypeScript**
- **SQLite** (persistência local com `expo-sqlite`)
- **Zustand** (gerenciamento de estado)
- **React Navigation** (navegação entre telas)
- **Expo Barcode Scanner** (scanner de código de barras)
- **Expo SecureStore** (armazenamento seguro de credenciais)

---

## 📂 Estrutura do Projeto
```
/CompraCerta
  /assets
  /src
    /components
    /screens
      LoginScreen.tsx
      RegisterScreen.tsx
      HomeScreen.tsx
      ListScreen.tsx
      ItemScreen.tsx
      ScannerScreen.tsx
      HistoryScreen.tsx
    /services
      database.ts
      authService.ts
      listService.ts
    /store
    /utils
    App.tsx
  app.json
  package.json
```

---

## 🗄️ Banco de Dados (SQLite)

### Tabelas principais
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shopping_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  total_amount REAL DEFAULT 0,   -- valor estimado pelo app
  final_amount REAL,             -- valor pago informado no caixa
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE list_items (
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
```

---

## 📱 Funcionalidades
- [x] Cadastro/Login de usuário (local, senha com hash)
- [x] Criar, editar e excluir listas de compras
- [x] Adicionar, editar, excluir e marcar itens como comprados
- [x] Cálculo automático de totais
- [x] Scanner de código de barras (opcional)
- [x] Finalização de lista (grava total estimado e valor pago real)
- [x] Histórico de compras com comparação **estimado vs. pago**
- [x] Reaproveitar listas anteriores

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js LTS
- npm ou yarn
- VSCode

### Passos
```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/compra-certa.git
cd compra-certa

# Instalar dependências
npm install

# Instalar libs Expo
npx expo install expo-sqlite expo-barcode-scanner expo-secure-store
npm install zustand @react-navigation/native @react-navigation/native-stack
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view

# Rodar projeto
npx expo start
```

Abra no celular com **Expo Go** (Android/iOS) ou no navegador (modo web).

---

## 🎨 UI/UX
- Interface simples e responsiva
- Paleta de cores:
  - Primária: #4CAF50 (verde)
  - Secundária: #2196F3 (azul)
  - Sucesso: #8BC34A (verde claro)
  - Atenção: #FFC107 (amarelo)
  - Erro: #F44336 (vermelho)
  - Fundo: #F5F5F5 (cinza claro)
  - Texto: #212121 (cinza escuro)

---

## ✅ Testes
- Fluxo completo: Cadastro → Criar lista → Adicionar itens → Marcar comprados → Inserir preços → Finalizar lista → Registrar valor pago.
- Testes de cálculo de totais.
- Comparação estimado vs. pago.
- Scanner em dispositivo real.
- Reaproveitamento de listas.

---

## 🗺️ Roadmap Futuro
- Exportar/importar listas (CSV)
- Sincronização em nuvem (Firebase ou Supabase)
- Relatórios de economia (diferença estimado vs. pago)
- Compartilhamento de listas entre usuários
- Notificações (lembrar lista ao sair de casa)

---

## 📜 Licença
Este projeto é open source sob a licença MIT.
