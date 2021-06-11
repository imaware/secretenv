module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/[^.]+\\.test\\.(ts|js)'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
