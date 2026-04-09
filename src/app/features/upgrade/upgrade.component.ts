import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <mat-icon class="!w-16 !h-16 !text-[64px] text-amber-500 mb-6">workspace_premium</mat-icon>
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Upgrade to Pro
        </h2>
        <p class="mt-4 text-xl text-gray-500">
          Unlock your full potential with unlimited AI tutoring and premium past papers.
        </p>
      </div>

      <div class="mt-16 max-w-lg mx-auto">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
          <div class="px-6 py-8 bg-amber-50 sm:p-10 sm:pb-6">
            <div class="flex justify-center">
              <span class="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-amber-200 text-amber-800">
                Pro Plan
              </span>
            </div>
            <div class="mt-4 flex justify-center text-6xl font-extrabold text-gray-900">
              <span class="ml-1 text-xl font-medium text-gray-500">MWK</span>
              5,000
              <span class="ml-1 text-xl font-medium text-gray-500">/mo</span>
            </div>
          </div>
          <div class="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
            <ul class="space-y-4">
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-gray-700">Unlimited AI Tutor Chat</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-gray-700">Access to all Premium Past Papers</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-gray-700">Priority Community Support</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-gray-700">Offline Downloads</p>
              </li>
            </ul>
            <div class="mt-8">
              <button (click)="simulateUpgrade()" class="w-full flex justify-center items-center gap-2 px-6 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-amber-500 hover:bg-amber-600 shadow-md transition-colors">
                <mat-icon>payment</mat-icon>
                Simulate Payment & Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UpgradeComponent {
  authService = inject(AuthService);
  router = inject(Router);

  async simulateUpgrade() {
    const user = this.authService.currentUser();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { isPro: true });
      
      // Update local state
      this.authService.currentUser.update(u => u ? { ...u, isPro: true } : null);
      
      alert('Upgrade successful! Welcome to Pro.');
      this.router.navigate(['/']);
    } catch (error) {
      console.error(error);
      alert('Upgrade failed.');
    }
  }
}
