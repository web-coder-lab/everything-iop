// Core domain types for Everything

export type UserRole = 'user' | 'moderator' | 'admin' | 'owner';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  communitiesCount: number;
  postsCount: number;
  isVerified?: boolean;
  role: UserRole;
  isOnline?: boolean;
  lastSeen?: string;
  isMuted?: boolean;
  isBlocked?: boolean;
  isFollowing?: boolean;
  joinedAt?: string;
  createdAt?: string;
}

export interface Session {
  id?: string;
  sessionId?: string;
  device: string;
  browser?: string;
  lastActive: string;
  location: string;
  isCurrent: boolean;
  ip?: string;
  ipAddress?: string;
}

export type AudienceType = 'public' | 'followers' | 'community';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  userVote?: string;
  totalVotes: number;
  endsAt?: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  mediaUrls?: string[];
  videoUrl?: string;
  poll?: Poll;
  linkPreview?: LinkPreview;
  audience: AudienceType;
  communityId?: string;
  communityName?: string;
  createdAt: string;
  reactionsCount: Record<string, number>;
  userReaction?: string;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  isSaved?: boolean;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  reactionsCount: Record<string, number>;
  userReaction?: string;
  replies?: Comment[];
  parentId?: string;
  coinAmount?: number;
  isPinned?: boolean;
  pinReason?: 'coin-support';
  isReadByOwner?: boolean;
}

export type CommunityPrivacy = 'public' | 'private' | 'invite-only';

export interface Channel {
  id: string;
  communityId: string;
  name: string;
  description: string;
  unreadCount?: number;
  lastActivity?: string;
  isPinned?: boolean;
  category?: string;
  type?: 'text' | 'announcement' | 'question' | 'topic';
  permissions?: 'everyone' | 'admin_only' | 'read_only';
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  coverUrl: string;
  iconUrl: string;
  membersCount: number;
  privacy: CommunityPrivacy;
  isJoined?: boolean;
  isPending?: boolean;
  userRole?: 'member' | 'moderator' | 'admin' | 'owner';
  channelsCount: number;
  rules: string[];
  createdAt: string;
  location?: string;
  ownerId?: string;
  isVerified?: boolean;
  onlineCount?: number;
  channels?: Channel[];
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  channelId?: string;
  sender: User;
  text?: string;
  content?: string;
  type?: string;
  mediaUrls?: string[];
  audioUrl?: string;
  status: MessageStatus;
  createdAt: string;
  isEdited?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text?: string;
    content?: string;
  };
  reactions?: MessageReaction[];
}

export interface Conversation {
  id: string;
  type?: 'direct' | 'group';
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  name?: string;
  iconUrl?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isMuted?: boolean;
  updatedAt: string;
  isPinned?: boolean;
}

export type NotificationCategory =
  | 'messages'
  | 'mentions'
  | 'comments'
  | 'replies'
  | 'reactions'
  | 'follows'
  | 'community'
  | 'invites'
  | 'events'
  | 'security'
  | 'moderation'
  | 'system';

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  body?: string;
  message?: string;
  time: string;
  isRead: boolean;
  targetUrl: string;
  actor?: User;
  metadata?: Record<string, any>;
}

export interface Story {
  id: string;
  user: User;
  mediaUrl: string;
  type: 'image' | 'video';
  text?: string;
  createdAt: string;
  privacy: 'everyone' | 'followers' | 'close_friends';
  isViewed?: boolean;
}

export interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  isJoined?: boolean;
}

export type ReportReason =
  | 'Spam'
  | 'Scam'
  | 'Harassment'
  | 'Impersonation'
  | 'Violence'
  | 'Hate'
  | 'Inappropriate content'
  | 'Other';

export interface Report {
  id: string;
  targetType: 'post' | 'comment' | 'message' | 'user' | 'community';
  targetId: string;
  targetPreview?: string;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reporterId: string;
}

export interface SecurityEvent {
  id: string;
  title: string;
  timestamp: string;
  ip: string;
  device: string;
  status: 'success' | 'warning' | 'critical';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination?: {
    nextCursor?: string;
    hasMore: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    requestId: string;
  };
}
