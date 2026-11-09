import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { ReactElement } from 'react';

import { SesionProvider } from '@/features/auth';

/** Monta una pantalla con la sesión real y una caché de consultas limpia, sin reintentos. */
export async function renderizarConSesion(
  pantalla: ReactElement,
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <SesionProvider>{pantalla}</SesionProvider>
    </QueryClientProvider>,
  );
}
