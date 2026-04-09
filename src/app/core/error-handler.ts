import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Log to console for debugging
    console.error('Global Error Caught:', error);
    
    // Here we would ideally log to a remote service like Sentry or Firebase Crashlytics
    // For now, we ensure the app doesn't crash completely by catching it here.
    
    // We could also show a toast notification to the user
    // alert('An unexpected error occurred. Please try again.');
  }
}
