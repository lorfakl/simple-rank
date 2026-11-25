export interface LinkSegmentText {
  type: 'text';
  text: string;
}

export interface LinkSegmentAnchor {
  type: 'link';
  text: string;
  href: string;
}

export type LinkSegment = LinkSegmentText | LinkSegmentAnchor;

const bareUrlRegex = /(https?:\/\/[^\s<>()]+|(?:\.\/|\.\.\/|\/)[^\s<>()]*)/g;

function isAllowedUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  const lowered = trimmed.toLowerCase();

  if (lowered.startsWith('http://') || lowered.startsWith('https://')) {
    return true;
  }

  if (trimmed.startsWith('//')) {
    return false;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true;
  }

  return false;
}

export function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  return isAllowedUrl(trimmed) ? trimmed : null;
}

function parseBareUrls(input: string): LinkSegment[] {
  const segments: LinkSegment[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(bareUrlRegex)) {
    const index = match.index ?? -1;
    const fullMatch = match[0] ?? '';

    if (index < 0 || fullMatch.length === 0) continue;

    if (index > lastIndex) {
      segments.push({ type: 'text', text: input.slice(lastIndex, index) });
    }

    const safeHref = sanitizeUrl(fullMatch);
    if (safeHref) {
      segments.push({ type: 'link', text: fullMatch, href: safeHref });
    } else {
      segments.push({ type: 'text', text: fullMatch });
    }

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < input.length) {
    segments.push({ type: 'text', text: input.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', text: input });
  }

  return segments;
}

function parseOneMarkdownLink(input: string, startAt: number): {
  startIndex: number;
  endIndex: number;
  raw: string;
  text: string;
  href: string;
} | null {
  const openBracket = input.indexOf('[', startAt);
  if (openBracket < 0) return null;

  const closeBracket = input.indexOf(']', openBracket + 1);
  if (closeBracket < 0) return null;

  if (input[closeBracket + 1] !== '(') return null;

  let cursor = closeBracket + 2;
  let depth = 1;

  while (cursor < input.length && depth > 0) {
    const char = input[cursor];
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    cursor += 1;
  }

  if (depth !== 0) return null;

  const closeParenExclusive = cursor;
  const closeParenInclusive = closeParenExclusive - 1;

  const raw = input.slice(openBracket, closeParenExclusive);
  const text = input.slice(openBracket + 1, closeBracket);
  const href = input.slice(closeBracket + 2, closeParenInclusive);

  return {
    startIndex: openBracket,
    endIndex: closeParenExclusive,
    raw,
    text,
    href
  };
}

export function parseLinkText(input: string): LinkSegment[] {
  const segments: LinkSegment[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const markdownLink = parseOneMarkdownLink(input, cursor);

    if (!markdownLink) {
      segments.push(...parseBareUrls(input.slice(cursor)));
      break;
    }

    if (markdownLink.startIndex > cursor) {
      segments.push(...parseBareUrls(input.slice(cursor, markdownLink.startIndex)));
    }

    const safeHref = sanitizeUrl(markdownLink.href);
    if (safeHref) {
      segments.push({ type: 'link', text: markdownLink.text, href: safeHref });
    } else {
      segments.push({ type: 'text', text: markdownLink.raw });
    }

    cursor = markdownLink.endIndex;
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', text: input });
  }

  return segments;
}
