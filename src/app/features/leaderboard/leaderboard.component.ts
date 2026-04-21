import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../core/services/data.service';
import { AuthService, UserProfile } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdPlaceholderComponent } from '../../core/components/ad-placeholder.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, NgOptimizedImage, AdPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <!-- Header -->
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 pt-safe">
        <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
          <mat-icon class="text-[22px]">arrow_back</mat-icon>
        </a>
        <h1 class="text-xl font-black text-slate-900 tracking-tight">Leaderboard</h1>
      </header>

      <div class="p-4 max-w-3xl mx-auto space-y-6">

        @if (!isNative()) {
          <app-ad-placeholder type="banner" size="320x50" />
        }

        <!-- Info Card -->
        <div class="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 flex items-center justify-between gap-4 overflow-hidden relative group">
          <div class="relative z-10">
            <h3 class="text-lg font-black mb-1">Climb the Ranks!</h3>
            <p class="text-xs text-white/80 font-bold">Earn coins by completing quizzes to reach the top.</p>
          </div>
          <mat-icon class="!w-24 !h-24 !text-[96px] text-white/10 absolute -right-4 -bottom-4 translate-y-4 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">stars</mat-icon>
        </div>

        <!-- Top 3 Podium -->
        <div class="flex items-end justify-center gap-2 pt-8 pb-4">
          <!-- 2nd Place -->
          @if (topStudents().length > 1) {
            <div class="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-10 duration-700 delay-100">
              <div class="relative">
                <img ngSrc="{{topStudents()[1].photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + topStudents()[1].uid}}" 
                     alt="2nd Place"
                     width="64"
                     height="64"
                     class="rounded-2xl border-4 border-slate-300 shadow-lg object-cover" referrerpolicy="no-referrer">
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">2nd</div>
              </div>
              <div class="text-center">
                <p class="text-xs font-bold text-slate-700 truncate w-20">{{topStudents()[1].displayName}}</p>
                <p class="text-[10px] font-black text-indigo-600">{{topStudents()[1].coins || 0}} coins</p>
                <div class="flex items-center justify-center gap-0.5 mt-0.5">
                  <mat-icon class="!w-3 !h-3 !text-[12px] text-orange-500">local_fire_department</mat-icon>
                  <span class="text-[10px] font-black text-orange-600">{{topStudents()[1].streak || 0}}</span>
                </div>
              </div>
            </div>
          }

          <!-- 1st Place -->
          @if (topStudents().length > 0) {
            <div class="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-10 duration-700">
              <div class="relative">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                  <mat-icon class="text-amber-400 !w-8 !h-8 !text-[32px]">emoji_events</mat-icon>
                </div>
                <img ngSrc="{{topStudents()[0].photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + topStudents()[0].uid}}" 
                     alt="1st Place"
                     width="96"
                     height="96"
                     class="rounded-3xl border-4 border-amber-400 shadow-xl shadow-amber-200/50 object-cover" referrerpolicy="no-referrer">
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[12px] font-black px-3 py-1 rounded-full shadow-md">1st</div>
              </div>
              <div class="text-center">
                <p class="text-sm font-black text-slate-900 truncate w-24">{{topStudents()[0].displayName}}</p>
                <p class="text-xs font-black text-indigo-600">{{topStudents()[0].coins || 0}} coins</p>
                <div class="flex items-center justify-center gap-0.5 mt-0.5">
                  <mat-icon class="!w-4 !h-4 !text-[14px] text-orange-500">local_fire_department</mat-icon>
                  <span class="text-xs font-black text-orange-600">{{topStudents()[0].streak || 0}}</span>
                </div>
              </div>
            </div>
          }

          <!-- 3rd Place -->
          @if (topStudents().length > 2) {
            <div class="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-10 duration-700 delay-200">
              <div class="relative">
                <img ngSrc="{{topStudents()[2].photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + topStudents()[2].uid}}" 
                     alt="3rd Place"
                     width="64"
                     height="64"
                     class="rounded-2xl border-4 border-orange-300 shadow-lg object-cover" referrerpolicy="no-referrer">
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">3rd</div>
              </div>
              <div class="text-center">
                <p class="text-xs font-bold text-slate-700 truncate w-20">{{topStudents()[2].displayName}}</p>
                <p class="text-[10px] font-black text-indigo-600">{{topStudents()[2].coins || 0}} coins</p>
                <div class="flex items-center justify-center gap-0.5 mt-0.5">
                  <mat-icon class="!w-3 !h-3 !text-[12px] text-orange-500">local_fire_department</mat-icon>
                  <span class="text-[10px] font-black text-orange-600">{{topStudents()[2].streak || 0}}</span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Leaderboard List -->
        <div class="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-y-auto max-h-[400px]">
          <div class="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h2 class="text-sm font-black text-slate-500 uppercase tracking-widest">Global Ranking</h2>
            <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Top 100</span>
          </div>

          <div class="divide-y divide-slate-50">
            @for (student of topStudents(); track student.uid; let i = $index) {
              @if (i >= 3) {
                <!-- Ad Placeholder within leaderboard list -->
                @if (!isNative() && i > 3 && i % 10 === 0) {
                  <div class="p-2 border-b border-slate-50">
                    <app-ad-placeholder type="native-banner" />
                  </div>
                }

                <div class="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                  <div class="w-8 font-black text-slate-300 group-hover:text-indigo-400 transition-colors text-center text-sm">{{i + 1}}</div>
                  <img ngSrc="{{student.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.uid}}" 
                       alt="Student Avatar"
                       width="40"
                       height="40"
                       class="rounded-xl bg-slate-100 border border-slate-100 object-cover" referrerpolicy="no-referrer">
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-slate-900 truncate text-sm">{{student.displayName}}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{{student.coins || 0}} coins</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                    <mat-icon class="!w-3 !h-3 !text-[14px] text-orange-500">local_fire_department</mat-icon>
                    <span class="text-[10px] font-black text-orange-600">{{student.streak || 0}}</span>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Pagination / Load More -->
          @if (hasMore() && topStudents().length < 100) {
            <div class="p-4 bg-slate-50/50 border-t border-slate-50">
              <button (click)="loadMore()" 
                      [disabled]="isLoading()"
                      class="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                @if (isLoading()) {
                  <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                } @else {
                  <span>Load Next 25 Students</span>
                  <mat-icon class="text-[16px] !w-4 !h-4">expand_more</mat-icon>
                }
              </button>
            </div>
          }
        </div>

        @if (topStudents().length === 0 && !isLoading()) {
          <div class="text-center py-12">
            <mat-icon class="text-slate-200 !w-16 !h-16 !text-[64px] mb-4">emoji_events</mat-icon>
            <p class="text-slate-400 font-bold">No students found yet.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  topStudents = signal<UserProfile[]>([]);
  lastDoc = signal<unknown>(null);
  hasMore = signal(true);
  isLoading = signal(false);

  isNative = signal(false);

  async ngOnInit() {
    this.isNative.set(isPlatformBrowser(this.platformId) && (window as any).Capacitor?.isNativePlatform);
    
    await this.loadMore();
  }

  async loadMore() {
    if (this.isLoading() || !this.hasMore()) return;
    
    this.isLoading.set(true);
    const result = await this.dataService.getTopStudents(25, this.lastDoc());
    
    if (result.students.length < 25) {
      this.hasMore.set(false);
    }
    
    this.topStudents.update(current => [...current, ...result.students]);
    this.lastDoc.set(result.lastDoc);
    this.isLoading.set(false);
  }
}
