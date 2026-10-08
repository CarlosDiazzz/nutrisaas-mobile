const API_URL_POR_DEFECTO = 'http://localhost:8080';

// Única lectura de EXPO_PUBLIC_*. Son variables públicas: nunca poner secretos aquí.
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || API_URL_POR_DEFECTO,
} as const;
