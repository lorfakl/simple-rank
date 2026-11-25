import { useEffect, useMemo, useState } from 'react';
import LinkifiedText from './LinkifiedText';
import { sanitizeUrl } from './linkParser';

interface ReadOnlyRankItemProps {
  id: string;
  index: number;
  data: { title: string; description: string; rank: number; imageUrl?: string };
}

function ReadOnlyRankItem({ id, index, data }: ReadOnlyRankItemProps) {
  const [hasValidImage, setHasValidImage] = useState(false);

  const safeImageUrl = useMemo(() => {
    if (!data.imageUrl) return null;
    return sanitizeUrl(data.imageUrl);
  }, [data.imageUrl]);

  useEffect(() => {
    if (!safeImageUrl) {
      setHasValidImage(false);
      return;
    }

    let disposed = false;
    const image = new Image();

    image.onload = () => {
      if (!disposed) {
        setHasValidImage(true);
      }
    };

    image.onerror = () => {
      if (!disposed) {
        setHasValidImage(false);
      }
    };

    image.src = safeImageUrl;

    return () => {
      disposed = true;
    };
  }, [safeImageUrl]);

  const itemStyle = hasValidImage && safeImageUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.78), rgba(255,255,255,0.9)), url(${safeImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : undefined;

  return (
    <div
      id={id}
      index={index}
      className="surface flex w-full h-fit flex-col rounded-box border border-base-300 bg-base-100 p-4 shadow-soft hover:bg-base-200/60"
      style={itemStyle}
    >
      <div className="rank-chip mb-3 self-start text-base">rank: {data.rank}</div>
      <div className="card card-border rounded-box border-base-300 bg-base-200/60 w-full max-w-120 card-sm shadow-sm">
        <div className="card-body">
          <h2 className="card-title font-display text-xl font-semibold tracking-tight break-words">{data.title}</h2>
          <p className="font-medium text-base-content/75 text-pretty text-left">
            <LinkifiedText text={data.description} />
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReadOnlyRankItem;
