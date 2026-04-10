import {ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {RouterOutlet, RouterLink, RouterLinkActive, Router} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    @if (!authService.isAuthReady()) {
      <div class="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
        <!-- Animated Background Orbs -->
        <div class="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-sky-500/5 blur-[120px] animate-pulse" style="animation-delay: 1s"></div>
        
        <div class="relative z-10 flex flex-col items-center">
          <!-- Logo with Pulse Effect -->
          <div class="relative mb-8">
            <div class="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl animate-ping"></div>
            <div class="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 relative z-10">
              <mat-icon class="!w-12 !h-12 !text-[48px]">school</mat-icon>
            </div>
          </div>
          
          <h2 class="text-3xl font-black text-slate-900 tracking-tight mb-2">EduMalawi</h2>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
          </div>
          <p class="text-slate-400 text-sm font-bold uppercase tracking-widest mt-6">Preparing your workspace</p>
        </div>
      </div>
    } @else {
      @if (authService.currentUser()) {
        <div class="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
          
          <!-- Top App Bar -->
          <header class="bg-white/80 backdrop-blur-xl border-b border-slate-200 h-20 flex-shrink-0 flex items-center justify-between px-6 z-30 pt-safe">
            <div class="flex items-center gap-4">
              @if (router.url === '/') {
                <button (click)="toggleMenu()" class="w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all group">
                  <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <mat-icon class="scale-90">menu</mat-icon>
                  </div>
                </button>
              } @else {
                <button (click)="goBack()" class="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-all active:scale-90">
                  <mat-icon>arrow_back</mat-icon>
                </button>
              }
              <div class="flex flex-col">
                <h1 class="text-xl font-black text-slate-900 tracking-tight leading-none">
                  EduMalawi
                </h1>
                <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Learning Hub</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              @if (authService.currentUser()?.isPro) {
                <div class="hidden md:flex items-center gap-1 bg-sky-50 text-sky-600 px-3 py-1 rounded-full border border-sky-100 text-[10px] font-black uppercase tracking-wider">
                  <mat-icon class="text-[14px] !w-[14px] !h-[14px]">workspace_premium</mat-icon>
                  Pro Member
                </div>
              }
              <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-9 h-9 rounded-2xl bg-slate-200 border-2 border-white shadow-sm ring-1 ring-slate-200" referrerpolicy="no-referrer">
            </div>
          </header>

          <!-- Main Content Area -->
          <main class="flex-1 overflow-hidden relative pb-safe" [class.pb-24]="router.url === '/'">
            <router-outlet></router-outlet>
          </main>

          <!-- Bottom Navigation (Home Screen Only) -->
          @if (router.url === '/' && !isNavHidden()) {
            <nav class="fixed bottom-0 left-0 right-0 h-20 bg-slate-900/95 backdrop-blur-xl z-40 flex items-center justify-around px-2 border-t border-white/10 animate-in slide-in-from-bottom-full duration-300">
              <a routerLink="/" (click)="hideNav()" routerLinkActive="text-indigo-400" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 p-3 transition-all text-slate-400">
                <mat-icon>home</mat-icon>
                <span class="text-[10px] font-bold uppercase tracking-tighter">Home</span>
              </a>
              <a routerLink="/chat" (click)="hideNav()" routerLinkActive="text-indigo-400" class="flex flex-col items-center gap-1 p-3 transition-all text-slate-400">
                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <mat-icon class="!w-4 !h-4 !text-[16px]">auto_awesome</mat-icon>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-tighter">Cleo AI</span>
              </a>
              <a routerLink="/community" (click)="hideNav()" routerLinkActive="text-indigo-400" class="flex flex-col items-center gap-1 p-3 transition-all text-slate-400">
                <mat-icon>people</mat-icon>
                <span class="text-[10px] font-bold uppercase tracking-tighter">Forum</span>
              </a>
              <a routerLink="/settings" (click)="hideNav()" routerLinkActive="text-indigo-400" class="flex flex-col items-center gap-1 p-3 transition-all text-slate-400">
                <mat-icon>person</mat-icon>
                <span class="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
              </a>
            </nav>
          }

          <!-- Mobile Drawer Overlay -->
          @if (isMobileMenuOpen()) {
            <div class="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-opacity duration-300" 
                 (click)="closeMenu()" 
                 (keydown.escape)="closeMenu()" 
                 role="button" 
                 tabindex="0" 
                 aria-label="Close menu"></div>
          }
          
          <!-- Slide-over Sidebar Menu -->
          <aside class="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col pt-safe border-r border-white/5"
                 [class.translate-x-0]="isMobileMenuOpen()"
                 [class.-translate-x-full]="!isMobileMenuOpen()">
            
            <!-- Sidebar Header -->
            <div class="px-6 py-6 flex items-center justify-between border-b border-white/5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <mat-icon class="!w-6 !h-6 !text-[24px]">school</mat-icon>
                </div>
                <div class="flex flex-col">
                  <h2 class="text-lg font-black text-white tracking-tight leading-none">EduMalawi</h2>
                  <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Learning Hub</span>
                </div>
              </div>
              <button (click)="closeMenu()" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors">
                <mat-icon class="!w-5 !h-5 !text-[20px]">close</mat-icon>
              </button>
            </div>

            <!-- User Profile Section -->
            <div class="p-6">
              @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                <a routerLink="/upgrade" (click)="closeMenu()" class="flex flex-col items-center justify-center gap-1 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black shadow-xl shadow-amber-900/20 hover:scale-[1.02] transition-all active:scale-[0.98] mb-2">
                  <div class="flex items-center gap-1">
                    <mat-icon class="scale-75">bolt</mat-icon>
                    <span class="text-sm">Upgrade to Pro</span>
                  </div>
                  <span class="text-[9px] opacity-90 font-bold">K5000 once till exams</span>
                </a>
              }
            </div>
            
            <!-- Navigation Items -->
            <nav class="flex-1 px-4 space-y-1 overflow-y-auto pb-10 custom-scrollbar">
              <a routerLink="/" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">home</mat-icon>
                <span class="text-sm">Dashboard</span>
              </a>
              
              <a routerLink="/video-lessons" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">play_circle_outline</mat-icon>
                <span class="text-sm">Video Lessons</span>
              </a>

              <a routerLink="/notes" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">menu_book</mat-icon>
                <span class="text-sm">Past Papers</span>
              </a>

              <a routerLink="/quizzes" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">help_outline</mat-icon>
                <span class="text-sm">Quizzes</span>
              </a>

              <a routerLink="/flashcards" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">layers</mat-icon>
                <span class="text-sm">Flashcards</span>
              </a>

              <a routerLink="/study-plan" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">access_time</mat-icon>
                <span class="text-sm">Study Plan</span>
              </a>

              <a routerLink="/leaderboard" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">emoji_events</mat-icon>
                <span class="text-sm">Leaderboard</span>
              </a>

              <a routerLink="/exam-countdown" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">calendar_today</mat-icon>
                <span class="text-sm">Exam Countdown</span>
              </a>

              <a routerLink="/community" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">people_outline</mat-icon>
                <span class="text-sm">Community</span>
              </a>

              <a routerLink="/premium-students" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">star_outline</mat-icon>
                <span class="text-sm">Premium Students</span>
              </a>

              <a routerLink="/timetable" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">calendar_month</mat-icon>
                <span class="text-sm">Student Timetable</span>
              </a>

              <a routerLink="/chat" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <div class="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <mat-icon class="!w-3 !h-3 !text-[12px]">auto_awesome</mat-icon>
                </div>
                <span class="text-sm">Cleo AI Assistant</span>
              </a>

              @if (authService.currentUser()?.role === 'admin') {
                <a routerLink="/admin" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                  <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">admin_panel_settings</mat-icon>
                  <span class="text-sm">Admin Dashboard</span>
                </a>
              }

              <div class="pt-4 mt-4 border-t border-white/5">
                <a routerLink="/settings" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                  <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">settings</mat-icon>
                  <span class="text-sm">Settings</span>
                </a>

                <div class="flex items-center gap-6 px-4 py-4">
                  <a routerLink="/terms" (click)="closeMenu()" class="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">Terms</a>
                  <a routerLink="/privacy" (click)="closeMenu()" class="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">Privacy</a>
                </div>

                <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 text-rose-400 font-bold rounded-xl hover:bg-rose-500/10 transition-all group">
                  <mat-icon class="!w-5 !h-5 !text-[20px]">logout</mat-icon>
                  <span class="text-sm">Logout</span>
                </button>
              </div>
            </nav>
          </aside>
          
          <!-- PWA Install Popup -->
          @if (showInstallPopup()) {
            <div class="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[100] animate-in slide-in-from-bottom-10 duration-500">
              <div class="bg-white rounded-[2rem] shadow-2xl border border-indigo-100 p-6 flex flex-col gap-4 relative overflow-hidden">
                <!-- Decorative background -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div class="flex items-start gap-4 relative z-10">
                  <div class="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                    <mat-icon class="!w-8 !h-8 !text-[32px]">install_mobile</mat-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-lg font-black text-slate-900 leading-tight">Install EduMalawi</h4>
                    <p class="text-sm text-slate-500 font-medium mt-1">Get 10 FREE AI Credits instantly when you install our app!</p>
                  </div>
                  <button (click)="showInstallPopup.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
                    <mat-icon class="text-[20px]">close</mat-icon>
                  </button>
                </div>
                
                <div class="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 relative z-10">
                  <mat-icon class="text-indigo-600 text-sm">stars</mat-icon>
                  <span class="text-[11px] font-black text-indigo-700 uppercase tracking-wider">+10 AI Credits Reward</span>
                </div>
                
                <button (click)="installPwa()" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all relative z-10">
                  Install & Claim Reward
                </button>
              </div>
            </div>
          }
          
        </div>
      } @else {
        <router-outlet></router-outlet>
      }
    }
  `,
})
export class App {
  authService = inject(AuthService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  isMobileMenuOpen = signal(false);
  isNavHidden = signal(false);
  isControlsHidden = signal(false);
  deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);
  showInstallPopup = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.deferredPrompt.set(e as BeforeInstallPromptEvent);
        // Update UI notify the user they can install the PWA
        if (this.authService.currentUser() && !this.authService.currentUser()?.pwaInstalled) {
          this.showInstallPopup.set(true);
        }
      });

      window.addEventListener('appinstalled', () => {
        // Log install to analytics
        console.log('INSTALL: Success');
        this.deferredPrompt.set(null);
        this.showInstallPopup.set(false);
        this.authService.claimPwaReward();
      });
    }
  }

  toggleMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }

  goBack() {
    window.history.back();
  }

  async installPwa() {
    const prompt = this.deferredPrompt();
    if (!prompt) return;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      this.showInstallPopup.set(false);
    }
    this.deferredPrompt.set(null);
  }

  hideNav() {
    this.isNavHidden.set(true);
    // Reset after a short delay to allow it to reappear when returning to home
    setTimeout(() => this.isNavHidden.set(false), 500);
  }

  logout() {
    this.closeMenu();
    this.authService.logout();
  }
}
