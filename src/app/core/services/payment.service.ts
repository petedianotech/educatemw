import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  async initializePayment(amount: number) {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    const isNative = isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
    const baseUrl = isNative ? PRODUCTION_API_URL : '';
    const origin = isNative ? PRODUCTION_API_URL : (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' ? window.location.origin : '');

    const response = await fetch(`${baseUrl}/api/paychangu/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        userId: user.uid,
        email: user.email || `${user.uid}@educatemw.com`,
        first_name: user.displayName?.split(' ')[0] || 'Student',
        last_name: user.displayName?.split(' ').slice(1).join(' ') || 'User',
        callback_url: `${origin}/api/paychangu-webhook`,
        return_url: `${origin}/dashboard?payment=success`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    if (data.status === 'success' && data.data?.checkout_url) {
      const checkoutUrl = data.data.checkout_url;
      
      if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
        try {
          const { Capacitor } = await import('@capacitor/core');
          const { Browser } = await import('@capacitor/browser');
          if (Capacitor.isNativePlatform()) {
            await Browser.open({ url: checkoutUrl });
          } else {
            window.location.href = checkoutUrl;
          }
        } catch {
          window.location.href = checkoutUrl;
        }
      }
    } else {
      throw new Error('Invalid response from payment gateway');
    }
  }
}
