import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    @if (!authService.isAuthReady()) {
      <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 blur-[100px] pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col items-center animate-bounce">
          <div class="w-24 h-24 bg-emerald-500 rounded-[2rem] border-b-[8px] border-emerald-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-6">
            <mat-icon class="!w-12 !h-12 !text-[48px]">school</mat-icon>
          </div>
        </div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight relative z-10">EduMalawi</h2>
        <p class="text-slate-500 font-bold mt-2 relative z-10 animate-pulse">Loading your learning ecosystem...</p>
        
        <div class="mt-8 w-48 h-3 bg-slate-200 rounded-full overflow-hidden relative z-10 border-2 border-slate-200">
          <div class="h-full bg-emerald-500 rounded-full w-1/2 animate-pulse"></div>
        </div>
      </div>
    } @else {
      @if (authService.currentUser()) {
        <div class="flex flex-col h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden relative">
          
          <!-- Top App Bar (Mobile First) -->
          <header class="bg-white border-b-[4px] border-slate-200 h-16 flex-shrink-0 flex items-center justify-between px-4 z-30 pt-safe">
            <div class="flex items-center gap-3">
              <button (click)="toggleMenu()" class="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors">
                <mat-icon>menu</mat-icon>
              </button>
              <h1 class="text-xl font-black text-emerald-600 tracking-tight flex items-center gap-2">
                EduMalawi
              </h1>
            </div>
            <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-200 shadow-sm" referrerpolicy="no-referrer">
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
          <aside class="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-[4px] border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pt-safe"
                 [class.translate-x-0]="isMobileMenuOpen()"
                 [class.-translate-x-full]="!isMobileMenuOpen()">
            
            <div class="p-4 border-b-2 border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div class="flex items-center gap-3">
                <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-12 h-12 rounded-full bg-white border-2 border-emerald-200 shadow-sm" referrerpolicy="no-referrer">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">{{authService.currentUser()?.displayName}}</p>
                  <p class="text-xs font-bold text-emerald-600 truncate">{{authService.currentUser()?.isPro ? 'Pro Member' : 'Free Plan'}}</p>
                </div>
              </div>
              <button (click)="closeMenu()" class="p-2 text-slate-500 rounded-full hover:bg-slate-200 active:bg-slate-300 transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
              <a routerLink="/" (click)="closeMenu()" routerLinkActive="bg-emerald-50 text-emerald-700 font-black border-b-[4px] border-emerald-200" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-4 px-4 py-3.5 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all border-2 border-transparent">
                <mat-icon class="text-emerald-600">dashboard</mat-icon>
                <span class="text-[15px]">Home</span>
              </a>
              <a routerLink="/chat" (click)="closeMenu()" routerLinkActive="bg-emerald-50 text-emerald-700 font-black border-b-[4px] border-emerald-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all border-2 border-transparent">
                <mat-icon class="text-emerald-600">auto_awesome</mat-icon>
                <span class="text-[15px]">Cleo AI</span>
                @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits ?? 5) <= 0) {
                  <mat-icon class="text-amber-500 text-sm ml-auto">lock</mat-icon>
                }
              </a>
              <a routerLink="/notes" (click)="closeMenu()" routerLinkActive="bg-emerald-50 text-emerald-700 font-black border-b-[4px] border-emerald-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all border-2 border-transparent">
                <mat-icon class="text-emerald-600">library_books</mat-icon>
                <span class="text-[15px]">Library & Papers</span>
              </a>
              <a routerLink="/community" (click)="closeMenu()" routerLinkActive="bg-emerald-50 text-emerald-700 font-black border-b-[4px] border-emerald-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all border-2 border-transparent">
                <mat-icon class="text-emerald-600">forum</mat-icon>
                <span class="text-[15px]">Community</span>
              </a>
              <a routerLink="/career-guidance" (click)="closeMenu()" routerLinkActive="bg-emerald-50 text-emerald-700 font-black border-b-[4px] border-emerald-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all border-2 border-transparent">
                <mat-icon class="text-emerald-600">explore</mat-icon>
                <span class="text-[15px]">Career Guidance</span>
              </a>
              <a routerLink="/settings" (click)="closeMenu()" routerLinkActive="bg-emerald-50 text-emerald-700 font-black border-b-[4px] border-emerald-200" class="flex items-center gap-4 px-4 py-3.5 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all border-2 border-transparent">
                <mat-icon class="text-emerald-600">settings</mat-icon>
                <span class="text-[15px]">Settings</span>
              </a>
            </nav>
            
            <div class="p-4 border-t-2 border-slate-100 pb-safe">
              <button (click)="logout()" class="btn-danger w-full py-3.5 text-[15px]">
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
