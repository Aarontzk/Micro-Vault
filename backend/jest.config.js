export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'app.js',
  ],
  coverageReporters: ['text', 'text-summary'],
};
