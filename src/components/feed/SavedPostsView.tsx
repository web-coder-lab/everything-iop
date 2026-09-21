import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { PostCard } from './PostCard';
import { Bookmark, ArrowLeft } from 'lucide-react';

export const SavedPostsView: React.FC = () => {
  const { posts, navigate } = useAppStore();
  const saved = posts.filter((p) => p.isSaved);

  return (
    <div id="saved-posts-view" className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-emerald-700" />
          <h1 className="text-lg font-bold text-stone-900 dark:text-white">Bookmarks & Saved Posts</h1>
        </div>
        <span className="text-xs text-stone-500 font-semibold">{saved.length} saved</span>
      </div>

      {saved.length > 0 ? (
        <div className="space-y-4">
          {saved.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenDetail={(id) => navigate(`/post/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 border border-stone-200 dark:border-stone-800 text-center">
          <Bookmark className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-800 dark:text-stone-200">No saved posts yet</p>
          <p className="text-xs text-stone-500 mt-1">
            Tap the bookmark icon on any post in your community feed to save it here for later.
          </p>
        </div>
      )}
    </div>
  );
};
