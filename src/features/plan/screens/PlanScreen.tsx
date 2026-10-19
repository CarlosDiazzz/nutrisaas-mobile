import { ClipboardList } from 'lucide-react-native';

import { EstadoVacio, Encabezado, Pantalla } from '@/components/ui';

/** Mi plan: por ahora solo el estado vacío; el plan completo llega en la sección 3C. */
export default function PlanScreen() {
  return (
    <Pantalla fija>
      <Encabezado titulo="Mi plan" />
      <EstadoVacio
        icono={ClipboardList}
        titulo="Tu nutrióloga aún no activa tu plan."
        texto="Cuando lo active, lo verás aquí."
      />
    </Pantalla>
  );
}
