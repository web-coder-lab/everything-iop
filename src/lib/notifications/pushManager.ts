// Web Push API Subscription Manager
import { WEB_PUSH_PUBLIC_KEY } from '../../config/constants';
import { apiClient } from '../api/client';

export interface PushSubscriptionState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushManager = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch {
      return null;
    }
  },

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const convertedVapidKey = urlBase64ToUint8Array(WEB_PUSH_PUBLIC_KEY);

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });

      // Send subscription to server
      try {
        await apiClient.request('/notifications/push-subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (e) {
        console.info('Push subscription registered locally (mock/prototype backend mode)');
      }

      return subscription;
    } catch (err) {
      console.warn('Push subscription failed:', err);
      return null;
    }
  },

  async unsubscribe(): Promise<boolean> {
    try {
      const sub = await this.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        try {
          await apiClient.request('/notifications/push-subscriptions', { method: 'DELETE' });
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  showLocalNotification(title: string, body: string, url: string = '/') {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    try {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          data: { url },
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
};
