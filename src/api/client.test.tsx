import client, {
  resetAuthRedirectStateForTests,
  setAuthRedirectHandlerForTests,
  setTokenProvider
} from './client';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

describe('api client interceptors', () => {
  beforeEach(() => {
    setTokenProvider(null);
    resetAuthRedirectStateForTests();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
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

  it('redirects to login once on 401 and preserves current route in query/storage', async () => {
    window.history.replaceState({}, '', '/ranking/abc?tab=stats#items');
    const redirectSpy = vi.fn();
    setAuthRedirectHandlerForTests(redirectSpy);

    const rejectInterceptor = client.interceptors.response.handlers[0]!.rejected;
    const error = { response: { status: 401 } };

    await expect(rejectInterceptor?.(error)).rejects.toBe(error);
    await expect(rejectInterceptor?.(error)).rejects.toBe(error);

    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith('/Login?returnTo=%2Franking%2Fabc%3Ftab%3Dstats%23items');
    expect(window.sessionStorage.getItem('simpleRank.returnTo')).toBe('/ranking/abc?tab=stats#items');
  });

  it('does not redirect when the 401 happens on auth pages', async () => {
    window.history.replaceState({}, '', '/Login?returnTo=%2FHome');
    const redirectSpy = vi.fn();
    setAuthRedirectHandlerForTests(redirectSpy);

    const rejectInterceptor = client.interceptors.response.handlers[0]!.rejected;
    const error = { response: { status: 401 } };

    await expect(rejectInterceptor?.(error)).rejects.toBe(error);

    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('ignores non-auth errors', async () => {
    const passThrough = { status: 500 } as AxiosResponse;
    const rejectInterceptor = client.interceptors.response.handlers[0]!.rejected;
    const error = { response: passThrough };

    await expect(rejectInterceptor?.(error)).rejects.toBe(error);
  });
});
