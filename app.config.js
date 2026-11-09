// Configuración dinámica de Expo: extiende app.json con lo que depende del entorno (variante de desarrollo,
// credenciales de FCM y proyecto de EAS). Los secretos nunca van aquí: llegan por variables de entorno o archivos
// que no se suben al repositorio (ver nutrisaas-infra/docs/movil.md).
const fs = require('node:fs');

// Un solo identificador para todas las variantes: así basta registrar una app de Android en Firebase.
const PAQUETE = 'mx.nutrisaas.paciente';

module.exports = ({ config }) => {
  const esDesarrollo = process.env.APP_VARIANT === 'development';
  // El archivo de Firebase de Android se pasa como archivo de EAS (GOOGLE_SERVICES_JSON) o se deja en la raíz.
  const googleServices = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';

  return {
    ...config,
    name: esDesarrollo ? 'NutriSaaS (desarrollo)' : config.name,
    ios: { ...config.ios, bundleIdentifier: PAQUETE },
    android: {
      ...config.android,
      package: PAQUETE,
      ...(fs.existsSync(googleServices) ? { googleServicesFile: googleServices } : {}),
    },
    plugins: [
      ...config.plugins,
      // HTTP sin cifrar (el backend local) solo en la variante de desarrollo; preview y production exigen HTTPS.
      ['expo-build-properties', { android: { usesCleartextTraffic: esDesarrollo } }],
      ['expo-notifications', { color: '#2E7D5B', defaultChannel: 'default' }],
    ],
    extra: {
      ...config.extra,
      // Lo crea `eas init` en la cuenta de Expo de quien publica; se exporta como EAS_PROJECT_ID.
      eas: { projectId: process.env.EAS_PROJECT_ID },
    },
  };
};
