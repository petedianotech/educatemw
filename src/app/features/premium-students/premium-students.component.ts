import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../core/services/data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-premium-students',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 pt-safe">
        <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
          <mat-icon class="text-[22px]">arrow_back</mat-icon>
        </a>
        <h1 class="text-xl font-bold text-slate-900">Premium Students</h1>
      </header>
      <div class="p-4">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 class="text-lg font-black text-slate-900 mb-4">Our Pro Members</h2>
          <div class="space-y-4">
            @for (user of premiumUsers(); track user.uid) {
              <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img [src]="user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid" 
                     alt="Profile" 
                     class="w-12 h-12 rounded-xl bg-slate-200 object-cover" 
                     referrerpolicy="no-referrer">
                <div class="flex-1">
                  <p class="font-black text-slate-900">{{user.displayName}}</p>
                  <p class="text-xs font-bold text-indigo-600 uppercase tracking-widest">Pro Member</p>
                </div>
                <mat-icon class="text-amber-500">workspace_premium</mat-icon>
              </div>
            } @empty {
              <p class="text-slate-500">No premium students found.</p>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class PremiumStudentsComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);

  ngOnInit() {
    this.dataService.subscribeToPremiumUsers();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromUsers();
  }

  premiumUsers() {
    return this.dataService.users();
  }
}
