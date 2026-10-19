import { AxiosAdapter, AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface RespuestaFalsa {
  status: number;
  data?: unknown;
}

export type ManejadorFalso = (
  peticion: InternalAxiosRequestConfig,
) => RespuestaFalsa | Promise<RespuestaFalsa>;

/** Adaptador de axios para las pruebas: responde con lo que devuelva el manejador y registra cada petición. */
export function crearAdaptadorFalso(manejador: ManejadorFalso) {
  const peticiones: InternalAxiosRequestConfig[] = [];
  const adaptador: AxiosAdapter = async (config) => {
    peticiones.push(config);
    const { status, data } = await manejador(config);
    const respuesta = { data, status, statusText: '', headers: {}, config, request: {} };
    if (status >= 200 && status < 300) return respuesta;
    throw new AxiosError(
      `Request failed with status code ${status}`,
      undefined,
      config,
      {},
      respuesta,
    );
  };
  return { adaptador, peticiones };
}

/** Simula que no hay conexión: axios lanza un error sin respuesta. */
export const sinConexion: ManejadorFalso = (peticion) => {
  throw new AxiosError('Network Error', 'ERR_NETWORK', peticion);
};

export const problema = (status: number, detail: string, title = 'Error') => ({
  status,
  data: { title, detail },
});
