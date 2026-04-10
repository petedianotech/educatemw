import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../core/services/data.service';
import { UserProfile } from '../../core/services/auth.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 pt-safe">
        <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition-colors -ml-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-xl font-bold text-slate-900">Leaderboard</h1>
      </header>
      <div class="p-4">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 class="text-lg font-black text-slate-900 mb-4">Top Students</h2>
          @for (student of topStudents(); track student.uid; let i = $index) {
            <div class="flex items-center gap-4 p-4 rounded-2xl" [class.bg-indigo-50]="i === 0">
              <div class="w-8 font-black text-slate-400" [class.text-indigo-600]="i === 0">{{i + 1}}</div>
              <img [src]="student.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.uid" [alt]="student.displayName" class="w-10 h-10 rounded-full bg-slate-200" referrerpolicy="no-referrer">
              <div class="flex-1">
                <p class="font-bold text-slate-900">{{student.displayName}}</p>
              </div>
              <div class="font-black text-indigo-600">{{student.aiCredits || 0}} pts</div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  dataService = inject(DataService);
  topStudents = signal<UserProfile[]>([]);

  async ngOnInit() {
    this.topStudents.set(await this.dataService.getTopStudents());
  }

  goBack() {
    window.history.back();
  }
}
