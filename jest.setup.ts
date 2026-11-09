// expo-secure-store necesita el módulo nativo: en las pruebas se sustituye por un almacén en memoria.
jest.mock('expo-secure-store', () => {
  const almacen = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (clave: string, valor: string) => {
      almacen.set(clave, valor);
    }),
    getItemAsync: jest.fn(async (clave: string) => almacen.get(clave) ?? null),
    deleteItemAsync: jest.fn(async (clave: string) => {
      almacen.delete(clave);
    }),
  };
});

// Los módulos nativos de notificaciones no existen en Jest: valores por defecto de un teléfono real al que aún
// no se le ha pedido el permiso. Cada prueba cambia lo que necesita.
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ granted: false, status: 'undetermined', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[abc]', type: 'expo' })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  AndroidImportance: { HIGH: 4 },
  PermissionStatus: { UNDETERMINED: 'undetermined', GRANTED: 'granted', DENIED: 'denied' },
}));
jest.mock('expo-device', () => ({ isDevice: true }));
