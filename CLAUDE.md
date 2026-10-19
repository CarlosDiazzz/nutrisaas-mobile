# NutriSaaS Mobile

App móvil React Native (Expo SDK 57, Expo Router, TypeScript) para el paciente de NutriSaaS.

@CONVENCIONES.md

## Comandos

- Desarrollo: `npm start` (Expo Go; ver `nutrisaas-infra/docs/movil.md` para probar en un teléfono)
- Lint: `npm run lint`
- Tipos: `npx tsc --noEmit`
- Pruebas: `npm test` (Jest con `jest-expo` y React Native Testing Library)
- Formato: `npm run format`
- Instalar dependencias: `npx expo install <paquete>` (resuelve versiones compatibles con el SDK)
- Las APIs de Expo cambian entre SDK: consulta la documentación versionada en docs.expo.dev antes de usarlas.

## Estructura

- `app/`: rutas de Expo Router, delgadas. Grupos `(auth)` (login, activar) y `(app)/(tabs)` (Inicio, Mi plan, Progreso, Perfil).
- `src/features/<feature>/{screens,hooks,services,components,schemas}`: flujo pantalla → hook → servicio → `httpClient`.
- `src/components/ui`: componentes compartidos del sistema de diseño (cada uno con su prueba).
- `src/theme/tokens.ts`: colores, espaciados, radios, medidas y fuentes (mismos nombres que la web).
- `src/api/httpClient.ts`: cliente HTTP con renovación automática ante un 401 (`renovarSesion.ts`).
- `src/auth/`: token de acceso en memoria y token de renovación en `expo-secure-store`.
- `src/test/`: ayudas de prueba (adaptador falso de axios).

## NUNCA hagas

- Lógica en `app/` (solo rutas delgadas)
- Token en `AsyncStorage` (el de renovación va solo en `src/auth/tokenStorage.ts` y el de acceso solo en memoria)
- `any`
- Secretos en `EXPO_PUBLIC_*`
- Colores, tamaños o fuentes escritos a mano fuera de `theme/`
- `console.log` en commits
- Importar `axios` fuera de `src/api` (y de `src/test`)
