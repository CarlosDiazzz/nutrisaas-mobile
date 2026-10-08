# NutriSaaS Mobile

App móvil React Native (Expo SDK 57, Expo Router, TypeScript) para el paciente de NutriSaaS.

@CONVENCIONES.md

## Comandos

- Desarrollo: `npm start`
- Lint: `npm run lint`
- Tipos: `npx tsc --noEmit`
- Formato: `npm run format`
- Instalar dependencias: `npx expo install <paquete>` (resuelve versiones compatibles con el SDK)
- Las APIs de Expo cambian entre SDK: consulta la documentación versionada en docs.expo.dev antes de usarlas.

## NUNCA hagas

- Lógica en `app/` (solo rutas delgadas)
- `AsyncStorage` para el token (solo `src/auth/tokenStorage.ts` con expo-secure-store)
- `any`
- Secretos en `EXPO_PUBLIC_*`
- Colores escritos a mano fuera de `theme/`
