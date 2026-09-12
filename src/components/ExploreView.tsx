import React, { useState } from 'react';
import { Search, TrendingUp, Users, Sparkles, Hash, ArrowUpRight } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from './PostCard';

const CATEGORIES = ['All', 'Architecture', 'Photography', 'Technology', 'Design', 'Outdoors'];

export const ExploreView: React.FC = () => {
  const {
    posts,
    users,
    currentUser,
    trending,
    setSelectedTag,
    setActiveTab,
    viewProfile,
    toggleFollow,
    isFollowing,
  } = useSocial();

  const [activeCategory, setActiveCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  // Matching users
  const matchingUsers = localSearch.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(localSearch.toLowerCase()) ||
          u.handle.toLowerCase().includes(localSearch.toLowerCase()) ||
          u.bio.toLowerCase().includes(localSearch.toLowerCase())
      )
    : [];

  // Matching posts
  const matchingPosts = posts.filter((p) => {
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      const contentMatch = p.content.toLowerCase().includes(q);
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!contentMatch && !tagMatch) return false;
    }

    if (activeCategory !== 'All') {
      const catMatch = p.tags.some(
        (t) => t.toLowerCase() === activeCategory.toLowerCase()
      );
      if (!catMatch) return false;
    }

    return true;
  });

  const handleTrendClick = (tag: string) => {
    setSelectedTag(tag);
    setActiveTab('feed');
  };

  return (
    <div id="explore-view-container" className="min-h-screen">
      {/* Explore Sticky Search Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            id="input-explore-search"
            type="text"
            placeholder="Search keywords, #hashtags, or people..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-150 focus:bg-white border border-transparent focus:border-zinc-300 rounded-full focus:outline-hidden transition-all placeholder-zinc-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-0.5 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* If Search Query has matching people */}
      {matchingUsers.length > 0 && (
        <div className="border-b border-zinc-200/80 p-4 bg-zinc-50/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>People</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingUsers.map((user) => {
              const followed = isFollowing(user.id);
              const isSelf = user.id === currentUser.id;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 shadow-xs"
                >
                  <div
                    onClick={() => viewProfile(user.id)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-zinc-900 text-xs truncate hover:underline">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">@{user.handle}</p>
                    </div>
                  </div>

                  {!isSelf && (
                    <button
                      onClick={() => toggleFollow(user.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        followed
                          ? 'border border-zinc-300 text-zinc-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                          : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      {followed ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Topics Grid when no specific search is active */}
      {!localSearch.trim() && activeCategory === 'All' && (
        <div className="border-b border-zinc-200/80 p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Trending Topics
            </h3>
            <span className="text-[11px] text-zinc-400">Updated hourly</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {trending.map((trend) => (
              <button
                key={trend.id}
                onClick={() => handleTrendClick(trend.tag)}
                className="text-left p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/70 transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-zinc-400 font-medium block truncate">
                    {trend.category}
                  </span>
                  <span className="font-bold text-zinc-900 text-sm flex items-center gap-0.5 group-hover:text-indigo-600 transition-colors">
                    #{trend.tag}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 mt-2 block">
                  {(trend.postsCount / 1000).toFixed(1)}k posts
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explore Posts Grid / Stream */}
      <div>
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
            {localSearch.trim() ? `Search Results for "${localSearch}"` : `${activeCategory} Feed`}
          </span>
          <span className="text-xs text-zinc-400">{matchingPosts.length} posts</span>
        </div>

        {matchingPosts.length > 0 ? (
          matchingPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="p-12 text-center text-zinc-500">
            <p className="text-base font-semibold text-zinc-800 mb-1">No matching posts</p>
            <p className="text-xs text-zinc-400">
              Try searching for different keywords or explore other categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
