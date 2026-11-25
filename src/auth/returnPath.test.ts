import {
  buildAuthPath,
  clearStoredReturnPath,
  composeCurrentPath,
  getPostAuthReturnPath,
  getReturnPathFromSearch,
  sanitizeReturnPath,
  writeStoredReturnPath
} from './returnPath';

describe('return path helpers', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('preserves route params and hash', () => {
    expect(composeCurrentPath('/ranking/42', '?tab=stats', '#items')).toBe('/ranking/42?tab=stats#items');
  });

  it('accepts only safe relative return paths', () => {
    expect(sanitizeReturnPath('/ranking/42?tab=stats')).toBe('/ranking/42?tab=stats');
    expect(sanitizeReturnPath('https://evil.example/phish')).toBeNull();
    expect(sanitizeReturnPath('//evil.example/phish')).toBeNull();
    expect(sanitizeReturnPath('/Login')).toBeNull();
  });

  it('reads return path from query and clears storage once consumed', () => {
    writeStoredReturnPath(window.sessionStorage, '/Home');

    expect(getPostAuthReturnPath('?returnTo=%2Franking%2F1%3Ftab%3Dstats', window.sessionStorage)).toBe('/ranking/1?tab=stats');
    expect(window.sessionStorage.getItem('simpleRank.returnTo')).toBeNull();
  });

  it('falls back to storage when query is missing', () => {
    writeStoredReturnPath(window.sessionStorage, '/ranking/3');

    expect(getPostAuthReturnPath('', window.sessionStorage)).toBe('/ranking/3');
    expect(window.sessionStorage.getItem('simpleRank.returnTo')).toBeNull();
  });

  it('falls back to /Home when no return path is provided', () => {
    clearStoredReturnPath(window.sessionStorage);
    expect(getPostAuthReturnPath('', window.sessionStorage)).toBe('/Home');
  });

  it('builds auth route URLs with encoded returnTo', () => {
    expect(getReturnPathFromSearch('?returnTo=%2Franking%2F5%3Ftab%3Dstats')).toBe('/ranking/5?tab=stats');
    expect(buildAuthPath('/Login', '/ranking/5?tab=stats')).toBe('/Login?returnTo=%2Franking%2F5%3Ftab%3Dstats');
  });
});
