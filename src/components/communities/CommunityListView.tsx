import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { CommunityApi } from '../../lib/api/communityApi';
import {
  Users2,
  Search,
  Lock,
  Globe,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Shield,
} from 'lucide-react';
import type { Community } from '../../types';

const CATEGORIES = ['All', 'Technology', 'Business', 'Jobs', 'Education', 'Sports', 'General'];

export const CommunityListView: React.FC = () => {
  const { communities, joinCommunity, leaveCommunity, navigate, currentUser, addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'joined' | 'managed'>('discover');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New community form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newPrivacy, setNewPrivacy] = useState<'public' | 'private'>('public');

  const filtered = communities.filter((comm) => {
    if (activeTab === 'joined' && !comm.isJoined) return false;
    if (activeTab === 'managed' && comm.ownerId !== currentUser?.id) return false;
    if (selectedCategory !== 'All' && comm.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !comm.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !comm.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    try {
      const res = await CommunityApi.createCommunity({
        name: newName,
        description: newDesc,
        category: newCategory,
        privacy: newPrivacy,
      });
      if (res.data) {
        addToast('Community created successfully!', 'success');
        setCreateModalOpen(false);
        setNewName('');
        setNewDesc('');
        navigate(`/communities/${res.data.id}`);
      }
    } catch {
      addToast('Failed to create community.', 'error');
    }
  };

  return (
    <div id="community-list-container" className="space-y-5 animate-fade-in">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Communities
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Discover interest circles, professional hubs, and community channels
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold text-xs shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>New Community</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'discover'
              ? 'bg-emerald-900 text-white'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Discover Hubs
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'joined'
              ? 'bg-emerald-900 text-white'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          My Joined Circles
        </button>
        <button
          onClick={() => setActiveTab('managed')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'managed'
              ? 'bg-emerald-900 text-white'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Managed by Me
        </button>
      </div>

      {/* Search & Categories Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search communities by title, keyword, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Communities Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((comm) => (
            <div
              key={comm.id}
              onClick={() => navigate(`/communities/${comm.id}`)}
              className="group bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:border-emerald-700/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-28 w-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <img
                    src={comm.coverUrl}
                    alt={comm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                    {comm.privacy === 'public' ? (
                      <>
                        <Globe className="w-2.5 h-2.5" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5" /> Private
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {comm.category}
                        </span>
                        {comm.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                        {comm.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {comm.description}
                  </p>
                </div>
              </div>

              {/* Footer / Join CTA */}
              <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Users2 className="w-3.5 h-3.5" />
                  <strong>{comm.membersCount.toLocaleString()}</strong> members
                </span>

                {comm.isJoined ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      leaveCommunity(comm.id);
                    }}
                    className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
                  >
                    Joined
                  </button>
                ) : comm.isPending ? (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Pending
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      joinCommunity(comm.id);
                    }}
                    className="px-3.5 py-1 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-semibold transition"
                  >
                    {comm.privacy === 'private' ? 'Request Join' : 'Join'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <Users2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
            No communities found matching your filters
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search keywords or start a new community hub.
          </p>
        </div>
      )}

      {/* Create Community Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1">
              Create New Community Hub
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Gather Pakistani thinkers, professionals, and peers around shared passions.
            </p>

            <form onSubmit={handleCreateCommunity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lahore Tech Founders"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Description & Purpose
                </label>
                <textarea
                  placeholder="Describe guidelines, discussions, and goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  rows={3}
                  className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Access Privacy
                  </label>
                  <select
                    value={newPrivacy}
                    onChange={(e) => setNewPrivacy(e.target.value as 'public' | 'private')}
                    className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="private">🔒 Private (Approval)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
