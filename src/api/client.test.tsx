import client, { setTokenProvider } from './client';
import type { InternalAxiosRequestConfig } from 'axios';

describe('api client token injection', () => {
  beforeEach(() => {
    setTokenProvider(null);
  });

  it('obtains a fresh token for every request', async () => {
    const getToken = vi.fn().mockResolvedValueOnce('abc123').mockResolvedValueOnce('refreshed');
    setTokenProvider(getToken);
    const interceptor = client.interceptors.request.handlers[0]!.fulfilled;

    const config = await interceptor({ headers: {} } as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBe('Bearer abc123');
    const nextConfig = await interceptor({ headers: {} } as InternalAxiosRequestConfig);
    expect(nextConfig.headers.Authorization).toBe('Bearer refreshed');
  });

  it('does not add Authorization header when no token provider is set', async () => {
    const interceptor = client.interceptors.request.handlers[0]!.fulfilled;

    const config = await interceptor({ headers: {} } as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBeUndefined();
  });
});
