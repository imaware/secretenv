const base = require('./jest.config.js');
module.exports = {
  ...base,
  testMatch: ['**/__tests__/[^.]+\\.integration\\.test\\.(ts|js)'],
};
