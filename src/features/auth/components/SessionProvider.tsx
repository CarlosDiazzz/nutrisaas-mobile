import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { eliminarToken, guardarToken, obtenerToken } from '@/auth/tokenStorage';

interface SessionContextValue {
  cargando: boolean;
  estaAutenticado: boolean;
  iniciarSesion: (token: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

/** Restaura la sesión desde expo-secure-store al abrir la app. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  useEffect(() => {
    obtenerToken()
      .then((token) => setEstaAutenticado(token !== null))
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (token: string) => {
    await guardarToken(token);
    setEstaAutenticado(true);
  }, []);

  const cerrarSesion = useCallback(async () => {
    await eliminarToken();
    setEstaAutenticado(false);
  }, []);

  const valor = useMemo(
    () => ({ cargando, estaAutenticado, iniciarSesion, cerrarSesion }),
    [cargando, estaAutenticado, iniciarSesion, cerrarSesion],
  );

  return <SessionContext.Provider value={valor}>{children}</SessionContext.Provider>;
}
