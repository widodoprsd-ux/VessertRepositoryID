/**
 * VessertRepositoryID - ESLint Configuration
 * Self-contained static analysis rules
 * Enforces clean boundaries across /src, /editor, /test, and /internal-ui
 */

export default [
  // 1. Files & Folders to Ignore
  {
    name: 'vessertid:ignores',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.git/**',
      '**/site.webmanifest'
    ]
  },

  // 2. Base Rules for Project JavaScript & Static Handlers
  {
    name: 'vessertid:base',
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // Browser & Runtime Globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Node.js Globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        URL: 'readonly',
        // VessertID Specific Design System Globals
        __VESSERT_VERSION__: 'readonly',
        VessertID: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
      'no-duplicate-imports': 'error',
      'no-irregular-whitespace': 'error',
      'no-undef': 'error'
    }
  },

  // 3. Editor & Tools Rules
  {
    name: 'vessertid:editor',
    files: ['editor/**/*.js', 'tools/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module'
    }
  },

  // 4. Test Isolation Rules
  {
    name: 'vessertid:tests',
    files: ['test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/dist/*'],
              message: 'Tests must import from source modules or internal-ui, not /dist as dist is not guaranteed to be fresh.'
            }
          ]
        }
      ]
    }
  }
];
