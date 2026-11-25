import React, { StrictMode } from 'react';
import { render, waitFor } from '@testing-library/react';
import type {} from '@testing-library/jest-dom/vitest';
import Home from './Home';

const mocks = vi.hoisted(() => ({
  getUserRankings: vi.fn(),
  showNotification: vi.fn()
}));

let mockSession: { user: { id: string }; access_token: string } | null = null;

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('../api/services', () => ({
  rankingService: {
    getUserRankings: (...args: unknown[]) => mocks.getUserRankings(...args)
  }
}));

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({ user: mockSession?.user ?? {}, session: mockSession })
}));

vi.mock('../contexts/NotificationContext', () => ({
  useNotifications: () => ({ showNotification: mocks.showNotification })
}));

vi.mock('../components/Rankings', () => ({
  default: () => <div data-testid="ranking-card" />
}));

vi.mock('../components/ConfirmationModal', () => ({
  default: () => null
}));

const rankingResponse = [
  {
    id: 'ranking-1',
    owner: 'user-1',
    title: 'Ranking One',
    description: 'desc',
    items: [],
    itemCount: 0,
    lastUpdated: '2026-01-01T00:00:00.000Z',
    createdDate: '2026-01-01T00:00:00.000Z',
    pinnedTime: '2026-01-01T00:00:00.000Z',
    isPublic: false,
    isShared: false,
    isPinned: false,
    createdBy: { userId: 'user-1', displayName: 'User One', avatarUrl: '' }
  }
];

describe('Home request behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = { user: { id: 'user-1' }, access_token: 'token-1' };
    mocks.getUserRankings.mockResolvedValue({ data: rankingResponse });
  });

  it('double-invokes fetch in StrictMode dev mounts (expected dev-only behavior)', async () => {
    render(
      <StrictMode>
        <Home />
      </StrictMode>
    );

    await waitFor(() => expect(mocks.getUserRankings).toHaveBeenCalledTimes(2));
  });

  it('does not refetch rankings when only session object/token changes for same user id', async () => {
    const { rerender } = render(
      <Home />
    );

    await waitFor(() => expect(mocks.getUserRankings).toHaveBeenCalledTimes(1));

    mockSession = { user: { id: 'user-1' }, access_token: 'token-2' };
    rerender(
      <Home />
    );

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mocks.getUserRankings).toHaveBeenCalledTimes(1);
  });
});
