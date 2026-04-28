import { Component, signal, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (error()) {
      <div class="fixed bottom-4 right-4 z-[9999] bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
        <mat-icon>error_outline</mat-icon>
        <p class="text-sm font-bold">{{ error() }}</p>
        <button (click)="error.set(null)" class="ml-2 hover:bg-rose-700 rounded-full p-1">
          <mat-icon class="!w-4 !h-4 !text-[16px]">close</mat-icon>
        </button>
      </div>
    }
  `
})
@Injectable({ providedIn: 'root' })
export class ErrorToastComponent {
  error = signal<string | null>(null);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('firestore-error', (event: Event | CustomEvent) => {
        if ('detail' in event && event.detail?.message) {
          this.showError((event as CustomEvent).detail.message);
        }
      });
    }
  }

  showError(message: string) {
    this.error.set(message);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.error.set(null), 5000);
    }
  }
}
