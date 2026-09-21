import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { PostApi } from '../../lib/api/postApi';
import { PostCard } from './PostCard';
import { timeAgo } from '../../lib/utils';
import { ArrowLeft, Send, CornerDownRight, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import CoinMessageComposer from '../everything/CoinMessageComposer';
import type { Post, Comment } from '../../types';

interface PostDetailViewProps {
  postId: string;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({ postId }) => {
  const { posts, navigate, currentUser, addToast } = useAppStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existing = posts.find((p) => p.id === postId);
    if (existing) {
      setPost(existing);
    }
    loadComments();
  }, [postId, posts]);

  const loadComments = async () => {
    try {
      const res = await PostApi.getComments(postId);
      if (res.data) {
        setComments(res.data);
      }
    } catch {
      // Handled
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await PostApi.addComment(postId, replyText, replyingToCommentId || undefined);
      if (res.data) {
        if (replyingToCommentId) {
          // add to replies of parent
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyingToCommentId
                ? { ...c, replies: [...(c.replies || []), res.data!] }
                : c
            )
          );
        } else {
          setComments((prev) => [...prev, res.data!]);
        }
        setReplyText('');
        setReplyingToCommentId(null);
        addToast('Comment posted.', 'success');
      }
    } catch {
      addToast('Could not send comment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) {
    return (
      <div className="p-8 text-center text-stone-500">
        <p>Loading post details…</p>
        <button
          onClick={() => navigate('/home')}
          className="mt-3 text-xs text-emerald-700 font-semibold hover:underline"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div id="post-detail-page" className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to feed</span>
      </button>

      {/* Main Post Card */}
      <PostCard post={post} />

      {/* Comments section */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-4">
          Community Discussion ({comments.length})
        </h3>

        {/* Reply Composer */}
        <form onSubmit={handleAddComment} className="mb-6">
          {replyingToCommentId && (
            <div className="flex items-center justify-between text-[11px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-t-xl">
              <span>Replying to comment thread</span>
              <button
                type="button"
                onClick={() => setReplyingToCommentId(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={replyingToCommentId ? 'Write your reply...' : 'Share your respectful thought...'}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <CoinMessageComposer
        surfaceId={post.id}
        surfaceType="post"
        ownerId={post.author.id}
        currentUserId={currentUser?.id}
      />

      {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => {
            const isCommentAuthor = comment.author.id === post.author.id;
            return (
              <div key={comment.id} className="text-xs space-y-2 border-b border-stone-100 dark:border-stone-800/50 pb-3 last:border-none">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.author.avatarUrl}
                      alt={comment.author.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {comment.author.fullName}
                        </span>
                        {comment.author.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                        {isCommentAuthor && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Author
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        @{comment.author.username} • {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setReplyingToCommentId(comment.id)}
                    className="text-[11px] text-stone-500 hover:text-emerald-700 font-medium"
                  >
                    Reply
                  </button>
                </div>

                <p className="text-stone-800 dark:text-stone-200 pl-9 leading-relaxed">
                  {comment.content}
                </p>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-9 mt-2 space-y-2 border-l-2 border-stone-100 dark:border-stone-800">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="pt-1.5 pl-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={reply.author.avatarUrl}
                            alt={reply.author.fullName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-bold text-stone-900 dark:text-stone-100 text-[11px]">
                            {reply.author.fullName}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {timeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-stone-800 dark:text-stone-200 mt-1 text-[11px]">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
