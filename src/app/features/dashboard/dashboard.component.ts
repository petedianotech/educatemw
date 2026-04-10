import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
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
    <div class="h-full overflow-y-auto bg-slate-50 pb-24 relative">
      
      <!-- Premium Header Background -->
      <div class="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-b-3xl shadow-md z-0">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-b-3xl"></div>
      </div>

      <div class="relative z-10 p-4 md:p-8">
        <!-- Greeting Section -->
        <div class="mb-8 mt-4 px-2 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-indigo-100 uppercase tracking-wider mb-1">Welcome Back</h2>
            <h1 class="text-3xl font-bold text-white tracking-tight">{{authService.currentUser()?.displayName}}</h1>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
            <mat-icon>notifications_none</mat-icon>
          </div>
        </div>

        <!-- App Updates Section -->
        @if (dataService.appUpdates().length > 0) {
          <div class="max-w-2xl mx-auto mb-8">
            <div class="bg-white rounded-3xl p-6 shadow-xl border border-indigo-50 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 blur-2xl"></div>
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <mat-icon class="!w-5 !h-5 !text-[20px]">campaign</mat-icon>
                </div>
                <div>
                  <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Latest Update</h3>
                  <p class="text-[10px] text-slate-400 font-bold">{{ toDate(dataService.appUpdates()[0].createdAt) | date:'mediumDate' }}</p>
                </div>
              </div>
              <h4 class="text-lg font-black text-slate-900 mb-2">{{ dataService.appUpdates()[0].title }}</h4>
              <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">{{ dataService.appUpdates()[0].content }}</p>
            </div>
          </div>
        }

        <!-- Quick Actions Grid (App Style) -->
        <div class="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          
          <!-- Cleo AI -->
          <a routerLink="/chat" class="card-modern p-5 flex flex-col justify-between aspect-square relative overflow-hidden group border-2 border-transparent hover:border-indigo-500/30 transition-all duration-500">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-blue-500/5 to-sky-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            
            <div class="flex justify-between items-start relative z-10">
              <div class="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-blue-500 to-sky-400 opacity-80"></div>
                <mat-icon class="!w-8 !h-8 !text-[32px] relative z-10 animate-pulse">auto_awesome</mat-icon>
              </div>
              @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits ?? 5) <= 0) {
                <div class="bg-slate-900 text-amber-400 p-2 rounded-xl border border-slate-800 shadow-lg">
                  <mat-icon class="!w-4 !h-4 !text-[16px]">lock</mat-icon>
                </div>
              }
            </div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-1.5 mb-1">
                <h3 class="font-black text-xl text-slate-900 tracking-tight">Cleo AI</h3>
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
              <p class="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Advanced Tutor</p>
            </div>
          </a>

          <!-- Library -->
          <a routerLink="/notes" class="card-modern p-5 flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-sky-100 rounded-full blur-2xl opacity-60 group-hover:bg-sky-200 transition-colors"></div>
            <div class="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center border border-sky-100 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-300">
              <mat-icon class="!w-7 !h-7 !text-[28px]">library_books</mat-icon>
            </div>
            <div class="relative z-10">
              <h3 class="font-bold text-xl mb-1 text-slate-800">Library</h3>
              <p class="text-slate-500 text-xs font-medium">Past papers & notes</p>
            </div>
          </a>

          <!-- Quizzes -->
          <a routerLink="/quizzes" class="card-modern p-5 flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-60 group-hover:bg-emerald-200 transition-colors"></div>
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-300">
              <mat-icon class="!w-7 !h-7 !text-[28px]">quiz</mat-icon>
            </div>
            <div class="relative z-10">
              <h3 class="font-bold text-xl mb-1 text-slate-800">Quizzes</h3>
              <p class="text-slate-500 text-xs font-medium">Test your skills</p>
            </div>
          </a>

          <!-- Community -->
          <a routerLink="/community" class="card-modern p-5 flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 rounded-full blur-2xl opacity-60 group-hover:bg-purple-200 transition-colors"></div>
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-300">
              <mat-icon class="!w-7 !h-7 !text-[28px]">forum</mat-icon>
            </div>
            <div class="relative z-10">
              <h3 class="font-bold text-xl mb-1 text-slate-800">Community</h3>
              <p class="text-slate-500 text-xs font-medium">Discuss with peers</p>
            </div>
          </a>

          <!-- Career Guidance -->
          <a routerLink="/career-guidance" class="card-modern p-5 flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-100 rounded-full blur-2xl opacity-60 group-hover:bg-rose-200 transition-colors"></div>
            <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-300">
              <mat-icon class="!w-7 !h-7 !text-[28px]">explore</mat-icon>
            </div>
            <div class="relative z-10">
              <h3 class="font-bold text-xl mb-1 text-slate-800">Careers</h3>
              <p class="text-slate-500 text-xs font-medium">MSCE Points Calc</p>
            </div>
          </a>
        </div>

        <!-- Pro Upgrade Banner (Native App Style) -->
        @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
          <div class="max-w-2xl mx-auto">
            <div class="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <div class="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-sky-500 opacity-20 blur-3xl pointer-events-none"></div>
              <div class="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-indigo-500 opacity-20 blur-2xl pointer-events-none"></div>
              
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-4">
                  <div class="p-1.5 bg-sky-500/20 rounded-lg border border-sky-500/30">
                    <mat-icon class="text-sky-400 !w-5 !h-5 !text-[20px]">workspace_premium</mat-icon>
                  </div>
                  <span class="text-sky-400 font-bold text-sm tracking-widest uppercase">EduMalawi Pro</span>
                </div>
                
                <h3 class="text-3xl font-bold mb-3 tracking-tight">Unlock Your Potential</h3>
                <p class="text-slate-300 text-sm mb-8 font-medium leading-relaxed max-w-[90%]">Pay K5,000 once and access everything till your exams. Get unlimited Cleo AI and premium papers.</p>
                
                <a routerLink="/upgrade" class="btn-accent w-full py-3.5 text-[15px]">
                  Upgrade Now
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  dataService = inject(DataService);

  ngOnInit() {
    this.dataService.subscribeToAppUpdates();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromAppUpdates();
  }

  toDate(date: Date | Timestamp | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  }
}
