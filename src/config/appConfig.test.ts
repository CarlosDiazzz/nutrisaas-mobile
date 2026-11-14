// La configuración de Expo (app.config.js) debe rechazar una compilación de producción sin HTTPS.
type Configuracion = { android: { package: string }; plugins: unknown[] };
type FabricaDeConfiguracion = (entrada: { config: Record<string, unknown> }) => Configuracion;

const cargarConfiguracion = (): FabricaDeConfiguracion =>
  jest.requireActual<FabricaDeConfiguracion>('../../app.config.js');

const entrada = { config: { name: 'NutriSaaS', ios: {}, android: {}, plugins: [], extra: {} } };

describe('app.config.js', () => {
  const entornoOriginal = { ...process.env };
  afterEach(() => {
    process.env = { ...entornoOriginal };
  });

  it('en producción rechaza una URL de API sin https', () => {
    process.env.EAS_BUILD_PROFILE = 'production';
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.50:8082';
    expect(() => cargarConfiguracion()(entrada)).toThrow(/https/);
  });

  it('en producción rechaza que falte la URL de la API', () => {
    process.env.EAS_BUILD_PROFILE = 'production';
    delete process.env.EXPO_PUBLIC_API_URL;
    expect(() => cargarConfiguracion()(entrada)).toThrow(/EXPO_PUBLIC_API_URL/);
  });

  it('en producción acepta una URL https', () => {
    process.env.EAS_BUILD_PROFILE = 'production';
    process.env.EXPO_PUBLIC_API_URL = 'https://app.ejemplo.mx';
    expect(cargarConfiguracion()(entrada).android.package).toBe('mx.nutrisaas.paciente');
  });

  it('en desarrollo no exige https', () => {
    process.env.EAS_BUILD_PROFILE = 'development';
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.50:8082';
    expect(() => cargarConfiguracion()(entrada)).not.toThrow();
  });
});
