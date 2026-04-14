import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  permission = signal<NotificationPermission>('default');
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && 'Notification' in window) {
      this.permission.set(Notification.permission);
    }
  }

  async requestPermission() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      this.permission.set(result);
      return result;
    }
    return 'denied';
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      // Use service worker for better background support if available
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }).catch(() => {
        // Fallback to standard notification
        new Notification(title, options);
      });
    }
  }

  // Schedule a reminder (simulated for this environment)
  scheduleReminder(title: string, body: string, delayMs: number) {
    setTimeout(() => {
      this.showNotification(title, { body });
    }, delayMs);
  }
}
