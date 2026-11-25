import { Fragment } from 'react';
import { parseLinkText } from './linkParser';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const segments = parseLinkText(text);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Fragment key={`text-${index}`}>{segment.text}</Fragment>;
        }

        const isExternal = segment.href.startsWith('http://') || segment.href.startsWith('https://');

        return (
          <a
            key={`link-${index}`}
            className="text-primary underline underline-offset-2 break-all"
            href={segment.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer nofollow' : undefined}
          >
            {segment.text}
          </a>
        );
      })}
    </span>
  );
}

export default LinkifiedText;
