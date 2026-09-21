// Posts and comments API layer. Server/private API is authoritative; there is no local success path.
import { apiClient } from './client';
import type { Post, Comment, ApiResponse } from '../../types';

export interface CreatePostPayload {
  content: string;
  mediaUrls?: string[];
  audience: 'public' | 'followers' | 'community';
  communityId?: string;
  communityName?: string;
  poll?: { question: string; options: string[] };
}

export const PostApi = {
  getFeed(tab: 'foryou' | 'following' | 'latest' = 'foryou', cursor?: string): Promise<ApiResponse<Post[]>> {
    const endpoint = tab === 'foryou' ? '/feed' : `/feed/${tab}`;
    return apiClient.request<Post[]>(cursor ? `${endpoint}?cursor=${encodeURIComponent(cursor)}` : endpoint);
  },
  getPost(postId: string): Promise<ApiResponse<Post>> {
    return apiClient.request<Post>(`/posts/${encodeURIComponent(postId)}`);
  },
  createPost(payload: CreatePostPayload): Promise<ApiResponse<Post>> {
    return apiClient.request<Post>('/posts', { method: 'POST', body: JSON.stringify(payload) });
  },
  toggleReaction(postId: string, reactionType = 'like'): Promise<ApiResponse<{ post: Post }>> {
    return apiClient.request(`/posts/${encodeURIComponent(postId)}/reactions`, { method: 'POST', body: JSON.stringify({ type: reactionType }) });
  },
  toggleSavePost(postId: string): Promise<ApiResponse<{ isSaved: boolean }>> {
    return apiClient.request(`/posts/${encodeURIComponent(postId)}/save`, { method: 'POST' });
  },
  deletePost(postId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.request(`/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' });
  },
  votePoll(postId: string, optionId: string): Promise<ApiResponse<{ post: Post }>> {
    return apiClient.request(`/posts/${encodeURIComponent(postId)}/poll/vote`, { method: 'POST', body: JSON.stringify({ optionId }) });
  },
  addComment(postId: string, content: string, parentId?: string): Promise<ApiResponse<Comment>> {
    return apiClient.request(`/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: JSON.stringify({ content, parentId }) });
  },
  getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return apiClient.request(`/posts/${encodeURIComponent(postId)}/comments`);
  },
  sendCoinComment(surfaceId: string, surfaceType: 'post' | 'reel' | 'video' | 'live', content: string, coinAmount: number, parentId?: string): Promise<ApiResponse<Comment>> {
    return apiClient.request('/coins/messages', { method: 'POST', body: JSON.stringify({ surfaceType, surfaceId, amount: coinAmount, message: content, parentId }) });
  },
  markCoinMessageRead(messageId: string): Promise<ApiResponse<{ read: boolean }>> {
    return apiClient.request(`/coins/messages/${encodeURIComponent(messageId)}/read`, { method: 'PATCH', body: JSON.stringify({ read: true }) });
  },
};
