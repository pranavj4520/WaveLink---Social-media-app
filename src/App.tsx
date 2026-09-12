import React from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { MobileNavbar } from './components/MobileNavbar';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { NotificationsView } from './components/NotificationsView';
import { MessagesView } from './components/MessagesView';
import { BookmarksView } from './components/BookmarksView';
import { ProfileView } from './components/ProfileView';
import { AIChatView } from './components/AIChatView';
import { TranscribeView } from './components/TranscribeView';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { EditProfileModal } from './components/EditProfileModal';
import { SoftwareUpdateModal } from './components/SoftwareUpdateModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useSocial();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedView />;
      case 'explore':
        return <ExploreView />;
      case 'ai-chat':
        return <AIChatView />;
      case 'transcribe':
        return <TranscribeView />;
      case 'notifications':
        return <NotificationsView />;
      case 'messages':
        return <MessagesView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <FeedView />;
    }
  };

  const isWideTab = activeTab === 'messages' || activeTab === 'ai-chat';

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex justify-center selection:bg-indigo-500 selection:text-white font-sans">
      {/* Container wrapper constrained to max width */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row min-h-screen">
        {/* Mobile Header & Bottom Navigation */}
        <MobileNavbar />

        {/* Left Desktop Sidebar */}
        <Sidebar />

        {/* Main Central Stream Column */}
        <main
          id="main-content-column"
          className={`flex-1 min-w-0 bg-white border-r border-zinc-200/80 pb-16 md:pb-0 ${
            isWideTab ? 'max-w-none' : 'max-w-2xl xl:max-w-[640px]'
          }`}
        >
          {renderActiveView()}
        </main>

        {/* Right Desktop Discovery Sidebar (hidden in wide views like messages or chat for focus) */}
        {!isWideTab && <RightSidebar />}
      </div>

      {/* Story, Profile, Live Voice & Software Update Modals */}
      <StoryViewerModal />
      <CreateStoryModal />
      <EditProfileModal />
      <LiveVoiceModal />
      <SoftwareUpdateModal />
    </div>
  );
};

export default function App() {
  return (
    <SocialProvider>
      <MainLayout />
    </SocialProvider>
  );
}
