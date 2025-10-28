module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  settings: { react: { version: 'detect' } },
  env: { browser: true, es2022: true, node: true },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};
