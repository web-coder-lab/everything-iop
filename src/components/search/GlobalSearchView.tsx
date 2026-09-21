import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { PostCard } from '../feed/PostCard';
import { Search, Users2, User, FileText, CheckCircle2 } from 'lucide-react';

interface GlobalSearchViewProps {
  initialQuery?: string;
}

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({ initialQuery = '' }) => {
  const { posts, communities, navigate } = useAppStore();
  const [query, setQuery] = useState(initialQuery);
  const [searchTab, setSearchTab] = useState<'all' | 'posts' | 'communities' | 'people'>('all');

  const q = query.toLowerCase().trim();

  const matchedPosts = posts.filter(
    (p) => !q || p.content.toLowerCase().includes(q) || p.author.fullName.toLowerCase().includes(q)
  );

  const matchedCommunities = communities.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );

  return (
    <div id="search-view-container" className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Search Input Box */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search keywords, topics, communities, or people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white border-none focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        {/* Search Type Tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/80">
          {(['all', 'posts', 'communities'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSearchTab(tab)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                searchTab === tab
                  ? 'bg-emerald-900 text-white'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Results Stream */}
      <div className="space-y-4">
        {(searchTab === 'all' || searchTab === 'communities') && matchedCommunities.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-bold text-stone-400 px-1">
              Communities ({matchedCommunities.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedCommunities.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/communities/${c.id}`)}
                  className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-3 cursor-pointer hover:border-emerald-700 transition"
                >
                  <img src={c.coverUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-stone-500">{c.membersCount} members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(searchTab === 'all' || searchTab === 'posts') && (
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-stone-400 px-1">
              Posts ({matchedPosts.length})
            </h3>
            {matchedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetail={(id) => navigate(`/post/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
