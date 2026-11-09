import { useEffect } from 'react';

import { registrarAntesDeCerrarSesion } from '@/auth/ganchosDeSesion';

import { obtenerPreferencia } from '../push/preferenciaPush';
import { quitarEsteDispositivo, registrarEsteDispositivo } from '../push/registroPush';

/**
 * Se monta cuando hay sesión: la primera vez pide el permiso (justo después del primer inicio de sesión, no al
 * abrir la app) y registra el teléfono; en los inicios siguientes solo renueva el registro si el paciente no lo
 * apagó. Al cerrar la sesión, primero quita el dispositivo.
 */
export function useRegistroPush() {
  useEffect(() => {
    const retirarGancho = registrarAntesDeCerrarSesion(quitarEsteDispositivo);
    obtenerPreferencia().then((preferencia) => {
      if (preferencia === 'desactivado') return;
      return registrarEsteDispositivo(preferencia === null);
    });
    return retirarGancho;
  }, []);
}
