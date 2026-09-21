import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Plus } from 'lucide-react';
import type { Story } from '../../types';

export const StoriesBar: React.FC = () => {
  const { currentUser, setActiveStory, addToast } = useAppStore();
  const [userStories, setUserStories] = useState<Story[]>([]);

  const handleAddStory = () => {
    if (!currentUser) {
      addToast('Please sign in to add a story', 'info');
      return;
    }
    const url = prompt('Enter an image URL for your story:');
    if (url && url.trim()) {
      const newStory: Story = {
        id: `story_${Date.now()}`,
        user: currentUser,
        mediaUrl: url.trim(),
        type: 'image',
        text: 'Story update by ' + currentUser.fullName,
        createdAt: new Date().toISOString(),
        privacy: 'everyone',
      };
      setUserStories((prev) => [newStory, ...prev]);
      setActiveStory(newStory);
      addToast('Story added to community strip!', 'success');
    }
  };

  return (
    <div
      id="stories-carousel-strip"
      className="w-full overflow-x-auto no-scrollbar py-2 mb-4 -mx-1 px-1 flex items-center gap-3 select-none"
    >
      {/* Create story item */}
      <div
        onClick={handleAddStory}
        className="flex flex-col items-center shrink-0 cursor-pointer group"
      >
        <div className="relative w-16 h-16 rounded-2xl p-0.5 border border-dashed border-emerald-600/70 dark:border-emerald-500/70 group-hover:scale-105 transition-transform bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          <img
            src={
              currentUser?.avatarUrl ||
              'https://api.dicebear.com/7.x/initials/svg?seed=Me'
            }
            alt="Your story"
            className="w-full h-full rounded-2xl object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-amber-300 flex items-center justify-center shadow-md">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 mt-1 max-w-[64px] truncate">
          Your story
        </span>
      </div>

      {/* Real User Stories */}
      {userStories.map((story) => {
        return (
          <div
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="flex flex-col items-center shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-amber-500 to-emerald-600 group-hover:scale-105 transition-transform shadow-sm">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-900 border-2 border-white dark:border-stone-900">
                <img
                  src={story.mediaUrl}
                  alt={story.user.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 mt-1 max-w-[64px] truncate text-center">
              {story.user.fullName.split(' ')[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
};
