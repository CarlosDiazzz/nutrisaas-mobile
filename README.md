# NutriSaaS — Mobile

App móvil (React Native + Expo Router, TypeScript) para el paciente de NutriSaaS (proyecto escolar ITO, Scrum).

Reglas de código: [CONVENCIONES.md](CONVENCIONES.md).

## Requisitos

- Node.js 20 o superior (probado con 24) y npm
- Expo Go en tu teléfono, o un emulador Android/iOS

## Cómo correrlo

```bash
cp .env.example .env   # ajusta EXPO_PUBLIC_API_URL (en un teléfono real usa la IP de tu PC, no localhost)
npm ci
npm start
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm start` | Servidor de desarrollo de Expo |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

## Estructura

`app/` solo contiene rutas delgadas (Expo Router); el código vive en `src/` organizado por funcionalidad. Ver [CONVENCIONES.md](CONVENCIONES.md).

## Ramas

`main` (producción) · `develop` (integración) · `feature/HU-xx-descripcion-corta` · `fix/HU-xx-descripcion`.
Un pull request por historia de usuario hacia `develop`.

## Versión 1.0.0 y distribución (HU-32)

La app se llama **NutriSaaS**, versión `1.0.0` (`app.json`); `versionCode` lo lleva EAS (`appVersionSource: remote`, `autoIncrement` en `production`, empieza en 1). El ícono y la pantalla de inicio (una hoja sobre el verde de la marca) se regeneran con `python3 scripts/generar-iconos.py`.

### APK de Android (perfil `production`)

El perfil `production` de `eas.json` genera un **APK** (`buildType: apk`) y **no permite HTTP en claro** (`usesCleartextTraffic` solo se activa en `development`). Además, `app.config.js` **aborta** la compilación si `EXPO_PUBLIC_API_URL` no empieza con `https://`. La URL de producción no va en el repositorio: se guarda como variable del entorno `production` de EAS (es pública, no es un secreto).

```bash
npm install -g eas-cli && eas login                       # tu cuenta de Expo
eas init                                                  # una vez; crea el proyecto y su EAS_PROJECT_ID
eas env:create --environment production --name EXPO_PUBLIC_API_URL --value https://app.tudominio.mx --visibility plaintext
eas build --profile production --platform android         # devuelve el enlace de descarga del APK
```

Instalación en un teléfono Android: abrir el enlace del APK, permitir **"Instalar apps de orígenes desconocidos"** para el navegador y abrir el archivo descargado.

> **Pendiente:** no hay servidor de producción todavía, así que no existe una URL `https://` real; el APK de producción no se ha generado ni instalado, y el enlace de descarga se añadirá aquí cuando exista. El push en Android (FCM) tampoco se ha probado: nadie del equipo tiene un teléfono Android. Es una limitación registrada.

### iPhone (demostración con Expo Go)

1. Instala **Expo Go** desde la App Store.
2. En la computadora, con el backend accesible, define `EXPO_PUBLIC_API_URL` en `.env` (la IP de la computadora en la red local con el puerto del backend, o una URL pública) y corre `npx expo start --tunnel`.
3. Escanea el código QR con la cámara del iPhone.

Para apuntar a producción cuando exista: `EXPO_PUBLIC_API_URL=https://app.tudominio.mx npx expo start --tunnel`. TestFlight y el push en iOS requieren una cuenta de Apple Developer (de pago): están **fuera del alcance** de este Sprint.
