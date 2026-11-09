import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Alerta, Boton, Campo } from '@/components/ui';
import { fuentes } from '@/theme';

import { ActivarFormValues, activarSchema, formatearCodigo } from '../schemas/activarSchema';

interface ActivarFormProps {
  onSubmit: (datos: ActivarFormValues) => void;
  cargando?: boolean;
  errorMensaje?: string;
}

export default function ActivarForm({
  onSubmit,
  cargando = false,
  errorMensaje,
}: ActivarFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivarFormValues>({
    resolver: zodResolver(activarSchema),
    defaultValues: { email: '', codigo: '', password: '', confirmacion: '' },
  });

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <Campo
            etiqueta="Correo electrónico"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="codigo"
        render={({ field: { value, onChange, onBlur } }) => (
          <Campo
            etiqueta="Código de invitación"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={9}
            value={value}
            onChangeText={(escrito) => onChange(formatearCodigo(escrito))}
            onBlur={onBlur}
            error={errors.codigo?.message}
            estiloEntrada={estilos.codigo}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <Campo
            etiqueta="Crea una contraseña"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            ayuda="Mínimo 10 caracteres."
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmacion"
        render={({ field: { value, onChange, onBlur } }) => (
          <Campo
            etiqueta="Confirma la contraseña"
            secureTextEntry
            autoComplete="new-password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmacion?.message}
          />
        )}
      />
      {errorMensaje ? <Alerta texto={errorMensaje} /> : null}
      <Boton titulo="Activar cuenta" onPress={handleSubmit(onSubmit)} cargando={cargando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  codigo: { letterSpacing: 3, fontFamily: fuentes.negrita },
});
