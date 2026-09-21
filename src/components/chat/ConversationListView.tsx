import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { timeAgo } from '../../lib/utils';
import {
  Search,
  MessageSquarePlus,
  Pin,
  VolumeX,
  CheckCheck,
  Check,
  Users,
} from 'lucide-react';
import type { Conversation } from '../../types';

interface ConversationListViewProps {
  onSelectConversation: (id: string) => void;
  activeId?: string | null;
}

export const ConversationListView: React.FC<ConversationListViewProps> = ({
  onSelectConversation,
  activeId,
}) => {
  const { conversations, currentUser, addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter((c) => {
    if (activeTab === 'unread' && (!c.unreadCount || c.unreadCount === 0)) return false;
    if (activeTab === 'groups' && !c.isGroup) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = c.isGroup ? c.groupName : c.participants.find((p) => p.id !== currentUser?.id)?.fullName;
      if (!title?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div
      id="conversation-list-container"
      className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm"
    >
      {/* Search & Header */}
      <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-stone-900 dark:text-white tracking-tight">
            Messages
          </h2>
          <button
            onClick={() => addToast('Search or select a user from Community to start a new chat.', 'info')}
            className="p-1.5 text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
            title="New Chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search chats or messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border-none text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
              activeTab === 'all'
                ? 'bg-emerald-900 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
              activeTab === 'unread'
                ? 'bg-emerald-900 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
              activeTab === 'groups'
                ? 'bg-emerald-900 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            Circles
          </button>
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
        {filtered.map((conv) => {
          const otherParticipant = conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
          const title = conv.isGroup ? conv.groupName : otherParticipant?.fullName;
          const avatar = conv.isGroup ? conv.groupAvatar : otherParticipant?.avatarUrl;
          const isSelected = activeId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition select-none ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-700'
                  : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={title}
                  className="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                />
                {otherParticipant?.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {title}
                  </span>
                  <span className="text-[10px] text-stone-400 shrink-0">
                    {conv.lastMessage ? timeAgo(conv.lastMessage.createdAt) : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate pr-2">
                    {conv.lastMessage?.text || conv.lastMessage?.content || 'No messages yet'}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {conv.isPinned && <Pin className="w-3 h-3 text-stone-400" />}
                    {conv.unreadCount && conv.unreadCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        {conv.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
