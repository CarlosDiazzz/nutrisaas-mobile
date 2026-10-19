import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { obtenerTokenAcceso } from '@/auth/sesionEnMemoria';
import { env } from '@/config/env';

import { renovarSesion, RUTA_RENOVACION } from './renovarSesion';

const TIMEOUT_MS = 15000;
const HTTP_NO_AUTORIZADO = 401;
const MENSAJE_SIN_CONEXION = 'No pudimos conectar con el servidor. Revisa tu conexión.';
const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';
// Un 401 en estas rutas significa credenciales o código incorrectos, no una sesión vencida.
const RUTAS_SIN_RENOVACION = ['/api/auth/movil/login', '/api/auth/movil/activar', RUTA_RENOVACION];

interface ProblemDetail {
  title?: string;
  detail?: string;
  errores?: { campo: string; mensaje: string }[];
}

type PeticionReintentable = InternalAxiosRequestConfig & { _reintentada?: boolean };

/** Error normalizado a partir de un ProblemDetail (RFC 7807) del backend. */
export class ApiError extends Error {
  readonly status: number;
  readonly titulo?: string;
  readonly errores: { campo: string; mensaje: string }[];

  constructor(status: number, mensaje: string, titulo?: string, errores: ApiError['errores'] = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.titulo = titulo;
    this.errores = errores;
  }
}

export function normalizarError(error: AxiosError<ProblemDetail>): ApiError {
  if (!error.response) {
    return new ApiError(0, MENSAJE_SIN_CONEXION, 'Sin conexión');
  }
  const { status, data } = error.response;
  return new ApiError(status, data?.detail || MENSAJE_GENERICO, data?.title, data?.errores);
}

interface ManejadorDeSesion {
  alExpirar: () => void | Promise<void>;
}
let manejadorDeSesion: ManejadorDeSesion = { alExpirar: () => {} };

/** La sesión registra aquí qué hacer cuando no se puede renovar (así el cliente HTTP no depende de React). */
export function registrarManejadorDeSesion(manejador: ManejadorDeSesion): void {
  manejadorDeSesion = manejador;
}

// axios.create es la forma documentada; el aviso del linter es un falso positivo.
// eslint-disable-next-line import/no-named-as-default-member
export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = obtenerTokenAcceso();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError<ProblemDetail>) => {
    const peticion = error.config as PeticionReintentable | undefined;
    if (!debeRenovar(error, peticion)) {
      throw normalizarError(error);
    }
    peticion._reintentada = true;
    if (await renovarSesion()) {
      peticion.headers.Authorization = `Bearer ${obtenerTokenAcceso()}`;
      return httpClient(peticion);
    }
    await manejadorDeSesion.alExpirar();
    throw normalizarError(error);
  },
);

function debeRenovar(
  error: AxiosError,
  peticion: PeticionReintentable | undefined,
): peticion is PeticionReintentable {
  return (
    error.response?.status === HTTP_NO_AUTORIZADO &&
    peticion !== undefined &&
    !peticion._reintentada &&
    !RUTAS_SIN_RENOVACION.some((ruta) => peticion.url?.endsWith(ruta))
  );
}
