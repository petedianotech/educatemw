import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden h-[100dvh] overflow-y-auto custom-scrollbar">
      <!-- Decorative Background Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-400/20 blur-[100px] pointer-events-none"></div>

      <div class="max-w-3xl mx-auto text-center relative z-10 pb-12">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl text-white shadow-lg shadow-indigo-500/30 mb-6 transform hover:scale-105 transition-transform duration-300">
          <mat-icon class="!w-12 !h-12 !text-[48px]">workspace_premium</mat-icon>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 sm:text-4xl">
          Upgrade to Pro
        </h2>
        <p class="mt-4 text-xl text-slate-500 font-medium">
          Pay K5,000 once and access everything till your exams.
        </p>
      </div>

      <div class="mt-16 max-w-lg mx-auto relative z-10">
        <div class="card-modern overflow-hidden">
          <div class="px-6 py-8 bg-indigo-50/50 border-b border-slate-100 sm:p-10 sm:pb-6 text-center">
            <span class="inline-flex px-4 py-1 rounded-xl text-sm font-bold tracking-wide uppercase bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm mb-4">
              Exam Success Plan
            </span>
            <div class="flex justify-center text-6xl font-black text-slate-900">
              <span class="text-xl font-semibold text-slate-500 mt-2 mr-1">MWK</span>
              5,000
            </div>
            <p class="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">One-time payment till exams</p>
          </div>
          <div class="px-6 pt-6 pb-8 bg-white sm:p-10 sm:pt-6">
            <ul class="space-y-4 mb-8">
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-indigo-600">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-medium">Unlimited Cleo AI Tutor Chat</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-indigo-600">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-medium">Access to all Premium Past Papers</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-indigo-600">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-medium">Full Video Lesson Library</p>
              </li>
              <li class="flex items-start">
                <div class="flex-shrink-0">
                  <mat-icon class="text-indigo-600">check_circle</mat-icon>
                </div>
                <p class="ml-3 text-base text-slate-700 font-medium">Personalized Study Plan</p>
              </li>
            </ul>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-8">
              <div class="flex items-center gap-3 mb-2">
                <mat-icon class="text-emerald-600">account_balance_wallet</mat-icon>
                <h4 class="font-bold text-slate-900 text-sm">Supported Payments</h4>
              </div>
              <p class="text-xs text-slate-500 font-medium leading-relaxed">
                We use <span class="text-indigo-600 font-bold">PayChangu</span> to securely process payments via <span class="font-bold">Airtel Money</span> and <span class="font-bold">TNM Mpamba</span>.
              </p>
            </div>

            <button (click)="startPayment()" [disabled]="isProcessing()" class="btn-primary w-full py-4 text-[16px] flex items-center justify-center gap-2 shadow-xl shadow-indigo-100">
              @if (isProcessing()) {
                <mat-icon class="animate-spin">sync</mat-icon>
              } @else {
                <mat-icon>payment</mat-icon>
              }
              {{ isProcessing() ? 'Initializing...' : 'Pay with Mobile Money' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Guest Warning Modal -->
      @if (showGuestWarning()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-8 text-center">
              <div class="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <mat-icon class="!w-10 !h-10 !text-[40px] text-amber-600">account_circle</mat-icon>
              </div>
              <h3 class="text-2xl font-black text-slate-900 mb-2">Account Required</h3>
              <p class="text-slate-500 font-medium mb-8">
                You are currently signed in as a <span class="text-amber-600 font-bold">Guest</span>. To upgrade to Pro and save your progress, you must create a permanent account first.
              </p>
              
              <div class="space-y-3">
                <button (click)="router.navigate(['/login'])" class="btn-primary w-full py-4 shadow-lg shadow-indigo-100">
                  Create Account Now
                </button>
                <button (click)="showGuestWarning.set(false)" class="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UpgradeComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  paymentService = inject(PaymentService);
  router = inject(Router);

  isProcessing = signal(false);
  showGuestWarning = signal(false);

  async startPayment() {
    const user = this.authService.currentUser();
    if (user?.isGuest) {
      this.showGuestWarning.set(true);
      return;
    }

    this.isProcessing.set(true);
    try {
      await this.paymentService.initializePayment(5000);
    } catch (error) {
      console.error('Payment Initialization Failed:', error);
      alert('Failed to start payment. Please try again later.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
