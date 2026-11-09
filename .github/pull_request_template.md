## Historia de usuario

HU-xx · <!-- título de la historia -->

## Cambios

<!-- Qué cambia y por qué, en pocas líneas -->

## Pruebas

<!-- Resumen con cifras de `./mvnw clean verify` / `npm test`, y pruebas manuales hechas -->

## Capturas

<!-- Antes/después o pantalla terminada frente al diseño. Si no hay cambios visibles, escribe "No aplica" -->

## Cómo probar

<!-- Pasos para validar el criterio de la historia -->

## Definición de Terminado

- [ ] Compila
- [ ] Pasa lint y pruebas
- [ ] Cumple el criterio de validación de la historia
- [ ] Respeta [CONVENCIONES.md](../CONVENCIONES.md)
- [ ] Incluye capturas o indica "No aplica"
- [ ] Al menos una revisión aprobada

## Reglas principales de este repositorio

- [ ] `app/` delgado: sin lógica ni HTTP
- [ ] Token solo con `tokenStorage.ts`; sin `any`; colores solo desde `theme/`
- [ ] Pantallas con estados de carga, error y vacío
- [ ] Sin secretos, sin `console.log`/`System.out.println`, sin código comentado
- [ ] Sin datos personales o clínicos en logs
