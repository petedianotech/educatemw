import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  permission = signal<NotificationPermission>('default');

  constructor() {
    if ('Notification' in window) {
      this.permission.set(Notification.permission);
    }
  }

  async requestPermission() {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      this.permission.set(result);
      return result;
    }
    return 'denied';
  }

  showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
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
