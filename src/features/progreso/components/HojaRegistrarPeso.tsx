import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Alerta, Boton, Campo, HojaInferior } from '@/components/ui';
import { useYo } from '@/shared/hooks/useYo';
import { formatearDia, hoyEnZona, sumarDias } from '@/shared/utils/fechas';
import { colores, fuentes, medidas, radios, tamanos } from '@/theme';

import { useBorrarRegistro, useGuardarRegistro, useProgreso } from '../hooks/useProgreso';
import {
  aNumero,
  errorDeFecha,
  RegistroFormValues,
  registroSchema,
} from '../schemas/registroSchema';
import { Punto } from '../types';

const DIAS_HACIA_ATRAS = 90;
const SIN_REGISTRO: RegistroFormValues = { peso: '', cintura: '', notas: '' };

interface HojaRegistrarPesoProps {
  visible: boolean;
  /** Día a editar (por ejemplo, el de un registro tocado en la lista); por defecto, hoy. */
  fechaInicial?: string;
  onCerrar: () => void;
}

const aTexto = (numero: number | null) => (numero === null ? '' : numero.toFixed(1));

/** «Registrar mi peso»: la usan Inicio, Progreso y la notificación del recordatorio semanal. */
export default function HojaRegistrarPeso({
  visible,
  fechaInicial,
  onCerrar,
}: HojaRegistrarPesoProps) {
  const yo = useYo();
  // Con la hoja cerrada no se pide nada: solo se necesita el historial para precargar un día ya registrado.
  const historial = useProgreso('TODO', { habilitado: visible });
  const guardar = useGuardarRegistro();
  const borrar = useBorrarRegistro();
  const [elegida, setElegida] = useState<string | null>(null);
  const [mostrandoCalendario, setMostrandoCalendario] = useState(false);
  const [errorFecha, setErrorFecha] = useState<string | null>(null);

  const zona = yo.data?.consultorio.zonaHoraria;
  const hoy = zona ? hoyEnZona(zona) : null;
  const fecha = elegida ?? fechaInicial ?? hoy;
  const existente = useMemo(
    () =>
      historial.data?.puntos.find((p: Punto) => p.fecha === fecha && p.origen === 'PACIENTE') ??
      null,
    [historial.data, fecha],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: SIN_REGISTRO,
  });

  // Un día que ya tiene registro se abre con sus valores; uno nuevo, vacío.
  useEffect(() => {
    if (!visible) return;
    reset(
      existente
        ? {
            peso: aTexto(existente.pesoKg),
            cintura: aTexto(existente.cinturaCm),
            notas: existente.notas ?? '',
          }
        : SIN_REGISTRO,
    );
  }, [visible, existente, reset]);

  const cerrar = () => {
    setElegida(null);
    setErrorFecha(null);
    setMostrandoCalendario(false);
    guardar.reset();
    borrar.reset();
    onCerrar();
  };

  const enviar = (datos: RegistroFormValues) => {
    if (!fecha) return;
    guardar.mutate(
      {
        fecha,
        registro: {
          pesoKg: aNumero(datos.peso),
          cinturaCm: datos.cintura.trim() === '' ? null : aNumero(datos.cintura),
          notas: datos.notas.trim() === '' ? null : datos.notas.trim(),
        },
      },
      { onSuccess: cerrar },
    );
  };

  const confirmarBorrado = () => {
    if (!fecha) return;
    Alert.alert(
      'Borrar registro',
      `¿Borrar tu registro del ${formatearDia(fecha).toLowerCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => borrar.mutate(fecha, { onSuccess: cerrar }),
        },
      ],
    );
  };

  const error = errorFecha ?? guardar.error?.message ?? borrar.error?.message;
  return (
    <HojaInferior visible={visible} titulo="Registrar mi peso" onCerrar={cerrar}>
      {fecha && hoy ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fecha: ${etiquetaDeFecha(fecha, hoy)}`}
          onPress={() => setMostrandoCalendario(true)}
          style={estilos.fecha}
        >
          <Text style={estilos.etiqueta}>Fecha</Text>
          <Text style={estilos.valorFecha}>{etiquetaDeFecha(fecha, hoy)}</Text>
        </Pressable>
      ) : null}
      {mostrandoCalendario && fecha && hoy ? (
        <DateTimePicker
          value={new Date(`${fecha}T12:00:00`)}
          mode="date"
          maximumDate={new Date(`${hoy}T12:00:00`)}
          minimumDate={new Date(`${sumarDias(hoy, -DIAS_HACIA_ATRAS)}T12:00:00`)}
          onChange={(_evento, seleccion) => {
            setMostrandoCalendario(false);
            if (!seleccion) return;
            const dia = diaLocal(seleccion);
            const error = errorDeFecha(dia, hoy, sumarDias(hoy, -DIAS_HACIA_ATRAS));
            setErrorFecha(error);
            if (!error) setElegida(dia);
          }}
        />
      ) : null}

      <View style={estilos.fila}>
        <View style={estilos.columna}>
          <Controller
            control={control}
            name="peso"
            render={({ field: { value, onChange, onBlur } }) => (
              <Campo
                etiqueta="Peso (kg)"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.peso?.message}
                estiloEntrada={estilos.peso}
              />
            )}
          />
        </View>
        <View style={estilos.columna}>
          <Controller
            control={control}
            name="cintura"
            render={({ field: { value, onChange, onBlur } }) => (
              <Campo
                etiqueta="Cintura (cm) · opcional"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.cintura?.message}
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="notas"
        render={({ field: { value, onChange, onBlur } }) => (
          <Campo
            etiqueta="Notas · opcional"
            placeholder="¿Cómo te sentiste esta semana?"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.notas?.message}
            ayuda="Solo un registro por día; si ya registraste ese día, se actualiza."
          />
        )}
      />
      {error ? <Alerta texto={error} /> : null}
      <Boton
        titulo={existente ? 'Actualizar registro' : 'Guardar registro'}
        onPress={handleSubmit(enviar)}
        cargando={guardar.isPending}
      />
      {existente ? (
        <View style={estilos.borrar}>
          <Boton
            titulo="Borrar registro"
            variante="peligro"
            onPress={confirmarBorrado}
            cargando={borrar.isPending}
          />
        </View>
      ) : null}
    </HojaInferior>
  );
}

/** «Hoy, lunes 15 de marzo» o «Lunes 8 de marzo». */
function etiquetaDeFecha(fecha: string, hoy: string): string {
  return fecha === hoy ? `Hoy, ${formatearDia(fecha).toLowerCase()}` : formatearDia(fecha);
}

/** El día que el selector eligió, en la hora del teléfono (el selector trabaja con fechas locales). */
function diaLocal(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

const estilos = StyleSheet.create({
  fecha: {
    minHeight: medidas.alturaCampo,
    justifyContent: 'center',
    borderRadius: radios.campo,
    borderWidth: 1,
    borderColor: colores.bordeInput,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  etiqueta: { fontFamily: fuentes.semibold, fontSize: 12, color: colores.etiqueta },
  valorFecha: { fontFamily: fuentes.normal, fontSize: tamanos.campo, color: colores.texto },
  fila: { flexDirection: 'row', gap: 12 },
  columna: { flex: 1 },
  peso: { fontFamily: fuentes.negrita },
  borrar: { marginTop: 8 },
});
