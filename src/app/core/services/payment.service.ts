import { Injectable, inject } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private authService = inject(AuthService);

  async initializePayment(amount: number) {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch('/api/paychangu/initialize', {
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
        callback_url: `${window.location.origin}/api/paychangu/webhook`,
        return_url: `${window.location.origin}/dashboard?payment=success`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    if (data.status === 'success' && data.data?.checkout_url) {
      const checkoutUrl = data.data.checkout_url;
      
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: checkoutUrl });
      } else {
        window.location.href = checkoutUrl;
      }
    } else {
      throw new Error('Invalid response from payment gateway');
    }
  }
}
