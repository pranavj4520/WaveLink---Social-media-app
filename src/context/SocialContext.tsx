import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, Story, Notification, Message, TrendingTopic, ActiveTab, SoftwareUpdateInfo, ReleaseChangelog } from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
  INITIAL_TRENDING,
} from '../data/initialData';

interface SocialContextType {
  currentUser: User;
  users: User[];
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  messages: Message[];
  trending: TrendingTopic[];
  activeTab: ActiveTab;
  selectedUserId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  feedFilter: 'for-you' | 'following' | 'media';
  viewingStory: Story | null;
  isCreateStoryOpen: boolean;
  isEditProfileOpen: boolean;
  isLiveVoiceOpen: boolean;
  isSoftwareUpdateOpen: boolean;
  softwareInfo: SoftwareUpdateInfo;
  updateStatus: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'up-to-date' | 'error';
  updateProgress: number;
  transcribedDraft: string;
  activeConversationUserId: string | null;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  setActiveTab: (tab: ActiveTab) => void;
  viewProfile: (userId: string) => void;
  switchCurrentUser: (userId: string) => void;
  updateCurrentUser: (updated: Partial<User>) => void;
  addPost: (content: string, mediaUrl?: string, tags?: string[], audience?: 'public' | 'followers') => void;
  deletePost: (postId: string) => void;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  toggleFollow: (targetUserId: string) => void;
  isFollowing: (targetUserId: string) => boolean;
  addStory: (mediaUrl: string, textOverlay?: string) => void;
  markStoryViewed: (storyId: string) => void;
  setViewingStory: (story: Story | null) => void;
  setIsCreateStoryOpen: (open: boolean) => void;
  setIsEditProfileOpen: (open: boolean) => void;
  setIsLiveVoiceOpen: (open: boolean) => void;
  setIsSoftwareUpdateOpen: (open: boolean) => void;
  checkForUpdates: () => Promise<void>;
  applySoftwareUpdate: () => Promise<void>;
  toggleAutoUpdate: (enabled: boolean) => void;
  setUpdateChannel: (channel: 'stable' | 'beta') => void;
  rollbackSoftwareVersion: (targetVer: string) => void;
  setTranscribedDraft: (text: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedTag: (tag: string | null) => void;
  setFeedFilter: (filter: 'for-you' | 'following' | 'media') => void;
  sendMessage: (recipientId: string, text: string) => void;
  setActiveConversationUserId: (userId: string | null) => void;
  markNotificationsRead: () => void;
  resetToDefaults: () => void;
}

const SocialContext = createContext<SocialContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'sn_users_v1',
  CURRENT_USER_ID: 'sn_curr_user_id_v1',
  POSTS: 'sn_posts_v1',
  STORIES: 'sn_stories_v1',
  NOTIFICATIONS: 'sn_notifs_v1',
  MESSAGES: 'sn_messages_v1',
  FOLLOWING: 'sn_following_map_v1',
  SOFTWARE_VERSION: 'sn_software_version_v2',
  SOFTWARE_CHANNEL: 'sn_software_channel_v2',
  SOFTWARE_AUTO_UPDATE: 'sn_software_auto_update_v2',
};

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'user_alex';
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [followingMap, setFollowingMap] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLLOWING);
    if (saved) return JSON.parse(saved);
    return {
      user_alex: ['user_maya', 'user_marcus'],
      user_maya: ['user_alex'],
      user_marcus: ['user_alex', 'user_samira'],
      user_elena: ['user_alex'],
      user_samira: ['user_alex', 'user_maya'],
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'for-you' | 'following' | 'media'>('for-you');
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);
  const [isSoftwareUpdateOpen, setIsSoftwareUpdateOpen] = useState<boolean>(false);
  const [transcribedDraft, setTranscribedDraft] = useState<string>('');
  const [activeConversationUserId, setActiveConversationUserId] = useState<string | null>('user_maya');

  const [currentVersion, setCurrentVersion] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SOFTWARE_VERSION) || '2.4.2';
  });
  const [channel, setChannel] = useState<'stable' | 'beta'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.SOFTWARE_CHANNEL) as 'stable' | 'beta') || 'stable';
  });
  const [autoUpdate, setAutoUpdate] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOFTWARE_AUTO_UPDATE);
    return saved !== null ? saved === 'true' : true;
  });
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'up-to-date' | 'error'>('idle');
  const [updateProgress, setUpdateProgress] = useState<number>(0);

  const [softwareInfo, setSoftwareInfo] = useState<SoftwareUpdateInfo>({
    currentVersion,
    latestVersion: '2.5.0',
    channel,
    build: 'build-2026.09.12-prod-e4f8a1',
    lastChecked: 'Today at 2:28 AM',
    autoUpdate,
    hasUpdate: currentVersion !== '2.5.0',
    changelog: [
      {
        version: '2.5.0',
        title: 'Multimodal Gemini & Live Audio Architecture',
        date: 'September 2026',
        size: '4.8 MB',
        highlights: [
          'Gemini 3.1 Flash Live preview integration with low-latency bidirectional WebSocket voice streaming',
          'Gemini 3.5 Transcribe engine for voice memos and real-time speech dictation in posts and DMs',
          'Multi-turn Gemini chatbot with customizable role personas and prompt templates',
          'Refined responsive design, high-contrast typography, and enhanced dark mode accents',
          'Automated software update verification and channel management system'
        ],
      },
      {
        version: '2.4.2',
        title: 'Ephemeral Stories & Media Feed Optimization',
        date: 'August 2026',
        size: '3.2 MB',
        highlights: [
          '24-hour disappearing stories with visual progress indicator and audio waveforms',
          'Personal profile customizer with banner and avatar management',
          'Instant search across hashtags, users, and post content'
        ],
      },
      {
        version: '2.3.0',
        title: 'Direct Messaging & Community Hub',
        date: 'July 2026',
        size: '2.9 MB',
        highlights: [
          'Multi-user simulated conversation threads with unread indicators',
          'Hashtag exploration dashboard and trending analytics'
        ],
      }
    ]
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(followingMap));
  }, [followingMap]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const viewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
    // If we're on our own profile tab, view the new user
    if (activeTab === 'profile' && selectedUserId === currentUserId) {
      setSelectedUserId(userId);
    }
  };

  const updateCurrentUser = (updated: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...updated } : u))
    );
  };

  const isFollowing = (targetUserId: string) => {
    const list = followingMap[currentUserId] || [];
    return list.includes(targetUserId);
  };

  const toggleFollow = (targetUserId: string) => {
    if (targetUserId === currentUserId) return;
    const currentlyFollowing = isFollowing(targetUserId);

    setFollowingMap((prev) => {
      const currentList = prev[currentUserId] || [];
      const updatedList = currentlyFollowing
        ? currentList.filter((id) => id !== targetUserId)
        : [...currentList, targetUserId];
      return { ...prev, [currentUserId]: updatedList };
    });

    // Update counts
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUserId) {
          return {
            ...u,
            followingCount: Math.max(0, u.followingCount + (currentlyFollowing ? -1 : 1)),
          };
        }
        if (u.id === targetUserId) {
          return {
            ...u,
            followersCount: Math.max(0, u.followersCount + (currentlyFollowing ? -1 : 1)),
          };
        }
        return u;
      })
    );

    // Add notification if following
    if (!currentlyFollowing) {
      const newNotif: Notification = {
        id: `notif_${Date.now()}`,
        type: 'follow',
        actorId: currentUserId,
        recipientId: targetUserId,
        contentSnippet: 'started following you',
        read: false,
        createdAt: 'Just now',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const addPost = (
    content: string,
    mediaUrl?: string,
    tags: string[] = [],
    audience: 'public' | 'followers' = 'public'
  ) => {
    const extractedTags = content.match(/#(\w+)/g)?.map((t) => t.slice(1)) || [];
    const combinedTags = Array.from(new Set([...tags, ...extractedTags]));

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUserId,
      content,
      mediaUrl: mediaUrl?.trim() ? mediaUrl.trim() : undefined,
      mediaType: mediaUrl?.trim() ? 'image' : undefined,
      tags: combinedTags,
      createdAt: 'Just now',
      likesCount: 0,
      likedBy: [],
      repostsCount: 0,
      repostedBy: [],
      bookmarksCount: 0,
      bookmarkedBy: [],
      comments: [],
      audience,
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const alreadyLiked = p.likedBy.includes(currentUserId);
        const likedBy = alreadyLiked
          ? p.likedBy.filter((id) => id !== currentUserId)
          : [...p.likedBy, currentUserId];

        // If newly liked and not authored by currentUser, generate notification
        if (!alreadyLiked && p.authorId !== currentUserId) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            type: 'like',
            actorId: currentUserId,
            recipientId: p.authorId,
            postId: p.id,
            contentSnippet: `liked your post "${p.content.slice(0, 40)}..."`,
            read: false,
            createdAt: 'Just now',
          };
          setNotifications((nPrev) => [newNotif, ...nPrev]);
        }

        return {
          ...p,
          likedBy,
          likesCount: likedBy.length,
        };
      })
    );
  };

  const toggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const alreadyBookmarked = p.bookmarkedBy.includes(currentUserId);
        const bookmarkedBy = alreadyBookmarked
          ? p.bookmarkedBy.filter((id) => id !== currentUserId)
          : [...p.bookmarkedBy, currentUserId];
        return {
          ...p,
          bookmarkedBy,
          bookmarksCount: bookmarkedBy.length,
        };
      })
    );
  };

  const toggleRepost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const alreadyReposted = p.repostedBy.includes(currentUserId);
        const repostedBy = alreadyReposted
          ? p.repostedBy.filter((id) => id !== currentUserId)
          : [...p.repostedBy, currentUserId];

        if (!alreadyReposted && p.authorId !== currentUserId) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            type: 'repost',
            actorId: currentUserId,
            recipientId: p.authorId,
            postId: p.id,
            contentSnippet: `reposted your post`,
            read: false,
            createdAt: 'Just now',
          };
          setNotifications((nPrev) => [newNotif, ...nPrev]);
        }

        return {
          ...p,
          repostedBy,
          repostsCount: repostedBy.length,
        };
      })
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const newComment = {
      id: `c_${Date.now()}`,
      authorId: currentUserId,
      content: content.trim(),
      createdAt: 'Just now',
      likesCount: 0,
      likedBy: [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (p.authorId !== currentUserId) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            type: 'comment',
            actorId: currentUserId,
            recipientId: p.authorId,
            postId: p.id,
            contentSnippet: `commented: "${content.slice(0, 36)}..."`,
            read: false,
            createdAt: 'Just now',
          };
          setNotifications((nPrev) => [newNotif, ...nPrev]);
        }
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      })
    );
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map((c) => {
            if (c.id !== commentId) return c;
            const alreadyLiked = c.likedBy.includes(currentUserId);
            const likedBy = alreadyLiked
              ? c.likedBy.filter((id) => id !== currentUserId)
              : [...c.likedBy, currentUserId];
            return {
              ...c,
              likedBy,
              likesCount: likedBy.length,
            };
          }),
        };
      })
    );
  };

  const addStory = (mediaUrl: string, textOverlay?: string) => {
    const newStory: Story = {
      id: `story_${Date.now()}`,
      authorId: currentUserId,
      mediaUrl,
      textOverlay,
      createdAt: 'Just now',
      viewedBy: [currentUserId],
    };
    setStories((prev) => [newStory, ...prev]);
  };

  const markStoryViewed = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId) return s;
        if (!s.viewedBy.includes(currentUserId)) {
          return { ...s, viewedBy: [...s.viewedBy, currentUserId] };
        }
        return s;
      })
    );
  };

  const sendMessage = (recipientId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      recipientId,
      text: text.trim(),
      createdAt: 'Just now',
      read: true,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const markNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipientId === currentUserId ? { ...n, read: true } : n))
    );
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.STORIES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.FOLLOWING);
    setUsers(INITIAL_USERS);
    setCurrentUserId('user_alex');
    setPosts(INITIAL_POSTS);
    setStories(INITIAL_STORIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setMessages(INITIAL_MESSAGES);
    setFollowingMap({
      user_alex: ['user_maya', 'user_marcus'],
      user_maya: ['user_alex'],
      user_marcus: ['user_alex', 'user_samira'],
      user_elena: ['user_alex'],
      user_samira: ['user_alex', 'user_maya'],
    });
    setActiveTab('feed');
    setSelectedTag(null);
    setSearchQuery('');
  };

  const checkForUpdates = async () => {
    setUpdateStatus('checking');
    try {
      const res = await fetch(`/api/system/version?channel=${channel}`);
      if (res.ok) {
        const data = await res.json();
        const hasNew = data.latestVersion !== currentVersion;
        setSoftwareInfo((prev) => ({
          ...prev,
          latestVersion: data.latestVersion,
          build: data.build,
          channel: data.channel,
          lastChecked: 'Just now',
          hasUpdate: hasNew,
          changelog: data.changelog || prev.changelog,
        }));
        setUpdateStatus(hasNew ? 'available' : 'up-to-date');
      } else {
        const hasNew = softwareInfo.latestVersion !== currentVersion;
        setUpdateStatus(hasNew ? 'available' : 'up-to-date');
      }
    } catch {
      const hasNew = softwareInfo.latestVersion !== currentVersion;
      setUpdateStatus(hasNew ? 'available' : 'up-to-date');
    }
  };

  const applySoftwareUpdate = async () => {
    setUpdateStatus('downloading');
    setUpdateProgress(20);
    await new Promise((r) => setTimeout(r, 450));
    setUpdateProgress(55);
    await new Promise((r) => setTimeout(r, 450));
    setUpdateProgress(85);
    await new Promise((r) => setTimeout(r, 400));
    setUpdateProgress(100);
    await new Promise((r) => setTimeout(r, 350));

    const newVer = softwareInfo.latestVersion;
    setCurrentVersion(newVer);
    localStorage.setItem(STORAGE_KEYS.SOFTWARE_VERSION, newVer);
    setSoftwareInfo((prev) => ({
      ...prev,
      currentVersion: newVer,
      hasUpdate: false,
    }));
    setUpdateStatus('up-to-date');
    setUpdateProgress(0);

    const updateNotif: Notification = {
      id: `notif_update_${Date.now()}`,
      recipientId: currentUserId,
      actorId: 'user_alex',
      type: 'system',
      read: false,
      createdAt: 'Just now',
      contentSnippet: `Wavelink updated to v${newVer}! Audio studio & Live Voice AI are ready.`,
    };
    setNotifications((prev) => [updateNotif, ...prev]);
  };

  const toggleAutoUpdate = (enabled: boolean) => {
    setAutoUpdate(enabled);
    localStorage.setItem(STORAGE_KEYS.SOFTWARE_AUTO_UPDATE, String(enabled));
    setSoftwareInfo((prev) => ({ ...prev, autoUpdate: enabled }));
  };

  const setUpdateChannel = async (newChannel: 'stable' | 'beta') => {
    setChannel(newChannel);
    localStorage.setItem(STORAGE_KEYS.SOFTWARE_CHANNEL, newChannel);
    setSoftwareInfo((prev) => ({ ...prev, channel: newChannel }));
    setUpdateStatus('checking');
    try {
      const res = await fetch(`/api/system/version?channel=${newChannel}`);
      if (res.ok) {
        const data = await res.json();
        const hasNew = data.latestVersion !== currentVersion;
        setSoftwareInfo((prev) => ({
          ...prev,
          channel: newChannel,
          latestVersion: data.latestVersion,
          build: data.build,
          hasUpdate: hasNew,
          changelog: data.changelog || prev.changelog,
          lastChecked: 'Just now',
        }));
        setUpdateStatus(hasNew ? 'available' : 'up-to-date');
      }
    } catch {
      setUpdateStatus('idle');
    }
  };

  const rollbackSoftwareVersion = (targetVer: string) => {
    setCurrentVersion(targetVer);
    localStorage.setItem(STORAGE_KEYS.SOFTWARE_VERSION, targetVer);
    setSoftwareInfo((prev) => ({
      ...prev,
      currentVersion: targetVer,
      hasUpdate: prev.latestVersion !== targetVer,
    }));
    setUpdateStatus('available');
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => n.recipientId === currentUserId && !n.read
  ).length;

  const unreadMessagesCount = messages.filter(
    (m) => m.recipientId === currentUserId && !m.read
  ).length;

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        users,
        posts,
        stories,
        notifications,
        messages,
        trending: INITIAL_TRENDING,
        activeTab,
        selectedUserId,
        searchQuery,
        selectedTag,
        feedFilter,
        viewingStory,
        isCreateStoryOpen,
        isEditProfileOpen,
        isLiveVoiceOpen,
        setIsLiveVoiceOpen,
        isSoftwareUpdateOpen,
        setIsSoftwareUpdateOpen,
        softwareInfo,
        updateStatus,
        updateProgress,
        checkForUpdates,
        applySoftwareUpdate,
        toggleAutoUpdate,
        setUpdateChannel,
        rollbackSoftwareVersion,
        transcribedDraft,
        setTranscribedDraft,
        setSearchQuery,
        setSelectedTag,
        setFeedFilter,
        sendMessage,
        activeConversationUserId,
        setActiveConversationUserId,
        unreadNotificationsCount,
        unreadMessagesCount,
        setActiveTab,
        viewProfile,
        switchCurrentUser,
        updateCurrentUser,
        addPost,
        deletePost,
        toggleLike,
        toggleBookmark,
        toggleRepost,
        addComment,
        toggleCommentLike,
        toggleFollow,
        isFollowing,
        addStory,
        markStoryViewed,
        setViewingStory,
        setIsCreateStoryOpen,
        setIsEditProfileOpen,
        markNotificationsRead,
        resetToDefaults,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used within SocialProvider');
  return ctx;
};
