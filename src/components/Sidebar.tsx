import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  User as UserIcon,
  Feather,
  Check,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Share2,
  Waves,
  Bot,
  Mic,
  Radio,
  Cpu
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    users,
    switchCurrentUser,
    viewProfile,
    unreadNotificationsCount,
    unreadMessagesCount,
    resetToDefaults,
    setIsLiveVoiceOpen,
    softwareInfo,
    setIsSoftwareUpdateOpen,
  } = useSocial();

  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSwitchMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { tab: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; tag?: string }[] = [
    { tab: 'feed', label: 'Home', icon: Home },
    { tab: 'explore', label: 'Explore', icon: Compass },
    { tab: 'ai-chat', label: 'Wavelink AI', icon: Bot, tag: 'Gemini' },
    { tab: 'transcribe', label: 'Transcribe', icon: Mic, tag: 'Audio' },
    {
      tab: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount,
    },
    {
      tab: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    { tab: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { tab: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    if (tab === 'profile') {
      viewProfile(currentUser.id);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col justify-between w-64 xl:w-72 h-screen sticky top-0 p-4 lg:p-5 border-r border-zinc-200/80 bg-white select-none flex-shrink-0"
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div
          id="brand-logo-container"
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-3 px-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Waves className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="font-extrabold text-base text-zinc-900 tracking-tight block">
              Wavelink
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">Connect & Share</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.tab}
                id={`nav-item-${item.tab}`}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full tabular-nums ${
                      isActive ? 'bg-white text-zinc-900' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : item.tag ? (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      isActive
                        ? 'bg-zinc-800 text-indigo-300'
                        : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
                    }`}
                  >
                    {item.tag}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Live Voice API Button */}
        <div className="pt-1">
          <button
            id="btn-sidebar-live-voice"
            onClick={() => setIsLiveVoiceOpen(true)}
            className="w-full py-2.5 px-3.5 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 to-violet-50/70 hover:from-indigo-100/80 hover:to-violet-100/80 text-indigo-950 font-bold text-xs shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Live Voice</div>
                <div className="text-[10px] text-indigo-600 font-normal">Real-time Gemini</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800">
              Live
            </span>
          </button>
        </div>

        {/* Primary New Post Button */}
        <div className="pt-1">
          <button
            id="btn-sidebar-new-post"
            onClick={() => {
              setActiveTab('feed');
              const textarea = document.getElementById('input-create-post-content');
              if (textarea) {
                textarea.focus();
                textarea.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Feather className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Account Switcher Footer */}
      <div className="relative pt-4 border-t border-zinc-100" ref={menuRef}>
        {showSwitchMenu && (
          <div
            id="account-switch-dropdown"
            className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-zinc-200 shadow-xl p-2 z-50 animate-fade-in"
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Switch Demo Profile
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchCurrentUser(u.id);
                      setShowSwitchMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                      isCurrent ? 'bg-zinc-100' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-zinc-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">@{u.handle}</p>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-zinc-900 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="pt-2 mt-1 border-t border-zinc-100 space-y-1">
              <button
                id="btn-dropdown-software-update"
                onClick={() => {
                  setIsSoftwareUpdateOpen(true);
                  setShowSwitchMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-700 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold">Software Update</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400">v{softwareInfo.currentVersion}</span>
                  {softwareInfo.hasUpdate && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset sample posts and accounts to original data?')) {
                    resetToDefaults();
                    setShowSwitchMenu(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Sample Data
              </button>
            </div>
          </div>
        )}

        {/* Compact Software Update Option Pill */}
        <div className="mb-2">
          <button
            id="btn-sidebar-software-update"
            onClick={() => setIsSoftwareUpdateOpen(true)}
            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all border ${
              softwareInfo.hasUpdate
                ? 'bg-gradient-to-r from-indigo-50 via-white to-violet-50 text-indigo-950 border-indigo-200/90 hover:border-indigo-300 shadow-xs'
                : 'bg-zinc-50/90 text-zinc-600 border-zinc-200/70 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Software updates & system releases"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Cpu className={`w-3.5 h-3.5 flex-shrink-0 ${softwareInfo.hasUpdate ? 'text-indigo-600' : 'text-zinc-400'}`} />
              <div className="truncate text-left">
                <span className="font-bold block leading-tight text-[11px]">
                  {softwareInfo.hasUpdate ? 'Update Available' : 'Wavelink System'}
                </span>
                <span className="text-[10px] text-zinc-400 block leading-tight">
                  {softwareInfo.hasUpdate ? `v${softwareInfo.latestVersion} ready` : `v${softwareInfo.currentVersion} • Up to date`}
                </span>
              </div>
            </div>

            {softwareInfo.hasUpdate ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                Update
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-200/60 px-1.5 py-0.5 rounded">
                v{softwareInfo.currentVersion}
              </span>
            )}
          </button>
        </div>

        {/* User Card Trigger */}
        <button
          id="btn-toggle-account-switcher"
          onClick={() => setShowSwitchMenu(!showSwitchMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 transition-colors text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-200"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-zinc-900 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-zinc-400 truncate leading-tight">
                @{currentUser.handle}
              </p>
            </div>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-transform ${
              showSwitchMenu ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
