import { useState } from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import RankItem from './RankItem';
import type {} from '@testing-library/jest-dom/vitest';

/**
 * Regression tests for "drag still reorders but the item no longer follows
 * the pointer".
 *
 * RankItem used to pass its own `style` prop AFTER spreading
 * `provided.draggableProps`, which REPLACES dnd's positioning style
 * (position: fixed / z-index / transform) instead of merging with it — so
 * during a drag the DOM never received the styles that make the item track
 * the pointer. Reordering kept working because dnd tracks positions
 * internally, which is why the bug only showed up visually.
 *
 * https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/patterns/adding-your-own-styled-component.md
 */

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const TITLES = ['Alpha', 'Beta', 'Gamma'];

function Harness({ onDragEnd, imageUrl }: { onDragEnd?: (result: DropResult) => void; imageUrl?: string }) {
  const [order, setOrder] = useState(TITLES);

  return (
    <DragDropContext
      onDragEnd={(result) => {
        onDragEnd?.(result);
        if (result.destination && result.destination.index !== result.source.index) {
          const next = [...order];
          const [moved] = next.splice(result.source.index, 1);
          if (!moved) return;
          next.splice(result.destination.index, 0, moved);
          setOrder(next);
        }
      }}
    >
      <Droppable droppableId="rankItems">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {order.map((title, index) => (
              <RankItem
                key={title}
                id={title}
                index={index}
                data={{
                  title,
                  description: `desc ${title}`,
                  rank: index + 1,
                  ...(imageUrl ? { imageUrl } : {}),
                }}
                onDataChange={() => {}}
                handleRemoveRankItem={() => {}}
                isEditable={false}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function liftHandle(id: string) {
  const handle = document.querySelector<HTMLElement>(
    `[data-rfd-drag-handle-draggable-id="${id}"]`
  );
  expect(handle).not.toBeNull();
  handle!.focus();
  fireEvent.keyDown(handle!, { key: ' ', code: 'Space', keyCode: 32 });
  return handle!;
}

it('keeps dnd in control of the dragging element style while a drag is in flight', async () => {
  const onDragEnd = vi.fn();
  render(<Harness onDragEnd={onDragEnd} />);

  const handle = liftHandle('Alpha');

  const dragging = document.querySelector<HTMLElement>('[data-rfd-draggable-id="Alpha"]');
  expect(dragging).not.toBeNull();
  // without position:fixed the item stays put in the list while the pointer
  // moves — the exact reported symptom.
  expect(dragging!.style.position).toBe('fixed');
  expect(dragging!.style.pointerEvents).toBe('none');
  expect(dragging!.style.zIndex).toBe('5000');

  // move down one slot, then drop
  fireEvent.keyDown(handle, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 });
  fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 });

  await waitFor(() => expect(onDragEnd).toHaveBeenCalledTimes(1));
  expect(onDragEnd).toHaveBeenCalledWith(
    expect.objectContaining({
      draggableId: 'Alpha',
      source: { droppableId: 'rankItems', index: 0 },
      destination: { droppableId: 'rankItems', index: 1 },
    })
  );
});

it('keeps the image background AND the dnd positioning style together', async () => {
  // jsdom never loads images, so make Image resolve immediately
  class ImmediateImage {
    onload?: () => void;
    onerror?: () => void;
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }
  vi.stubGlobal('Image', ImmediateImage);

  render(<Harness imageUrl="https://example.com/pic.png" />);
  await waitFor(() =>
    expect((document.querySelector('[data-rfd-draggable-id="Alpha"]') as HTMLElement | null)?.style.backgroundImage).toContain('pic.png')
  );

  liftHandle('Alpha');

  const dragging = document.querySelector<HTMLElement>('[data-rfd-draggable-id="Alpha"]');
  expect(dragging!.style.backgroundImage).toContain('pic.png');
  expect(dragging!.style.position).toBe('fixed');
  expect(dragging!.style.zIndex).toBe('5000');
});
