import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full bg-slate-50 relative flex flex-col overflow-hidden">
      
      <!-- Premium Header Background -->
      <div class="absolute top-0 left-0 right-0 h-48 bg-slate-950 rounded-b-[2.5rem] shadow-lg z-0 overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <!-- Decorative glow -->
        <div class="absolute top-[-50%] left-[-10%] w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div class="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-sky-500/20 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 pt-safe pb-32 px-5 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <!-- Top Bar -->
        <div class="pt-4 pb-8 flex items-center justify-between shrink-0">
          <div class="pl-14">
            <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <mat-icon class="text-indigo-400">school</mat-icon>
              Educate MW
            </h1>
            <p class="text-xs font-medium text-indigo-200 mt-1">Welcome back, {{authService.currentUser()?.displayName?.split(' ')?.[0] || 'Student'}}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-sm hover:bg-white/20 transition-colors">
            <mat-icon class="!w-6 !h-6 !text-[24px]">notifications_none</mat-icon>
          </div>
        </div>

        <!-- App Updates Section -->
        @if (dataService.appUpdates().length > 0 && !updateDismissed()) {
          <div class="mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500" (click)="dismissUpdate()">
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95">
              <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                <mat-icon class="!w-5 !h-5 !text-[20px]">campaign</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-black text-slate-900 truncate">{{ dataService.appUpdates()[0].title }}</h4>
                <p class="text-xs text-slate-500 truncate mt-0.5">{{ dataService.appUpdates()[0].content }}</p>
              </div>
              <mat-icon class="text-slate-300 !w-5 !h-5 !text-[20px]">close</mat-icon>
            </div>
          </div>
        }

        <!-- Quick Actions Grid (Compact Sizing, 2 Columns) -->
        <div class="grid grid-cols-2 gap-3 mb-4 shrink-0">
          
          <!-- Cleo AI Tutor -->
          <a routerLink="/chat" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all active:scale-95 group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 relative z-10 group-hover:scale-105 transition-transform">
              <mat-icon class="!w-6 !h-6 !text-[24px]">auto_awesome</mat-icon>
              @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits ?? 5) <= 0) {
                <div class="absolute -top-1.5 -right-1.5 bg-slate-900 text-amber-400 p-1 rounded-lg border-2 border-white shadow-sm">
                  <mat-icon class="!w-3 !h-3 !text-[12px]">lock</mat-icon>
                </div>
              }
            </div>
            <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Cleo AI Tutor</h3>
            <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Interactive learning</p>
          </a>

          <!-- Video Lessons -->
          <a routerLink="/video-lessons" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all active:scale-95 group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-rose-500/30 relative z-10 group-hover:scale-105 transition-transform">
              <mat-icon class="!w-6 !h-6 !text-[24px]">play_circle_outline</mat-icon>
            </div>
            <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Video Lessons</h3>
            <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Visual tutorials</p>
          </a>

          <!-- Study Library -->
          <a routerLink="/notes" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all active:scale-95 group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30 relative z-10 group-hover:scale-105 transition-transform">
              <mat-icon class="!w-6 !h-6 !text-[24px]">library_books</mat-icon>
            </div>
            <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Study Library</h3>
            <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Past papers & notes</p>
          </a>

          <!-- Practice Quizzes -->
          <a routerLink="/quizzes" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all active:scale-95 group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/30 relative z-10 group-hover:scale-105 transition-transform">
              <mat-icon class="!w-6 !h-6 !text-[24px]">quiz</mat-icon>
            </div>
            <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Practice Quizzes</h3>
            <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Test your knowledge</p>
          </a>

          <!-- Community Forum -->
          <a routerLink="/community" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all active:scale-95 group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/30 relative z-10 group-hover:scale-105 transition-transform">
              <mat-icon class="!w-6 !h-6 !text-[24px]">forum</mat-icon>
            </div>
            <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Community Forum</h3>
            <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Discuss with peers</p>
          </a>

          <!-- Career Guidance -->
          <a routerLink="/career-guidance" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all active:scale-95 group relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/30 relative z-10 group-hover:scale-105 transition-transform">
              <mat-icon class="!w-6 !h-6 !text-[24px]">explore</mat-icon>
            </div>
            <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Career Guidance</h3>
            <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">MSCE points calculator</p>
          </a>
        </div>

        <!-- Pro Upgrade Banner -->
        @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
          <div class="mt-auto shrink-0 pb-4">
            <div class="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[1.5rem] p-5 text-white shadow-lg border border-slate-800 flex items-center justify-between relative overflow-hidden">
              <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
              <div class="relative z-10">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <mat-icon class="text-sky-400 !w-4 !h-4 !text-[16px]">workspace_premium</mat-icon>
                  <span class="text-sky-400 font-bold text-[10px] tracking-widest uppercase">Educate MW Pro</span>
                </div>
                <h3 class="text-base font-bold tracking-tight">Unlock Everything</h3>
              </div>
              <a routerLink="/upgrade" class="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-black text-sm shadow-md active:scale-95 transition-transform relative z-10">
                Upgrade
              </a>
            </div>
          </div>
        }
      </div>
      
      <!-- Edge-to-Edge Bottom Navigation -->
      <div class="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
        <div class="bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-6 py-2 pb-safe flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
          <a routerLink="/" class="flex flex-col items-center justify-center w-12 h-10 text-white transition-all active:scale-90">
            <div class="bg-indigo-500/20 p-1.5 rounded-xl">
              <mat-icon class="!w-5 !h-5 !text-[20px] text-indigo-400">home</mat-icon>
            </div>
          </a>
          <a routerLink="/chat" class="flex flex-col items-center justify-center w-12 h-10 text-slate-400 hover:text-white transition-all active:scale-90">
            <div class="p-1.5 rounded-xl hover:bg-white/5">
              <mat-icon class="!w-5 !h-5 !text-[20px]">auto_awesome</mat-icon>
            </div>
          </a>
          <a routerLink="/notes" class="flex flex-col items-center justify-center w-12 h-10 text-slate-400 hover:text-white transition-all active:scale-90">
            <div class="p-1.5 rounded-xl hover:bg-white/5">
              <mat-icon class="!w-5 !h-5 !text-[20px]">library_books</mat-icon>
            </div>
          </a>
          <a routerLink="/quizzes" class="flex flex-col items-center justify-center w-12 h-10 text-slate-400 hover:text-white transition-all active:scale-90">
            <div class="p-1.5 rounded-xl hover:bg-white/5">
              <mat-icon class="!w-5 !h-5 !text-[20px]">quiz</mat-icon>
            </div>
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  dataService = inject(DataService);
  
  updateDismissed = signal(false);

  ngOnInit() {
    this.dataService.subscribeToAppUpdates();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromAppUpdates();
  }

  dismissUpdate() {
    this.updateDismissed.set(true);
  }

  toDate(date: Date | Timestamp | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  }
}
