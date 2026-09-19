import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // The app is type-documented with JSDoc typedefs (`src/types`), so
      // runtime prop-types would be duplicated weight in the bundle.
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      // Typographic apostrophes and quotes are intentional in the copy.
      'react/no-unescaped-entities': 'off',

      'no-console': ['error', { allow: ['debug', 'warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-implicit-coercion': 'warn',
      'object-shorthand': 'warn',
      'react/jsx-no-target-blank': 'error',
      'react/no-array-index-key': 'off', // charts use index keys by design (fixed-length series)
    },
  },

  {
    files: ['tests/**/*.{js,jsx}', 'scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off' },
  },

  // Must stay last: disables rules that would fight Prettier's formatting.
  prettier,
];
