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
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverage: true
};
