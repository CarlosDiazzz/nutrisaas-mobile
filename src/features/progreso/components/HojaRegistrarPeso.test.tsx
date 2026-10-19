import { QueryClient } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { httpClient } from '@/api/httpClient';
import { clienteSinSesion } from '@/api/renovarSesion';
import { fijarTokenAcceso } from '@/auth/sesionEnMemoria';
import { eliminarTokenRenovacion } from '@/auth/tokenStorage';
import { Yo } from '@/shared/types/paciente';
import { crearAdaptadorFalso, problema } from '@/test/adaptadorFalso';
import { renderizarConSesion } from '@/test/proveedores';

import { Progreso, Punto } from '../types';

import HojaRegistrarPeso from './HojaRegistrarPeso';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: object) => <View testID="selector-fecha" {...props} />,
  };
});

const YO: Yo = {
  paciente: {
    id: 15,
    nombre: 'Ana',
    nombreCompleto: 'Ana López Ruiz',
    email: 'ana.lopez@correo.mx',
  },
  nutriologo: { nombreCompleto: 'Laura Méndez Torres' },
  consultorio: {
    nombre: 'NutriSalud',
    telefono: null,
    direccion: null,
    zonaHoraria: 'America/Mexico_City',
  },
  consentimiento: null,
};

const registro = (fecha: string, pesoKg: number, extra: Partial<Punto> = {}): Punto => ({
  fecha,
  pesoKg,
  cinturaCm: null,
  notas: null,
  origen: 'PACIENTE',
  oculto: false,
  ...extra,
});

const historial = (puntos: Punto[]): Progreso => ({
  rango: 'TODO',
  desde: null,
  resumen: null,
  puntos,
});

function servidor(
  puntos: Punto[] = [],
  alGuardar?: (peticion: { url?: string; method?: string; data?: string }) => void,
) {
  const llamadas = crearAdaptadorFalso((peticion) => {
    if (peticion.url === '/api/paciente/yo') return { status: 200, data: YO };
    if (peticion.url === '/api/paciente/progreso') return { status: 200, data: historial(puntos) };
    alGuardar?.(peticion);
    return { status: 200, data: {} };
  });
  httpClient.defaults.adapter = llamadas.adaptador;
  return llamadas;
}

const escritas = (llamadas: ReturnType<typeof servidor>) =>
  llamadas.peticiones.filter((p) => p.method !== 'get');

async function abrir(props: { fechaInicial?: string } = {}, cliente?: QueryClient) {
  const onCerrar = jest.fn();
  await renderizarConSesion(<HojaRegistrarPeso visible onCerrar={onCerrar} {...props} />, cliente);
  return onCerrar;
}

describe('HojaRegistrarPeso', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    // Lunes 15/03/2027 a las 10:00 en Oaxaca.
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2027-03-15T16:00:00Z').getTime());
    fijarTokenAcceso('acceso-1');
    await eliminarTokenRenovacion();
    clienteSinSesion.defaults.adapter = crearAdaptadorFalso(() =>
      problema(401, 'Expiró'),
    ).adaptador;
  });

  it('abre en hoy con los campos vacíos y el botón «Guardar registro»', async () => {
    servidor();
    await abrir();

    expect(await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Peso (kg)').props.value).toBe('');
    expect(screen.getByRole('button', { name: 'Guardar registro' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Borrar registro' })).not.toBeOnTheScreen();
  });

  it('guarda el peso con coma decimal como número y cierra la hoja', async () => {
    const llamadas = servidor();
    const onCerrar = await abrir();
    await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo');

    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '67,3');
    await fireEvent.changeText(screen.getByLabelText('Cintura (cm) · opcional'), '78.0');
    await fireEvent.changeText(screen.getByLabelText('Notas · opcional'), '  Después de caminar ');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));

    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
    const guardado = escritas(llamadas)[0];
    expect(guardado.method).toBe('put');
    expect(guardado.url).toBe('/api/paciente/registros/2027-03-15');
    expect(JSON.parse(guardado.data as string)).toEqual({
      pesoKg: 67.3,
      cinturaCm: 78,
      notas: 'Después de caminar',
    });
  });

  it('los campos opcionales vacíos viajan como nulos', async () => {
    const llamadas = servidor();
    await abrir();
    await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo');

    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '67.3');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));

    await waitFor(() => expect(escritas(llamadas)).toHaveLength(1));
    expect(JSON.parse(escritas(llamadas)[0].data as string)).toEqual({
      pesoKg: 67.3,
      cinturaCm: null,
      notas: null,
    });
  });

  it('después de guardar refresca el progreso y el inicio', async () => {
    servidor();
    const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidar = jest.spyOn(cliente, 'invalidateQueries');
    await abrir({}, cliente);
    await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo');

    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '67.3');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));

    await waitFor(() => expect(invalidar).toHaveBeenCalledTimes(2));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['paciente', 'progreso'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['paciente', 'inicio'] });
  });

  it('un día que ya tiene registro se abre con sus valores y el botón dice «Actualizar registro»', async () => {
    servidor([registro('2027-03-15', 67.3, { cinturaCm: 78, notas: 'Mañana' })]);
    await abrir();

    expect(await screen.findByRole('button', { name: 'Actualizar registro' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Peso (kg)').props.value).toBe('67.3');
    expect(screen.getByLabelText('Cintura (cm) · opcional').props.value).toBe('78.0');
    expect(screen.getByLabelText('Notas · opcional').props.value).toBe('Mañana');
    expect(screen.getByRole('button', { name: 'Borrar registro' })).toBeOnTheScreen();
  });

  it('una consulta del mismo día no cuenta como registro propio: la hoja abre vacía', async () => {
    servidor([registro('2027-03-15', 68.5, { origen: 'CONSULTA' })]);
    await abrir();

    expect(await screen.findByRole('button', { name: 'Guardar registro' })).toBeOnTheScreen();
  });

  it('abre en el día del registro tocado y actualiza ese día', async () => {
    const llamadas = servidor([registro('2027-03-08', 67.6)]);
    const onCerrar = await abrir({ fechaInicial: '2027-03-08' });

    expect(await screen.findByLabelText('Fecha: Lunes 8 de marzo')).toBeOnTheScreen();
    await screen.findByRole('button', { name: 'Actualizar registro' });
    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '67,5');
    await fireEvent.press(screen.getByRole('button', { name: 'Actualizar registro' }));

    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
    expect(escritas(llamadas)[0].url).toBe('/api/paciente/registros/2027-03-08');
    expect(JSON.parse(escritas(llamadas)[0].data as string).pesoKg).toBe(67.5);
  });

  it('exige el peso y lo valida', async () => {
    const llamadas = servidor();
    await abrir();
    await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo');

    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(await screen.findByText('El peso es obligatorio')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '0');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(await screen.findByText('Escribe un peso mayor a 0')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '500');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(await screen.findByText('El peso debe ser menor a 500 kg')).toBeOnTheScreen();
    expect(escritas(llamadas)).toHaveLength(0);
  });

  it('una fecha futura elegida en el calendario se rechaza con su mensaje y no cambia la fecha', async () => {
    servidor();
    await abrir();
    await fireEvent.press(await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo'));

    await fireEvent(screen.getByTestId('selector-fecha'), 'change', {}, new Date(2027, 2, 16, 12));

    expect(await screen.findByText('No puedes registrar una fecha futura.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Fecha: Hoy, lunes 15 de marzo')).toBeOnTheScreen();
  });

  it('una fecha de hace más de 90 días también se rechaza', async () => {
    servidor();
    await abrir();
    await fireEvent.press(await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo'));

    await fireEvent(screen.getByTestId('selector-fecha'), 'change', {}, new Date(2026, 11, 14, 12));

    expect(await screen.findByText('Solo puedes registrar los últimos 90 días.')).toBeOnTheScreen();
  });

  it('elegir un día válido en el calendario cambia la fecha del registro', async () => {
    const llamadas = servidor();
    await abrir();
    await fireEvent.press(await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo'));

    await fireEvent(screen.getByTestId('selector-fecha'), 'change', {}, new Date(2027, 2, 10, 12));
    expect(await screen.findByLabelText('Fecha: Miércoles 10 de marzo')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '67.9');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));

    await waitFor(() => expect(escritas(llamadas)).toHaveLength(1));
    expect(escritas(llamadas)[0].url).toBe('/api/paciente/registros/2027-03-10');
  });

  it('borrar pide confirmación y, al confirmar, borra el registro de ese día', async () => {
    const llamadas = servidor([registro('2027-03-15', 67.3)]);
    const aviso = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const onCerrar = await abrir();

    await fireEvent.press(await screen.findByRole('button', { name: 'Borrar registro' }));
    expect(escritas(llamadas)).toHaveLength(0);
    expect(aviso).toHaveBeenCalledWith(
      'Borrar registro',
      '¿Borrar tu registro del lunes 15 de marzo?',
      expect.any(Array),
    );
    const botones = aviso.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    botones.find((b) => b.text === 'Borrar')?.onPress?.();

    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
    expect(escritas(llamadas)[0].method).toBe('delete');
    expect(escritas(llamadas)[0].url).toBe('/api/paciente/registros/2027-03-15');
  });

  it('un error del servidor se muestra en la hoja y no la cierra', async () => {
    httpClient.defaults.adapter = crearAdaptadorFalso((peticion) => {
      if (peticion.url === '/api/paciente/yo') return { status: 200, data: YO };
      if (peticion.url === '/api/paciente/progreso') return { status: 200, data: historial([]) };
      return problema(400, 'No puedes registrar una fecha futura.', 'Solicitud inválida');
    }).adaptador;
    const onCerrar = await abrir();
    await screen.findByLabelText('Fecha: Hoy, lunes 15 de marzo');

    await fireEvent.changeText(screen.getByLabelText('Peso (kg)'), '67.3');
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar registro' }));

    expect(await screen.findByText('No puedes registrar una fecha futura.')).toBeOnTheScreen();
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
