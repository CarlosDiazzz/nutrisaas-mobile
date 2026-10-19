import { useCallback, useEffect, useState } from 'react';

import { fijarPreferencia, obtenerPreferencia } from '../push/preferenciaPush';
import {
  quitarEsteDispositivo,
  registrarEsteDispositivo,
  ResultadoRegistro,
} from '../push/registroPush';
import { soportePush, SoportePush } from '../push/pushNativo';

const MENSAJES: Partial<Record<ResultadoRegistro, string>> = {
  sinPermiso: 'Activa las notificaciones de NutriSaaS en los ajustes del teléfono.',
  noSoportado: 'Las notificaciones no están disponibles en este teléfono.',
  sinProyecto: 'Falta configurar el proyecto de notificaciones de la app.',
  error: 'No pudimos activar las notificaciones. Revisa tu conexión e inténtalo de nuevo.',
};

/** Estado del interruptor «Notificaciones» del Perfil: apagarlo quita el teléfono; encenderlo lo registra. */
export function usePreferenciaPush() {
  const [activado, setActivado] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const soporte: SoportePush = soportePush();

  useEffect(() => {
    obtenerPreferencia().then((preferencia) => setActivado(preferencia === 'activado'));
  }, []);

  const alternar = useCallback(async (quiereActivar: boolean) => {
    setMensaje(null);
    setTrabajando(true);
    try {
      if (quiereActivar) {
        const resultado = await registrarEsteDispositivo(true);
        setActivado(resultado === 'registrado');
        setMensaje(MENSAJES[resultado] ?? null);
      } else {
        await quitarEsteDispositivo().catch(() => undefined);
        await fijarPreferencia('desactivado');
        setActivado(false);
      }
    } finally {
      setTrabajando(false);
    }
  }, []);

  return { activado, trabajando, mensaje, soporte, alternar };
}
