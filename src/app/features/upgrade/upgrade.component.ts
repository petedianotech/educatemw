import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Decorative Background Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 blur-[100px] pointer-events-none"></div>

      <div class="max-w-3xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-amber-500 rounded-[2rem] border-b-[8px] border-amber-700 text-white shadow-xl shadow-amber-500/30 mb-6 transform hover:scale-105 transition-transform duration-300">
          <mat-icon class="!w-12 !h-12 !text-[48px]">workspace_premium</mat-icon>
        </div>
        <h2 class="text-3xl font-black text-slate-900 sm:text-4xl">
          Upgrade to Pro
        </h2>
        <p class="mt-4 text-xl text-slate-500 font-bold">
          Unlock your full potential with unlimited AI tutoring and premium past papers.
        </p>
      </div>

      <div class="mt-16 max-w-lg mx-auto relative z-10">
        <div class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-2 border-slate-200 border-b-[8px]">
          <div class="px-6 py-8 bg-amber-50 border-b-2 border-slate-100 sm:p-10 sm:pb-6">
            <div class="flex justify-center">
              <span class="inline-flex px-4 py-1 rounded-xl text-sm font-black tracking-wide uppercase bg-amber-200 text-amber-800 border-2 border-amber-300">
                Pro Plan
              </span>
            </div>
            <div class="mt-4 flex justify-center text-6xl font-black text-slate-900">
              <span class="ml-1 text-xl font-bold text-slate-500 mt-2">MWK</span>
              5,000
              <span class="ml-1 text-xl font-bold text-slate-500 mt-auto mb-2">/mo</span>
            </div>
          </div>
          <div class="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
            <ul class="space-y-4">
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-bold">Unlimited AI Tutor Chat</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-bold">Access to all Premium Past Papers</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-bold">Priority Community Support</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-bold">Offline Downloads</p>
              </li>
            </ul>
            <div class="mt-8">
              <button (click)="simulateUpgrade()" class="btn-accent w-full py-4 text-[16px] flex items-center gap-2">
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
