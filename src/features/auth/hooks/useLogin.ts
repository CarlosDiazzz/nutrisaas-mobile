import { useMutation } from '@tanstack/react-query';

import { authService } from '../services/authService';

import { useSession } from './useSession';

export function useLogin() {
  const { iniciarSesion } = useSession();

  return useMutation({
    mutationFn: authService.login,
    // TODO HU-23: ajustar el campo del token según el contrato real.
    onSuccess: (respuesta) => iniciarSesion(respuesta.token),
  });
}
