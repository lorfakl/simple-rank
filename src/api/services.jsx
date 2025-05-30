import apiClient from './client';

export const userService = {
  //getAllUsers: () => apiClient.get('/api/users'),
  getUserById: (id) => apiClient.get(`/api/users/${id}`),
  createUser: (userData) => apiClient.post('/api/users', userData),
  updateUser: (id, userData) => apiClient.put(`/api/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/api/users/${id}`),
};

export const authService = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  register: (userData) => apiClient.post('/api/auth/register', userData),
};


export const rankingService = {
  createRanking: (rankingData) => apiClient.post('/api/Rank/CreateRanking', rankingData),
  editRanking: (rankingData) => apiClient.put(`/api/Rank/EditRanking/${rankingData.id}`, rankingData),
  deleteRanking: (id) => apiClient.delete(`/api/Rank/DeleteRanking/${id}`),
  getUserRankings: (user_id) => apiClient.get(`/api/Rank/GetUserRankings/${user_id}`),
  getRankingById: (id) => apiClient.get(`/api/Rank/GetRanking/${id}`),
  getAllRankings: () => apiClient.get('/api/Rank/GetPublicRankings'),
  searchPublicRankings: (searchOptions) => apiClient.post(`/api/Rank/GetRankingByName`, searchOptions),
  updateRankItemPlacement: (rankItemId, newPlacement) => apiClient.post("/api/Rank/UpdateRankItemPlacement", { rankItemId, newPlacement }),
};

export const rankItemService = {
  createRankItem: (rankItem) => apiClient.post('/api/Rank/CreateRankItem', rankItem),
  editRankItem: (rankItem) => apiClient.put(`/api/Rank/EditRankItem/${rankItem.id}`, rankItem),
  deleteRankItem: (id) => apiClient.delete(`/api/Rank/DeleteRankItem/${id}`),
};


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
