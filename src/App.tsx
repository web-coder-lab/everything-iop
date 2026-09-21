/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppStore } from './stores/appStore';
import { AppShell } from './components/layout/AppShell';
import { FeedView } from './components/feed/FeedView';
import { PostDetailView } from './components/feed/PostDetailView';
import { CommunityListView } from './components/communities/CommunityListView';
import { CommunityDetailView } from './components/communities/CommunityDetailView';
import { MessagingLayout } from './components/chat/MessagingLayout';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { GlobalSearchView } from './components/search/GlobalSearchView';
import { SavedPostsView } from './components/feed/SavedPostsView';
import { SettingsView } from './components/settings/SettingsView';
import { SecurityCenterView } from './components/settings/SecurityCenterView';
import { HelpView } from './components/help/HelpView';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { WelcomeView } from './components/auth/WelcomeView';
import { ExploreView, CreatePostView, FollowersView, SettingsSectionView, SessionsView, BlockedUsersView, ReportView, HelpCenterView, ServerStatusView, SystemStateView, ForgotPasswordView, ResetPasswordView, CommunityMembersView, CommunityRulesView, ChatInfoView, CreateStoryView, SupportView } from './components/ExtendedPages';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import EverythingHome from './components/everything/EverythingHome';
import EverythingDetailHub from './components/everything/EverythingDetailHub';

const EVERYTHING_ROUTES = new Set(['/home','/everything','/reels','/videos','/live','/store','/events','/wallet','/coins','/subscriptions','/seller','/creator','/business','/developer','/community-control','/details']);
const isEverythingRoute = (route: string) => EVERYTHING_ROUTES.has(route) || route.startsWith('/everything/') || ['/reel/','/video/','/live/','/user/','/community/','/product/','/event/'].some((prefix) => route.startsWith(prefix));

const RouterContent: React.FC = () => {
  const { currentRoute, routeParams, currentUser } = useAppStore();

  // Pattern matching for routes
  if (currentRoute === '/welcome') {
    return <WelcomeView />;
  }

  if (currentRoute === '/login') {
    return <LoginView />;
  }

  if (currentRoute === '/register') {
    return <RegisterView />;
  }
  if (currentRoute === '/forgot-password') return <ForgotPasswordView />;
  if (currentRoute === '/reset-password') return <ResetPasswordView />;

  const protectedRoute = currentRoute.startsWith('/home') || currentRoute.startsWith('/everything') || ['/reels','/videos','/live','/store','/events','/wallet','/coins','/subscriptions','/seller','/creator','/business','/developer','/community-control','/details','/messages','/notifications','/profile','/saved','/settings','/create','/followers','/following','/reports'].includes(currentRoute) || currentRoute.startsWith('/communities') || currentRoute.startsWith('/post/') || currentRoute.startsWith('/reel/') || currentRoute.startsWith('/video/') || currentRoute.startsWith('/live/') || currentRoute.startsWith('/product/') || currentRoute.startsWith('/event/');
  if (protectedRoute && !currentUser) return <LoginView />;

  if (currentRoute.startsWith('/post/')) {
    const postId = currentRoute.replace('/post/', '');
    return <PostDetailView postId={postId} />;
  }

  if (currentRoute.startsWith('/reel/')) return <EverythingDetailHub forcedDetail="reel" surfaceId={currentRoute.replace('/reel/', '')} notify={() => undefined} />;
  if (currentRoute.startsWith('/video/')) return <EverythingDetailHub forcedDetail="video" surfaceId={currentRoute.replace('/video/', '')} notify={() => undefined} />;
  if (currentRoute.startsWith('/live/')) return <EverythingDetailHub forcedDetail="live" surfaceId={currentRoute.replace('/live/', '')} notify={() => undefined} />;
  if (currentRoute.startsWith('/user/')) {
    const username = currentRoute.replace('/user/', '');
    return <ProfileView username={username} />;
  }
  if (currentRoute.startsWith('/community/')) return <EverythingDetailHub forcedDetail="community" notify={() => undefined} />;
  if (currentRoute.startsWith('/product/')) return <EverythingDetailHub forcedDetail="product" notify={() => undefined} />;
  if (currentRoute.startsWith('/event/')) return <EverythingDetailHub forcedDetail="event" notify={() => undefined} />;

  if (currentRoute.startsWith('/communities/members/')) return <CommunityMembersView />;
  if (currentRoute.startsWith('/communities/rules/')) return <CommunityRulesView />;
  if (currentRoute.startsWith('/communities/')) {
    const commId = currentRoute.replace('/communities/', '');
    return <CommunityDetailView communityId={commId} />;
  }

  if (currentRoute === '/communities') {
    return <CommunityListView />;
  }

  if (currentRoute === '/messages/info') return <ChatInfoView />;
  if (currentRoute.startsWith('/messages')) {
    const convId = currentRoute.startsWith('/messages/') ? currentRoute.replace('/messages/', '') : undefined;
    return <MessagingLayout initialConversationId={convId} />;
  }

  if (currentRoute === '/notifications') {
    return <NotificationsView />;
  }

  if (currentRoute === '/profile') {
    return <ProfileView />;
  }

  if (currentRoute.startsWith('/users/')) {
    const username = currentRoute.replace('/users/', '');
    return <ProfileView username={username} />;
  }

  if (currentRoute === '/search') {
    return <GlobalSearchView initialQuery={routeParams.q || ''} />;
  }

  if (currentRoute === '/saved') {
    return <SavedPostsView />;
  }

  if (currentRoute === '/settings/security') {
    return <SecurityCenterView />;
  }

  if (currentRoute === '/settings') {
    return <SettingsView />;
  }


  if (currentRoute === '/help') {
    return <HelpView />;
  }
  if (currentRoute === '/explore') return <ExploreView />;
  if (currentRoute === '/stories/create') return <CreateStoryView />;
  if (currentRoute === '/support') return <SupportView />;
  if (currentRoute === '/create') return <CreatePostView />;
  if (currentRoute === '/followers') return <FollowersView mode="followers" />;
  if (currentRoute === '/following') return <FollowersView mode="following" />;
  if (currentRoute === '/settings/account') return <SettingsSectionView section="account" />;
  if (currentRoute === '/settings/privacy') return <SettingsSectionView section="privacy" />;
  if (currentRoute === '/settings/notifications') return <SettingsSectionView section="notifications" />;
  if (currentRoute === '/settings/appearance') return <SettingsSectionView section="appearance" />;
  if (currentRoute === '/settings/sessions') return <SessionsView />;
  if (currentRoute === '/settings/blocked') return <BlockedUsersView />;
  if (currentRoute === '/reports') return <ReportView />;
  if (currentRoute === '/server-status') return <ServerStatusView />;
  if (currentRoute === '/offline') return <SystemStateView kind="offline" />;
  if (currentRoute === '/error') return <SystemStateView kind="error" />;
  if (currentRoute === '/404') return <SystemStateView kind="404" />;

  // Everything is the unified product surface. Unknown URLs must not silently fall back to home.
  const knownStandalone = new Set(['/','/home','/everything','/reels','/videos','/live','/store','/events','/wallet','/coins','/subscriptions','/seller','/creator','/business','/developer','/community-control','/details']);
  const knownDynamic = currentRoute.startsWith('/everything/') || currentRoute.startsWith('/post/') || currentRoute.startsWith('/reel/') || currentRoute.startsWith('/video/') || currentRoute.startsWith('/live/') || currentRoute.startsWith('/user/') || currentRoute.startsWith('/community/') || currentRoute.startsWith('/product/') || currentRoute.startsWith('/event/') || currentRoute.startsWith('/communities/') || currentRoute.startsWith('/messages/') || currentRoute.startsWith('/users/');
  if (!knownStandalone.has(currentRoute) && !knownDynamic) return <SystemStateView kind="404" />;
  return <EverythingHome />;
};

const RoutedSurface: React.FC = () => {
  const { currentRoute } = useAppStore();
  const content = <RouterContent />;
  return isEverythingRoute(currentRoute) ? content : <AppShell>{content}</AppShell>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <RoutedSurface />
      </AppProvider>
    </ErrorBoundary>
  );
}
