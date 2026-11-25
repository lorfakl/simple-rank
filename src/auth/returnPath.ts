const DEFAULT_RETURN_PATH = '/Home';
export const RETURN_TO_QUERY_KEY = 'returnTo';
export const RETURN_TO_STORAGE_KEY = 'simpleRank.returnTo';

function isRelativePath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

export function isAuthRoute(pathname: string): boolean {
  const normalized = pathname.toLowerCase();
  return normalized === '/login' || normalized === '/signup';
}

export function composeCurrentPath(pathname: string, search = '', hash = ''): string {
  return `${pathname}${search}${hash}`;
}

export function sanitizeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep the original value if decode fails.
  }

  if (!isRelativePath(decoded)) return null;
  if (isAuthRoute(decoded.split('?')[0] ?? decoded)) return null;
  return decoded;
}

export function getReturnPathFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  return sanitizeReturnPath(params.get(RETURN_TO_QUERY_KEY));
}

export function readStoredReturnPath(storage: Storage | undefined): string | null {
  if (!storage) return null;
  return sanitizeReturnPath(storage.getItem(RETURN_TO_STORAGE_KEY));
}

export function writeStoredReturnPath(storage: Storage | undefined, returnPath: string): void {
  if (!storage) return;
  storage.setItem(RETURN_TO_STORAGE_KEY, returnPath);
}

export function clearStoredReturnPath(storage: Storage | undefined): void {
  storage?.removeItem(RETURN_TO_STORAGE_KEY);
}

export function getPostAuthReturnPath(search: string, storage: Storage | undefined): string {
  const fromQuery = getReturnPathFromSearch(search);
  if (fromQuery) {
    clearStoredReturnPath(storage);
    return fromQuery;
  }

  const fromStorage = readStoredReturnPath(storage);
  if (fromStorage) {
    clearStoredReturnPath(storage);
    return fromStorage;
  }

  return DEFAULT_RETURN_PATH;
}

export function buildAuthPath(basePath: '/Login' | '/SignUp', returnPath: string): string {
  const params = new URLSearchParams({ [RETURN_TO_QUERY_KEY]: returnPath });
  return `${basePath}?${params.toString()}`;
}

export function getDefaultReturnPath(): string {
  return DEFAULT_RETURN_PATH;
}
