import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 pt-safe">
        <h1 class="text-xl font-bold text-slate-900">Student Timetable</h1>
      </header>
      <div class="p-4">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 class="text-lg font-black text-slate-900 mb-4">Weekly Schedule</h2>
          <p class="text-slate-500">Timetable functionality is coming soon. Stay tuned!</p>
        </div>
      </div>
    </div>
  `
})
export class TimetableComponent {
  goBack() {
    window.history.back();
  }
}
