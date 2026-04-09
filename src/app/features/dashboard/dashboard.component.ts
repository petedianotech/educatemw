import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-8 h-full overflow-y-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {{authService.currentUser()?.displayName?.split(' ')?.[0]}}!</h1>
        <p class="text-gray-500 mt-1">Ready to continue your learning journey?</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- AI Tutor Card -->
        <a routerLink="/chat" class="group block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-200">
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <mat-icon>smart_toy</mat-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            AI Tutor
            @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
              <mat-icon class="text-amber-500 text-sm">lock</mat-icon>
            }
          </h3>
          <p class="text-gray-500 text-sm">Get personalized help and explanations from your AI assistant.</p>
        </a>

        <!-- Notes Card -->
        <a routerLink="/notes" class="group block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <mat-icon>library_books</mat-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Library & Past Papers</h3>
          <p class="text-gray-500 text-sm">Access study materials offline anytime, anywhere.</p>
        </a>

        <!-- Community Card -->
        <a routerLink="/community" class="group block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-purple-200">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <mat-icon>forum</mat-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Student Community</h3>
          <p class="text-gray-500 text-sm">Discuss topics and share knowledge with peers.</p>
        </a>
      </div>

      @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
        <div class="mt-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold mb-2 flex items-center gap-2">
                <mat-icon>workspace_premium</mat-icon>
                Unlock Pro Features
              </h3>
              <p class="text-emerald-50 max-w-2xl">Get unlimited access to the AI Tutor and premium past papers to supercharge your studies.</p>
            </div>
            <a routerLink="/upgrade" class="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              Upgrade Now
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
}
