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

    const isNative = isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && (window as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform?.();
    
    let apiBase = '';
    try {
      // Check if PRODUCTION_API_URL is defined (it's a global const)
      if (typeof PRODUCTION_API_URL !== 'undefined' && PRODUCTION_API_URL) {
        apiBase = PRODUCTION_API_URL;
      } else if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
        apiBase = window.location.origin;
      }
    } catch {
      if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
        apiBase = window.location.origin;
      }
    }

    const baseUrl = isNative ? apiBase : '';
    const origin = isNative ? apiBase : (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' ? window.location.origin : '');

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

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new Error('Server returned an invalid response. This usually happens if the payment service is temporarily unavailable or misconfigured.');
    }

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
