import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { GeminiService } from '../../core/services/gemini.service';
import { UnityAdsService } from '../../core/services/unity-ads.service';
import { MatIconModule } from '@angular/material/icon';
import { Timestamp } from 'firebase/firestore';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

interface Notification {
  id: string;
  title: string;
  content?: string;
  driveUrl?: string;
  type?: string;
  destination?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full bg-slate-50 relative flex flex-col overflow-hidden">
      <!-- Payment Success Message -->
      @if (paymentSuccess()) {
        <div class="fixed top-20 left-4 right-4 z-[60] animate-in slide-in-from-top-10 duration-500">
          <div class="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 backdrop-blur-md">
            <mat-icon class="text-emerald-100">check_circle</mat-icon>
            <p class="text-sm font-black tracking-tight">Payment successful! Your account has been upgraded to Pro.</p>
          </div>
        </div>
      }
      
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
          <div class="flex items-center gap-3">
            <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-sm hover:bg-white/20 transition-all active:scale-95">
              <mat-icon class="!w-6 !h-6 !text-[24px]">arrow_back</mat-icon>
            </a>
            <div class="flex flex-col">
              <div class="flex items-center gap-2.5">
                <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 drop-shadow-md">
                  <span class="bg-indigo-600 p-1.5 rounded-xl border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                    <mat-icon class="!w-5 !h-5 !text-[20px] text-white">school</mat-icon>
                  </span>
                  <span class="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">Educate MW</span>
                </h1>
                @if (authService.currentUser()?.isPro || authService.currentUser()?.role === 'admin') {
                  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 border border-amber-300/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse-once">
                    <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-amber-900 font-black">workspace_premium</mat-icon>
                    <span class="text-[9px] font-black text-amber-950 uppercase tracking-[0.1em] leading-none">PRO</span>
                  </div>
                }
              </div>
              <p class="text-xs font-semibold text-indigo-200/80 mt-1.5 pl-1.5 flex items-center gap-1.5 font-heading uppercase tracking-widest">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                Welcome, {{authService.currentUser()?.displayName?.split(' ')?.[0] || 'Student'}}
              </p>
            </div>
          </div>
          <button aria-label="Notifications" class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-sm hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
            <mat-icon class="!w-6 !h-6 !text-[24px]">notifications_none</mat-icon>
          </button>
        </div>

        <!-- Guest Banner -->
        @if (authService.currentUser()?.isGuest) {
          <div class="mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
            <div class="bg-amber-50 rounded-2xl p-4 shadow-sm border border-amber-200/80 flex items-center gap-4">
              <div class="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
                <mat-icon class="!w-5 !h-5 !text-[20px]">account_circle</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-black text-amber-900">Guest Account</h4>
                <p class="text-[10px] text-amber-700 font-bold mt-0.5">Create an account for 5 AI credits per day and to save your progress!</p>
              </div>
              <a routerLink="/login" aria-label="Sign up" class="bg-amber-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] shadow-sm active:scale-95 transition-all hover:scale-105">
                Sign Up
              </a>
            </div>
          </div>
        }

      <!-- Announcements Section -->
      @if (isLoading()) {
        <div class="mb-6 shrink-0">
          <app-skeleton className="w-full h-24 rounded-2xl"></app-skeleton>
        </div>
      } @else if (announcements().length > 0 && !isDismissed(announcements()[0].id)) {
        <div class="mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-all hover:scale-[1.01] active:scale-95" 
               (click)="viewNotification(announcements()[0])"
               (keydown.enter)="viewNotification(announcements()[0])"
               tabindex="0"
               role="button"
               aria-label="View announcement">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
              <mat-icon class="!w-5 !h-5 !text-[20px]">campaign</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-black text-slate-900 truncate">{{ announcements()[0].title }}</h4>
              <p class="text-xs text-slate-500 truncate mt-0.5">{{ announcements()[0].content }}</p>
            </div>
            <mat-icon class="text-slate-300 !w-5 !h-5 !text-[20px]">chevron_right</mat-icon>
          </div>
        </div>
      }

      <!-- App Updates Section (Fallback if no announcements) -->
      @if (!isLoading() && announcements().length === 0 && dataService.appUpdates().length > 0 && !isDismissed(dataService.appUpdates()[0].id)) {
        <div class="mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-all hover:scale-[1.01] active:scale-95" 
               (click)="viewNotification(dataService.appUpdates()[0])"
               (keydown.enter)="viewNotification(dataService.appUpdates()[0])"
               tabindex="0"
               role="button"
               aria-label="View update">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
              <mat-icon class="!w-5 !h-5 !text-[20px]">system_update</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-black text-slate-900 truncate">{{ dataService.appUpdates()[0].title }}</h4>
              <p class="text-xs text-slate-500 truncate mt-0.5">{{ dataService.appUpdates()[0].content }}</p>
            </div>
            <mat-icon class="text-slate-300 !w-5 !h-5 !text-[20px]">chevron_right</mat-icon>
          </div>
        </div>
      }

        <!-- Quick Actions Grid (Compact Sizing, 2 Columns) -->
        @if (isLoading()) {
          <div class="grid grid-cols-2 gap-3 mb-4 shrink-0">
            @for (i of [1, 2, 3, 4, 5, 6, 7]; track i) {
              <app-skeleton className="w-full h-28 rounded-2xl"></app-skeleton>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-3 mb-4 shrink-0">
            
            <!-- emi AI Tutor -->
            <a routerLink="/chat" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/30 relative z-10 group-hover:scale-105 transition-transform overflow-hidden">
                <img [src]="gemini.EMI_AVATAR" alt="emi AI" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits ?? 10) <= 0) {
                  <div class="absolute -top-1.5 -right-1.5 bg-slate-900 text-sky-400 p-1 rounded-lg border-2 border-white shadow-sm">
                    <mat-icon class="!w-3 !h-3 !text-[12px]">lock</mat-icon>
                  </div>
                }
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">emi AI Tutor</h3>
              <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Interactive learning</p>
            </a>

            <!-- Video Lessons -->
            <a routerLink="/video-lessons" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-rose-500/30 relative z-10 group-hover:scale-105 transition-transform">
                <mat-icon class="!w-6 !h-6 !text-[24px]">play_circle_outline</mat-icon>
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Video Lessons</h3>
              <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Visual tutorials</p>
            </a>

            <!-- Study Library -->
            <a routerLink="/notes" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30 relative z-10 group-hover:scale-105 transition-transform">
                <mat-icon class="!w-6 !h-6 !text-[24px]">library_books</mat-icon>
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Study Library</h3>
              <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Past papers & notes</p>
            </a>

            <!-- Practice Quizzes -->
            <a routerLink="/quizzes" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/30 relative z-10 group-hover:scale-105 transition-transform">
                <mat-icon class="!w-6 !h-6 !text-[24px]">quiz</mat-icon>
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Practice Quizzes</h3>
              <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Test your knowledge</p>
            </a>

            <!-- Exam Countdown -->
            <a routerLink="/exam-countdown" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 relative z-10 group-hover:scale-105 transition-transform">
                <mat-icon class="!w-6 !h-6 !text-[24px]">timer</mat-icon>
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Exam Dates</h3>
              <div class="mt-1 relative z-10">
                @let nextExam = getNextExam();
                @if (nextExam) {
                  <p class="text-blue-600 text-[10px] font-black uppercase tracking-tighter">{{ nextExam.name }} in {{ getExamDays(nextExam.date!) }} Days</p>
                } @else {
                  <p class="text-blue-600 text-[10px] font-black uppercase tracking-tighter">No Exams Scheduled</p>
                }
              </div>
            </a>

            <!-- Community Chat -->
            <a routerLink="/community" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/30 relative z-10 group-hover:scale-105 transition-transform">
                <mat-icon class="!w-6 !h-6 !text-[24px]">groups</mat-icon>
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Community Chat</h3>
              <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Live study discussion</p>
            </a>

            <!-- Career Guidance -->
            <a routerLink="/career-guidance" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/30 relative z-10 group-hover:scale-105 transition-transform">
                <mat-icon class="!w-6 !h-6 !text-[24px]">explore</mat-icon>
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Career Guidance</h3>
              <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">MSCE points calculator</p>
            </a>

            <!-- Flashcards -->
            <a routerLink="/flashcards" class="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md border border-slate-200/80 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-12 h-12 mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30 relative z-10 group-hover:scale-105 transition-transform">
                <mat-icon class="!w-6 !h-6 !text-[24px]">style</mat-icon>
              </div>
              <h3 class="font-bold text-xs text-slate-900 leading-tight relative z-10">Flashcards</h3>
              <p class="text-slate-500 text-[10px] font-medium mt-0.5 relative z-10">Master subjects</p>
            </a>
          </div>

          <!-- Recent Materials -->
          <div class="mb-8 shrink-0">
            <div class="flex items-center justify-between mb-4 px-1">
              <h3 class="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Recent Materials</h3>
              <a routerLink="/notes" class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">See All</a>
            </div>
            <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              @for (note of recentNotes(); track note.id) {
                <a [routerLink]="['/books', note.slug || note.id]" class="min-w-[200px] bg-white rounded-2xl p-4 border border-slate-200 shadow-sm snap-start hover:border-indigo-200 transition-all group">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <mat-icon class="!w-5 !h-5 !text-[20px]">description</mat-icon>
                  </div>
                  <h4 class="text-xs font-black text-slate-900 line-clamp-2 mb-1">{{ note.title }}</h4>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ note.category }}</p>
                </a>
              }
            </div>
          </div>
        }

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

        <!-- Ad Report Link -->
        <div class="mt-4 pb-8 flex justify-center">
          <a href="https://wa.me/265987066051?text=Hello%20Peter,%20I%20am%20reporting%20an%20ad%20I%20saw%20in%20Educate%20MW." 
             target="_blank"
             class="flex items-center gap-2 group transition-all">
            <mat-icon class="text-slate-300 group-hover:text-amber-500 !w-4 !h-4 !text-[16px] transition-colors">info_outline</mat-icon>
            <span class="text-[9px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-[0.15em] transition-colors">See an inappropriate ad? Report it</span>
          </a>
        </div>
      </div>

      <!-- Notification Detail Modal -->
      @if (selectedNotification()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
               (click)="selectedNotification.set(null)"
               (keydown.escape)="selectedNotification.set(null)"
               role="button"
               tabindex="0"
               aria-label="Close notification"></div>
          <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-8">
              <div class="flex items-center justify-between mb-6">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <mat-icon>{{ selectedNotification()?.type ? 'system_update' : 'campaign' }}</mat-icon>
                </div>
                <button (click)="selectedNotification.set(null)" class="text-slate-300 hover:text-slate-500 transition-colors">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              
              <h3 class="text-2xl font-black text-slate-900 tracking-tight mb-4">{{ selectedNotification()?.title }}</h3>
              <div class="max-h-60 overflow-y-auto custom-scrollbar mb-8">
                <p class="text-slate-600 leading-relaxed font-medium">{{ selectedNotification()?.content }}</p>
              </div>

              @if (selectedNotification()?.driveUrl) {
                <a [href]="selectedNotification()?.driveUrl" target="_blank" class="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 mb-4 hover:bg-indigo-700 transition-all">
                  <mat-icon>open_in_new</mat-icon>
                  View Attachment
                </a>
              }

              <div class="flex flex-col gap-3">
                <button (click)="selectedNotification.set(null)" class="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">
                  Close
                </button>
                <button (click)="dontShowAgain(selectedNotification()?.id || '')" class="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
                  Don't show this again
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  gemini = inject(GeminiService);
  dataService = inject(DataService);
  unityAdsService = inject(UnityAdsService);
  route = inject(ActivatedRoute);
  
  updateDismissed = signal(false);
  isLoading = signal(true);
  paymentSuccess = signal(false);
  selectedNotification = signal<Notification | null>(null);
  dismissedIds = signal<string[]>([]);

  announcements = computed(() => {
    return this.dataService.notes().filter(note => note.destination === 'announcements');
  });

  recentNotes = computed(() => {
    return this.dataService.notes()
      .filter(note => note.destination === 'notes' || note.destination === 'past-papers' || !note.destination)
      .sort((a, b) => {
        const dateA = this.toDate(a.createdAt)?.getTime() || 0;
        const dateB = this.toDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  });

  ngOnInit() {
    this.unityAdsService.showBanner();
    this.dataService.subscribeToAppUpdates();
    this.dataService.subscribeToExamDates();
    this.dataService.subscribeToNotes();
    
    // Load dismissed notifications
    const saved = localStorage.getItem('dismissed_notifications');
    if (saved) {
      this.dismissedIds.set(JSON.parse(saved));
    }
    
    // Simulate loading for demonstration
    setTimeout(() => this.isLoading.set(false), 1000);
    
    // Check for payment success
    this.route.queryParams.subscribe(async params => {
      if (params['payment'] === 'success') {
        this.paymentSuccess.set(true);
        
        // Auto-verify payment status with backend
        try {
          const user = this.authService.currentUser();
          if (user) {
            const response = await fetch(`/api/paychangu/verify?tx_ref=${params['tx_ref'] || ''}`);
            const data = await response.json();
            
            if (data.status === 'success') {
              // Force refresh user state
              this.authService.currentUser.update(u => u ? { ...u, isPro: true } : null);
            }
          }
        } catch (error) {
          console.error('Auto-verification failed:', error);
        }

        // Clear message after 5 seconds
        setTimeout(() => this.paymentSuccess.set(false), 5000);
      } else if (params['payment'] === 'failed' || params['payment'] === 'cancelled') {
        // Handle failed/cancelled payment
        console.warn('Payment was not successful:', params['payment']);
        // Optionally show a message to the user
      }
    });
  }

  officialExams = [
    { name: 'MSCE', date: new Date('2026-06-29T08:00:00') },
    { name: 'JCE', date: new Date('2026-06-01T08:00:00') },
    { name: 'PSLCE', date: new Date('2026-06-08T08:00:00') }
  ];

  getNextExam() {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const customExams = this.dataService.examDates().map(e => ({
      name: e.subject,
      date: this.toDate(e.date)
    }));

    const allExams = [...this.officialExams, ...customExams]
      .filter(e => e.date && e.date.getTime() >= now.getTime())
      .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

    return allExams.length > 0 ? allExams[0] : null;
  }

  ngOnDestroy() {
    this.unityAdsService.hideBanner();
    this.dataService.unsubscribeFromAppUpdates();
    this.dataService.unsubscribeFromExamDates();
    this.dataService.unsubscribeFromNotes();
  }

  dismissUpdate() {
    this.updateDismissed.set(true);
  }

  viewNotification(notif: Notification) {
    this.selectedNotification.set(notif);
  }

  isDismissed(id: string) {
    return this.dismissedIds().includes(id);
  }

  dontShowAgain(id: string) {
    const current = this.dismissedIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      this.dismissedIds.set(updated);
      localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
    }
    this.selectedNotification.set(null);
  }

  getExamDays(date: Date | Timestamp | string): number {
    const examDate = this.toDate(date);
    if (!examDate) return 0;
    const diff = examDate.getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  toDate(date: Date | Timestamp | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  }
}
