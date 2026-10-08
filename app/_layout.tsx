import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SessionProvider } from '@/features/auth/components/SessionProvider';
import NavegadorRaiz from '@/features/auth/components/NavegadorRaiz';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NavegadorRaiz />
      </SessionProvider>
    </QueryClientProvider>
  );
}
