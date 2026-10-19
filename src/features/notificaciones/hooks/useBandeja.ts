import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { notificacionesService } from '../services/notificacionesService';

export const BANDEJA_KEY = ['paciente', 'notificaciones'] as const;
const INICIO_KEY = ['paciente', 'inicio'] as const;

export function useBandeja() {
  return useInfiniteQuery({
    queryKey: BANDEJA_KEY,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => notificacionesService.listar(pageParam),
    getNextPageParam: (ultima) =>
      ultima.pagina + 1 < ultima.totalPaginas ? ultima.pagina + 1 : undefined,
  });
}

/** Al leer avisos se refrescan la bandeja y el Inicio (que muestra el punto de la campana). */
function useInvalidarTrasLeer() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: BANDEJA_KEY }),
      queryClient.invalidateQueries({ queryKey: INICIO_KEY }),
    ]);
}

export function useMarcarLeida() {
  const invalidar = useInvalidarTrasLeer();
  return useMutation({ mutationFn: notificacionesService.marcarLeida, onSuccess: invalidar });
}

export function useMarcarTodasLeidas() {
  const invalidar = useInvalidarTrasLeer();
  return useMutation({ mutationFn: notificacionesService.marcarTodasLeidas, onSuccess: invalidar });
}
