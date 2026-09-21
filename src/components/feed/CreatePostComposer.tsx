import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  Image,
  Video,
  BarChart2,
  Link2,
  Globe,
  Users,
  Shield,
  X,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import type { AudienceType } from '../../types';

export const CreatePostComposer: React.FC = () => {
  const {
    currentUser,
    communities,
    createPost,
    createPostModalOpen,
    setCreatePostModalOpen,
  } = useAppStore();

  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<AudienceType>('public');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isPublishing, setIsPublishing] = useState(false);

  // Restore draft from local state so user input is never lost
  useEffect(() => {
    const savedDraft = localStorage.getItem('everything_post_draft');
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.content && !content) setContent(d.content);
      } catch {}
    }
  }, []);

  const saveDraft = (text: string) => {
    setContent(text);
    localStorage.setItem('everything_post_draft', JSON.stringify({ content: text }));
  };

  const handleAddMedia = () => {
    const url = prompt(
      'Enter an image or photo URL for this post:',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80'
    );
    if (url) {
      setMediaUrls((prev) => [...prev, url]);
    }
  };

  const handleAddVideo = () => {
    const url = prompt(
      'Enter a video embed or preview URL:',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80'
    );
    if (url) {
      setMediaUrls((prev) => [...prev, url]);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePollOption = (index: number, val: string) => {
    const next = [...pollOptions];
    next[index] = val;
    setPollOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0 && !pollQuestion) return;

    setIsPublishing(true);
    let pollPayload = undefined;
    if (showPollComposer && pollQuestion.trim()) {
      const validOptions = pollOptions.filter((o) => o.trim().length > 0);
      if (validOptions.length >= 2) {
        pollPayload = {
          question: pollQuestion.trim(),
          options: validOptions,
        };
      }
    }

    const success = await createPost(
      content,
      audience,
      mediaUrls.length > 0 ? mediaUrls : undefined,
      selectedCommunityId || undefined,
      pollPayload
    );

    setIsPublishing(false);
    if (success) {
      setContent('');
      setMediaUrls([]);
      setShowPollComposer(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      localStorage.removeItem('everything_post_draft');
    }
  };

  if (!currentUser) return null;

  const contentUI = (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm mb-6 transition-all">
      <div className="flex items-start gap-3">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.fullName}
          className="w-10 h-10 rounded-full object-cover border border-emerald-700/40 shrink-0"
        />

        <div className="flex-1">
          {/* Controls: Audience & Community Picker */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as AudienceType)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="public">🌐 Public (Everyone)</option>
              <option value="followers">👥 Followers Only</option>
              <option value="community">🏛️ In Community</option>
            </select>

            {audience === 'community' && (
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 focus:outline-none"
              >
                <option value="">Select a community...</option>
                {communities.map((comm) => (
                  <option key={comm.id} value={comm.id}>
                    {comm.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <textarea
            value={content}
            onChange={(e) => saveDraft(e.target.value)}
            placeholder="What's happening in your community today?"
            rows={createPostModalOpen ? 4 : 2}
            className="w-full text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 bg-transparent focus:outline-none resize-none"
          />

          {/* Media preview chips */}
          {mediaUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 w-24 h-24">
                  <img src={url} alt="Uploaded attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Poll Composer */}
          {showPollComposer && (
            <div className="my-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-700" /> Community Poll
                </span>
                <button
                  type="button"
                  onClick={() => setShowPollComposer(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Ask a community question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 mb-2 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />

              <div className="space-y-1.5">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => handleUpdatePollOption(i, e.target.value)}
                      className="flex-1 text-xs p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(i)}
                        className="p-1.5 text-stone-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add option
                </button>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80 mt-2">
            <div className="flex items-center gap-1 text-stone-500">
              <button
                type="button"
                onClick={handleAddMedia}
                className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-700 transition"
                title="Add photo"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleAddVideo}
                className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-700 transition"
                title="Add video"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowPollComposer(!showPollComposer)}
                className={`p-2 rounded-xl transition ${
                  showPollComposer
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-700'
                }`}
                title="Add poll"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isPublishing || (!content.trim() && mediaUrls.length === 0 && !pollQuestion.trim())}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              {isPublishing ? 'Publishing…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (createPostModalOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-lg">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setCreatePostModalOpen(false)}
              className="p-1 rounded-full bg-white dark:bg-stone-800 text-stone-500 shadow"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {contentUI}
        </div>
      </div>
    );
  }

  return contentUI;
};
