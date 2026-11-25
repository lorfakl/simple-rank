import apiClient from './client';
import type { AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// Wire types. Request/response shapes mirror NewApp/DTOs/*.cs as serialized
// by ASP.NET Core's default camelCase JSON policy; request shapes mirror the
// payloads this client actually posts. Routes are untouched.
// ---------------------------------------------------------------------------

/**
 * Axios response plus the optional `error` slot that legacy call sites check
 * (`if (response.error)`). axios surfaces failures by rejection, so the slot
 * is always undefined at runtime — hence optional.
 */
export interface ApiResponse<T> extends AxiosResponse<T> {
  error?: unknown;
}

// ---- NewApp/DTOs/AuthDtos.cs --------------------------------------------

export interface AuthUserMetadata {
  full_name: string;
  avatar_url: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: AuthUserMetadata;
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

/** GET /api/Auth/Me → { user: AuthUser } */
export interface MeResponse {
  user: AuthUser;
}

// ---- NewApp/DTOs/UserDtos.cs --------------------------------------------

export interface SetMetadataRequest {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface ResponseBase {
  message: string;
}

// ---- NewApp/DTOs/RankingDtos.cs -----------------------------------------

export interface RankItemDto {
  id: string;
  name: string;
  description: string;
  rank: number;
  imageUrl?: string;
}

export interface CreateRankingRequest {
  title: string;
  description: string;
  items: RankItemDto[];
  /** optional: CreateRank omits it and the server defaults to false */
  isPublic?: boolean;
}

export interface UpdateRankingRequest {
  /** route id (may be undefined when useParams() has no :id) */
  id?: string;
  title: string;
  description: string;
  items: RankItemDto[];
  isPublic: boolean;
}

export interface CreateRankingItemRequest {
  item: RankItemDto;
  rankingId: string | undefined;
}

export interface DeleteRankItemRequest {
  rankingId: string | undefined;
  rankItemId: string;
}

export interface EditRankItemRequest {
  rankingId: string;
  name: string;
  description: string;
  rank: number;
}

/** EditRankItem body plus the `id` the client interpolates into the route. */
export interface EditRankItemPayload extends EditRankItemRequest {
  id: string;
}

export interface UpdateRankItemPlacementRequest {
  rankingId: string | undefined;
  /** sent PascalCase exactly as the code writes it; ASP.NET binds case-insensitively */
  ItemIdToRank: Record<string, number>;
}

export interface PinRankingRequest {
  rankingId: string;
  pinOperation: boolean;
}

export interface ShareableLinkResponse {
  shareableId: string;
}

export interface CreatedByDto {
  userId: string;
  displayName: string;
  avatarUrl: string;
}

export interface RankItemOutputDto {
  itemId: string;
  name: string;
  description: string;
  rank: number;
  imageUrl?: string;
}

export interface RankingResponse {
  id: string;
  owner: string;
  title: string;
  description: string;
  items: RankItemOutputDto[];
  itemCount: number;
  lastUpdated: string;
  createdDate: string;
  /** C# DateTime? — typed non-null (see conversion report deviations) */
  pinnedTime: string;
  isPublic: boolean;
  isShared: boolean;
  isPinned: boolean;
  createdBy: CreatedByDto;
}

export interface CreateRankingResponse {
  id: string;
  message: string;
}

// ---- NewApp/DTOs/StatisticDtos.cs ---------------------------------------

export type StatisticName =
  | 'LIKE'
  | 'LOVE'
  | 'LAUGH'
  | 'WOW'
  | 'SAD'
  | 'ANGRY'
  | 'VIEW'
  | 'CLONE';

export interface RankStatisticResponse {
  statistics: Partial<Record<StatisticName, number>>;
}

/** body of /api/Statistic/RecordView and /api/Statistic/React (ReactDto) */
export interface ReactRequest {
  reactionId: string;
  rankingId: string;
  isShared: boolean;
}

export interface CountResponse {
  totalCount: number;
  message: string;
}

// ---- endpoints without a backend contract -------------------------------

/**
 * Legacy /api/users CRUD — the actions are commented out in
 * Controllers/UserController.cs, so no request/response DTO exists and the
 * UI never calls them. Payloads are deliberately `unknown`.
 */
export interface LegacyUserPayload {
  [key: string]: unknown;
}

/** /api/Rank/GetRankingByName and GetRankingMetadata have no backend action. */
export interface SearchRankingsPayload {
  [key: string]: unknown;
}

// ---- services ------------------------------------------------------------

export const userService = {
  //getAllUsers: () => apiClient.get('/api/users'),
  getUserById: (id: string): Promise<ApiResponse<unknown>> => apiClient.get(`/api/users/${id}`),
  createUser: (userData: LegacyUserPayload): Promise<ApiResponse<unknown>> => apiClient.post('/api/users', userData),
  updateUser: (id: string, userData: LegacyUserPayload): Promise<ApiResponse<unknown>> => apiClient.put(`/api/users/${id}`, userData),
  deleteUser: (id: string): Promise<ApiResponse<unknown>> => apiClient.delete(`/api/users/${id}`),
};

export const authService = {
  sync: (): Promise<ApiResponse<MeResponse>> => apiClient.post("/api/Auth/Sync"),
  me: (): Promise<ApiResponse<MeResponse>> => apiClient.get("/api/Auth/Me"),
  setMetadata: (request: SetMetadataRequest): Promise<ApiResponse<ResponseBase>> => apiClient.post("/api/User/SetUserMetadata", request)
};


export const rankingService = {
  createRanking: (rankingData: CreateRankingRequest): Promise<ApiResponse<CreateRankingResponse>> => apiClient.post('/api/Rank/CreateRanking', rankingData),
  editRanking: (rankingData: UpdateRankingRequest): Promise<ApiResponse<ResponseBase>> => apiClient.put(`/api/Rank/EditRanking/${rankingData.id}`, rankingData),
  deleteRanking: (id: string): Promise<ApiResponse<ResponseBase>> => apiClient.delete(`/api/Rank/DeleteRanking/${id}`),
  getUserRankings: (user_id: string): Promise<ApiResponse<RankingResponse[]>> => apiClient.get(`/api/Rank/GetUserRankings/${user_id}`),
  getRankingById: (id: string): Promise<ApiResponse<RankingResponse>> => apiClient.get(`/api/Rank/GetRanking/${id}`),
  getAllRankings: (): Promise<ApiResponse<RankingResponse[]>> => apiClient.get('/api/Rank/GetPublicRankings'),
  searchPublicRankings: (searchOptions: SearchRankingsPayload): Promise<ApiResponse<unknown>> => apiClient.post(`/api/Rank/GetRankingByName`, searchOptions),
  getShareableLink: (rankingId: string | undefined): Promise<ApiResponse<ShareableLinkResponse>> => apiClient.post(`/api/Rank/GetShareableLink/${rankingId}`),
  getRankingMetadata: (rankingId: string): Promise<ApiResponse<unknown>> => apiClient.get(`/api/Rank/GetRankingMetadata/${rankingId}`),
  setRankingPin: (request: PinRankingRequest): Promise<ApiResponse<ResponseBase>> => apiClient.post(`/api/Rank/PinRanking/${request.rankingId}`, request),
};

export const rankItemService = {
  createRankItem: (request: CreateRankingItemRequest): Promise<ApiResponse<ResponseBase>> => apiClient.post(`/api/Rank/CreateRankItem`, request),
  editRankItem: (rankItem: EditRankItemPayload): Promise<ApiResponse<ResponseBase>> => apiClient.put(`/api/Rank/EditRankItem/${rankItem.id}`, rankItem),
  deleteRankItem: (request: DeleteRankItemRequest): Promise<ApiResponse<ResponseBase>> => apiClient.post(`/api/Rank/DeleteRankItem/${request.rankItemId}`, request),
  updateRankItemPlacement: (request: UpdateRankItemPlacementRequest): Promise<ApiResponse<ResponseBase>> => apiClient.post(`/api/Rank/UpdateRankItemsPlacement/${request.rankingId}`, request),
};

export const shareRankService = {
  getShareableLink: (rankingId: string | undefined): Promise<ApiResponse<ShareableLinkResponse>> => apiClient.post(`/api/Rank/GetShareableLink/${rankingId}`),
  getSharedRanking: (sharedId: string): Promise<ApiResponse<RankingResponse>> => apiClient.get(`/api/Rank/GetSharedRanking/${sharedId}`),
  cloneSharedRanking: (sharedId: string): Promise<ApiResponse<CreateRankingResponse>> => apiClient.post(`/api/Rank/CloneSharedRanking/${sharedId}`),
}

export const statisticService = {
  recordView: (request: ReactRequest): Promise<ApiResponse<ResponseBase>> => apiClient.post(`/api/Statistic/RecordView/${request.rankingId}`, request),
  recordReaction: (request: ReactRequest): Promise<ApiResponse<ResponseBase>> => apiClient.post(`/api/Statistic/React/${request.rankingId}`, request),
  getRankStatistics: (rankingId: string): Promise<ApiResponse<RankStatisticResponse>> => apiClient.get(`/api/Statistic/Get/${rankingId}`),
  getSharedRankStatistics: (rankingId: string): Promise<ApiResponse<RankStatisticResponse>> => apiClient.get(`/api/Statistic/GetShared/${rankingId}`),
  getUserCount: (): Promise<ApiResponse<CountResponse>> => apiClient.get(`/api/Statistic/GetUserCount`),
  getRankingCount: (): Promise<ApiResponse<CountResponse>> => apiClient.get(`/api/Statistic/GetRankingsCount`),
}

// export const exploreService = {
//   getNewRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetNewRankings?page=${page}&pageSize=${pageSize}`),
//   getPopularRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetPopularRankings?page=${page}&pageSize=${pageSize}`),
//   getTrendingRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetTrendingRankings?page=${page}&pageSize=${pageSize}`),
//   getTopRankings: (page = 1, pageSize = 10) => apiClient.get(`/api/Explore/GetTopRankings?page=${page}&pageSize=${pageSize}`),
// }

// export const commentService = {
//   createComment: (commentData) => apiClient.post('/api/Comment/CreateComment', commentData),
//   editComment: (commentData) => apiClient.put('/api/Comment/EditComment', commentData),
//   deleteComment: (id) => apiClient.delete(`/api/Comment/DeleteComment/${id}`),
//   getCommentsByRankingId: (rankingId) => apiClient.get(`/api/Comment/GetCommentsByRankingId/${rankingId}`),
// };

// export const notificationService = {
//   getNotifications: (userId) => apiClient.get(`/api/Notification/GetNotifications/${userId}`),
//   markAsRead: (notificationId) => apiClient.post(`/api/Notification/MarkAsRead/${notificationId}`),
//   deleteNotification: (notificationId) => apiClient.delete(`/api/Notification/DeleteNotification/${notificationId}`),
// };
