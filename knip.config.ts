import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  rules: {
    exports: 'warn',
    types: 'warn',
  },
  // Files to exclude from Knip analysis
  ignore: [
    'checkly.config.ts',
    'src/libs/I18n.ts',
    'src/types/I18n.ts',
    'docs/scripts/**',
    'src/components/analytics/PostHogProvider.tsx',
    'src/components/brand/LogoAcesso.tsx',
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [
    '@commitlint/types',
    '@clerk/shared',
    '@swc/helpers', // Avoid error in CI: "`npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync."
    'vite',
  ],
  // Include custom Playwright test file suffixes
  playwright: {
    entry: ['tests/**/*.@(integ|e2e).ts'],
  },
  // Binaries to ignore during analysis
  ignoreBinaries: [
    'production', // False positive raised with dotenv-cli
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join('\n'),
  },
  // Hints (e.g. stale ignore entries) must not fail CI when CI=true turns warnings into errors
  treatConfigHintsAsErrors: false,
};

export default config;
