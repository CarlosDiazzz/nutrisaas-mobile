import axios, { AxiosError } from 'axios';

import { obtenerToken } from '@/auth/tokenStorage';
import { env } from '@/config/env';

const TIMEOUT_MS = 15000;
const MENSAJE_SIN_CONEXION = 'No pudimos conectar con el servidor. Revisa tu conexión.';
const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';

interface ProblemDetail {
  title?: string;
  detail?: string;
  errores?: { campo: string; mensaje: string }[];
}

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

// axios.create es la forma documentada; el aviso del linter es un falso positivo.
// eslint-disable-next-line import/no-named-as-default-member
export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError<ProblemDetail>) => Promise.reject(normalizarError(error)),
);
