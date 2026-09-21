// Communities API layer. The server/private API is the sole source of truth.
import { apiClient } from './client';
import type { Community, Channel, CommunityEvent, User, ApiResponse } from '../../types';

export const CommunityApi = {
  async getCommunities(tab: 'discover' | 'joined' | 'following' | 'managed' = 'discover', category?: string, query?: string): Promise<ApiResponse<Community[]>> {
    const params = new URLSearchParams({ tab });
    if (category && category !== 'All') params.set('category', category);
    if (query) params.set('q', query);
    return apiClient.request<Community[]>(`/communities?${params.toString()}`);
  },
  getCommunity(communityId: string): Promise<ApiResponse<Community>> {
    return apiClient.request<Community>(`/communities/${encodeURIComponent(communityId)}`);
  },
  joinCommunity(communityId: string): Promise<ApiResponse<{ joined: boolean; isPending?: boolean }>> {
    return apiClient.request(`/communities/${encodeURIComponent(communityId)}/join`, { method: 'POST' });
  },
  leaveCommunity(communityId: string): Promise<ApiResponse<{ left: boolean }>> {
    return apiClient.request(`/communities/${encodeURIComponent(communityId)}/leave`, { method: 'POST' });
  },
  getChannels(communityId: string): Promise<ApiResponse<Channel[]>> {
    return apiClient.request<Channel[]>(`/communities/${encodeURIComponent(communityId)}/channels`);
  },
  getEvents(communityId: string): Promise<ApiResponse<CommunityEvent[]>> {
    return apiClient.request<CommunityEvent[]>(`/communities/${encodeURIComponent(communityId)}/events`);
  },
  getCommunityMembers(communityId: string): Promise<ApiResponse<User[]>> {
    return apiClient.request<User[]>(`/communities/${encodeURIComponent(communityId)}/members`);
  },
  createCommunity(payload: Partial<Community>): Promise<ApiResponse<Community>> {
    return apiClient.request<Community>('/communities', { method: 'POST', body: JSON.stringify(payload) });
  },
};
