import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { PostApi } from '../../lib/api/postApi';
import { timeAgo, copyToClipboard } from '../../lib/utils';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Shield,
  CheckCircle2,
  Trash2,
  Flag,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onOpenDetail?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenDetail }) => {
  const {
    currentUser,
    togglePostReaction,
    toggleSavePost,
    deletePost,
    openReportModal,
    addToast,
    navigate,
  } = useAppStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | undefined>(post.userReaction);
  const [reactionsCount, setReactionsCount] = useState(post.reactionsCount);
  const [poll, setPoll] = useState(post.poll);

  const isAuthor = currentUser?.id === post.author.id;
  const totalReactions = Object.values(reactionsCount).reduce((a, b) => a + b, 0);

  const handleReaction = async (type: string) => {
    setSelectedReaction((prev) => (prev === type ? undefined : type));
    await togglePostReaction(post.id, type);
  };

  const handleVotePoll = async (optionId: string) => {
    if (!poll) return;
    try {
      const res = await PostApi.votePoll(post.id, optionId);
      if (res.data?.post.poll) {
        setPoll(res.data.post.poll);
        addToast('Vote recorded!', 'success');
      }
    } catch {
      addToast('Unable to submit vote.', 'error');
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author.fullName}`,
          text: post.content.slice(0, 100),
          url: postUrl,
        });
      } catch {}
    } else {
      const ok = await copyToClipboard(postUrl);
      if (ok) addToast('Link copied to clipboard.', 'success');
    }
  };

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm mb-4 transition-all hover:border-stone-300 dark:hover:border-stone-700"
    >
      {/* Author Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/users/${post.author.username}`)}
            className="flex items-center gap-3 group text-left"
          >
            <img
              src={post.author.avatarUrl}
              alt={post.author.fullName}
              className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {post.author.fullName}
                </span>
                {post.author.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" />
                )}
                {post.author.role === 'admin' && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span>@{post.author.username}</span>
                <span>•</span>
                <span>{timeAgo(post.createdAt)}</span>
                <span>•</span>
                {post.communityName ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (post.communityId) navigate(`/communities/${post.communityId}`);
                    }}
                    className="font-medium text-emerald-800 dark:text-emerald-400 hover:underline"
                  >
                    {post.communityName}
                  </button>
                ) : post.audience === 'public' ? (
                  <span title="Public"><Globe className="w-3 h-3 text-stone-400" /></span>
                ) : (
                  <span title="Followers only"><Users className="w-3 h-3 text-stone-400" /></span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-44 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-20 animate-fade-in"
              onClick={() => setMenuOpen(false)}
            >
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Link</span>
              </button>

              {isAuthor ? (
                <button
                  onClick={() => deletePost(post.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              ) : (
                <button
                  onClick={() =>
                    openReportModal({
                      type: 'post',
                      id: post.id,
                      title: `Post by ${post.author.fullName}`,
                    })
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <Flag className="w-3.5 h-3.5 text-stone-500" />
                  <span>Report Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Text Content */}
      <div
        onClick={() => onOpenDetail?.(post.id)}
        className="cursor-pointer"
      >
        <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line mb-3">
          {post.content}
        </p>

        {/* Media Attachments */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div
            className={`rounded-2xl overflow-hidden mb-3 border border-stone-100 dark:border-stone-800 ${
              post.mediaUrls.length > 1 ? 'grid grid-cols-2 gap-1.5' : ''
            }`}
          >
            {post.mediaUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Post content"
                className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-200"
              />
            ))}
          </div>
        )}

        {/* Poll Component */}
        {poll && (
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 mb-3 space-y-2">
            <p className="text-xs font-bold text-stone-900 dark:text-white">{poll.question}</p>
            <div className="space-y-1.5">
              {poll.options.map((opt) => {
                const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                const isSelected = poll.userVote === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVotePoll(opt.id);
                    }}
                    className={`relative w-full text-left p-2.5 rounded-xl border text-xs font-medium overflow-hidden transition-all ${
                      isSelected
                        ? 'border-emerald-600 text-emerald-950 dark:text-emerald-100 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/50'
                    }`}
                  >
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${
                        isSelected ? 'bg-emerald-200/50 dark:bg-emerald-900/50' : 'bg-stone-200/40 dark:bg-stone-700/40'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between z-10">
                      <span>{opt.text}</span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
                        {pct}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-500 pt-1">{poll.totalVotes} total votes</p>
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80 text-stone-500">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reaction Button */}
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedReaction
                ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                : 'hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${selectedReaction ? 'fill-current' : ''}`} />
            <span>{totalReactions > 0 ? totalReactions : 'React'}</span>
          </button>

          {/* Comments Button */}
          <button
            onClick={() => onOpenDetail?.(post.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount > 0 ? post.commentsCount : 'Comment'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Bookmark / Save */}
        <button
          onClick={() => toggleSavePost(post.id)}
          className={`p-1.5 rounded-xl transition ${
            post.isSaved
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
          aria-label="Save post"
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </article>
  );
};
