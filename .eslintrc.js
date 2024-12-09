module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true, // Agregar esto para reconocer las variables globales de Node.js
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    // ...tus reglas personalizadas...
  },
  globals: {
    require: 'readonly', // Agregar esto para reconocer `require`
    module: 'readonly',  // Agregar esto para reconocer `module`
    process: 'readonly', // Agregar esto para reconocer `process`
  },
};
