import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { destinoDeNotificacion } from '../push/destino';
import { alTocarNotificacion, RespuestaDeNotificacion, ultimaRespuesta } from '../push/pushNativo';

// La respuesta con la que se abrió la app sigue disponible hasta que se pide otra: se atiende una sola vez.
let ultimaAtendida: string | null = null;

/** Al tocar una notificación abre su pantalla, también si la app estaba cerrada o en segundo plano. */
export function useAbrirNotificacion() {
  const router = useRouter();

  useEffect(() => {
    const abrir = (respuesta: RespuestaDeNotificacion) => {
      const identificador = respuesta.notification.request.identifier;
      if (identificador === ultimaAtendida) return;
      ultimaAtendida = identificador;
      const destino = destinoDeNotificacion(respuesta.notification.request.content.data?.tipo);
      if (destino) router.navigate(destino);
    };
    ultimaRespuesta().then((respuesta) => {
      if (respuesta) abrir(respuesta);
    });
    const suscripcion = alTocarNotificacion(abrir);
    return () => suscripcion.remove();
  }, [router]);
}
