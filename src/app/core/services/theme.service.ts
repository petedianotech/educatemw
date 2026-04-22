import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  isDarkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.isDarkMode.set(true);
        this.updateBodyClass(true);
      }
    }

    // React to signal changes accurately
    effect(() => {
      const darkMode = this.isDarkMode();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        this.updateBodyClass(darkMode);
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
  }

  private updateBodyClass(isDark: boolean) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
