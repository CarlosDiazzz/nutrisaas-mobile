# Changelog — NutriSaaS Móvil

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las versiones siguen las iteraciones (Sprint) del proyecto.

## [0.3.0] — 2026-10-19 · Sprint 3: aplicación móvil del paciente

### Agregado
- **Base de la app (HU-24).** Expo SDK 57 con TypeScript y Expo Router: grupos `(auth)` y `(app)/(tabs)` con `Stack.Protected`, 16 componentes de interfaz y tokens del diseño, TanStack Query, React Hook Form con Zod y cliente HTTP con renovación única de la sesión (token de acceso en memoria y de renovación en `expo-secure-store`).
- **HU-24 · Inicio de sesión, inicio y perfil.** Pantallas de login, activar cuenta (HU-23), Inicio (próxima cita, menú de hoy, último peso y campana) y Perfil.
- **HU-25 · Mi plan.** Menú por día con selector, equivalentes por tiempo de comida y avisos de alergia.
- **HU-26 y HU-27 · Progreso.** Gráfica de peso (`react-native-gifted-charts`) con rangos, lista de registros y la hoja «Registrar mi peso».
- **HU-28 · Notificaciones.** Registro del dispositivo con `expo-notifications` (canal antes del permiso), bandeja de Avisos con «Marcar todo como leído», apertura de la pantalla correcta al tocar una notificación y el interruptor del Perfil. `app.config.js` y `eas.json` (`development`, `preview` y `production`).
- Fechas en español con tablas propias (Hermes no trae nombres de meses y días).
- Plantilla de pull request.

### Corregido
- Prueba inestable de «+ Registrar» en el Inicio: el servidor falso respondía al progreso con los datos del inicio.

### Pruebas
- 183 pruebas de Jest con React Native Testing Library en 19 suites; cobertura 94.8 % de instrucciones y 91.5 % de ramas; lint, `tsc`, `expo-doctor` y bundle de Android sin errores.

### Pendiente
- Entrega del push en un teléfono real (Android con Firebase o iPhone con Apple Developer) y capturas del teléfono.
