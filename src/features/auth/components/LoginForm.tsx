import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { colores, espaciado, tipografia } from '@/theme';

import { LoginFormValues, loginSchema } from '../schemas/loginSchema';

interface LoginFormProps {
  onSubmit: (datos: LoginFormValues) => void;
  cargando?: boolean;
  errorMensaje?: string;
}

export default function LoginForm({ onSubmit, cargando = false, errorMensaje }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: '', contrasena: '' },
  });

  return (
    <View style={estilos.formulario}>
      <Controller
        control={control}
        name="correo"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            etiqueta="Correo electrónico"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.correo?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="contrasena"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            etiqueta="Contraseña"
            secureTextEntry
            autoComplete="password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.contrasena?.message}
          />
        )}
      />
      {errorMensaje ? <Text style={estilos.error}>{errorMensaje}</Text> : null}
      <Button titulo="Iniciar sesión" onPress={handleSubmit(onSubmit)} cargando={cargando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: { gap: espaciado.md },
  error: { color: colores.error, fontSize: tipografia.tamanoPequeno },
});
