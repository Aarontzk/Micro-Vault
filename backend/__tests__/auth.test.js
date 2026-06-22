import { jest } from '@jest/globals';

process.env.JWT_SECRET = 'test-secret';

// Mock the DB layer so tests never touch a real database.
const mockQuery = jest.fn();
jest.unstable_mockModule('../config/db.js', () => ({
  default: { query: mockQuery },
}));

// Mock bcrypt to control password comparison.
const bcryptCompare = jest.fn();
jest.unstable_mockModule('bcryptjs', () => ({
  default: { compare: bcryptCompare, hash: jest.fn(async () => 'hashed') },
}));

const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

const validUser = {
  id: 1, email: 'a@b.com', password_hash: 'hash',
  full_name: 'Tester', role: 'admin', biosafety_clearance: 4, deleted_at: null,
};

beforeEach(() => {
  mockQuery.mockReset();
  bcryptCompare.mockReset();
});

describe('POST /api/auth/login', () => {
  it('rejects an invalid email format with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
  });

  it('returns 401 for an unknown user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret12345' });
    expect(res.status).toBe(401);
  });

  it('returns a token and user for valid credentials', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [validUser] }) // user lookup
      .mockResolvedValueOnce({ rows: [] });          // audit log insert
    bcryptCompare.mockResolvedValueOnce(true);

    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'secret12345' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('a@b.com');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('returns 401 for a wrong password', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [validUser] });
    bcryptCompare.mockResolvedValueOnce(false);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('security headers', () => {
  it('sets helmet headers', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
