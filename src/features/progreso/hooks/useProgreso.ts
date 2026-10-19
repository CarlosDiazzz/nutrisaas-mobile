import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { progresoService } from '../services/progresoService';
import { Rango, RegistroPeso } from '../types';

export const PROGRESO_KEY = ['paciente', 'progreso'] as const;
const INICIO_KEY = ['paciente', 'inicio'] as const;

export function useProgreso(rango: Rango, opciones: { habilitado?: boolean } = {}) {
  return useQuery({
    queryKey: [...PROGRESO_KEY, rango],
    queryFn: () => progresoService.obtener(rango),
    enabled: opciones.habilitado ?? true,
  });
}

/** Tras cambiar un registro se refrescan el progreso (todos los rangos) y el inicio, que muestra el último peso. */
function useInvalidarTrasCambio() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: PROGRESO_KEY }),
      queryClient.invalidateQueries({ queryKey: INICIO_KEY }),
    ]);
}

export function useGuardarRegistro() {
  const invalidar = useInvalidarTrasCambio();
  return useMutation({
    mutationFn: ({ fecha, registro }: { fecha: string; registro: RegistroPeso }) =>
      progresoService.guardar(fecha, registro),
    onSuccess: invalidar,
  });
}

export function useBorrarRegistro() {
  const invalidar = useInvalidarTrasCambio();
  return useMutation({
    mutationFn: (fecha: string) => progresoService.borrar(fecha),
    onSuccess: invalidar,
  });
}
