import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Decorative Background Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-400/20 blur-[100px] pointer-events-none"></div>

      <div class="max-w-3xl mx-auto text-center relative z-10">
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
              <mat-icon>{{ isProcessing() ? 'sync' : 'payment' }}</mat-icon>
              {{ isProcessing() ? 'Processing...' : 'Pay with Mobile Money' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mock Payment Modal -->
      @if (showPaymentModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="bg-indigo-600 p-8 text-white text-center">
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <mat-icon class="!w-10 !h-10 !text-[40px]">smartphone</mat-icon>
              </div>
              <h3 class="text-2xl font-black mb-1 tracking-tight">PayChangu Checkout</h3>
              <p class="text-indigo-100 text-sm font-medium">Secure Payment Gateway</p>
            </div>
            
            <div class="p-8">
              <div class="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount to Pay</p>
                  <p class="text-3xl font-black text-slate-900">MWK 5,000</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</p>
                  <p class="text-sm font-black text-indigo-600">PRO UNTIL EXAMS</p>
                </div>
              </div>

              <div class="space-y-4 mb-8">
                <button (click)="completePayment('Airtel Money')" class="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                      <mat-icon>phone_android</mat-icon>
                    </div>
                    <span class="font-black text-slate-900">Airtel Money</span>
                  </div>
                  <mat-icon class="text-slate-300 group-hover:text-red-500">chevron_right</mat-icon>
                </button>

                <button (click)="completePayment('TNM Mpamba')" class="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                      <mat-icon>phone_android</mat-icon>
                    </div>
                    <span class="font-black text-slate-900">TNM Mpamba</span>
                  </div>
                  <mat-icon class="text-slate-300 group-hover:text-emerald-500">chevron_right</mat-icon>
                </button>
              </div>

              <button (click)="showPaymentModal.set(false)" class="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                Cancel Payment
              </button>
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
  router = inject(Router);

  isProcessing = signal(false);
  showPaymentModal = signal(false);

  startPayment() {
    this.showPaymentModal.set(true);
  }

  async completePayment(method: string) {
    const user = this.authService.currentUser();
    if (!user) return;

    this.showPaymentModal.set(false);
    this.isProcessing.set(true);

    try {
      // 1. Update User Pro Status
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { isPro: true });
      
      // 2. Record Revenue for Admin
      await this.dataService.recordRevenue({
        userId: user.uid,
        userName: user.displayName,
        amount: 5000,
        plan: 'PRO_TILL_EXAMS'
      });

      // 3. Update local state
      this.authService.currentUser.update(u => u ? { ...u, isPro: true } : null);
      
      alert(`Payment successful via ${method}! Welcome to Pro.`);
      this.router.navigate(['/']);
    } catch (error) {
      console.error(error);
      alert('Payment processing failed. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
