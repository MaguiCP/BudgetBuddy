export default {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testEnvironment: 'node',

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/startServer.js',
  ],

  coverageThreshold: {
    global: {
      statements: 90,
      branches: 70,
      functions: 90,
      lines: 90,
    },
  },
};