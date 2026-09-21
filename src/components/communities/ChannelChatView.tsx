import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { timeAgo } from '../../lib/utils';
import { Send, Hash, Volume2, HelpCircle, Lock, Shield, CheckCheck } from 'lucide-react';
import type { Community, Channel, Message } from '../../types';

interface ChannelChatViewProps {
  community: Community;
  channel: Channel;
}

export const ChannelChatView: React.FC<ChannelChatViewProps> = ({ community, channel }) => {
  const { currentUser, addToast } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'cmsg_1',
      conversationId: channel.id,
      sender: {
        id: community.ownerId || 'usr_01',
        username: 'bilal_ceo',
        fullName: 'Bilal Tariq',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        isVerified: true,
        role: 'admin',
        followersCount: 1540,
        followingCount: 300,
        communitiesCount: 5,
        postsCount: 54,
        joinedAt: '2025-01-01',
      },
      text: `Welcome to #${channel.name}! Let's keep discussions focused and supportive of the community guidelines.`,
      content: `Welcome to #${channel.name}! Let's keep discussions focused and supportive of the community guidelines.`,
      type: 'text',
      status: 'read',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'cmsg_2',
      conversationId: channel.id,
      sender: {
        id: 'usr_02',
        username: 'ayesha_k',
        fullName: 'Ayesha Khan',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        isVerified: true,
        role: 'user',
        followersCount: 890,
        followingCount: 140,
        communitiesCount: 2,
        postsCount: 12,
        joinedAt: '2025-01-01',
      },
      text: 'Salam everyone! Delighted to connect here.',
      content: 'Salam everyone! Delighted to connect here.',
      type: 'text',
      status: 'read',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const isAllowedToPost =
    !channel.permissions ||
    channel.permissions === 'everyone' ||
    (channel.permissions === 'admin_only' && (currentUser?.role === 'admin' || currentUser?.id === community.ownerId));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !isAllowedToPost) return;

    const newMsg: Message = {
      id: `cmsg_${Date.now()}`,
      conversationId: channel.id,
      sender: currentUser,
      text: inputText.trim(),
      content: inputText.trim(),
      type: 'text',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const getIcon = () => {
    switch (channel.type) {
      case 'announcement':
        return <Volume2 className="w-4 h-4 text-amber-500" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Hash className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
      {/* Channel Header */}
      <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-2">
          {getIcon()}
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-white">#{channel.name}</h4>
            <p className="text-[10px] text-stone-500">
              {(channel.type || 'text').toUpperCase()} • {channel.permissions === 'admin_only' ? 'Admin posts only' : 'Everyone can post'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUser?.id;
          return (
            <div key={msg.id} className="flex items-start gap-2.5 text-xs">
              <img
                src={msg.sender.avatarUrl}
                alt={msg.sender.fullName}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {msg.sender.fullName}
                  </span>
                  <span className="text-[10px] text-stone-400">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className="text-stone-800 dark:text-stone-200 mt-0.5 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-2xl rounded-tl-sm inline-block">
                  {msg.text || msg.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
        {isAllowedToPost ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder={`Message #${channel.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div className="text-center text-xs text-stone-400 py-1 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Only community admins can send announcements in this channel.</span>
          </div>
        )}
      </div>
    </div>
  );
};
