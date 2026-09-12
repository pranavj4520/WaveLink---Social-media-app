export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  bio: string;
  location?: string;
  website?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  verified?: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image';
  tags: string[];
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  repostsCount: number;
  repostedBy: string[];
  bookmarksCount: number;
  bookmarkedBy: string[];
  comments: Comment[];
  audience: 'public' | 'followers';
}

export interface Story {
  id: string;
  authorId: string;
  mediaUrl: string;
  textOverlay?: string;
  createdAt: string;
  viewedBy: string[];
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'repost' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  actorId: string;
  recipientId: string;
  postId?: string;
  contentSnippet?: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: Message;
  unreadCount: number;
}

export interface TrendingTopic {
  id: string;
  tag: string;
  category: string;
  postsCount: number;
}

export type ActiveTab = 'feed' | 'explore' | 'notifications' | 'messages' | 'bookmarks' | 'profile' | 'ai-chat' | 'transcribe';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  rolePreset?: string;
}

export interface AIRolePreset {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  systemInstruction: string;
  suggestedPrompts: string[];
}

export interface ReleaseChangelog {
  version: string;
  title: string;
  date: string;
  size?: string;
  highlights: string[];
}

export interface SoftwareUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  channel: 'stable' | 'beta';
  build: string;
  lastChecked: string;
  autoUpdate: boolean;
  hasUpdate: boolean;
  changelog: ReleaseChangelog[];
}
