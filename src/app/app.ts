import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    @if (!authService.isAuthReady()) {
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    } @else {
      @if (authService.currentUser()) {
        <div class="flex h-screen bg-gray-50 font-sans text-gray-900">
          <!-- Sidebar -->
          <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div class="p-6 border-b border-gray-200">
              <h1 class="text-2xl font-bold text-emerald-600 tracking-tight flex items-center gap-2">
                <mat-icon>school</mat-icon>
                EduMalawi
              </h1>
            </div>
            
            <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
              <a routerLink="/" routerLinkActive="bg-emerald-50 text-emerald-700" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                <mat-icon>dashboard</mat-icon>
                <span class="font-medium">Dashboard</span>
              </a>
              <a routerLink="/chat" routerLinkActive="bg-emerald-50 text-emerald-700" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                <mat-icon>smart_toy</mat-icon>
                <span class="font-medium">AI Tutor</span>
                @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                  <mat-icon class="text-amber-500 text-sm ml-auto">lock</mat-icon>
                }
              </a>
              <a routerLink="/notes" routerLinkActive="bg-emerald-50 text-emerald-700" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                <mat-icon>library_books</mat-icon>
                <span class="font-medium">Library</span>
              </a>
              <a routerLink="/community" routerLinkActive="bg-emerald-50 text-emerald-700" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                <mat-icon>forum</mat-icon>
                <span class="font-medium">Community</span>
              </a>
              
              @if (authService.currentUser()?.role === 'admin') {
                <div class="pt-4 mt-4 border-t border-gray-200">
                  <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</p>
                  <a routerLink="/admin" routerLinkActive="bg-emerald-50 text-emerald-700" class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                    <mat-icon>admin_panel_settings</mat-icon>
                    <span class="font-medium">Dashboard</span>
                  </a>
                </div>
              }
            </nav>
            
            <div class="p-4 border-t border-gray-200">
              <div class="flex items-center gap-3 mb-4 px-2">
                <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-10 h-10 rounded-full bg-gray-200" referrerpolicy="no-referrer">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{authService.currentUser()?.displayName}}</p>
                  <p class="text-xs text-gray-500 truncate">{{authService.currentUser()?.isPro ? 'Pro Member' : 'Free Plan'}}</p>
                </div>
              </div>
              <button (click)="authService.logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                <mat-icon class="text-sm">logout</mat-icon>
                Sign Out
              </button>
            </div>
          </aside>
          
          <!-- Main Content -->
          <main class="flex-1 flex flex-col overflow-hidden relative">
            <router-outlet></router-outlet>
          </main>
        </div>
      } @else {
        <router-outlet></router-outlet>
      }
    }
  `,
})
export class App {
  authService = inject(AuthService);
}
