import axios from 'axios';
import {
  buildAuthPath,
  composeCurrentPath,
  isAuthRoute,
  writeStoredReturnPath
} from '../auth/returnPath';

let tokenProvider: (() => Promise<string | null>) | null = null;
let authRedirectInFlight = false;
let authRedirectHandler: ((path: string) => void) | null = null;

export function setTokenProvider(provider: (() => Promise<string | null>) | null) {
  tokenProvider = provider;
}

export function setAuthRedirectHandlerForTests(handler: ((path: string) => void) | null) {
  authRedirectHandler = handler;
}

export function resetAuthRedirectStateForTests() {
  authRedirectInFlight = false;
  authRedirectHandler = null;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  responseType: 'json'
});

client.interceptors.request.use(
  async (config) => {
    const token = await tokenProvider?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    if (status !== 401 && status !== 403) {
      return Promise.reject(error);
    }

    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    if (authRedirectInFlight || isAuthRoute(window.location.pathname)) {
      return Promise.reject(error);
    }

    authRedirectInFlight = true;
    const returnPath = composeCurrentPath(window.location.pathname, window.location.search, window.location.hash);
    writeStoredReturnPath(window.sessionStorage, returnPath);
    const loginPath = buildAuthPath('/Login', returnPath);
    if (authRedirectHandler) {
      authRedirectHandler(loginPath);
    } else {
      window.location.assign(loginPath);
    }

    return Promise.reject(error);
  }
);

export default client;
