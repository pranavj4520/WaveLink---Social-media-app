import React from 'react';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from './PostCard';

export const BookmarksView: React.FC = () => {
  const { posts, currentUser, setActiveTab } = useSocial();

  const bookmarkedPosts = posts.filter((p) => p.bookmarkedBy.includes(currentUser.id));

  return (
    <div id="bookmarks-view-container" className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 p-4 flex items-center gap-3">
        <button
          onClick={() => setActiveTab('feed')}
          className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 leading-tight">Bookmarks</h2>
          <span className="text-xs text-zinc-400">@{currentUser.handle}</span>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-zinc-100">
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="p-16 text-center text-zinc-500">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Bookmark className="w-6 h-6 stroke-1" />
            </div>
            <p className="text-base font-semibold text-zinc-800 mb-1">Save posts for later</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Don't let the good stuff slip away! Bookmark posts using the bookmark icon to easily find them again in the future.
            </p>
            <button
              onClick={() => setActiveTab('feed')}
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Browse Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
