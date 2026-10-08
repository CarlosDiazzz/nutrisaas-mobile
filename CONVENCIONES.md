# Convenciones de código — NutriSaaS

Reglas que seguimos las tres personas del equipo y Claude Code. Si una regla estorba, se discute en el equipo y se cambia aquí; no se ignora en silencio.

## 1. Reglas generales (los 4 repositorios)

### 1.1 Principios

- **SOLID** como guía de diseño (hay ejemplos por repositorio).
- **KISS:** la solución más simple que cumpla la historia de usuario.
- **YAGNI:** no programar funciones "por si acaso" que no estén en una historia.
- **DRY con criterio:** extraer el código repetido a la **tercera** repetición, no antes. Una abstracción equivocada cuesta más que un poco de duplicación.
- **Separación de responsabilidades:** cada archivo, clase o función tiene una sola razón para cambiar.

### 1.2 Idioma y nombres

- El dominio se nombra en español y coincide con el modelo de datos: `Paciente`, `Cita`, `Consultorio`, `PlanAlimentacion`.
- Los sufijos técnicos van en inglés por convención del framework: `PacienteController`, `PacienteService`, `usePacientes`, `pacientesService`.
- Nombres que expliquen la intención. Booleanos con `es`/`tiene`/`puede`.
- Nada de números mágicos: constantes con nombre.

```java
// Correcto
private static final int DIAS_MAXIMOS_PARA_CANCELAR = 2;
boolean esActivo = paciente.esActivo();
double gasto = calcularGastoEnergeticoTotal(paciente);

// Incorrecto
if (dias > 2) { ... }
boolean activo = p.act;
double r = calc(p);
```

### 1.3 Funciones y archivos

- Funciones cortas (guía: ≤ 30 líneas) y con ≤ 3 parámetros; si se necesitan más, usar un objeto/record.
- Un archivo = una responsabilidad principal (un componente, un servicio, un controlador).
- Retornos tempranos en lugar de `if` anidados.
- Sin código comentado ni `console.log` / `System.out.println` en commits. Los comentarios explican el **por qué**, no el qué.

```js
// Correcto
function puedeCancelar(cita) {
  if (!cita) return false;
  if (cita.estaCancelada) return false;
  return cita.diasRestantes >= DIAS_MINIMOS_PARA_CANCELAR;
}

// Incorrecto
function puedeCancelar(cita) {
  if (cita) {
    if (!cita.estaCancelada) {
      if (cita.diasRestantes >= 2) {
        return true;
      }
    }
  }
  return false;
}
```

### 1.4 Errores

- Nunca tragar excepciones (`catch` vacío). Manejar, transformar o propagar.
- Mensajes de error al usuario en español y sin detalles técnicos.

```java
// Incorrecto
try { enviarCorreo(); } catch (Exception e) { }

// Correcto
try {
    enviarCorreo();
} catch (MailException e) {
    log.warn("No se pudo enviar el recordatorio de la cita {}", citaId, e);
    throw new ReglaDeNegocioException("No pudimos enviar el recordatorio. Intenta de nuevo.");
}
```

### 1.5 Seguridad (datos de salud = datos sensibles)

- Ningún secreto, contraseña o clave en el código; todo por variables de entorno. `.env` nunca se sube.
- No registrar en logs datos personales ni clínicos de pacientes (nombre, peso, diagnóstico, correo). Registrar IDs.
- Validar toda entrada en el backend aunque el frontend ya valide.
- El aislamiento por consultorio (multi-tenant) se garantiza en el backend; nunca se confía en el cliente.

```java
// Incorrecto
log.info("Paciente {} con diagnóstico {} registrado", paciente.getNombre(), paciente.getDiagnostico());

// Correcto
log.info("Paciente {} registrado", paciente.getId());
```

### 1.6 Git y flujo Scrum

- Ramas: `main` (producción), `develop` (integración), `feature/HU-xx-descripcion-corta`, `fix/HU-xx-descripcion`.
- Commits con **Conventional Commits en español**: `feat(pacientes): registrar paciente (HU-07)`, `fix(agenda): validar empalme de citas`, `chore`, `docs`, `test`, `refactor`.
- Un pull request por historia de usuario y por repositorio, hacia `develop`, con al menos una revisión aprobada.
- **Definición de Terminado:** compila, pasa lint y pruebas, respeta estas convenciones, cumple el criterio de validación de la historia y se revisó en PR.

## 4. Reglas de la app móvil (nutrisaas-mobile)

- Mismas responsabilidades y flujo que la web: **Pantalla → Hook → Servicio → httpClient**. Un componente nunca importa Axios; un feature no importa internos de otro.
- Los archivos de `app/` (Expo Router) son **delgados**: solo importan y renderizan una pantalla o componente de `src/features`. Sin lógica ni llamadas HTTP en `app/`.

```tsx
// Correcto: app/(auth)/login.tsx
import { LoginScreen } from '@/features/auth/components/LoginScreen';
export default LoginScreen;

// Incorrecto: lógica y HTTP dentro de app/
export default function Login() { const r = await axios.post('/login', ...); }
```

- TypeScript estricto: sin `any`; tipos de respuesta de la API en `features/x/types.ts`.
- Token **solo** en `expo-secure-store` a través de `src/auth/tokenStorage.ts`. Prohibido `AsyncStorage` para datos sensibles.
- Colores, tamaños y espaciados solo desde `src/theme/`; estilos con `StyleSheet.create`, sin estilos en línea repetidos.

```tsx
// Incorrecto
<Text style={{ color: '#2E7D32', fontSize: 18 }}>Hola</Text>

// Correcto
<Text style={estilos.titulo}>Hola</Text>
const estilos = StyleSheet.create({ titulo: { color: colores.primario, fontSize: tipografia.tamanoTitulo } });
```

- Variables de entorno solo desde `src/config/env.ts` (`EXPO_PUBLIC_*` es público: nunca poner secretos ahí).
- Listas largas con `FlatList`, no `map` dentro de `ScrollView`.
- Manejar siempre los estados de carga, error y vacío en cada pantalla.
