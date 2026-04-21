import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  async initializePayment() {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    const paymentUrl = 'https://pay.paychangu.com/SC-IGLIA1';
    
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      try {
        const { Capacitor } = await import('@capacitor/core');
        const { Browser } = await import('@capacitor/browser');
        if (Capacitor.isNativePlatform()) {
          await Browser.open({ url: paymentUrl });
        } else {
          window.open(paymentUrl, '_blank');
        }
      } catch {
        window.open(paymentUrl, '_blank');
      }
    }
  }
}
