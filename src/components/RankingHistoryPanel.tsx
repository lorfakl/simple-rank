import { useEffect, useState } from 'react';
import { rankingService } from '../api/services';
import type { RankingEditHistoryItemResponse } from '../api/services';
import { dateTimeHelper } from '../helper/helper';
import { useNotifications } from '../contexts/NotificationContext';

interface RankingHistoryPanelProps {
  rankingId: string;
  onRestored?: () => Promise<void> | void;
}

export function RankingHistoryPanel({ rankingId, onRestored }: RankingHistoryPanelProps) {
  const [items, setItems] = useState<RankingEditHistoryItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { showNotification } = useNotifications();

  async function loadHistory() {
    setLoading(true);
    try {
      const response = await rankingService.getRankingEditHistory(rankingId);
      if (response.error) {
        showNotification('Unable to load edit history', 'error', 2000);
        return;
      }
      setItems(response.data.items);
    } catch {
      showNotification('Unable to load edit history', 'error', 2000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, [rankingId]);

  async function restore(historyId: string) {
    setRestoringId(historyId);
    try {
      const response = await rankingService.restoreRankingFromHistory(rankingId, historyId);
      if (response.error) {
        showNotification('Restore failed', 'error', 2500);
        return;
      }

      showNotification('Ranking restored', 'success', 1200);
      await onRestored?.();
      await loadHistory();
    } catch {
      showNotification('Restore failed', 'error', 2500);
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <section className="rounded-box border border-base-300 bg-base-100/60 p-4" data-testid="ranking-history-panel">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">edit history</h3>
      </div>

      {loading ? <p className="text-sm text-base-content/70">loading history...</p> : null}

      {!loading && items.length === 0 ? <p className="text-sm text-base-content/70">no edits recorded yet</p> : null}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-base-200 bg-base-100 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{item.summary}</p>
                <p className="text-xs uppercase tracking-wide text-base-content/60">{item.actionType}</p>
                <p className="text-xs text-base-content/70">{dateTimeHelper.convertStringToLocalTime(item.createdAt)}</p>
              </div>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  void restore(item.id);
                }}
                disabled={restoringId !== null}
              >
                {restoringId === item.id ? 'restoring...' : 'restore'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
