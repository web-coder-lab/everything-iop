import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { X, Heart, Send, Globe, Users, Shield } from 'lucide-react';

export const StoryViewerModal: React.FC = () => {
  const { activeStory, setActiveStory, addToast } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!activeStory) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveStory(null);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, setActiveStory]);

  if (!activeStory) return null;

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      addToast(`Reply sent to ${activeStory.user.fullName}!`, 'success');
      setReplyText('');
      setActiveStory(null);
    }
  };

  return (
    <div
      id="story-fullscreen-viewer"
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-4 select-none animate-fade-in"
    >
      <div className="relative w-full max-w-sm h-full sm:h-[680px] bg-stone-900 rounded-none sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Background media */}
        <img
          src={activeStory.mediaUrl}
          alt="Story"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

        {/* Top header & progress */}
        <div className="relative z-10 p-4">
          {/* Progress bar */}
          <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-3">
            <div
              className="bg-amber-400 h-full transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={activeStory.user.avatarUrl}
                alt={activeStory.user.fullName}
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
              />
              <div className="text-white">
                <p className="text-xs font-bold leading-none">{activeStory.user.fullName}</p>
                <div className="flex items-center gap-1 text-[10px] text-stone-300 mt-1">
                  <span>@{activeStory.user.username}</span>
                  <span>•</span>
                  {activeStory.privacy === 'everyone' ? (
                    <span className="flex items-center gap-0.5">
                      <Globe className="w-2.5 h-2.5" /> Everyone
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> Followers
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveStory(null)}
              className="p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white transition"
              aria-label="Close story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Caption text */}
        {activeStory.text && (
          <div className="relative z-10 px-5 mb-auto text-center text-sm font-medium text-white drop-shadow-md">
            <p className="bg-black/40 px-3 py-1.5 rounded-xl inline-block backdrop-blur-sm">
              {activeStory.text}
            </p>
          </div>
        )}

        {/* Bottom reply bar */}
        <div className="relative z-10 p-4 flex items-center gap-2">
          <form onSubmit={handleReply} className="flex-1 flex items-center relative">
            <input
              type="text"
              placeholder={`Reply to ${activeStory.user.fullName.split(' ')[0]}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full h-10 pl-4 pr-10 rounded-full bg-black/50 text-white placeholder-stone-400 text-xs border border-white/20 focus:outline-none focus:border-amber-400 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="absolute right-2 p-1 text-amber-400 hover:text-amber-300 disabled:opacity-40"
              disabled={!replyText.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <button
            onClick={() => {
              setLiked(!liked);
              addToast(liked ? 'Reaction removed' : 'Reacted with ❤️', 'info');
            }}
            className={`p-2.5 rounded-full backdrop-blur-sm transition ${
              liked ? 'bg-rose-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'
            }`}
            aria-label="Like story"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
