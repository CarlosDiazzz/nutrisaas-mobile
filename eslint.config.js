const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettier,
  { ignores: ['dist/*', '.expo/*'] },
  {
    // Reglas de CONVENCIONES.md hechas verificables por el linter.
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'Usa httpClient desde un servicio (src/api/httpClient.ts).' },
            {
              name: '@react-native-async-storage/async-storage',
              message: 'El token va solo en expo-secure-store (src/auth/tokenStorage.ts).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/api/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['app/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/services/*', '**/api/*'], message: 'app/ solo renderiza pantallas.' },
          ],
        },
      ],
    },
  },
]);
