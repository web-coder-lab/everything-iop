// Chat and Direct Messaging API Layer. All state is authoritative in the Everything server/private API.
import { apiClient } from './client';
import type { Conversation, Message, ApiResponse, User } from '../../types';

export const ChatApi = {
  getConversations(): Promise<ApiResponse<Conversation[]>> {
    return apiClient.request<Conversation[]>('/conversations');
  },
  getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    return apiClient.request<Message[]>(`/conversations/${encodeURIComponent(conversationId)}/messages`);
  },
  sendMessage(conversationId: string, text: string, mediaUrls?: string[], audioUrl?: string, replyTo?: Message): Promise<ApiResponse<Message>> {
    return apiClient.request<Message>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, mediaUrls, audioUrl, replyToId: replyTo?.id }),
    });
  },
  markAsRead(conversationId: string): Promise<ApiResponse<{ read: boolean }>> {
    return apiClient.request<{ read: boolean }>(`/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST' });
  },
  toggleReaction(conversationId: string, messageId: string, emoji: string): Promise<ApiResponse<{ message?: Message }>> {
    return apiClient.request<{ message?: Message }>(
      `/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/reactions`,
      { method: 'POST', body: JSON.stringify({ emoji }) },
    );
  },
  async createConversation(participant: User): Promise<Conversation> {
    const response = await apiClient.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ type: 'direct', participantId: participant.id }),
    });
    if (!response.data) throw new Error('Conversation was not returned by the server.');
    return response.data;
  },
};
