// Everything frontend configuration.
// Backend integrations stay disabled until the unified server is ready.

export const API_ENABLED = import.meta.env.VITE_API_ENABLED !== 'false';

export const API_BASE_URL = import.meta.env.VITE_API_ENABLED !== 'false'
  ? (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : ''))
  : '';

export const WS_URL = import.meta.env.VITE_API_ENABLED !== 'false'
  ? (import.meta.env.VITE_WS_URL || (typeof window !== 'undefined' ? window.location.origin : ''))
  : '';

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Everything IOP';

export const WEB_PUSH_PUBLIC_KEY = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY || '';

export const COMMUNITY_CATEGORIES = [
  'Technology','Education','Gaming','Business','Jobs','Sports',
  'Entertainment','Pakistan','Local','Other'
] as const;

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];
