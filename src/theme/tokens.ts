// Mismos nombres y valores que `@theme` de la web (nutrisaas-web/src/index.css).
// Ningún componente escribe colores, tamaños ni fuentes sueltos: todo sale de aquí.
export const colores = {
  primario: '#2E7D5B',
  primarioOscuro: '#276b4d',
  primarioClaro: '#e6f2ec',
  lateral: '#183d2e',
  avatar: '#5bc28f',
  avatarTexto: '#10291f',
  fondo: '#f3f6f4',
  superficie: '#ffffff',
  superficieSuave: '#f8faf9',
  borde: '#dde3df',
  bordeInput: '#cfd8d3',
  texto: '#1f2933',
  textoSuave: '#6b7280',
  textoPlaceholder: '#9aa5a0',
  etiqueta: '#374151',
  linea: '#eef1ef',
  segmentadoFondo: '#e9eeeb',
  blanco: '#ffffff',
  sobrePrimarioSuave: '#cfe8db',
  etiquetaSobrePrimario: '#bfe3cd',
  asa: '#d6dcd8',
  fondoAtenuado: 'rgba(16, 30, 24, 0.45)',
  peligro: '#c0392b',
  peligroFondo: '#fff6f5',
  peligroBorde: '#f0c6c0',
  insignia: {
    ok: { fondo: '#e3f4ea', texto: '#1e6b47' },
    aviso: { fondo: '#fdf2dc', texto: '#8a5a0b' },
    info: { fondo: '#e7eefc', texto: '#1d4ed8' },
    neutro: { fondo: '#eef0ef', texto: '#4b5563' },
    error: { fondo: '#fdecea', texto: '#a5281b' },
  },
  alerta: {
    error: { fondo: '#fdecea', texto: '#8c2318', borde: '#f5c6c0' },
    exito: { fondo: '#e3f4ea', texto: '#1e6b47', borde: '#bfe3cd' },
    aviso: { fondo: '#fdf2dc', texto: '#8a5a0b', borde: '#f0d9a8' },
  },
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  margenPantalla: 18,
} as const;

export const radios = {
  insignia: 99,
  selector: 10,
  campo: 12,
  boton: 12,
  tarjeta: 16,
  hoja: 22,
} as const;

/** Medidas de la sección 1 del complemento de diseño (390 × 844 pt). */
export const medidas = {
  objetivoTactilMinimo: 44,
  alturaCampo: 50,
  alturaBoton: 50,
  alturaBotonCompacto: 44,
  alturaBarraPestanas: 68,
  iconoPestana: 20,
  asaHoja: { ancho: 42, alto: 5 },
} as const;

// Fuentes de Inter (@expo-google-fonts/inter): en React Native el peso va en el nombre de la fuente.
export const fuentes = {
  normal: 'Inter_400Regular',
  media: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  negrita: 'Inter_700Bold',
  extranegrita: 'Inter_800ExtraBold',
} as const;

export const tamanos = {
  titulo: 24,
  tituloSeccion: 18,
  cuerpo: 15,
  campo: 16,
  boton: 16,
  subtitulo: 14,
  pequeno: 13,
  etiquetaPestana: 11.5,
  etiquetaSeccion: 12,
  insignia: 11.5,
} as const;
