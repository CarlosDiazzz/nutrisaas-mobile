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
