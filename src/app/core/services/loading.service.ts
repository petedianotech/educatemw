import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  progress = signal(0);
  isLoading = signal(true);
  loadingText = signal('Initializing...');

  simulateLoading() {
    this.isLoading.set(true);
    this.progress.set(0);
    this.loadingText.set('Loading Educate MW...');

    const interval = setInterval(() => {
      this.progress.update(p => {
        if (p >= 100) {
          clearInterval(interval);
          this.isLoading.set(false);
          return 100;
        }
        
        // Dynamic text based on progress
        if (p > 20) this.loadingText.set('Connecting to servers...');
        if (p > 50) this.loadingText.set('Preparing your dashboard...');
        if (p > 80) this.loadingText.set('Almost ready...');
        
        return p + Math.floor(Math.random() * 20) + 10;
      });
    }, 100);
  }

  setLoading(loading: boolean, text = 'Loading...') {
    this.isLoading.set(loading);
    this.loadingText.set(text);
    if (!loading) this.progress.set(100);
  }
}
