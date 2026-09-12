import React from 'react';
import { Sparkles, Users, Image as ImageIcon, X, Flame } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { StoriesBar } from './StoriesBar';
import { CreatePostBox } from './CreatePostBox';
import { PostCard } from './PostCard';

export const FeedView: React.FC = () => {
  const {
    posts,
    currentUser,
    feedFilter,
    setFeedFilter,
    selectedTag,
    setSelectedTag,
    isFollowing,
  } = useSocial();

  // Filter posts based on tab and selected hashtag
  let filteredPosts = posts.filter((p) => {
    // Tag filter
    if (selectedTag) {
      const match = p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      if (!match) return false;
    }

    // Tab filter
    if (feedFilter === 'following') {
      return p.authorId === currentUser.id || isFollowing(p.authorId);
    }
    if (feedFilter === 'media') {
      return Boolean(p.mediaUrl);
    }
    return true; // 'for-you'
  });

  return (
    <div id="feed-view-container" className="min-h-screen">
      {/* Feed Sticky Header Tabs */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="flex items-center justify-around h-13 px-2">
          <button
            id="tab-feed-for-you"
            onClick={() => {
              setFeedFilter('for-you');
              setSelectedTag(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 h-full relative text-sm font-semibold transition-colors ${
              feedFilter === 'for-you' && !selectedTag
                ? 'text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>For You</span>
            {feedFilter === 'for-you' && !selectedTag && (
              <span className="absolute bottom-0 inset-x-6 h-0.75 bg-zinc-900 rounded-full" />
            )}
          </button>

          <button
            id="tab-feed-following"
            onClick={() => {
              setFeedFilter('following');
              setSelectedTag(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 h-full relative text-sm font-semibold transition-colors ${
              feedFilter === 'following'
                ? 'text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Following</span>
            {feedFilter === 'following' && (
              <span className="absolute bottom-0 inset-x-6 h-0.75 bg-zinc-900 rounded-full" />
            )}
          </button>

          <button
            id="tab-feed-media"
            onClick={() => {
              setFeedFilter('media');
              setSelectedTag(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 h-full relative text-sm font-semibold transition-colors ${
              feedFilter === 'media'
                ? 'text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media</span>
            {feedFilter === 'media' && (
              <span className="absolute bottom-0 inset-x-6 h-0.75 bg-zinc-900 rounded-full" />
            )}
          </button>
        </div>

        {/* Selected Tag Active Banner */}
        {selectedTag && (
          <div className="bg-indigo-50/80 px-4 py-2 border-t border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-indigo-600" />
              Showing posts tagged with <span className="font-bold">#{selectedTag}</span>
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
            >
              Clear
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Stories Bar */}
      <StoriesBar />

      {/* Post Composer */}
      <CreatePostBox />

      {/* Post Stream */}
      <div id="posts-stream">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="p-12 text-center text-zinc-500">
            <p className="text-base font-semibold text-zinc-800 mb-1">No posts found</p>
            <p className="text-xs text-zinc-400 mb-4">
              {feedFilter === 'following'
                ? "You're not following anyone who posted yet, or they haven't posted."
                : 'No posts match this filter.'}
            </p>
            {feedFilter === 'following' ? (
              <button
                onClick={() => setFeedFilter('for-you')}
                className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Switch to For You
              </button>
            ) : (
              selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Clear Tag Filter
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
