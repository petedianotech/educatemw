import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ErrorToastComponent } from '../shared/components/error-toast/error-toast.component';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private zone = inject(NgZone);
  private errorToast = inject(ErrorToastComponent);

  handleError(error: unknown): void {
    console.error('Global Error Caught:', error);
    
    this.zone.run(() => {
      this.errorToast.showError('An unexpected error occurred. Please try again.');
    });
  }
}
