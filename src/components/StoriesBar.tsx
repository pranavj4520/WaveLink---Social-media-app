import React from 'react';
import { Plus } from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export const StoriesBar: React.FC = () => {
  const { stories, users, currentUser, setViewingStory, setIsCreateStoryOpen } = useSocial();

  // Group stories or show active stories
  return (
    <div id="stories-bar-container" className="border-b border-zinc-200/70 bg-white/60 backdrop-blur-md px-4 py-3">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {/* Add story button */}
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
          <button
            id="btn-add-story"
            onClick={() => setIsCreateStoryOpen(true)}
            className="relative w-15 h-15 rounded-full p-0.5 border border-dashed border-zinc-300 group-hover:border-zinc-800 transition-colors flex items-center justify-center bg-zinc-50"
            title="Create a new story"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-zinc-900 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </div>
          </button>
          <span className="text-[11px] font-medium text-zinc-600 mt-1.5 truncate max-w-[64px]">
            Your story
          </span>
        </div>

        {/* List of active stories */}
        {stories.map((story) => {
          const author = users.find((u) => u.id === story.authorId);
          if (!author) return null;
          const isViewed = story.viewedBy.includes(currentUser.id);

          return (
            <div
              key={story.id}
              id={`story-item-${story.id}`}
              onClick={() => setViewingStory(story)}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
            >
              <div
                className={`w-15 h-15 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                  isViewed
                    ? 'border-2 border-zinc-300'
                    : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[2px]'
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-zinc-700 mt-1.5 truncate max-w-[64px] text-center">
                {author.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
