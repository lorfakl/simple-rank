import { parseLinkText, sanitizeUrl } from './linkParser';

describe('linkParser', () => {
  it('parses markdown links and bare urls', () => {
    const output = parseLinkText('Docs: [site](https://example.com) and http://foo.dev/path');

    expect(output).toEqual([
      { type: 'text', text: 'Docs: ' },
      { type: 'link', text: 'site', href: 'https://example.com' },
      { type: 'text', text: ' and ' },
      { type: 'link', text: 'http://foo.dev/path', href: 'http://foo.dev/path' }
    ]);
  });

  it('allows relative links', () => {
    expect(parseLinkText('open [profile](/users/me)')).toEqual([
      { type: 'text', text: 'open ' },
      { type: 'link', text: 'profile', href: '/users/me' }
    ]);
  });

  it('renders hostile markdown link as plain text', () => {
    const output = parseLinkText('click [pwn](javascript:alert(1)) now');

    expect(output).toEqual([
      { type: 'text', text: 'click ' },
      { type: 'text', text: '[pwn](javascript:alert(1))' },
      { type: 'text', text: ' now' }
    ]);
  });

  it('keeps plain text unchanged when no links exist', () => {
    const text = '<img src=x onerror=alert(1)> no links here';
    expect(parseLinkText(text)).toEqual([{ type: 'text', text }]);
  });

  it('rejects protocol-relative and non-http schemes', () => {
    expect(sanitizeUrl('//example.com/path')).toBeNull();
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html;base64,abc')).toBeNull();
  });
});
