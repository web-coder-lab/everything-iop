import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { apiClient } from '../../lib/api/client';
import { PostCard } from '../feed/PostCard';
import {
  Calendar,
  MapPin,
  Link2,
  CheckCircle2,
  QrCode,
  Edit3,
  Bookmark,
  Grid,
  Users2,
  Share2,
} from 'lucide-react';
import type { User } from '../../types';

interface ProfileViewProps {
  user?: User | null;
  username?: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user: propUser, username }) => {
  const {
    currentUser,
    posts,
    communities,
    setQrModalUser,
    setEditProfileOpen,
    navigate,
    openChatWithUser,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'saved' | 'communities'>('posts');
  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(Boolean(username));
  const [profileError, setProfileError] = useState('');
  useEffect(() => {
    if (!username) return;
    setProfileLoading(true);
    apiClient.request<User>(`/profiles/${encodeURIComponent(username)}`).then((res) => setRemoteUser(res.data || null)).catch((e:any) => setProfileError(e.message || 'Unable to load profile.')).finally(() => setProfileLoading(false));
  }, [username]);
  const user = propUser || remoteUser || currentUser;

  if (profileLoading) return <div className="py-12 text-center text-stone-500">Loading profile from Everything IOP server…</div>;
  if (profileError) return <div className="py-12 text-center text-rose-600">{profileError}</div>;
  if (!user) {
    return (
      <div className="py-12 text-center text-stone-500">
        <p>No user profile loaded.</p>
      </div>
    );
  }

  const isMe = user.id === currentUser?.id;
  const userPosts = posts.filter((p) => p.author.id === user.id);
  const savedPosts = posts.filter((p) => p.isSaved);
  const userCommunities = communities.filter((c) => c.isJoined || c.ownerId === user.id);

  return (
    <div id="profile-page-container" className="space-y-4 animate-fade-in max-w-3xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm">
        {/* Cover image */}
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-amber-900 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile info section */}
        <div className="px-4 sm:px-6 pb-6 relative">
          {/* Avatar & Action row */}
          <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-4">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-md"
              />
              {user.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQrModalUser(user)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1.5 transition"
                title="Share QR Code"
              >
                <QrCode className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden sm:inline">QR Share</span>
              </button>

              {isMe ? (
                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => openChatWithUser(user)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  Send Message
                </button>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                {user.fullName}
              </h1>
              {user.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-600/10" />
              )}
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Community Admin
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-medium">@{user.username}</p>

            <p className="text-xs text-stone-700 dark:text-stone-300 mt-2.5 leading-relaxed max-w-xl">
              {user.bio || 'Exploring and building communities across Pakistan.'}
            </p>

            {/* Metadata tags */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Pakistan</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Joined {new Date(user.joinedAt || user.createdAt || Date.now()).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Link2 className="w-3.5 h-3.5" />
                <a href="https://everything.example" target="_blank" rel="noreferrer" className="hover:underline">
                  everything.example
                </a>
              </span>
            </div>

            {/* Follower counts */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex items-center gap-1">
                <strong className="font-bold text-stone-900 dark:text-white">
                  {(user.followersCount || 1420).toLocaleString()}
                </strong>
                <span className="text-stone-500">Followers</span>
              </div>
              <div className="flex items-center gap-1">
                <strong className="font-bold text-stone-900 dark:text-white">
                  {(user.followingCount || 342).toLocaleString()}
                </strong>
                <span className="text-stone-500">Following</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 border-b border-stone-100 dark:border-stone-800 mt-5 pt-2">
            {[
              { id: 'posts', label: 'Posts' },
              { id: 'media', label: 'Media' },
              { id: 'saved', label: 'Saved' },
              { id: 'communities', label: 'Circles' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 text-xs font-bold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-emerald-900 dark:text-emerald-300'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetail={(id) => navigate(`/post/${id}`)}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
              No posts published yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800">
          {userPosts
            .filter((p) => p.mediaUrls && p.mediaUrls.length > 0)
            .flatMap((p) => p.mediaUrls!)
            .map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-stone-100">
                <img src={url} alt="Media" className="w-full h-full object-cover" />
              </div>
            ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetail={(id) => navigate(`/post/${id}`)}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
              No bookmarked posts yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'communities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userCommunities.map((comm) => (
            <div
              key={comm.id}
              onClick={() => navigate(`/communities/${comm.id}`)}
              className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-emerald-700 transition"
            >
              <img
                src={comm.coverUrl}
                alt={comm.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                  {comm.name}
                </h4>
                <p className="text-[11px] text-stone-500">{comm.membersCount} members</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
