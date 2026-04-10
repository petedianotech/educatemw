import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
      <div class="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-6">
        <mat-icon class="!w-10 !h-10 !text-[40px]">construction</mat-icon>
      </div>
      <h2 class="text-2xl font-black text-slate-900 mb-2">Coming Soon</h2>
      <p class="text-slate-500 max-w-xs">We are working hard to bring this feature to you. Stay tuned!</p>
    </div>
  `
})
export class PlaceholderComponent {}
