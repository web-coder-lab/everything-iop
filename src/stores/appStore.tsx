// Main Application Global State Store
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api/client';
import { API_ENABLED } from '../config/constants';
import { AuthApi } from '../lib/api/authApi';
import { PostApi } from '../lib/api/postApi';
import { CommunityApi } from '../lib/api/communityApi';
import { ChatApi } from '../lib/api/chatApi';
import { NotificationApi } from '../lib/api/notificationApi';
import { socketClient } from '../lib/websocket/socketClient';
import { PushManager } from '../lib/notifications/pushManager';
import type { User, Post, Community, Conversation, Notification, Story } from '../types';

export type ServerHealthState = 'checking' | 'waking' | 'ok' | 'failed';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Server Health & Startup
  serverStatus: ServerHealthState;
  serverMessage: string;
  checkServerHealth: () => Promise<void>;
  
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  register: (f: string, u: string, ep: string, p: string, bio?: string, avatarUrl?: string, avatarFile?: File | null) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => void;

  // Routing
  currentRoute: string;
  routeParams: Record<string, string>;
  navigate: (route: string, params?: Record<string, string>) => void;

  // Feed / Posts
  posts: Post[];
  feedTab: 'foryou' | 'following' | 'latest';
  setFeedTab: (tab: 'foryou' | 'following' | 'latest') => void;
  loadFeed: (tab?: 'foryou' | 'following' | 'latest') => Promise<void>;
  createPost: (content: string, audience: 'public' | 'followers' | 'community', mediaUrls?: string[], communityId?: string, poll?: any) => Promise<boolean>;
  togglePostReaction: (postId: string, reaction?: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  // Stories
  activeStory: Story | null;
  setActiveStory: (story: Story | null) => void;

  // Communities
  communities: Community[];
  loadCommunities: (category?: string, query?: string) => Promise<void>;
  joinCommunity: (id: string) => Promise<void>;
  leaveCommunity: (id: string) => Promise<void>;

  // Chat
  conversations: Conversation[];
  activeConversationId: string | null;
  unreadMessagesCount: number;
  openChatWithUser: (user: User) => Promise<void>;
  sendMessage: (convId: string, text: string, mediaUrls?: string[], audioUrl?: string, replyTo?: any) => Promise<void>;
  setActiveConversationId: (id: string | null) => void;

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  pushSubscribed: boolean;
  togglePushNotifications: () => Promise<void>;

  // Modals & Reporting
  reportTarget: { type: 'post' | 'comment' | 'message' | 'user' | 'community'; id: string; title?: string } | null;
  openReportModal: (target: { type: 'post' | 'comment' | 'message' | 'user' | 'community'; id: string; title?: string }) => void;
  closeReportModal: () => void;
  qrModalUser: User | null;
  setQrModalUser: (user: User | null) => void;
  editProfileOpen: boolean;
  setEditProfileOpen: (open: boolean) => void;
  createPostModalOpen: boolean;
  setCreatePostModalOpen: (open: boolean) => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Server Health
  const [serverStatus, setServerStatus] = useState<ServerHealthState>('checking');
  const [serverMessage, setServerMessage] = useState<string>('Checking Everything IOP server…');

  // Auth is restored from the server-side secure session; the browser is not an auth database.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAuthenticated = !!currentUser;

  // Routing (starts at /home if user signed in, or /welcome if guest)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/') return window.location.pathname;
    return '/welcome';
  });
  const [routeParams, setRouteParams] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    const params: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((value, key) => { params[key] = value; });
    return params;
  });

  // Feed & Posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedTab, setFeedTab] = useState<'foryou' | 'following' | 'latest'>('foryou');
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Communities
  const [communities, setCommunities] = useState<Community[]>([]);

  // Chat
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // Modals
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment' | 'message' | 'user' | 'community'; id: string; title?: string } | null>(null);
  const [qrModalUser, setQrModalUser] = useState<User | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('everything_dark') === 'true';
    }
    return false;
  });

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('everything_dark', String(next));
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  }, []);

  // Sync dark class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Server health check routine adhering to Stage 2 specs
  const checkServerHealth = useCallback(async () => {
    if (!API_ENABLED) { setServerStatus('failed'); setServerMessage('Server integration is disabled. Set VITE_API_ENABLED=true.'); return; }
    setServerStatus('checking');
    setServerMessage('Checking Everything server…');
    try {
      const res = await apiClient.checkHealth();
      if (res.status === 'ok') {
        setServerStatus('ok');
        setServerMessage('Connected');
        return;
      }
      setServerStatus('failed');
      setServerMessage('Everything server is not ready.');
    } catch {
      setServerStatus('failed');
      setServerMessage('Could not reach Everything server.');
    }
  }, []);

  // Perform server check and restore the secure server session on mount.
  useEffect(() => {
    checkServerHealth();
    // Register PWA service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((e) => console.log('SW registration note:', e));
      PushManager.getSubscription().then((sub) => setPushSubscribed(!!sub));
    }
    // Initialize WebSocket only when backend integration is explicitly enabled.
    if (import.meta.env.VITE_API_ENABLED === 'true') socketClient.connect(apiClient.getAccessToken() || undefined);
    return () => {
      socketClient.disconnect();
    };
  }, [checkServerHealth]);

  // Load feed
  const loadFeed = useCallback(async (tab: 'foryou' | 'following' | 'latest' = feedTab) => {
    if (import.meta.env.VITE_API_ENABLED !== 'true') return;
    try {
      const res = await PostApi.getFeed(tab);
      if (res.data) {
        setPosts(res.data);
      }
    } catch {
      // Handled
    }
  }, [feedTab]);

  // Load communities
  const loadCommunities = useCallback(async (category?: string, query?: string) => {
    if (import.meta.env.VITE_API_ENABLED !== 'true') return;
    try {
      const res = await CommunityApi.getCommunities('discover', category, query);
      if (res.data) {
        setCommunities(res.data);
      }
    } catch {
      // Handled
    }
  }, []);

  // Load chat conversations
  const loadConversations = useCallback(async () => {
    if (import.meta.env.VITE_API_ENABLED !== 'true') return;
    try {
      const res = await ChatApi.getConversations();
      if (res.data) {
        setConversations(res.data);
      }
    } catch {
      // Handled
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (import.meta.env.VITE_API_ENABLED !== 'true') return;
    try {
      const res = await NotificationApi.getNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
    } catch {
      // Handled
    }
  }, []);

  useEffect(() => {
    loadFeed();
    loadCommunities();
    loadConversations();
    loadNotifications();
  }, [loadFeed, loadCommunities, loadConversations, loadNotifications]);

  // Navigation: keep the in-app router and browser URL in sync.
  const navigate = useCallback((route: string, params: Record<string, string> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    if (typeof window !== 'undefined') {
      const query = Object.entries(params).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
      const nextUrl = query ? `${route}?${query}` : route;
      if (window.location.pathname + window.location.search !== nextUrl) window.history.pushState({ route, params }, '', nextUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const params: Record<string, string> = {};
      new URLSearchParams(window.location.search).forEach((value, key) => { params[key] = value; });
      setCurrentRoute(window.location.pathname || '/home');
      setRouteParams(params);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    apiClient.request<User>('/auth/me').then((res) => {
      if (!cancelled && res.data) {
        setCurrentUser(res.data);
        const path = typeof window !== 'undefined' ? window.location.pathname : '/';
        if (path === '/welcome' || path === '/login' || path === '/register') navigate('/home');
      }
    }).catch(() => { if (!cancelled) setCurrentUser(null); });
    return () => { cancelled = true; };
  }, [navigate]);

  // Auth functions: server-backed only.
  const login = async (u: string, p: string): Promise<boolean> => {
    if (!API_ENABLED) { addToast('Everything IOP server integration is disabled.', 'error'); return false; }
    try {
      const res = await AuthApi.login({ usernameOrEmail: u, password: p });
      if (!res.data?.user) throw new Error('Authentication server returned no user.');
      setCurrentUser(res.data.user);
      socketClient.reconnect(apiClient.getAccessToken() || undefined);
      addToast(`Welcome back, ${res.data.user.fullName}!`, 'success');
      navigate('/home');
      return true;
    } catch (err: any) { addToast(err.message || 'Invalid login credentials.', 'error'); return false; }
  };

  const register = async (fullName: string, username: string, emailOrPhone: string, password: string, bio = '', avatarUrl = '', avatarFile: File | null = null): Promise<boolean> => {
    if (!API_ENABLED) { addToast('Everything IOP server integration is disabled.', 'error'); return false; }
    try {
      const res = await AuthApi.register({ fullName, username, emailOrPhone, password, bio, avatarUrl });
      if (!res.data?.user) throw new Error('Registration server returned no user.');
      let user = res.data.user;
      if (avatarFile) {
        if (avatarFile.size > 10 * 1024 * 1024) throw new Error('Profile image must be 10 MB or smaller.');
        if (!['image/png','image/jpeg','image/webp'].includes(avatarFile.type.toLowerCase())) throw new Error('Profile image must be PNG, JPEG, or WebP.');
        const upload = await apiClient.request<any>('/media/upload', { method: 'POST', body: await avatarFile.arrayBuffer(), headers: { 'Content-Type': avatarFile.type.toLowerCase() } });
        const uploadedUrl = String(upload.data?.url || upload.data?.publicUrl || upload.data?.location || '');
        if (!uploadedUrl) throw new Error('Profile image upload returned no usable URL.');
        const updated = await apiClient.request<any>('/profiles/me', { method: 'PATCH', body: JSON.stringify({ bio, avatarUrl: uploadedUrl }) });
        user = { ...user, bio, avatarUrl: uploadedUrl, ...(updated.data?.user || {}) };
      } else if (bio) {
        const updated = await apiClient.request<any>('/profiles/me', { method: 'PATCH', body: JSON.stringify({ bio }) });
        user = { ...user, bio, ...(updated.data?.user || {}) };
      }
      setCurrentUser(user);
      socketClient.reconnect(apiClient.getAccessToken() || undefined);
      addToast(`Welcome to Everything IOP, ${user.fullName}!`, 'success');
      navigate('/home');
      return true;
    } catch (err: any) { addToast(err.message || 'Registration failed.', 'error'); return false; }
  };

  const logout = async () => { try { await AuthApi.logout(); setCurrentUser(null); navigate('/welcome'); addToast('Logged out securely.', 'info'); } catch (err:any) { addToast(err.message || 'Logout could not be completed by the server.', 'error'); } };
  const logoutAll = async () => { try { await AuthApi.logoutAll(); setCurrentUser(null); navigate('/welcome'); addToast('All active sessions revoked.', 'info'); } catch (err:any) { addToast(err.message || 'Session revocation could not be completed.', 'error'); } };
  const updateCurrentUser = (updates: Partial<User>) => setCurrentUser((u) => u ? { ...u, ...updates } : u);

  // Post Actions: every mutation goes to the server.
  const createPost = async (content: string, audience: 'public' | 'followers' | 'community', mediaUrls?: string[], communityId?: string, poll?: any): Promise<boolean> => {
    if (!API_ENABLED) { addToast('Server integration is disabled.', 'error'); return false; }
    try { const res = await PostApi.createPost({ content, audience, mediaUrls, communityId, poll }); if (!res.data) throw new Error('Post was not returned by the server.'); setPosts((prev) => [res.data!, ...prev]); setCreatePostModalOpen(false); addToast('Post published to Everything IOP.', 'success'); return true; }
    catch (err: any) { addToast(err.message || 'Failed to publish post.', 'error'); return false; }
  };
  const togglePostReaction = async (postId: string, reaction = 'like') => { try { const res = await PostApi.toggleReaction(postId, reaction); if (res.data?.post) setPosts((prev) => prev.map((p) => p.id === postId ? res.data!.post : p)); } catch (err: any) { addToast(err.message || 'Unable to update reaction.', 'error'); } };
  const toggleSavePost = async (postId: string) => { try { const res = await PostApi.toggleSavePost(postId); if (res.data) setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isSaved: res.data!.isSaved } : p)); } catch (err: any) { addToast(err.message || 'Unable to update saved state.', 'error'); } };
  const deletePost = async (postId: string) => { try { await PostApi.deletePost(postId); setPosts((prev) => prev.filter((p) => p.id !== postId)); if (currentRoute === `/post/${postId}`) navigate('/home'); } catch (err: any) { addToast(err.message || 'Unable to delete post.', 'error'); } };

  // Community actions
  const joinCommunity = async (id: string) => {
    try {
      const res = await CommunityApi.joinCommunity(id);
      if (res.data) {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  isJoined: res.data!.joined,
                  isPending: res.data!.isPending,
                  membersCount: res.data!.joined ? c.membersCount + 1 : c.membersCount,
                }
              : c
          )
        );
        addToast(
          res.data.isPending ? 'Membership request submitted.' : 'Welcome to the community!',
          'success'
        );
      }
    } catch {
      addToast('Unable to join community.', 'error');
    }
  };

  const leaveCommunity = async (id: string) => {
    try {
      await CommunityApi.leaveCommunity(id);
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isJoined: false, membersCount: Math.max(0, c.membersCount - 1) } : c
        )
      );
      addToast('You left the community.', 'info');
    } catch {
      addToast('Unable to leave community.', 'error');
    }
  };

  // Chat actions
  const openChatWithUser = async (targetUser: User) => {
    const conv = await ChatApi.createConversation(targetUser);
    setConversations((prev) => {
      if (prev.some((c) => c.id === conv.id)) return prev;
      return [conv, ...prev];
    });
    setActiveConversationId(conv.id);
    navigate(`/messages/${conv.id}`);
  };

  const sendMessage = async (
    convId: string,
    text: string,
    mediaUrls?: string[],
    audioUrl?: string,
    replyTo?: any
  ) => {
    try {
      const res = await ChatApi.sendMessage(convId, text, mediaUrls, audioUrl, replyTo);
      if (res.data) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, lastMessage: res.data, updatedAt: res.data!.createdAt } : c))
        );
      }
    } catch {
      addToast('Failed to deliver message.', 'error');
    }
  };

  // Notifications actions
  const markNotificationRead = async (id: string) => {
    await NotificationApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await NotificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('All notifications marked as read.', 'success');
  };

  const togglePushNotifications = async () => {
    if (pushSubscribed) {
      await PushManager.unsubscribe();
      setPushSubscribed(false);
      addToast('Push notifications disabled.', 'info');
    } else {
      const sub = await PushManager.subscribe();
      if (sub) {
        setPushSubscribed(true);
        addToast('Web push notifications enabled!', 'success');
      } else {
        addToast('Push permission denied or not supported in this environment.', 'info');
      }
    }
  };

  // Modals
  const openReportModal = (target: { type: 'post' | 'comment' | 'message' | 'user' | 'community'; id: string; title?: string }) => {
    setReportTarget(target);
  };
  const closeReportModal = () => setReportTarget(null);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        serverStatus,
        serverMessage,
        checkServerHealth,
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        logoutAll,
        updateCurrentUser,
        currentRoute,
        routeParams,
        navigate,
        posts,
        feedTab,
        setFeedTab,
        loadFeed,
        createPost,
        togglePostReaction,
        toggleSavePost,
        deletePost,
        activeStory,
        setActiveStory,
        communities,
        loadCommunities,
        joinCommunity,
        leaveCommunity,
        conversations,
        activeConversationId,
        unreadMessagesCount,
        openChatWithUser,
        sendMessage,
        setActiveConversationId,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        pushSubscribed,
        togglePushNotifications,
        reportTarget,
        openReportModal,
        closeReportModal,
        qrModalUser,
        setQrModalUser,
        editProfileOpen,
        setEditProfileOpen,
        createPostModalOpen,
        setCreatePostModalOpen,
        toasts,
        addToast,
        removeToast,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within an AppProvider');
  return ctx;
};
