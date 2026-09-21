import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { StoriesBar } from './StoriesBar';
import { StoryViewerModal } from './StoryViewerModal';
import { CreatePostComposer } from './CreatePostComposer';
import { PostCard } from './PostCard';
import { Sparkles, Users, Clock, RefreshCw } from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, feedTab, setFeedTab, loadFeed, navigate } = useAppStore();

  const handleTabChange = (tab: 'foryou' | 'following' | 'latest') => {
    setFeedTab(tab);
    loadFeed(tab);
  };

  return (
    <div id="home-feed-container" className="space-y-4">
      {/* 24h Expiring Stories Carousel Strip */}
      <StoriesBar />
      <StoryViewerModal />

      {/* Feed Tabs: For You, Following, Latest */}
      <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2 px-1">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => handleTabChange('foryou')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition-all relative ${
              feedTab === 'foryou'
                ? 'text-emerald-900 dark:text-emerald-300'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>For You</span>
            {feedTab === 'foryou' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('following')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition-all relative ${
              feedTab === 'following'
                ? 'text-emerald-900 dark:text-emerald-300'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Following</span>
            {feedTab === 'following' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('latest')}
            className={`flex items-center gap-1.5 pb-2 text-xs font-bold transition-all relative ${
              feedTab === 'latest'
                ? 'text-emerald-900 dark:text-emerald-300'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latest</span>
            {feedTab === 'latest' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        <button
          onClick={() => loadFeed(feedTab)}
          className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
          title="Refresh feed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Post Composer */}
      <CreatePostComposer />

      {/* Feed Stream */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenDetail={(id) => navigate(`/post/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No community posts yet in this stream
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Be the first to share an update, start a discussion, or join a community channel.
          </p>
        </div>
      )}
    </div>
  );
};
