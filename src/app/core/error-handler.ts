import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ErrorToastComponent } from '../shared/components/error-toast/error-toast.component';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private zone = inject(NgZone);
  private errorToast = inject(ErrorToastComponent);

  handleError(error: unknown): void {
    const errorStr = String(error);
    const message = error instanceof Error ? error.message : errorStr;
    
    // Auto-reload on chunk load failure (vite dev server clears chunks on compile)
    if (message.includes('Failed to fetch dynamically imported module') || message.includes('Loading chunk') || message.includes('chunk')) {
       console.warn('Chunk loading failed. Refreshing page to get latest bundle...');
       window.location.reload();
       return;
    }

    // Ignore fetch errors which are often non-critical (blocked analytics, network flakiness)
    const silentErrors = [
      'Failed to fetch',
      'fetch',
      'NetworkError',
      'Network request failed',
      '@firebase/analytics',
      'FirebaseError: Analytics'
    ];

    if (silentErrors.some(s => message.includes(s) || errorStr.includes(s))) {
      console.warn('Minor network/background error ignored:', message);
      return;
    }

    console.error('Global Error Caught:', error);
    
    this.zone.run(() => {
      this.errorToast.showError('An unexpected error occurred. Please try again.');
    });
  }
}
