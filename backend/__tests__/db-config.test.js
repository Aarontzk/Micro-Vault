import { jest } from '@jest/globals';

const dotenvConfig = jest.fn();
const Pool = jest.fn(function Pool(options) {
  this.options = options;
});

jest.unstable_mockModule('dotenv', () => ({
  default: { config: dotenvConfig },
}));

jest.unstable_mockModule('pg', () => ({
  default: { Pool },
}));

await import('../config/db.js');

describe('database config', () => {
  it('loads backend/.env independent of the process working directory', () => {
    expect(dotenvConfig).toHaveBeenCalledWith({
      path: expect.stringMatching(/backend[\\/]\.env$/),
    });
  });
});
