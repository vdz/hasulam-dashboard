import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import comments from '@eslint-community/eslint-plugin-eslint-comments';

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'src/lib/db/types.gen.ts', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    plugins: { '@next/next': nextPlugin, '@eslint-community/eslint-comments': comments },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true }],
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['@supabase/*'], message: 'Only src/lib/db/* may import the Supabase client.' }],
      }],
    },
  },
  {
    files: ['src/lib/db/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['**/*.config.*', 'scripts/**', 'eslint.config.mjs'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: { ...tseslint.configs.disableTypeChecked.languageOptions, globals: globals.node },
  },
);
