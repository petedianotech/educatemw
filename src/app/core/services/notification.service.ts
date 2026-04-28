import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AuthService } from './auth.service';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  permission = signal<NotificationPermission | 'prompt' | 'granted' | 'denied'>('default');
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && 'Notification' in window) {
      if (!Capacitor.isNativePlatform()) {
        this.permission.set(Notification.permission);
      }
    }
  }

  async requestPermission() {
    if (!isPlatformBrowser(this.platformId)) return 'denied';

    if (Capacitor.isNativePlatform()) {
      try {
        // Request Local Notification Permissions
        const localPerm = await LocalNotifications.requestPermissions();
        if (localPerm.display === 'granted') {
           this.scheduleDailyCreditReminder();
        }

        // Request Push Notification Permissions
        let pushPermStatus = await PushNotifications.checkPermissions();
        if (pushPermStatus.receive === 'prompt') {
          pushPermStatus = await PushNotifications.requestPermissions();
        }

        if (pushPermStatus.receive !== 'granted') {
          console.warn('Push permissions denied');
          this.permission.set('denied');
          return 'denied';
        }

        this.permission.set('granted');

        // Register with Google/Apple
        await PushNotifications.register();

        // Listeners
        PushNotifications.addListener('registration', async (token: Token) => {
          console.log('Push registration success, token: ' + token.value);
          await this.saveFCMToken(token.value);
        });

        PushNotifications.addListener('registrationError', (error: unknown) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push received: ' + JSON.stringify(notification));
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
          if (notification.notification.data?.path) {
             this.router.navigateByUrl(notification.notification.data.path);
          }
        });

        return 'granted';
      } catch (err) {
        console.warn('Failed native permissions', err);
        return 'denied';
      }
    } else {
      // Web Fallback
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        this.permission.set(result);
        return result;
      }
      return 'denied';
    }
  }

  private async saveFCMToken(token: string) {
    const user = this.authService.currentUser();
    if (user && user.uid) {
      try {
         const userRef = doc(db, 'users', user.uid);
         await updateDoc(userRef, { fcmToken: token });
      } catch (err) {
         console.warn('Failed to save FCM token', err);
      }
    }
  }

  private async scheduleDailyCreditReminder() {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Your Daily AI Credits are Ready! 🎁',
          body: 'Come use your free tokens to ask questions, solve past papers, or practice.',
          id: 1,
          schedule: { 
            on: { hour: 8, minute: 0 },
            repeats: true 
          },
          actionTypeId: '',
          extra: null
        }]
      });
    } catch (err) {
      console.warn('Failed to schedule local notification', err);
    }
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (Capacitor.isNativePlatform()) {
      LocalNotifications.schedule({
        notifications: [{
          title: title,
          body: options?.body || '',
          id: Math.floor(Math.random() * 100000),
          schedule: { at: new Date(Date.now() + 1000) }, // basically now
          actionTypeId: '',
          extra: null
        }]
      });
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options
        } as unknown as NotificationOptions);
      }).catch(() => {
        new Notification(title, options);
      });
    }
  }

  scheduleReminder(title: string, body: string, delayMs: number) {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.schedule({
        notifications: [{
          title: title,
          body: body,
          id: Math.floor(Math.random() * 100000),
          schedule: { at: new Date(Date.now() + delayMs) },
          actionTypeId: '',
          extra: null
        }]
      });
    } else {
      setTimeout(() => {
        this.showNotification(title, { body });
      }, delayMs);
    }
  }
}
