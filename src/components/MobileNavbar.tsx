import React from 'react';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  User as UserIcon,
  PlusCircle,
  Share2,
  Waves,
  Bot,
  Mic,
  Radio,
  Cpu
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { ActiveTab } from '../types';

export const MobileNavbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    viewProfile,
    unreadNotificationsCount,
    unreadMessagesCount,
    setIsCreateStoryOpen,
    setIsLiveVoiceOpen,
    softwareInfo,
    setIsSoftwareUpdateOpen,
  } = useSocial();

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 h-13 flex items-center justify-between">
        <button
          onClick={() => viewProfile(currentUser.id)}
          className="flex items-center gap-2"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200"
          />
        </button>

        <div
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <Waves className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="font-extrabold text-sm text-zinc-900">Wavelink</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSoftwareUpdateOpen(true)}
            className={`p-1.5 rounded-full border transition-colors relative flex items-center justify-center ${
              softwareInfo.hasUpdate
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
            }`}
            title="Software Update"
          >
            <Cpu className="w-3.5 h-3.5" />
            {softwareInfo.hasUpdate && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-600 ring-1 ring-white" />
            )}
          </button>

          <button
            onClick={() => setIsLiveVoiceOpen(true)}
            className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/60 hover:bg-indigo-100 flex items-center gap-1 text-xs font-semibold"
            title="Start Live Voice chat (gemini-3.1-flash-live-preview)"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="text-[11px]">Live</span>
          </button>

          <button
            onClick={() => setIsCreateStoryOpen(true)}
            className="text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-full flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Story</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 h-14 flex items-center justify-around px-2"
      >
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            activeTab === 'feed' ? 'text-zinc-900' : 'text-zinc-400'
          }`}
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            activeTab === 'explore' ? 'text-zinc-900' : 'text-zinc-400'
          }`}
          title="Explore"
        >
          <Compass className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('ai-chat')}
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            activeTab === 'ai-chat' ? 'text-indigo-600' : 'text-zinc-400'
          }`}
          title="Wavelink AI"
        >
          <Bot className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('transcribe')}
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            activeTab === 'transcribe' ? 'text-rose-600' : 'text-zinc-400'
          }`}
          title="Audio Transcribe"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            activeTab === 'messages' ? 'text-zinc-900' : 'text-zinc-400'
          }`}
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          )}
        </button>

        <button
          onClick={() => viewProfile(currentUser.id)}
          className={`flex flex-col items-center justify-center flex-1 h-full relative ${
            activeTab === 'profile' ? 'text-zinc-900' : 'text-zinc-400'
          }`}
          title="Profile"
        >
          <UserIcon className="w-5 h-5" />
        </button>
      </nav>
    </>
  );
};
