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
        <div class="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
          
          <!-- Top App Bar -->
          @if (router.url !== '/chat' && router.url !== '/quizzes' && router.url !== '/notes' && router.url !== '/flashcards') {
            <header class="bg-white/80 backdrop-blur-xl border-b border-slate-200 h-20 flex-shrink-0 flex items-center justify-between px-6 z-30 pt-safe">
              <div class="flex items-center gap-4">
                <button (click)="toggleMenu()" class="w-14 h-14 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all group">
                  <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <mat-icon class="scale-110">menu</mat-icon>
                  </div>
                </button>
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
          }

          <!-- Main Content Area -->
          <main class="flex-1 overflow-hidden relative pb-safe">
            @if (router.url === '/chat' || router.url === '/quizzes' || router.url === '/notes' || router.url === '/flashcards') {
              <button (click)="toggleMenu()" class="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-white/20 flex items-center justify-center text-slate-900 hover:bg-white transition-all active:scale-90">
                <mat-icon>menu</mat-icon>
              </button>
            }
            <router-outlet></router-outlet>
          </main>

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
          <aside class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col pt-safe"
                 [class.translate-x-0]="isMobileMenuOpen()"
                 [class.-translate-x-full]="!isMobileMenuOpen()">
            
            <!-- Swipe/Toggle Handle -->
            <button (click)="closeMenu()" class="absolute top-1/2 -right-4 w-8 h-20 bg-white border border-slate-200 rounded-r-3xl shadow-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all z-50 group">
              <mat-icon class="group-hover:-translate-x-1 transition-transform">chevron_left</mat-icon>
            </button>
            
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-md ring-1 ring-slate-200" referrerpolicy="no-referrer">
                  @if (authService.currentUser()?.isPro) {
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-sky-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <mat-icon class="text-[10px] !w-[10px] !h-[10px]">workspace_premium</mat-icon>
                    </div>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-base font-bold text-slate-900 truncate">{{authService.currentUser()?.displayName}}</p>
                  <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{{authService.currentUser()?.role}}</p>
                </div>
              </div>
              <button (click)="closeMenu()" class="w-8 h-8 flex items-center justify-center text-slate-400 rounded-xl hover:bg-slate-200 transition-colors">
                <mat-icon class="text-[20px]">close</mat-icon>
              </button>
            </div>
            
            <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
              <div class="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Navigation</div>
              
              <a routerLink="/" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-200" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-4 px-4 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all group">
                <mat-icon [class.text-white]="router.url === '/'" class="group-hover:scale-110 transition-transform">dashboard</mat-icon>
                <span class="text-[15px]">Dashboard</span>
              </a>
              
              <a routerLink="/chat" (click)="closeMenu()" routerLinkActive="bg-slate-900 text-white shadow-xl shadow-slate-200" class="flex items-center gap-4 px-4 py-4 text-slate-600 font-black rounded-[1.5rem] hover:bg-slate-50 transition-all group relative overflow-hidden border border-transparent hover:border-indigo-100">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm" [class.bg-indigo-500]="router.url.includes('/chat')" [class.text-white]="router.url.includes('/chat')">
                  <mat-icon class="scale-90 group-hover:animate-pulse">auto_awesome</mat-icon>
                </div>
                <div class="flex flex-col">
                  <span class="text-[15px] leading-none">Cleo AI</span>
                  <span class="text-[9px] uppercase tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors mt-1">Intelligent Tutor</span>
                </div>
                @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits ?? 5) <= 0) {
                  <mat-icon class="text-amber-500 text-sm ml-auto">lock</mat-icon>
                } @else {
                  <div class="ml-auto flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  </div>
                }
              </a>

              <div class="px-4 pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning</div>
              
              <a routerLink="/notes" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all group">
                <mat-icon [class.text-white]="router.url.includes('/notes')" class="group-hover:scale-110 transition-transform">library_books</mat-icon>
                <span class="text-[15px]">Library & Papers</span>
              </a>
              
              <a routerLink="/quizzes" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all group">
                <mat-icon [class.text-white]="router.url.includes('/quizzes')" class="group-hover:scale-110 transition-transform">quiz</mat-icon>
                <span class="text-[15px]">Quizzes</span>
              </a>

              <a routerLink="/flashcards" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all group">
                <mat-icon [class.text-white]="router.url.includes('/flashcards')" class="group-hover:scale-110 transition-transform">style</mat-icon>
                <span class="text-[15px]">Flashcards</span>
              </a>
              
              <a routerLink="/community" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all group">
                <mat-icon [class.text-white]="router.url.includes('/community')" class="group-hover:scale-110 transition-transform">forum</mat-icon>
                <span class="text-[15px]">Community</span>
              </a>
              
              <a routerLink="/career-guidance" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all group">
                <mat-icon [class.text-white]="router.url.includes('/career-guidance')" class="group-hover:scale-110 transition-transform">explore</mat-icon>
                <span class="text-[15px]">Career Guidance</span>
              </a>

              <div class="px-4 pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account</div>
              
              <a routerLink="/upgrade" (click)="closeMenu()" routerLinkActive="bg-amber-500 text-white shadow-lg shadow-amber-200" class="flex items-center gap-4 px-4 py-3.5 text-amber-600 font-black rounded-2xl hover:bg-amber-50 transition-all group border border-amber-100">
                <mat-icon [class.text-white]="router.url.includes('/upgrade')" class="group-hover:scale-110 transition-transform">workspace_premium</mat-icon>
                <span class="text-[15px]">Buy Premium</span>
              </a>

              <a routerLink="/settings" (click)="closeMenu()" routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all group">
                <mat-icon [class.text-white]="router.url.includes('/settings')" class="group-hover:scale-110 transition-transform">settings</mat-icon>
                <span class="text-[15px]">Settings</span>
              </a>
            </nav>
            
            <div class="p-6 border-t border-slate-100 pb-safe">
              <button (click)="logout()" class="w-full py-4 text-[15px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all flex items-center justify-center group">
                <mat-icon class="text-[20px] !w-[20px] !h-[20px] mr-3 group-hover:rotate-12 transition-transform">logout</mat-icon>
                Sign Out
              </button>
            </div>
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

  logout() {
    this.closeMenu();
    this.authService.logout();
  }
}
