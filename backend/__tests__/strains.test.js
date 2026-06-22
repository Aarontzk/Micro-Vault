import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

const mockQuery = jest.fn();
jest.unstable_mockModule('../config/db.js', () => ({
  default: { query: mockQuery },
}));

const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

const token = jwt.sign(
  { userId: 1, email: 'a@b.com', role: 'admin', biosafety_clearance: 4 },
  'test-secret',
);
const auth = { Authorization: `Bearer ${token}` };

// First query in any authenticated route is the middleware user lookup.
const mockAuthUser = () =>
  mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, role: 'admin', biosafety_clearance: 4, deleted_at: null }] });

beforeEach(() => { mockQuery.mockReset(); });

describe('GET /api/strains', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/strains');
    expect(res.status).toBe(401);
  });

  it('returns paginated strains for an authenticated user', async () => {
    mockAuthUser();
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '2' }] });           // count
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'x', strain_code: 'MV-1' }] }); // page

    const res = await request(app).get('/api/strains?page=1&limit=10').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(2);
    expect(Array.isArray(res.body.strains)).toBe(true);
  });

  it('caps an excessive page size', async () => {
    mockAuthUser();
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] });
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/strains?limit=999999').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBeLessThanOrEqual(1000);
  });
});

describe('GET /api/strains/stats', () => {
  it('returns collection summary', async () => {
    mockAuthUser();
    mockQuery.mockResolvedValueOnce({ rows: [{ n: 5 }] });                       // total
    mockQuery.mockResolvedValueOnce({ rows: [{ t: 'BAKTERI', n: 5 }] });         // by type
    mockQuery.mockResolvedValueOnce({ rows: [{ b: 1, n: 5 }] });                 // by bsl
    mockQuery.mockResolvedValueOnce({ rows: [{ s: 'Tanah' }] });                 // samples
    mockQuery.mockResolvedValueOnce({ rows: [{ cellulolytic: 2, sequenced: 0 }] }); // potentials

    const res = await request(app).get('/api/strains/stats').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.byType.BAKTERI).toBe(5);
    expect(res.body.sampleTypes).toContain('Tanah');
  });
});

describe('POST /api/strains', () => {
  it('rejects invalid payload with 400', async () => {
    mockAuthUser();
    const res = await request(app).post('/api/strains').set(auth).send({ strain_code: '' });
    expect(res.status).toBe(400);
  });
});
