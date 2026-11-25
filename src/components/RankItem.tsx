import { X, SquarePen, Trash2, Save, GripHorizontal } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { useEffect, useMemo, useState } from 'react';
import LimitedTextInput from './LimitedTextInput';
import LimitedTextArea from './LimitedTextArea';
import LinkifiedText from './LinkifiedText';
import { sanitizeUrl } from './linkParser';

interface RankItemData {
  title: string;
  description: string;
  rank: number;
  imageUrl?: string;
}

interface RankItemProps {
  id: string;
  index: number;
  data: RankItemData;
  onDataChange: (id: string, title: string, description: string) => void;
  handleRemoveRankItem: (id: string) => void;
  isEditable?: boolean;
}

function RankItem({ id, index, data, onDataChange, handleRemoveRankItem, isEditable = false }: RankItemProps) {
  const [editMode, setEditMode] = useState(isEditable);
  const [showError, setShowError] = useState(false);
  const [rankName, setRankName] = useState('');
  const [rankDescription, setRankDescription] = useState('');
  const [hasValidImage, setHasValidImage] = useState(false);

  const safeImageUrl = useMemo(() => {
    if (!data.imageUrl) return null;
    return sanitizeUrl(data.imageUrl);
  }, [data.imageUrl]);

  useEffect(() => {
    if (data !== undefined && data !== null) {
      setRankName(data.title);
      setRankDescription(data.description);
    }
  }, [data]);

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

  function handleRemoveOnClick(itemId: string) {
    setEditMode(false);
    handleRemoveRankItem(itemId);
  }

  function handleSaveOnClick(itemId: string) {
    setEditMode(false);
    onDataChange(itemId, rankName, rankDescription);
  }

  const itemStyle = hasValidImage && safeImageUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.78), rgba(255,255,255,0.9)), url(${safeImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : undefined;

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="surface flex w-full flex-col rounded-box border border-base-300 bg-base-100 p-3 shadow-soft hover:bg-base-200/60"
          style={itemStyle}
        >
          <div className="flex flex-row  justify-between items-center gap-2" {...provided.dragHandleProps}>
            <div className="drag-handle cursor-grab active:cursor-grabbing">
              <GripHorizontal className="w-8 h-8 text-base-content/40" />
            </div>
            <div className="rank-chip text-base">rank: {data.rank}</div>
            <div className="drag-handle cursor-grab active:cursor-grabbing">
              <GripHorizontal className="w-8 h-8 text-base-content/40" />
            </div>
          </div>

          {editMode ? (
            <>
              <div className="card card-border rounded-box border-base-300 bg-base-200/60 w-full card-sm shadow-sm">
                <div className="card-body">
                  <div className="flex flex-col">
                    <LimitedTextInput
                      inputLabel={'item name'}
                      characterLimit={150}
                      handleInputChange={setRankName}
                      textSize={'text-xl'}
                      showRequired={showError}
                      useWidthFull={true}
                      placeholderText={rankName}
                      textValue={rankName}
                    />

                    <LimitedTextArea
                      inputLabel={'item description'}
                      characterLimit={255}
                      placeholderText={'enter rank item description'}
                      handleInputChange={setRankDescription}
                      initialValue={rankDescription}
                      useFullWidth={true}
                      textSize='text-xl'
                      syncToInitialValue={true}
                    />
                  </div>
                  <div className="card-actions justify-between">
                    <button className="btn btn-primary" onClick={() => { handleSaveOnClick(id); }}><Save /></button>
                    <button className="btn btn-error" onClick={() => { setEditMode(false); }}><X /></button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-box p-1 text-wrap">
                <h2 className="text-left font-display text-lg font-semibold tracking-tight break-words">{data.title}</h2>
                <p className="text-left font-medium text-base-content/75 break-words">
                  <LinkifiedText text={data.description} />
                </p>
                <div className="card-actions justify-between">
                  <button className="btn btn-primary" onClick={() => { setEditMode(true); }}><SquarePen /></button>
                  <button className="btn btn-error" onClick={() => { handleRemoveOnClick(id); }}><Trash2 /></button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default RankItem;
