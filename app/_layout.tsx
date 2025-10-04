import { AuthProvider } from '../src/services/AuthProvider';
import { DatabaseProvider } from '../src/services/DatabaseProvider';
import AppLayout from './AppLayout';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <AppLayout />
      </DatabaseProvider>
    </AuthProvider>
  );
}