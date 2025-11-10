// Shared ESLint configuration used by both backend and frontend projects.
// Keep this file framework-agnostic so it can be spread into flat configs.

/** @type {import('eslint').Linter.FlatConfig[]} */
const sharedConfig = [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console':
        process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger':
        process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
];

export default sharedConfig;


