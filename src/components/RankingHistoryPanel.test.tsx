import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RankingHistoryPanel } from './RankingHistoryPanel';

const { getRankingEditHistory, restoreRankingFromHistory, showNotification } = vi.hoisted(() => ({
  getRankingEditHistory: vi.fn(),
  restoreRankingFromHistory: vi.fn(),
  showNotification: vi.fn()
}));

vi.mock('../api/services', () => ({
  rankingService: {
    getRankingEditHistory,
    restoreRankingFromHistory
  }
}));

vi.mock('../contexts/NotificationContext', () => ({
  useNotifications: () => ({
    showNotification
  })
}));

describe('RankingHistoryPanel', () => {
  beforeEach(() => {
    getRankingEditHistory.mockReset();
    restoreRankingFromHistory.mockReset();
    showNotification.mockReset();
  });

  it('loads history and restores an entry', async () => {
    getRankingEditHistory
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'h1',
              rankingId: 'r1',
              actionType: 'edit',
              summary: 'Renamed ranking to Top 5',
              createdAt: '2026-11-25T12:00:00Z'
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'h2',
              rankingId: 'r1',
              actionType: 'restore',
              summary: 'Restored from history entry h1',
              createdAt: '2026-11-25T13:00:00Z'
            }
          ]
        }
      });

    restoreRankingFromHistory.mockResolvedValue({ data: { message: 'ok' } });

    const onRestored = vi.fn().mockResolvedValue(undefined);
    render(<RankingHistoryPanel rankingId="r1" onRestored={onRestored} />);

    expect(await screen.findByText('Renamed ranking to Top 5')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'restore' }));

    await waitFor(() => {
      expect(restoreRankingFromHistory).toHaveBeenCalledWith('r1', 'h1');
    });

    await waitFor(() => {
      expect(onRestored).toHaveBeenCalledTimes(1);
      expect(getRankingEditHistory).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Restored from history entry h1')).toBeInTheDocument();
    });
  });
});
