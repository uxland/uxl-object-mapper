module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/unit/setup.ts'],
  transformIgnorePatterns: [],
  transform: {
    '^.+\\\\node_modules\\\\.*?\\\\es\\\\.*?\\\\*?.js$': 'ts-jest',
    '^.+\\node_modules\\.*?\\es\\.*?\\*?.js$': 'ts-jest',
    '^.+/node_modules/.*?/es/.*?/*?.js$': 'ts-jest',
    '^.+\\.ts$': 'ts-jest',
    '^.+.ts$': 'ts-jest'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/test/unit/benchmark.spec.ts',
    '<rootDir>/test/unit/sandbox.spec.ts'
  ],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverage: true,
  globals: {
    'ts-jest': {
      babelConfig: {
        comments: false,
        plugins: ['@babel/plugin-proposal-optional-chaining']
      }
    }
  }
};
