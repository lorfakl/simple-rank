import apiClient from './client';

export const userService = {
  //getAllUsers: () => apiClient.get('/api/users'),
  getUserById: (id) => apiClient.get(`/api/users/${id}`),
  createUser: (userData) => apiClient.post('/api/users', userData),
  updateUser: (id, userData) => apiClient.put(`/api/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/api/users/${id}`),
};

export const authService = {
  setMetadata: (request) => apiClient.post("/api/user/SetUserMetadata", request)
};


export const rankingService = {
  createRanking: (rankingData) => apiClient.post('/api/Rank/CreateRanking', rankingData),
  editRanking: (rankingData) => apiClient.put(`/api/Rank/EditRanking/${rankingData.id}`, rankingData),
  deleteRanking: (id) => apiClient.delete(`/api/Rank/DeleteRanking/${id}`),
  getUserRankings: (user_id) => apiClient.get(`/api/Rank/GetUserRankings/${user_id}`),
  getRankingById: (id) => apiClient.get(`/api/Rank/GetRanking/${id}`),
  getAllRankings: () => apiClient.get('/api/Rank/GetPublicRankings'),
  searchPublicRankings: (searchOptions) => apiClient.post(`/api/Rank/GetRankingByName`, searchOptions),
  getShareableLink: (rankingId) => apiClient.post(`/api/Rank/GetShareableLink/${rankingId}`),
  getRankingMetadata: (rankingId) => apiClient.get(`/api/Rank/GetRankingMetadata/${rankingId}`)
};

export const rankItemService = {
  createRankItem: (request) => apiClient.post(`/api/Rank/CreateRankItem`, request),
  editRankItem: (rankItem) => apiClient.put(`/api/Rank/EditRankItem/${rankItem.id}`, rankItem),
  deleteRankItem: (request) => apiClient.post(`/api/Rank/DeleteRankItem/${request.rankItemId}`, request),
  updateRankItemPlacement: (request) => apiClient.post(`/api/Rank/UpdateRankItemsPlacement/${request.rankingId}`, request),
};

export const shareRankService = {
  getShareableLink: (rankingId) => apiClient.post(`/api/Rank/GetShareableLink/${rankingId}`),
  getSharedRanking: (sharedId) => apiClient.get(`/api/Rank/GetSharedRanking/${sharedId}`),
  cloneSharedRanking: (sharedId) => apiClient.post(`/api/Rank/CloneSharedRanking/${sharedId}`),
}

export const statisticService = {
  recordView: (request) => apiClient.post(`/api/Statistic/RecordView/${request.rankingId}`, request),
  recordReaction: (request) => apiClient.post(`/api/Statistic/React/${request.rankingId}`, request),
  getRankStatistics: (rankingId) => apiClient.get(`/api/Statistic/Get/${rankingId}`),
  getSharedRankStatistics: (rankingId) => apiClient.get(`/api/Statistic/GetShared/${rankingId}`)
}

export const exploreService = {
  getNewRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetNewRankings?page=${page}&pageSize=${pageSize}`),
  getPopularRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetPopularRankings?page=${page}&pageSize=${pageSize}`),
  getTrendingRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetTrendingRankings?page=${page}&pageSize=${pageSize}`),
  getTopRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetTopRankings?page=${page}&pageSize=${pageSize}`),
}

export const commentService = {
  createComment: (commentData) => apiClient.post('/api/Comment/CreateComment', commentData),
  editComment: (commentData) => apiClient.put('/api/Comment/EditComment', commentData),
  deleteComment: (id) => apiClient.delete(`/api/Comment/DeleteComment/${id}`),
  getCommentsByRankingId: (rankingId) => apiClient.get(`/api/Comment/GetCommentsByRankingId/${rankingId}`),
};

export const notificationService = {
  getNotifications: (userId) => apiClient.get(`/api/Notification/GetNotifications/${userId}`),
  markAsRead: (notificationId) => apiClient.post(`/api/Notification/MarkAsRead/${notificationId}`),
  deleteNotification: (notificationId) => apiClient.delete(`/api/Notification/DeleteNotification/${notificationId}`),
};
