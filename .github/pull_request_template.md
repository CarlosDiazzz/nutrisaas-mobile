## Historia de usuario

HU-xx

## Descripción

<!-- Qué cambia y por qué -->

## Cómo probar

<!-- Pasos para validar el criterio de la historia -->

## Definición de Terminado

- [ ] Compila
- [ ] Pasa lint y pruebas
- [ ] Cumple el criterio de validación de la historia
- [ ] Respeta [CONVENCIONES.md](../CONVENCIONES.md)

## Reglas principales de este repositorio

- [ ] `app/` delgado: sin lógica ni HTTP
- [ ] Token solo con `tokenStorage.ts`; sin `any`; colores solo desde `theme/`
- [ ] Pantallas con estados de carga, error y vacío
- [ ] Sin secretos, sin `console.log`/`System.out.println`, sin código comentado
- [ ] Sin datos personales o clínicos en logs
