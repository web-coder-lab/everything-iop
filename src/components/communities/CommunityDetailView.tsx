import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { CommunityApi } from '../../lib/api/communityApi';
import { ChannelChatView } from './ChannelChatView';
import { PostCard } from '../feed/PostCard';
import { CreatePostComposer } from '../feed/CreatePostComposer';
import {
  Users2,
  Globe,
  Lock,
  ArrowLeft,
  Hash,
  Volume2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Settings,
  Plus,
} from 'lucide-react';
import type { Community, Channel } from '../../types';

interface CommunityDetailViewProps {
  communityId: string;
}

export const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({ communityId }) => {
  const { communities, joinCommunity, leaveCommunity, navigate, posts, currentUser, addToast } = useAppStore();
  const [community, setCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'channels' | 'about' | 'rules' | 'members'>('feed');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const found = communities.find((c) => c.id === communityId);
    if (found) {
      setCommunity(found);
      if (found.channels && found.channels.length > 0 && !selectedChannel) {
        setSelectedChannel(found.channels[0]);
      }
    }
  }, [communityId, communities]);

  if (!community) {
    return (
      <div className="py-12 text-center text-stone-500">
        <p>Loading community hub…</p>
        <button
          onClick={() => navigate('/communities')}
          className="mt-2 text-xs text-emerald-700 font-semibold"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  // Filter posts relevant to this community
  const communityPosts = posts.filter(
    (p) => p.communityId === community.id || p.communityName === community.name
  );

  return (
    <div id="community-detail-container" className="space-y-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/communities')}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Communities</span>
      </button>

      {/* Hero Cover & Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Cover */}
        <div className="h-44 sm:h-56 w-full relative bg-stone-200 dark:bg-stone-800">
          <img src={community.coverUrl} alt={community.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
              {community.privacy === 'public' ? (
                <>
                  <Globe className="w-3 h-3 text-emerald-400" /> Public Circle
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-400" /> Private Circle
                </>
              )}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                  {community.name}
                </h1>
                {community.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-600/10" />
                )}
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-xl leading-relaxed">
                {community.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
                <span className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <Users2 className="w-4 h-4 text-emerald-600" />
                  {community.membersCount.toLocaleString()} Members
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {community.onlineCount} Online
                </span>
                <span className="text-stone-400">• Category: {community.category}</span>
              </div>
            </div>

            {/* Join / Membership state button */}
            <div>
              {community.isJoined ? (
                <button
                  onClick={() => leaveCommunity(community.id)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-800 dark:text-stone-200 hover:text-rose-600 font-semibold text-xs transition"
                >
                  Joined (Leave)
                </button>
              ) : community.isPending ? (
                <span className="flex items-center gap-1 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-300">
                  <Clock className="w-4 h-4" /> Approval Pending
                </span>
              ) : (
                <button
                  onClick={() => joinCommunity(community.id)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  {community.privacy === 'private' ? 'Request to Join' : 'Join Circle'}
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 mt-6 pt-2 overflow-x-auto no-scrollbar">
            {(['feed', 'channels', 'about', 'rules', 'members'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 px-1 text-xs font-bold capitalize transition-all relative whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-emerald-900 dark:text-emerald-300'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {tab === 'feed' ? 'Discussion Feed' : tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <CreatePostComposer />
          {communityPosts.length > 0 ? (
            communityPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetail={(id) => navigate(`/post/${id}`)}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 text-center">
              <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                No posts shared in this circle yet. Start the conversation!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Channels Sidebar */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-2 h-fit">
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2">
              Community Channels
            </h4>
            {community.channels?.map((ch) => {
              const active = selectedChannel?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold border-l-2 border-emerald-700'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {ch.type === 'announcement' ? (
                      <Volume2 className="w-4 h-4 text-amber-500" />
                    ) : ch.type === 'question' ? (
                      <HelpCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Hash className="w-4 h-4 text-stone-400" />
                    )}
                    <span>{ch.name}</span>
                  </div>
                  {ch.unreadCount && ch.unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px]">
                      {ch.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Channel Chat */}
          <div className="md:col-span-2">
            {selectedChannel ? (
              <ChannelChatView community={community} channel={selectedChannel} />
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">Select a channel to chat</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <h3>Community Code of Conduct & Rules</h3>
          </div>
          <div className="space-y-3">
            {community.rules?.map((rule, idx) => (
              <div key={idx} className="flex gap-3 text-xs p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-stone-800 dark:text-stone-200 leading-relaxed pt-0.5">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 space-y-4 text-xs">
          <h3 className="font-bold text-stone-900 dark:text-white text-sm">About {community.name}</h3>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{community.description}</p>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2 text-stone-500">
            <p>• Category: {community.category}</p>
            <p>• Privacy Model: {community.privacy.toUpperCase()}</p>
            <p>• Managed by: Community verified team</p>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 space-y-3">
          <h3 className="font-bold text-stone-900 dark:text-white text-sm">
            Community Members ({community.membersCount.toLocaleString()})
          </h3>
          <p className="text-xs text-stone-500">
            Active stewards, verified founders, and participants across Pakistan.
          </p>
        </div>
      )}
    </div>
  );
};
