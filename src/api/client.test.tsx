import client from './client';
import type { InternalAxiosRequestConfig } from 'axios';

describe('api client token injection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds Authorization header when auth_token exists', async () => {
    localStorage.setItem('auth_token', 'abc123');
    const interceptor = client.interceptors.request.handlers[0]!.fulfilled;

    const config = await interceptor({ headers: {} } as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBe('Bearer abc123');
  });

  it('does not add Authorization header when auth_token is missing', async () => {
    const interceptor = client.interceptors.request.handlers[0]!.fulfilled;

    const config = await interceptor({ headers: {} } as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBeUndefined();
  });
});
