import React, { useState } from 'react';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  BadgeCheck,
  Edit3,
  UserPlus,
  UserCheck,
  MessageCircle,
  ArrowLeft,
  Cpu
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from './PostCard';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    users,
    selectedUserId,
    posts,
    toggleFollow,
    isFollowing,
    setIsEditProfileOpen,
    setActiveTab,
    setActiveConversationUserId,
    softwareInfo,
    setIsSoftwareUpdateOpen,
  } = useSocial();

  const [profileTab, setProfileTab] = useState<'posts' | 'media' | 'likes'>('posts');

  const targetUserId = selectedUserId || currentUser.id;
  const profileUser = users.find((u) => u.id === targetUserId) || currentUser;
  const isSelf = profileUser.id === currentUser.id;
  const followed = isFollowing(profileUser.id);

  // Filter posts based on profile tab
  const authoredPosts = posts.filter((p) => p.authorId === profileUser.id);
  const mediaPosts = authoredPosts.filter((p) => Boolean(p.mediaUrl));
  const likedPosts = posts.filter((p) => p.likedBy.includes(profileUser.id));

  const currentPosts =
    profileTab === 'posts' ? authoredPosts : profileTab === 'media' ? mediaPosts : likedPosts;

  const handleStartChat = () => {
    setActiveConversationUserId(profileUser.id);
    setActiveTab('messages');
  };

  return (
    <div id="profile-view-container" className="min-h-screen pb-12">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 py-2.5 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('feed')}
          className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-zinc-900 leading-tight flex items-center gap-1">
            {profileUser.name}
            {profileUser.verified && <BadgeCheck className="w-4 h-4 text-sky-500" />}
          </h2>
          <span className="text-[11px] text-zinc-400">{authoredPosts.length} posts</span>
        </div>
      </div>

      {/* Cover Banner */}
      <div className="h-36 sm:h-48 w-full bg-zinc-200 overflow-hidden relative">
        <img
          src={profileUser.banner}
          alt={`${profileUser.name} cover`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Details Container */}
      <div className="px-4 sm:px-6 relative border-b border-zinc-200/80 pb-5 bg-white">
        {/* Avatar & Action Button Row */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-3">
          <div className="relative">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white ring-1 ring-zinc-200 shadow-md bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {isSelf ? (
              <>
                <button
                  id="btn-open-software-update-profile"
                  onClick={() => setIsSoftwareUpdateOpen(true)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    softwareInfo.hasUpdate
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100 shadow-xs'
                      : 'border-zinc-300 hover:border-zinc-400 text-zinc-700 hover:bg-zinc-50'
                  }`}
                  title="Software Update & Version Info"
                >
                  <Cpu className={`w-3.5 h-3.5 ${softwareInfo.hasUpdate ? 'text-indigo-600' : 'text-zinc-500'}`} />
                  <span>Update</span>
                  {softwareInfo.hasUpdate && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </button>

                <button
                  id="btn-open-edit-profile"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-1.5 rounded-full border border-zinc-300 hover:border-zinc-400 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartChat}
                  className="p-2 rounded-full border border-zinc-300 hover:bg-zinc-50 text-zinc-700 transition-colors"
                  title="Direct Message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  id="btn-toggle-follow-profile"
                  onClick={() => toggleFollow(profileUser.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    followed
                      ? 'border border-zinc-300 text-zinc-700 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {followed ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Identity */}
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 flex items-center gap-1.5">
            {profileUser.name}
            {profileUser.verified && (
              <BadgeCheck className="w-5 h-5 text-sky-500 fill-sky-500/10" />
            )}
          </h1>
          <p className="text-xs text-zinc-500">@{profileUser.handle}</p>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-zinc-700 mt-3 leading-relaxed max-w-2xl">
          {profileUser.bio}
        </p>

        {/* Meta details */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-zinc-500">
          {profileUser.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              {profileUser.location}
            </span>
          )}
          {profileUser.website && (
            <a
              href={profileUser.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline font-medium"
            >
              <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
              {profileUser.website.replace('https://', '')}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            {profileUser.joinedDate}
          </span>
        </div>

        {/* Follow counts */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className="text-zinc-600">
            <strong className="text-zinc-900 font-bold">{profileUser.followingCount}</strong>{' '}
            Following
          </span>
          <span className="text-zinc-600">
            <strong className="text-zinc-900 font-bold">{profileUser.followersCount}</strong>{' '}
            Followers
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-zinc-200 bg-white">
        {(['posts', 'media', 'likes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setProfileTab(tab)}
            className={`flex-1 py-3 text-xs font-semibold capitalize relative transition-colors ${
              profileTab === tab ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            {tab}
            {profileTab === tab && (
              <span className="absolute bottom-0 inset-x-8 h-0.75 bg-zinc-900 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="divide-y divide-zinc-100">
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No {profileTab} yet for this profile.
          </div>
        )}
      </div>
    </div>
  );
};
