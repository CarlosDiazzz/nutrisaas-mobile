import { TrendingUp } from 'lucide-react-native';

import { EstadoVacio, Encabezado, Pantalla } from '@/components/ui';

/** Progreso: por ahora solo el estado vacío; la gráfica llega en la sección 3D. */
export default function ProgresoScreen() {
  return (
    <Pantalla fija>
      <Encabezado titulo="Progreso" />
      <EstadoVacio
        icono={TrendingUp}
        titulo="Aún no hay registros"
        texto="Aquí verás cómo cambia tu peso con el tiempo."
      />
    </Pantalla>
  );
}
