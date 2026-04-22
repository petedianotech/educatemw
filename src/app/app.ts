import {ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal, OnInit} from '@angular/core';
import {isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {RouterOutlet, RouterLink, RouterLinkActive, Router} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {LoadingService} from './core/services/loading.service';
import {DataService} from './core/services/data.service';
import {GeminiService} from './core/services/gemini.service';
import {ThemeService} from './core/services/theme.service';
import {MatIconModule} from '@angular/material/icon';
import { ErrorToastComponent } from './shared/components/error-toast/error-toast.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, ErrorToastComponent, NgOptimizedImage],
  template: `
    <app-error-toast></app-error-toast>
    @if (loadingService.isLoading() || !authService.isAuthReady()) {
      <div class="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
        <!-- Animated Background Orbs -->
        <div class="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style="animation-delay: 1.5s"></div>
        
        <div class="relative z-10 flex flex-col items-center w-full max-w-xs">
          <!-- Logo with Catching Animation -->
          <div class="relative mb-12 group">
            <!-- Outer Glow -->
            <div class="absolute inset-0 bg-indigo-500/40 rounded-2xl blur-2xl animate-pulse group-hover:blur-3xl transition-all duration-700"></div>
            
            <!-- Main Logo Box -->
            <div class="w-24 h-24 bg-gradient-to-tr from-indigo-600 via-blue-500 to-sky-400 rounded-2xl flex items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] relative z-10 animate-in zoom-in duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)">
              <mat-icon class="!w-12 !h-12 !text-[48px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">school</mat-icon>
            </div>
            
            <!-- Orbiting Dots -->
            <div class="absolute inset-0 animate-spin-slow pointer-events-none">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)]"></div>
            </div>
          </div>
          
          <div class="text-center space-y-6 w-full">
            <h2 class="text-4xl font-black text-white tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
              Educate <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">MW</span>
            </h2>
            
            <!-- Progress Bar -->
            <div class="space-y-3 w-full px-4">
              <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div class="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                     [style.width.%]="loadingService.progress()"></div>
              </div>
              <div class="flex justify-center items-center">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
                  {{ loadingService.loadingText() }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bottom Branding -->
        <div class="absolute bottom-12 left-0 right-0 flex flex-col items-center animate-in fade-in duration-1000 delay-1000">
          <div class="h-[1px] w-12 bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-4"></div>
          <p class="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Malawi's Digital Classroom</p>
        </div>
      </div>
    } @else {
      @if (authService.currentUser() && router.url !== '/') {
        <div class="flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
          
          <!-- Floating Action Buttons (Top Left) -->
          <div class="absolute top-safe left-4 mt-4 z-40 flex gap-2">
            @if (router.url === '/dashboard') {
              <button (click)="toggleMenu()" class="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border border-white/20 dark:border-white/5 flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 active:scale-95 transition-all group">
                <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <mat-icon class="scale-90">menu</mat-icon>
                </div>
              </button>
            }
          </div>

          <!-- Main Content Area -->
          <main class="flex-1 overflow-hidden relative transition-colors duration-500" [class.pb-[calc(env(safe-area-inset-bottom)+4.5rem)]]="router.url === '/dashboard'">
            
            <!-- Daily Reward Message -->
            @if (authService.rewardMessage()) {
              <div class="fixed top-20 left-4 right-4 z-[60] animate-in slide-in-from-top-10 duration-500">
                <div class="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 backdrop-blur-md">
                  <mat-icon class="text-emerald-100">card_giftcard</mat-icon>
                  <p class="text-sm font-black tracking-tight">{{authService.rewardMessage()}}</p>
                </div>
              </div>
            }

            <!-- Floating Download Reward Banner -->
            @if (dataService.appSettings().isAppOfferActive && authService.currentUser() && !isBannerDismissed() && router.url === '/dashboard') {
              <div class="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 duration-700">
                <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-[2rem] p-5 shadow-2xl border border-white/20 relative overflow-hidden group">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  
                  <button (click)="isBannerDismissed.set(true)" class="absolute top-3 right-3 text-white/60 hover:text-white transition-colors z-10 p-1">
                    <mat-icon class="!w-4 !h-4 !text-[16px]">close</mat-icon>
                  </button>
                  
                  <div class="flex items-center gap-4 relative z-10">
                    <div class="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                      <mat-icon class="!w-7 !h-7 !text-[28px]">install_mobile</mat-icon>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-base font-black text-white leading-tight">Install App (PWA)</h4>
                      <p class="text-[10px] text-white/80 font-medium mt-1 leading-tight">Install our app for a faster, better experience.</p>
                    </div>
                    <button (click)="installPwa()" class="bg-white text-indigo-700 px-5 py-3 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all hover:scale-105 hover:bg-slate-50">
                      Install
                    </button>
                  </div>
                </div>
              </div>
            }
            <router-outlet></router-outlet>
          </main>

          <!-- TikTok Style Bottom Navigation (Only on Dashboard) -->
          @if (router.url === '/dashboard') {
            <nav class="fixed bottom-0 left-0 right-0 z-50 bg-slate-950 dark:bg-black border-t border-white/10 flex items-center justify-around pt-2 pb-[env(safe-area-inset-bottom)] px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-300">
              
              <!-- Home -->
              <a routerLink="/dashboard" routerLinkActive="text-white" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-slate-300 transition-all active:scale-90 group">
                <mat-icon class="!w-6 !h-6 !text-[24px]" routerLinkActive="text-white">home</mat-icon>
                <span class="text-[10px] font-bold tracking-wide" routerLinkActive="text-white">Home</span>
              </a>

              <!-- Library -->
              <a routerLink="/notes" routerLinkActive="text-white" class="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-slate-300 transition-all active:scale-90 group">
                <mat-icon class="!w-6 !h-6 !text-[24px]" routerLinkActive="text-white">library_books</mat-icon>
                <span class="text-[10px] font-bold tracking-wide" routerLinkActive="text-white">Library</span>
              </a>

              <!-- emi AI (Center, Prominent) -->
              <div class="relative -top-1">
                <a routerLink="/chat" class="flex flex-col items-center justify-center gap-1 transition-all active:scale-90 group">
                   <div class="relative flex items-center justify-center w-12 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 border-2 border-white/20 group-hover:scale-105 transition-transform overflow-hidden font-black">
                    <img [src]="gemini.EMI_AVATAR" alt="emi AI" class="w-full h-full object-cover avatar-integrated" referrerpolicy="no-referrer">
                  </div>
                  <span class="text-[10px] font-black tracking-wide text-blue-500">emi AI</span>
                </a>
              </div>

              <!-- Quizzes -->
              <a routerLink="/quizzes" routerLinkActive="text-white" class="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-slate-300 transition-all active:scale-90 group">
                <mat-icon class="!w-6 !h-6 !text-[24px]" routerLinkActive="text-white">quiz</mat-icon>
                <span class="text-[10px] font-bold tracking-wide" routerLinkActive="text-white">Quizzes</span>
              </a>

              <!-- Profile -->
              <a routerLink="/profile" routerLinkActive="text-white" class="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 hover:text-slate-300 transition-all active:scale-90 group">
                <mat-icon class="!w-6 !h-6 !text-[24px]" routerLinkActive="text-white">account_circle</mat-icon>
                <span class="text-[10px] font-bold tracking-wide" routerLinkActive="text-white">Profile</span>
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
          <aside class="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 dark:bg-black shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col pt-safe border-r border-white/5"
                 [class.translate-x-0]="isMobileMenuOpen()"
                 [class.-translate-x-full]="!isMobileMenuOpen()">
            
            <!-- Sidebar Header -->
            <div class="px-6 py-6 flex items-center justify-between border-b border-white/5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <mat-icon class="!w-6 !h-6 !text-[24px]">school</mat-icon>
                </div>
                <div class="flex flex-col">
                  <h2 class="text-lg font-black text-white tracking-tight leading-none">Educate MW</h2>
                  <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Learning Hub</span>
                </div>
              </div>
              <button (click)="closeMenu()" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors">
                <mat-icon class="!w-5 !h-5 !text-[20px]">close</mat-icon>
              </button>
            </div>

            <!-- User Profile Section -->
            <div class="p-6 border-b border-white/5">
              <div class="flex items-center gap-3 mb-4">
                <div class="relative group">
                  <img ngSrc="{{authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid}}" 
                       alt="Profile" 
                       width="48" 
                       height="48" 
                       class="rounded-2xl bg-slate-800 border-2 border-white/10 cursor-pointer hover:brightness-110 transition-all" 
                       (click)="sideFileInput.click()"
                       (keydown.enter)="sideFileInput.click()"
                       tabindex="0"
                       role="button"
                       referrerpolicy="no-referrer">
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-md flex items-center justify-center shadow-lg border border-white/20 pointer-events-none">
                    <mat-icon class="!w-3 !h-3 !text-[12px]">camera_alt</mat-icon>
                  </div>
                  <input type="file" #sideFileInput (change)="onSideFileSelected($event)" accept="image/*" class="hidden">
                </div>
                <div class="flex flex-col">
                  <h3 class="text-white font-bold leading-tight">{{authService.currentUser()?.displayName}}</h3>
                  <span class="text-[10px] text-slate-400 truncate w-32">{{authService.currentUser()?.email}}</span>
                </div>
              </div>
              @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                <a routerLink="/upgrade" (click)="closeMenu()" class="flex flex-col items-center justify-center gap-1 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black shadow-xl shadow-amber-900/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
                  <div class="flex items-center gap-1">
                    <mat-icon class="scale-75">bolt</mat-icon>
                    <span class="text-sm">Upgrade to Pro</span>
                  </div>
                </a>
              }
            </div>
            
            <!-- Navigation Items -->
            <nav class="flex-1 px-4 space-y-1 overflow-y-auto pb-10 custom-scrollbar">
              <a routerLink="/dashboard" (click)="closeMenu()" (keydown.enter)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">home</mat-icon>
                <span class="text-sm">Dashboard</span>
              </a>
              
              <a routerLink="/video-lessons" (click)="closeMenu()" (keydown.enter)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">play_circle_outline</mat-icon>
                <span class="text-sm">Video Lessons</span>
              </a>

              <a routerLink="/notes" (click)="closeMenu()" (keydown.enter)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">menu_book</mat-icon>
                <span class="text-sm">Past Papers</span>
              </a>

              <a routerLink="/quizzes" (click)="closeMenu()" (keydown.enter)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">help_outline</mat-icon>
                <span class="text-sm">Quizzes</span>
              </a>

              <a routerLink="/flashcards" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">layers</mat-icon>
                <span class="text-sm">Flashcards</span>
              </a>
              
              <a routerLink="/dictionary" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">menu_book</mat-icon>
                <span class="text-sm">Dictionary</span>
              </a>

              <a routerLink="/leaderboard" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">emoji_events</mat-icon>
                <span class="text-sm">Leaderboard</span>
              </a>

              <a routerLink="/community" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">people_outline</mat-icon>
                <span class="text-sm">Forum</span>
              </a>

              <a routerLink="/premium-students" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">star_outline</mat-icon>
                <span class="text-sm">Premium Students</span>
              </a>

              <a routerLink="/chat" (click)="closeMenu()" routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                <div class="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
                  <img [src]="gemini.EMI_AVATAR" alt="emi AI" class="w-full h-full object-cover avatar-integrated" referrerpolicy="no-referrer">
                </div>
                <span class="text-sm">emi AI Assistant</span>
              </a>

              <div class="pt-4 mt-4 border-t border-white/5">
                <p class="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">My Account</p>
                <a routerLink="/settings" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                  <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">settings</mat-icon>
                  <span class="text-sm">App Settings</span>
                </a>
                @if (authService.currentUser()?.role === 'admin') {
                  <a routerLink="/admin" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" class="flex items-center gap-3 px-4 py-3 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-all group">
                    <mat-icon class="!w-5 !h-5 !text-[20px] group-hover:text-indigo-400 transition-colors">admin_panel_settings</mat-icon>
                    <span class="text-sm">Admin Dashboard</span>
                  </a>
                }
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
                    <h4 class="text-lg font-black text-slate-900 leading-tight">Install Educate MW</h4>
                    <p class="text-sm text-slate-500 font-medium mt-1">Install our app for a faster and easier access to learning materials!</p>
                  </div>
                  <button (click)="showInstallPopup.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
                    <mat-icon class="text-[20px]">close</mat-icon>
                  </button>
                </div>
                
                <button (click)="installPwa()" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all relative z-10">
                  Install Now
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
export class App implements OnInit {
  authService = inject(AuthService);
  gemini = inject(GeminiService);
  loadingService = inject(LoadingService);
  dataService = inject(DataService);
  router = inject(Router);
  themeService = inject(ThemeService);
  platformId = inject(PLATFORM_ID);
  isMobileMenuOpen = signal(false);
  isControlsHidden = signal(false);
  isBannerDismissed = signal(false);
  deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);
  showInstallPopup = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
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
        // Reward disabled by user request
        // this.authService.claimPwaReward();
      });
    }
  }

  ngOnInit() {
    this.loadingService.simulateLoading();
    this.dataService.subscribeToSettings();
  }

  toggleMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }

  goBack() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.authService.currentUser() ? '/dashboard' : '/']);
    }
  }

  async installPwa() {
    const prompt = this.deferredPrompt();
    if (!prompt) {
       // Fallback message if they aren't on a compatible browser
       alert("Your browser currently doesn't support direct installation or the app is already installed.");
       this.isBannerDismissed.set(true);
       return;
    }

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      this.showInstallPopup.set(false);
      this.isBannerDismissed.set(true);
    }
    this.deferredPrompt.set(null);
  }

  async downloadAndReward() {
    // Deprecated for now, using PWA install instead without rewards.
    this.installPwa();
  }

  async onSideFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      await this.authService.uploadProfilePicture(file);
    } catch (error) {
      console.error('Failed to upload profile picture from sidebar', error);
    }
  }

  logout() {
    this.closeMenu();
    this.authService.logout();
  }
}
