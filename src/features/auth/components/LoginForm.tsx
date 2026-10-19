import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Alerta, Boton, Campo } from '@/components/ui';

import { LoginFormValues, loginSchema } from '../schemas/loginSchema';

interface LoginFormProps {
  onSubmit: (datos: LoginFormValues) => void;
  cargando?: boolean;
  /** Error del servidor (credenciales incorrectas, cuenta que no es de paciente, sin conexión…). */
  errorMensaje?: string;
}

export default function LoginForm({ onSubmit, cargando = false, errorMensaje }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
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
            textContentType="emailAddress"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <Campo
            etiqueta="Contraseña"
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />
      {errorMensaje ? <Alerta texto={errorMensaje} /> : null}
      <Boton titulo="Iniciar sesión" onPress={handleSubmit(onSubmit)} cargando={cargando} />
    </View>
  );
}
