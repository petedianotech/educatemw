import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-study-plan',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 pt-safe">
        <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
          <mat-icon class="text-[22px]">arrow_back</mat-icon>
        </a>
        <h1 class="text-xl font-bold text-slate-900">My Study Plan</h1>
      </header>
      <div class="p-4">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 class="text-lg font-black text-slate-900 mb-4">Your Personalized Plan</h2>
          <p class="text-slate-500">Your study plan is being generated based on your progress. Check back soon!</p>
        </div>
      </div>
    </div>
  `
})
export class StudyPlanComponent {
  // Placeholder for future implementation
}
