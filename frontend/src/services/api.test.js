import { handleAuthSessionError, isAuthSessionError } from './api';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
}));

describe('auth session API errors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('recognizes backend errors that mean the cached session is invalid', () => {
    expect(isAuthSessionError({
      response: { status: 403, data: { error: 'Invalid or expired token' } },
    })).toBe(true);
  });

  it('clears cached auth data and redirects to login for invalid sessions', () => {
    localStorage.setItem('token', 'old-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    const location = { pathname: '/dashboard', assign: jest.fn() };

    const handled = handleAuthSessionError({
      response: { status: 403, data: { error: 'Invalid or expired token' } },
    }, { storage: localStorage, location });

    expect(handled).toBe(true);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(location.assign).toHaveBeenCalledWith('/login');
  });

  it('does not clear the session for non-auth authorization failures', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    const location = { pathname: '/dashboard', assign: jest.fn() };

    const handled = handleAuthSessionError({
      response: { status: 403, data: { error: 'Insufficient biosafety clearance' } },
    }, { storage: localStorage, location });

    expect(handled).toBe(false);
    expect(localStorage.getItem('token')).toBe('valid-token');
    expect(location.assign).not.toHaveBeenCalled();
  });
});
