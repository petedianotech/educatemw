import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive, Router} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    @if (!authService.isAuthReady()) {
      <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-400/10 blur-[100px] pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col items-center">
          <div class="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-6">
            <mat-icon class="!w-10 !h-10 !text-[40px]">school</mat-icon>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight relative z-10">EduMalawi</h2>
        <p class="text-slate-500 font-medium mt-2 relative z-10 animate-pulse">Loading your learning ecosystem...</p>
        
        <div class="mt-8 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden relative z-10">
          <div class="h-full bg-indigo-500 rounded-full w-1/2 animate-pulse"></div>
        </div>
      </div>
    } @else {
      @if (authService.currentUser()) {
        <div class="flex flex-col h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden relative">
          
          <!-- Top App Bar (Mobile First) -->
          <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex-shrink-0 flex items-center justify-between px-4 z-30 pt-safe">
            <div class="flex items-center gap-3">
              <button (click)="toggleMenu()" class="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors">
                <mat-icon>menu</mat-icon>
              </button>
              <h1 class="text-xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
                EduMalawi
              </h1>
            </div>
            <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-9 h-9 rounded-full bg-slate-200 border border-slate-200 shadow-sm" referrerpolicy="no-referrer">
          </header>

          <!-- Main Content Area -->
          <main class="flex-1 overflow-hidden relative pb-safe">
            <router-outlet></router-outlet>
          </main>

          <!-- Mobile Drawer Overlay -->
          @if (isMobileMenuOpen()) {
            <div class="fixed inset-0 bg-gray-900/60 z-40 backdrop-blur-sm transition-opacity" (click)="closeMenu()"></div>
          }
          
          <!-- Slide-over Sidebar Menu -->
          <aside class="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pt-safe"
                 [class.translate-x-0]="isMobileMenuOpen()"
                 [class.-translate-x-full]="!isMobileMenuOpen()">
            
            <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div class="flex items-center gap-3">
                <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm" referrerpolicy="no-referrer">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-900 truncate">{{authService.currentUser()?.displayName}}</p>
                  <p class="text-xs font-medium text-indigo-600 truncate">{{authService.currentUser()?.isPro ? 'Pro Member' : 'Free Plan'}}</p>
                </div>
              </div>
              <button (click)="closeMenu()" class="p-2 text-slate-500 rounded-full hover:bg-slate-200 active:bg-slate-300 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
              <a routerLink="/" (click)="closeMenu()" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-4 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                <mat-icon [class.text-indigo-600]="router.url === '/'">dashboard</mat-icon>
                <span class="text-[15px]">Home</span>
              </a>
              <a routerLink="/chat" (click)="closeMenu()" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" class="flex items-center gap-4 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                <mat-icon [class.text-indigo-600]="router.url.includes('/chat')">auto_awesome</mat-icon>
                <span class="text-[15px]">Cleo AI</span>
                @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits ?? 5) <= 0) {
                  <mat-icon class="text-amber-500 text-sm ml-auto">lock</mat-icon>
                }
              </a>
              <a routerLink="/notes" (click)="closeMenu()" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" class="flex items-center gap-4 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                <mat-icon [class.text-indigo-600]="router.url.includes('/notes')">library_books</mat-icon>
                <span class="text-[15px]">Library & Papers</span>
              </a>
              <a routerLink="/community" (click)="closeMenu()" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" class="flex items-center gap-4 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                <mat-icon [class.text-indigo-600]="router.url.includes('/community')">forum</mat-icon>
                <span class="text-[15px]">Community</span>
              </a>
              <a routerLink="/career-guidance" (click)="closeMenu()" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" class="flex items-center gap-4 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                <mat-icon [class.text-indigo-600]="router.url.includes('/career-guidance')">explore</mat-icon>
                <span class="text-[15px]">Career Guidance</span>
              </a>
              <a routerLink="/settings" (click)="closeMenu()" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" class="flex items-center gap-4 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                <mat-icon [class.text-indigo-600]="router.url.includes('/settings')">settings</mat-icon>
                <span class="text-[15px]">Settings</span>
              </a>
            </nav>
            
            <div class="p-4 border-t border-slate-100 pb-safe">
              <button (click)="logout()" class="w-full py-3 text-[15px] font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center">
                <mat-icon class="text-[20px] !w-[20px] !h-[20px] mr-2">logout</mat-icon>
                Sign Out
              </button>
            </div>
          </aside>
          
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
  isMobileMenuOpen = signal(false);

  toggleMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.closeMenu();
    this.authService.logout();
  }
}
