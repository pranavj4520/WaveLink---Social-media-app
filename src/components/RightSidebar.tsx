import React, { useState } from 'react';
import { Search, TrendingUp, UserPlus, UserCheck, Sparkles, Bot, Mic, Radio } from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export const RightSidebar: React.FC = () => {
  const {
    users,
    currentUser,
    trending,
    setSelectedTag,
    setActiveTab,
    viewProfile,
    toggleFollow,
    isFollowing,
    setIsLiveVoiceOpen,
    softwareInfo,
    setIsSoftwareUpdateOpen,
  } = useSocial();

  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSelectedTag(searchInput.trim().replace(/^#/, ''));
    setActiveTab('feed');
  };

  // Recommended users: other users whom currentUser does not yet follow
  const recommendedUsers = users
    .filter((u) => u.id !== currentUser.id)
    .slice(0, 3);

  return (
    <aside
      id="desktop-right-sidebar"
      className="hidden lg:block w-72 xl:w-80 h-screen sticky top-0 p-4 lg:p-5 overflow-y-auto space-y-5 border-l border-zinc-200/80 bg-white flex-shrink-0"
    >
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
        <input
          id="input-right-search"
          type="text"
          placeholder="Search #topics or tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-100 hover:bg-zinc-150 focus:bg-white border border-transparent focus:border-zinc-300 rounded-full focus:outline-hidden transition-all placeholder-zinc-400"
        />
      </form>

      {/* Who to Follow Card */}
      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-xs tracking-tight">Who to Follow</h3>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-[11px] font-semibold text-indigo-600 hover:underline"
          >
            Show more
          </button>
        </div>

        <div className="space-y-3">
          {recommendedUsers.map((user) => {
            const followed = isFollowing(user.id);
            return (
              <div key={user.id} className="flex items-center justify-between gap-2">
                <div
                  onClick={() => viewProfile(user.id)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-bold text-xs text-zinc-900 truncate group-hover:underline">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">@{user.handle}</p>
                  </div>
                </div>

                <button
                  id={`btn-follow-recommendation-${user.id}`}
                  onClick={() => toggleFollow(user.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 transition-all ${
                    followed
                      ? 'border border-zinc-300 text-zinc-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {followed ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wavelink AI Studio Hub Card */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 rounded-2xl p-4 border border-indigo-200/70 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-xs tracking-tight">Wavelink AI Studio</h3>
            <p className="text-[10px] text-zinc-500">Gemini-powered intelligence</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => setActiveTab('ai-chat')}
            className="w-full p-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="text-xs font-bold text-zinc-900 leading-none">Gemini Chatbot</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Multi-turn creator coach</div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
              3.5 Flash
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transcribe')}
            className="w-full p-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-500" />
              <div>
                <div className="text-xs font-bold text-zinc-900 leading-none">Voice Transcribe</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Audio memo to post</div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">
              3.5 Transcribe
            </span>
          </button>

          <button
            onClick={() => setIsLiveVoiceOpen(true)}
            className="w-full p-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <div>
                <div className="text-xs font-bold text-zinc-900 leading-none">Live Voice Call</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Real-time conversation</div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              Live API
            </span>
          </button>
        </div>
      </div>

      {/* Trending Hashtags Card */}
      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 text-xs tracking-tight flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            Trends for You
          </h3>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-[11px] font-semibold text-indigo-600 hover:underline"
          >
            Explore
          </button>
        </div>

        <div className="space-y-2.5">
          {trending.slice(0, 5).map((trend) => (
            <button
              key={trend.id}
              onClick={() => {
                setSelectedTag(trend.tag);
                setActiveTab('feed');
              }}
              className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-100 transition-colors group flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] text-zinc-400 font-medium block">
                  {trend.category}
                </span>
                <span className="font-bold text-xs text-zinc-800 group-hover:text-indigo-600 transition-colors">
                  #{trend.tag}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                {(trend.postsCount / 1000).toFixed(1)}k
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Micro Footer */}
      <div className="px-2 text-[11px] text-zinc-400 space-y-1">
        <div className="flex items-center justify-between">
          <p>© 2026 Wavelink • Privacy • Terms</p>
          <button
            onClick={() => setIsSoftwareUpdateOpen(true)}
            className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-mono text-[10px] text-zinc-400 hover:underline"
            title="Software update & system version"
          >
            <span>v{softwareInfo.currentVersion}</span>
            {softwareInfo.hasUpdate && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
