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
Un pull request por historia de usuario hacia `develop`. EAS Build aún no está configurado.
