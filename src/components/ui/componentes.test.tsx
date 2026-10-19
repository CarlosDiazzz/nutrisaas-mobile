import { Inbox } from 'lucide-react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import {
  Alerta,
  Encabezado,
  Esqueleto,
  EstadoVacio,
  Estadistica,
  EtiquetaSeccion,
  FilaAlimento,
  FilaTiempoComida,
  HojaInferior,
  Insignia,
  Pantalla,
  Segmentado,
  SelectorDia,
  Tarjeta,
} from '.';

const DIAS = [
  { clave: '2027-03-15', letra: 'L', numero: 15 },
  { clave: '2027-03-16', letra: 'M', numero: 16 },
  { clave: '2027-03-17', letra: 'M', numero: 17 },
];

describe('componentes de interfaz', () => {
  it('Pantalla muestra su contenido', async () => {
    await render(
      <Pantalla>
        <Text>Contenido</Text>
      </Pantalla>,
    );

    expect(screen.getByText('Contenido')).toBeOnTheScreen();
  });

  it('Pantalla fija no usa desplazamiento', async () => {
    await render(
      <Pantalla fija>
        <Text>Fija</Text>
      </Pantalla>,
    );

    expect(screen.getByText('Fija')).toBeOnTheScreen();
  });

  it('Encabezado expone el título como encabezado y muestra subtítulo y acción', async () => {
    await render(
      <Encabezado titulo="Hola, Ana" subtitulo="Lunes 15 de marzo" accion={<Text>campana</Text>} />,
    );

    expect(screen.getByRole('header', { name: 'Hola, Ana' })).toBeOnTheScreen();
    expect(screen.getByText('Lunes 15 de marzo')).toBeOnTheScreen();
    expect(screen.getByText('campana')).toBeOnTheScreen();
  });

  it('Tarjeta destacada usa el fondo primario', async () => {
    await render(
      <Tarjeta destacada>
        <Text>Próxima cita</Text>
      </Tarjeta>,
    );

    expect(screen.getByText('Próxima cita').parent).toHaveStyle({ backgroundColor: '#2E7D5B' });
  });

  it('Insignia muestra su texto con los colores de su variante', async () => {
    await render(<Insignia texto="Alergia: nuez" variante="error" />);

    expect(screen.getByText('Alergia: nuez')).toHaveStyle({ color: '#a5281b' });
  });

  it('Alerta se anuncia como alerta', async () => {
    await render(<Alerta texto="Correo o contraseña incorrectos." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
  });

  it('EtiquetaSeccion escribe el texto en mayúsculas', async () => {
    await render(<EtiquetaSeccion texto="Mi nutrióloga" />);

    expect(screen.getByText('MI NUTRIÓLOGA')).toBeOnTheScreen();
  });

  it('Segmentado marca la opción activa y avisa el cambio', async () => {
    const alCambiar = jest.fn();
    await render(
      <Segmentado
        opciones={[
          { valor: 'MENU', etiqueta: 'Menú' },
          { valor: 'EQUIVALENTES', etiqueta: 'Equivalentes' },
        ]}
        valor="MENU"
        onCambiar={alCambiar}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Menú' })).toBeSelected();

    await fireEvent.press(screen.getByRole('tab', { name: 'Equivalentes' }));

    expect(alCambiar).toHaveBeenCalledWith('EQUIVALENTES');
  });

  it('SelectorDia selecciona un día y marca el actual', async () => {
    const alSeleccionar = jest.fn();
    await render(
      <SelectorDia dias={DIAS} seleccionado="2027-03-15" onSeleccionar={alSeleccionar} />,
    );
    expect(screen.getByRole('button', { name: 'Día 15' })).toBeSelected();

    await fireEvent.press(screen.getByRole('button', { name: 'Día 16' }));

    expect(alSeleccionar).toHaveBeenCalledWith('2027-03-16');
  });

  it('FilaTiempoComida muestra nombre, resumen y kcal con separador de miles, y es tocable', async () => {
    const alTocar = jest.fn();
    await render(
      <FilaTiempoComida
        tiempo="DESAYUNO"
        nombre="Desayuno"
        resumen="Huevo, tortillas y papaya"
        kcal={1440}
        onPress={alTocar}
      />,
    );

    expect(screen.getByText('1,440')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /Desayuno/ }));
    expect(alTocar).toHaveBeenCalled();
  });

  it('FilaAlimento muestra la cantidad y una insignia por aviso, con su color', async () => {
    await render(
      <FilaAlimento
        nombre="Almendras"
        cantidad="10 piezas"
        alertas={[{ tipo: 'ALERGIA', texto: 'Alergia: nuez' }]}
      />,
    );

    expect(screen.getByText('10 piezas')).toBeOnTheScreen();
    expect(screen.getByText('Alergia: nuez')).toHaveStyle({ color: '#a5281b' });
  });

  it('Estadistica se lee como una sola frase', async () => {
    await render(<Estadistica etiqueta="Cambio" valor="−5.1 kg" />);

    expect(screen.getByLabelText('Cambio: −5.1 kg')).toBeOnTheScreen();
  });

  it('HojaInferior muestra el título y su contenido solo cuando está visible', async () => {
    const { rerender } = await render(
      <HojaInferior visible titulo="Registrar peso" onCerrar={() => {}}>
        <Text>Formulario</Text>
      </HojaInferior>,
    );
    expect(screen.getByRole('header', { name: 'Registrar peso' })).toBeOnTheScreen();
    expect(screen.getByText('Formulario')).toBeOnTheScreen();

    await rerender(
      <HojaInferior visible={false} titulo="Registrar peso" onCerrar={() => {}}>
        <Text>Formulario</Text>
      </HojaInferior>,
    );

    expect(screen.queryByText('Formulario')).not.toBeOnTheScreen();
  });

  it('HojaInferior se cierra al tocar el fondo', async () => {
    const alCerrar = jest.fn();
    await render(
      <HojaInferior visible titulo="Registrar peso" onCerrar={alCerrar}>
        <Text>Formulario</Text>
      </HojaInferior>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar' }));

    expect(alCerrar).toHaveBeenCalled();
  });

  it('EstadoVacio muestra título y texto', async () => {
    await render(
      <EstadoVacio
        icono={Inbox}
        titulo="Sin citas próximas"
        texto="Tu nutrióloga aún no agenda."
      />,
    );

    expect(screen.getByText('Sin citas próximas')).toBeOnTheScreen();
    expect(screen.getByText('Tu nutrióloga aún no agenda.')).toBeOnTheScreen();
  });

  it('Esqueleto se anuncia como cargando', async () => {
    await render(<Esqueleto alto={20} />);

    expect(screen.getByLabelText('Cargando')).toBeOnTheScreen();
  });
});
