// API pública del feature: lo único que otros features y `app/` pueden importar de él.
export { configurarManejador } from './push/pushNativo';
export { useAbrirNotificacion } from './hooks/useAbrirNotificacion';
export { usePreferenciaPush } from './hooks/usePreferenciaPush';
export { useRegistroPush } from './hooks/useRegistroPush';
export { default as AvisosScreen } from './screens/AvisosScreen';
