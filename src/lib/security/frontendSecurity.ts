/**
 * Frontend security helpers aligned with Google web security guidance:
 * https://web.dev/secure/
 * https://web.dev/articles/strict-csp
 * https://owasp.org/www-project-cheat-sheets/cheatsheets/HTML5_Security_Cheat_Sheet.html
 *
 * Browser is untrusted. These helpers reduce XSS, open redirects, token leakage
 * and accidental outbound fetches. Server authorization remains mandatory.
 */

const INTERNAL_PREFIXES = [
  '/',
  '/home',
  '/welcome',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/explore',
  '/search',
  '/help',
  '/legal',
  '/privacy',
  '/terms',
  '/privacy-terms',
  '/communities',
  '/messages',
  '/notifications',
  '/profile',
  '/saved',
  '/settings',
  '/create',
  '/followers',
  '/following',
  '/reports',
  '/support',
  '/everything',
  '/reels',
  '/videos',
  '/live',
  '/store',
  '/events',
  '/wallet',
  '/coins',
  '/subscriptions',
  '/seller',
  '/creator',
  '/business',
  '/developer',
  '/community-control',
  '/details',
  '/stories',
  '/post/',
  '/reel/',
  '/video/',
  '/live/',
  '/user/',
  '/users/',
  '/community/',
  '/product/',
  '/event/',
  '/offline',
  '/error',
  '/404',
];

const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript|file|about):/i;

export function sanitizePlainText(value: string, max = 4000): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .slice(0, max);
}

export function isSafeInternalPath(path: string): boolean {
  if (typeof path !== 'string') return false;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return false;
  if (BLOCKED_PROTOCOLS.test(trimmed)) return false;
  if (trimmed.includes('\\') || trimmed.includes('://')) return false;
  const pathname = trimmed.split('?')[0].split('#')[0];
  return INTERNAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix === '/' ? '///' : prefix));
}

export function safeInternalPath(path: string, fallback = '/home'): string {
  const raw = String(path || '').trim() || fallback;
  const pathname = raw.split('?')[0].split('#')[0];
  if (pathname === '/') return '/home';
  if (isSafeInternalPath(pathname)) return pathname;
  return fallback;
}

export function safeHttpUrl(url: string): string | null {
  const raw = String(url || '').trim();
  if (!raw || BLOCKED_PROTOCOLS.test(raw)) return null;
  try {
    const parsed = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://everything-iop.onrender.com');
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sameOriginApiUrl(endpoint: string, baseUrl: string): string {
  if (!endpoint) throw new Error('Empty API endpoint.');
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    const allowed = safeHttpUrl(endpoint);
    if (!allowed) throw new Error('Blocked unsafe URL.');
    const target = new URL(allowed);
    const base = new URL(baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://everything-iop.onrender.com'));
    if (target.origin !== base.origin) throw new Error('Cross-origin API calls from the browser are blocked.');
    return allowed;
  }
  if (!endpoint.startsWith('/')) throw new Error('API endpoint must be a relative path.');
  return `${baseUrl.replace(/\/+$/, '')}${endpoint}`;
}

export function clearSensitiveClientState() {
  if (typeof window === 'undefined') return;
  const drop = [
    'everything_session',
    'everything_access_token',
    'everything_refresh_token',
    'everything_post_draft',
    'everything_report_queue',
  ];
  drop.forEach((key) => {
    try { localStorage.removeItem(key); } catch {}
    try { sessionStorage.removeItem(key); } catch {}
  });
}

export function passwordLooksUsable(password: string): boolean {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}
