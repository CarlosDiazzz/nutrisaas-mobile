import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { registrarManejadorDeSesion } from '@/api/httpClient';
import { renovarSesion } from '@/api/renovarSesion';
import { ejecutarAntesDeCerrarSesion } from '@/auth/ganchosDeSesion';
import { borrarTokens, guardarTokens } from '@/auth/sesion';
import { obtenerTokenRenovacion } from '@/auth/tokenStorage';

import { authService } from '../services/authService';
import { CredencialesLogin, DatosActivacion } from '../types';

interface SesionContexto {
  /** `true` mientras se intenta renovar la sesión al abrir la app. */
  cargando: boolean;
  estaAutenticado: boolean;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<void>;
  activarCuenta: (datos: DatosActivacion) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const SesionContext = createContext<SesionContexto | null>(null);

/** Al abrir la app intenta renovar la sesión con el token guardado; expone el inicio, la activación y el cierre. */
export function SesionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [cargando, setCargando] = useState(true);
  const [estaAutenticado, setEstaAutenticado] = useState(false);

  // Los datos en caché son del paciente que se va: no deben verse en la sesión siguiente.
  const limpiarSesionLocal = useCallback(async () => {
    await borrarTokens();
    queryClient.clear();
    setEstaAutenticado(false);
  }, [queryClient]);

  useEffect(() => {
    registrarManejadorDeSesion({ alExpirar: limpiarSesionLocal });
  }, [limpiarSesionLocal]);

  useEffect(() => {
    renovarSesion()
      .then(setEstaAutenticado)
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    await guardarTokens(await authService.login(credenciales));
    setEstaAutenticado(true);
  }, []);

  const activarCuenta = useCallback(async (datos: DatosActivacion) => {
    await guardarTokens(await authService.activar(datos));
    setEstaAutenticado(true);
  }, []);

  const cerrarSesion = useCallback(async () => {
    await ejecutarAntesDeCerrarSesion();
    const tokenRenovacion = await obtenerTokenRenovacion();
    if (tokenRenovacion) {
      try {
        await authService.cerrarSesion(tokenRenovacion);
      } catch {
        // Sin conexión o con la sesión ya vencida: igual se cierra en el teléfono y el token caduca solo.
      }
    }
    await limpiarSesionLocal();
  }, [limpiarSesionLocal]);

  const valor = useMemo(
    () => ({ cargando, estaAutenticado, iniciarSesion, activarCuenta, cerrarSesion }),
    [cargando, estaAutenticado, iniciarSesion, activarCuenta, cerrarSesion],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
